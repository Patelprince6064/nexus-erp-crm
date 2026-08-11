import prisma from '../config/prisma';
import {
  CreateCustomerInput,
  UpdateCustomerInput,
  CreateFollowUpInput,
  customerQuerySchema,
} from '../validators/customer.validator';
import { NotFoundError } from '../middleware/error.middleware';

export class CustomerService {
  static async getCustomers(query: any) {
    const parsedQuery = customerQuerySchema.parse(query);
    const page = parsedQuery.page || 1;
    const limit = parsedQuery.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (parsedQuery.status) {
      where.status = parsedQuery.status;
    }

    if (parsedQuery.customerType) {
      where.customerType = parsedQuery.customerType;
    }

    if (parsedQuery.search) {
      const search = parsedQuery.search;
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { businessName: { contains: search, mode: 'insensitive' } },
        { mobile: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { gstNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: { followUps: true, challans: true },
          },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    return {
      customers,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getCustomerById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        followUps: {
          orderBy: { createdAt: 'desc' },
          include: {
            createdBy: {
              select: { id: true, name: true },
            },
          },
        },
        challans: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            createdBy: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    return customer;
  }

  static async createCustomer(input: CreateCustomerInput, userId: string) {
    const customer = await prisma.customer.create({
      data: {
        name: input.name,
        mobile: input.mobile,
        email: input.email.toLowerCase(),
        businessName: input.businessName,
        gstNumber: input.gstNumber || null,
        customerType: input.customerType,
        address: input.address,
        status: input.status,
        followUpDate: input.followUpDate ? new Date(input.followUpDate) : null,
        notes: input.notes || null,
        createdById: userId,
      },
    });

    return customer;
  }

  static async updateCustomer(id: string, input: UpdateCustomerInput) {
    await this.getCustomerById(id);

    const updateData: any = { ...input };
    if (input.email) updateData.email = input.email.toLowerCase();
    if (input.followUpDate !== undefined) {
      updateData.followUpDate = input.followUpDate ? new Date(input.followUpDate) : null;
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: updateData,
    });

    return updatedCustomer;
  }

  static async deleteCustomer(id: string) {
    await this.getCustomerById(id);

    // Soft update status to INACTIVE or delete if no relations exist
    const updated = await prisma.customer.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });

    return updated;
  }

  static async getFollowUps(customerId: string) {
    await this.getCustomerById(customerId);

    const followUps = await prisma.customerFollowUp.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });

    return followUps;
  }

  static async addFollowUp(customerId: string, input: CreateFollowUpInput, userId: string) {
    await this.getCustomerById(customerId);

    const followUpDate = new Date(input.followUpDate);

    const [followUp] = await prisma.$transaction([
      prisma.customerFollowUp.create({
        data: {
          customerId,
          note: input.note,
          followUpDate,
          createdById: userId,
        },
      }),
      prisma.customer.update({
        where: { id: customerId },
        data: { followUpDate },
      }),
    ]);

    return followUp;
  }
}
