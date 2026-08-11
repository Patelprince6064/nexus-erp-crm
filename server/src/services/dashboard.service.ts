import prisma from '../config/prisma';

export class DashboardService {
  static async getDashboardMetrics() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      totalCustomers,
      totalProducts,
      allProducts,
      todaysChallansCount,
      confirmedChallansCount,
      draftChallansCount,
      pendingFollowUpsCount,
      recentCustomers,
      recentChallans,
      recentMovements,
      upcomingFollowUps,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.findMany({ where: { isActive: true } }),
      prisma.challan.count({
        where: { createdAt: { gte: startOfToday } },
      }),
      prisma.challan.count({ where: { status: 'CONFIRMED' } }),
      prisma.challan.count({ where: { status: 'DRAFT' } }),
      prisma.customer.count({
        where: {
          followUpDate: { gte: startOfToday },
        },
      }),
      prisma.customer.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { createdBy: { select: { name: true } } },
      }),
      prisma.challan.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: { select: { name: true, businessName: true } } },
      }),
      prisma.stockMovement.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { name: true, sku: true } },
          createdBy: { select: { name: true } },
        },
      }),
      prisma.customer.findMany({
        where: {
          followUpDate: { gte: new Date() },
        },
        take: 5,
        orderBy: { followUpDate: 'asc' },
      }),
    ]);

    // Calculate low stock products
    const lowStockProducts = allProducts.filter((p) => p.currentStock <= p.minimumStockAlert);

    // Customer distribution by status
    const leadCount = await prisma.customer.count({ where: { status: 'LEAD' } });
    const activeCount = await prisma.customer.count({ where: { status: 'ACTIVE' } });
    const inactiveCount = await prisma.customer.count({ where: { status: 'INACTIVE' } });

    // Customer distribution by type
    const wholesaleCount = await prisma.customer.count({ where: { customerType: 'WHOLESALE' } });
    const distributorCount = await prisma.customer.count({ where: { customerType: 'DISTRIBUTOR' } });
    const retailCount = await prisma.customer.count({ where: { customerType: 'RETAIL' } });

    return {
      metrics: {
        totalCustomers,
        totalProducts,
        lowStockCount: lowStockProducts.length,
        todaysChallans: todaysChallansCount,
        confirmedChallans: confirmedChallansCount,
        draftChallans: draftChallansCount,
        pendingFollowUps: pendingFollowUpsCount,
      },
      charts: {
        customerStatus: [
          { name: 'Active', value: activeCount, color: '#10b981' },
          { name: 'Lead', value: leadCount, color: '#3b82f6' },
          { name: 'Inactive', value: inactiveCount, color: '#94a3b8' },
        ],
        customerTypes: [
          { name: 'Wholesale', value: wholesaleCount },
          { name: 'Distributor', value: distributorCount },
          { name: 'Retail', value: retailCount },
        ],
      },
      lowStockAlerts: lowStockProducts.slice(0, 5),
      recentActivity: {
        customers: recentCustomers,
        challans: recentChallans,
        movements: recentMovements,
      },
      upcomingFollowUps,
    };
  }
}
