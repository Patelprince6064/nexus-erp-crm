import request from 'supertest';
import app from '../app';
import prisma from '../config/prisma';
import bcrypt from 'bcryptjs';

describe('Mini ERP + CRM Critical Business Logic Integration Tests', () => {
  let adminToken: string;
  let salesToken: string;

  let testCustomerId: string;
  let productAId: string;
  let productBId: string;

  beforeAll(async () => {
    // Clean slate for tests
    await prisma.challanItem.deleteMany();
    await prisma.stockMovement.deleteMany();
    await prisma.challan.deleteMany();
    await prisma.customerFollowUp.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();

    const adminHash = await bcrypt.hash('Admin@123', 10);
    const salesHash = await bcrypt.hash('Sales@123', 10);

    await prisma.user.create({
      data: { name: 'Test Admin', email: 'testadmin@erp.com', passwordHash: adminHash, role: 'ADMIN' },
    });
    await prisma.user.create({
      data: { name: 'Test Sales', email: 'testsales@erp.com', passwordHash: salesHash, role: 'SALES' },
    });

    const adminRes = await request(app).post('/api/auth/login').send({ email: 'testadmin@erp.com', password: 'Admin@123' });
    adminToken = adminRes.body.data.token;

    const salesRes = await request(app).post('/api/auth/login').send({ email: 'testsales@erp.com', password: 'Sales@123' });
    salesToken = salesRes.body.data.token;
  });

  afterAll(async () => {
    await prisma.challanItem.deleteMany();
    await prisma.stockMovement.deleteMany();
    await prisma.challan.deleteMany();
    await prisma.customerFollowUp.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  // ─── AUTH TESTS ────────────────────────────────────────────────────────────

  it('1. Login succeeds with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testadmin@erp.com', password: 'Admin@123' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe('ADMIN');
  });

  it('2. Login rejected with invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testadmin@erp.com', password: 'WrongPass' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // ─── CUSTOMER TESTS ────────────────────────────────────────────────────────

  it('3. Creates customer via CRM API', async () => {
    const res = await request(app)
      .post('/api/customers')
      .set('Authorization', `Bearer ${salesToken}`)
      .send({
        name: 'Test Contact',
        mobile: '+91 99999 88888',
        email: 'contact@testbiz.com',
        businessName: 'Test Business Pvt Ltd',
        customerType: 'WHOLESALE',
        address: '123 Industrial Area, Mumbai',
        status: 'LEAD',
      });
    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeDefined();
    testCustomerId = res.body.data.id;
  });

  // ─── PRODUCT TESTS ─────────────────────────────────────────────────────────

  it('4. Creates products with unique SKUs', async () => {
    const resA = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Test Product A', sku: 'TEST-PROD-A', category: 'Hardware', unitPrice: 100, currentStock: 10, minimumStockAlert: 2, warehouseLocation: 'Rack 1' });
    expect(resA.status).toBe(201);
    productAId = resA.body.data.id;

    const resB = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Test Product B', sku: 'TEST-PROD-B', category: 'Hardware', unitPrice: 200, currentStock: 5, minimumStockAlert: 2, warehouseLocation: 'Rack 2' });
    expect(resB.status).toBe(201);
    productBId = resB.body.data.id;
  });

  // ─── INVENTORY TESTS ───────────────────────────────────────────────────────

  it('5. Records Stock IN movement and updates stock level', async () => {
    const res = await request(app)
      .post('/api/inventory/movement')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ productId: productAId, quantity: 5, movementType: 'IN', reason: 'Test restock' });
    expect(res.status).toBe(201);
    expect(res.body.data.product.currentStock).toBe(15); // 10 + 5
  });

  it('6. Records Stock OUT movement and updates stock level', async () => {
    const res = await request(app)
      .post('/api/inventory/movement')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ productId: productAId, quantity: 3, movementType: 'OUT', reason: 'Test dispatch' });
    expect(res.status).toBe(201);
    expect(res.body.data.product.currentStock).toBe(12); // 15 - 3
  });

  it('7. Rejects Stock OUT when quantity exceeds current stock', async () => {
    const res = await request(app)
      .post('/api/inventory/movement')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ productId: productBId, quantity: 100, movementType: 'OUT', reason: 'Over-demand test' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/insufficient stock/i);
  });

  // ─── CHALLAN TESTS ─────────────────────────────────────────────────────────

  it('8. Creates DRAFT challan WITHOUT deducting stock', async () => {
    const stockABefore = await prisma.product.findUnique({ where: { id: productAId } });

    const res = await request(app)
      .post('/api/challans')
      .set('Authorization', `Bearer ${salesToken}`)
      .send({
        customerId: testCustomerId,
        status: 'DRAFT',
        items: [{ productId: productAId, quantity: 4 }, { productId: productBId, quantity: 2 }],
      });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('DRAFT');

    // Stock must remain unchanged
    const stockAAfter = await prisma.product.findUnique({ where: { id: productAId } });
    expect(stockAAfter?.currentStock).toBe(stockABefore?.currentStock);
  });

  it('9. CRITICAL: Full transaction rollback when any item has insufficient stock', async () => {
    // Product A = 12, Product B = 5
    // Requesting B = 10 (insufficient) → entire transaction must fail
    const draftRes = await request(app)
      .post('/api/challans')
      .set('Authorization', `Bearer ${salesToken}`)
      .send({
        customerId: testCustomerId,
        status: 'DRAFT',
        items: [
          { productId: productAId, quantity: 4 },  // sufficient
          { productId: productBId, quantity: 10 },  // INSUFFICIENT (available: 5)
        ],
      });

    const draftChallanId = draftRes.body.data.id;

    const confirmRes = await request(app)
      .post(`/api/challans/${draftChallanId}/confirm`)
      .set('Authorization', `Bearer ${salesToken}`);

    expect(confirmRes.status).toBe(400);
    expect(confirmRes.body.success).toBe(false);

    // VERIFY ROLLBACK: Neither product A nor B was deducted
    const prodA = await prisma.product.findUnique({ where: { id: productAId } });
    const prodB = await prisma.product.findUnique({ where: { id: productBId } });
    expect(prodA?.currentStock).toBe(12); // must remain 12
    expect(prodB?.currentStock).toBe(5);  // must remain 5
  });

  it('10. Confirms valid challan and deducts stock atomically', async () => {
    // Product A = 12, Product B = 5 — request A=2, B=3 (both sufficient)
    const draftRes = await request(app)
      .post('/api/challans')
      .set('Authorization', `Bearer ${salesToken}`)
      .send({
        customerId: testCustomerId,
        status: 'DRAFT',
        items: [{ productId: productAId, quantity: 2 }, { productId: productBId, quantity: 3 }],
      });

    const challanId = draftRes.body.data.id;
    const confirmRes = await request(app)
      .post(`/api/challans/${challanId}/confirm`)
      .set('Authorization', `Bearer ${salesToken}`);

    expect(confirmRes.status).toBe(200);
    expect(confirmRes.body.data.status).toBe('CONFIRMED');

    const prodA = await prisma.product.findUnique({ where: { id: productAId } });
    const prodB = await prisma.product.findUnique({ where: { id: productBId } });
    expect(prodA?.currentStock).toBe(10); // 12 - 2
    expect(prodB?.currentStock).toBe(2);  // 5 - 3
  });

  it('11. Enforces RBAC: SALES cannot delete customers (ADMIN only)', async () => {
    const res = await request(app)
      .delete(`/api/customers/${testCustomerId}`)
      .set('Authorization', `Bearer ${salesToken}`);
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/access denied/i);
  });
});
