import { PrismaClient } from '@prisma/client';
import { Role, CustomerType, CustomerStatus, MovementType, ChallanStatus } from '../src/types/enums';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Prisma database seed...');

  // Clear existing records in reverse dependency order
  await prisma.challanItem.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.challan.deleteMany();
  await prisma.customerFollowUp.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing database records.');

  // 1. Create Users
  const passwordHash = await bcrypt.hash('Admin@123', 10);
  const salesPasswordHash = await bcrypt.hash('Sales@123', 10);
  const warehousePasswordHash = await bcrypt.hash('Warehouse@123', 10);
  const accountsPasswordHash = await bcrypt.hash('Accounts@123', 10);

  const adminUser = await prisma.user.create({
    data: {
      name: 'Rajesh Sharma (Admin)',
      email: 'admin@erp-demo.com',
      passwordHash: passwordHash,
      role: Role.ADMIN,
    },
  });

  const salesUser = await prisma.user.create({
    data: {
      name: 'Vikram Mehta (Sales Lead)',
      email: 'sales@erp-demo.com',
      passwordHash: salesPasswordHash,
      role: Role.SALES,
    },
  });

  const warehouseUser = await prisma.user.create({
    data: {
      name: 'Suresh Patel (Warehouse Mgr)',
      email: 'warehouse@erp-demo.com',
      passwordHash: warehousePasswordHash,
      role: Role.WAREHOUSE,
    },
  });

  const accountsUser = await prisma.user.create({
    data: {
      name: 'Priya Iyer (Accounts Lead)',
      email: 'accounts@erp-demo.com',
      passwordHash: accountsPasswordHash,
      role: Role.ACCOUNTS,
    },
  });

  console.log('👤 Created 4 demo users across roles.');

  // 2. Create 15 Customers
  const customerData = [
    {
      name: 'Ramesh Gupta',
      mobile: '+91 98200 11223',
      email: 'ramesh@apexindustries.in',
      businessName: 'Apex Industrial Supplies Pvt Ltd',
      gstNumber: '27AAACA1234H1Z5',
      customerType: CustomerType.DISTRIBUTOR,
      address: 'Plot 42, MIDC Industrial Area, Andheri East, Mumbai, Maharashtra 400093',
      status: CustomerStatus.ACTIVE,
      notes: 'Key distributor for Western Region. Prefers monthly credit terms.',
      followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    {
      name: 'Amitabh Sen',
      mobile: '+91 98310 44556',
      email: 'asen@swastiktech.co.in',
      businessName: 'Swastik Tech Distributors',
      gstNumber: '19AABCS5678J1Z2',
      customerType: CustomerType.WHOLESALE,
      address: '77 Netaji Subhash Road, Fairley Place, Kolkata, West Bengal 700001',
      status: CustomerStatus.ACTIVE,
      notes: 'Wholesale buyer for Eastern hardware dealers.',
      followUpDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
    {
      name: 'Sunil Verma',
      mobile: '+91 98111 22334',
      email: 'sunil@metrohardware.com',
      businessName: 'Metro Hardware & Electricals',
      gstNumber: '07AACCM9988K1Z9',
      customerType: CustomerType.RETAIL,
      address: 'Shop 14, Chawri Bazar, Chandni Chowk, New Delhi 110006',
      status: CustomerStatus.ACTIVE,
      notes: 'Retail store ordering fast-moving items weekly.',
    },
    {
      name: 'Karthik Rao',
      mobile: '+91 98450 33445',
      email: 'karthik@deccanmachinery.com',
      businessName: 'Deccan Machinery Works',
      gstNumber: '29AAACD4433L1Z3',
      customerType: CustomerType.DISTRIBUTOR,
      address: '12 Peenya Industrial Area Phase 1, Bengaluru, Karnataka 560058',
      status: CustomerStatus.ACTIVE,
      notes: 'High volume buyer of bearings and power tools.',
    },
    {
      name: 'Anand Joshi',
      mobile: '+91 98220 55667',
      email: 'ajoshi@maharashtravalves.com',
      businessName: 'Maharashtra Valve Solutions',
      gstNumber: '27AAACM8877M1Z1',
      customerType: CustomerType.WHOLESALE,
      address: 'Block B-5, Bhosari Industrial Area, Pune, Maharashtra 411026',
      status: CustomerStatus.ACTIVE,
    },
    {
      name: 'Deepak Agrawal',
      mobile: '+91 94250 66778',
      email: 'deepak@centraltraders.in',
      businessName: 'Central India Traders',
      gstNumber: '23AAACC3322N1Z4',
      customerType: CustomerType.DISTRIBUTOR,
      address: '45 Transport Nagar, Indore, Madhya Pradesh 452014',
      status: CustomerStatus.LEAD,
      notes: 'New inquiry for quarterly bulk fasteners supply.',
      followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
    {
      name: 'Nitin Patel',
      mobile: '+91 98980 77889',
      email: 'npatel@gujaratpipes.com',
      businessName: 'Gujarat Pipe & Fitting Corp',
      gstNumber: '24AAACG1122P1Z8',
      customerType: CustomerType.WHOLESALE,
      address: 'Plot 108, GIDC Makarpura, Vadodara, Gujarat 390010',
      status: CustomerStatus.ACTIVE,
    },
    {
      name: 'Harpreet Singh',
      mobile: '+91 98140 88990',
      email: 'harpreet@punjabtools.in',
      businessName: 'Punjab Heavy Engineering Tools',
      gstNumber: '03AAACP4455Q1Z7',
      customerType: CustomerType.DISTRIBUTOR,
      address: 'Focal Point Phase V, Ludhiana, Punjab 141010',
      status: CustomerStatus.ACTIVE,
    },
    {
      name: 'Venkat Reddy',
      mobile: '+91 98490 11447',
      email: 'venkat@telanganasafety.com',
      businessName: 'Telangana Industrial Safety Gear',
      gstNumber: '36AAACT9900R1Z6',
      customerType: CustomerType.WHOLESALE,
      address: 'Autonagar, Gajuwaka, Visakhapatnam / Hyderabad Hub 500037',
      status: CustomerStatus.LEAD,
      followUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    },
    {
      name: 'Manoj Kumar',
      mobile: '+91 94310 22558',
      email: 'manoj@biharelectricals.com',
      businessName: 'Bihar Electrical & Power Controls',
      gstNumber: '10AAACB6677S1Z5',
      customerType: CustomerType.RETAIL,
      address: 'Exhibition Road, Patna, Bihar 800001',
      status: CustomerStatus.ACTIVE,
    },
    {
      name: 'Sanjay Chawla',
      mobile: '+91 98290 33669',
      email: 'schawla@rajmarbles.in',
      businessName: 'Rajasthan Mining & Mill Mart',
      gstNumber: '08AAACR2211T1Z4',
      customerType: CustomerType.WHOLESALE,
      address: 'RIICO Industrial Area, Udaipur, Rajasthan 313001',
      status: CustomerStatus.INACTIVE,
      notes: 'Dormant account since Q3. Needs account manager call.',
    },
    {
      name: 'Pradeep Pillai',
      mobile: '+91 98470 44770',
      email: 'ppillai@keralahardware.co.in',
      businessName: 'Cochin Hardware Supplies',
      gstNumber: '32AAACC7788U1Z3',
      customerType: CustomerType.DISTRIBUTOR,
      address: 'MG Road, Ernakulam, Kochi, Kerala 682016',
      status: CustomerStatus.ACTIVE,
    },
    {
      name: 'Gopal Krishnan',
      mobile: '+91 98400 55881',
      email: 'gopal@chennaifasteners.com',
      businessName: 'Chennai Fasteners & Hardware',
      gstNumber: '33AAACC5544V1Z2',
      customerType: CustomerType.WHOLESALE,
      address: 'Guindy Industrial Estate, Chennai, Tamil Nadu 600032',
      status: CustomerStatus.ACTIVE,
    },
    {
      name: 'Tushar Roy',
      mobile: '+91 98300 66992',
      email: 'tushar@assamtools.com',
      businessName: 'Assam Tea Garden Supplies',
      gstNumber: '18AAACA3344W1Z1',
      customerType: CustomerType.WHOLESALE,
      address: 'AT Road, Guwahati, Assam 781001',
      status: CustomerStatus.LEAD,
      followUpDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    },
    {
      name: 'Pankaj Shah',
      mobile: '+91 98250 77003',
      email: 'pshah@suratsteel.com',
      businessName: 'Surat Industrial Steel & Hardware',
      gstNumber: '24AAACS8899X1Z0',
      customerType: CustomerType.DISTRIBUTOR,
      address: 'Udhna Magdalla Road, Surat, Gujarat 395007',
      status: CustomerStatus.ACTIVE,
    },
  ];

  const createdCustomers = [];
  for (const cData of customerData) {
    const cust = await prisma.customer.create({
      data: {
        ...cData,
        createdById: salesUser.id,
      },
    });
    createdCustomers.push(cust);
  }
  console.log(`🏢 Created ${createdCustomers.length} realistic customer accounts.`);

  // 3. Create Follow-up Notes
  await prisma.customerFollowUp.create({
    data: {
      customerId: createdCustomers[0].id,
      note: 'Discussed Q3 pricing for high-grade M8 Allen Bolts. Sent quote PDF.',
      followUpDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      createdById: salesUser.id,
    },
  });

  await prisma.customerFollowUp.create({
    data: {
      customerId: createdCustomers[5].id,
      note: 'Initial phone discussion. Client requesting 100 units test batch of ball valves.',
      followUpDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      createdById: salesUser.id,
    },
  });

  console.log('📌 Created initial customer follow-up notes.');

  // 4. Create 20 Products
  const productData = [
    {
      name: 'Hex Bolt Stainless Steel M8 x 50mm',
      sku: 'FAST-HEX-M8-50',
      category: 'Fasteners',
      unitPrice: 18.5,
      currentStock: 1500,
      minimumStockAlert: 300,
      warehouseLocation: 'Rack A-12',
    },
    {
      name: 'Allen Cap Screw M10 x 40mm Grade 12.9',
      sku: 'FAST-ALL-M10-40',
      category: 'Fasteners',
      unitPrice: 32.0,
      currentStock: 800,
      minimumStockAlert: 200,
      warehouseLocation: 'Rack A-14',
    },
    {
      name: 'Nylon Lock Nut M12 Galvanized',
      sku: 'FAST-NUT-M12-NYL',
      category: 'Fasteners',
      unitPrice: 9.75,
      currentStock: 120, // LOW STOCK
      minimumStockAlert: 250,
      warehouseLocation: 'Rack A-05',
    },
    {
      name: 'Deep Groove Ball Bearing 6204-2RS (20x47x14mm)',
      sku: 'BEAR-6204-2RS',
      category: 'Bearings',
      unitPrice: 145.0,
      currentStock: 350,
      minimumStockAlert: 50,
      warehouseLocation: 'Rack B-02',
    },
    {
      name: 'Tapered Roller Bearing 30206',
      sku: 'BEAR-30206-TAP',
      category: 'Bearings',
      unitPrice: 380.0,
      currentStock: 40, // LOW STOCK
      minimumStockAlert: 75,
      warehouseLocation: 'Rack B-08',
    },
    {
      name: 'Brass Ball Valve 1/2 Inch Female Thread PN25',
      sku: 'VALV-BAL-050-BR',
      category: 'Industrial Valves',
      unitPrice: 285.0,
      currentStock: 180,
      minimumStockAlert: 40,
      warehouseLocation: 'Rack C-01',
    },
    {
      name: 'Cast Iron Gate Valve 2 Inch Flanged Class 150',
      sku: 'VALV-GAT-200-CI',
      category: 'Industrial Valves',
      unitPrice: 2450.0,
      currentStock: 25,
      minimumStockAlert: 10,
      warehouseLocation: 'Rack C-10',
    },
    {
      name: 'Heavy Duty Angle Grinder 850W 4 Inch',
      sku: 'TOOL-ANG-850W',
      category: 'Power Tools',
      unitPrice: 3200.0,
      currentStock: 45,
      minimumStockAlert: 15,
      warehouseLocation: 'Rack D-04',
    },
    {
      name: 'Rotary Hammer Drill Machine 26mm 800W',
      sku: 'TOOL-HAM-800W',
      category: 'Power Tools',
      unitPrice: 5400.0,
      currentStock: 8, // LOW STOCK
      minimumStockAlert: 12,
      warehouseLocation: 'Rack D-06',
    },
    {
      name: 'Industrial Safety Helmet HDPE Yellow',
      sku: 'SAFE-HLM-YEL',
      category: 'Safety Gear',
      unitPrice: 195.0,
      currentStock: 600,
      minimumStockAlert: 100,
      warehouseLocation: 'Rack E-01',
    },
    {
      name: 'Steel Toe Safety Shoes Size 9 (S3 SR)',
      sku: 'SAFE-SHO-SZ09',
      category: 'Safety Gear',
      unitPrice: 1250.0,
      currentStock: 110,
      minimumStockAlert: 30,
      warehouseLocation: 'Rack E-05',
    },
    {
      name: 'Cut Resistant Nitrile Coated Gloves (Pair)',
      sku: 'SAFE-GLV-NIT-L',
      category: 'Safety Gear',
      unitPrice: 85.0,
      currentStock: 950,
      minimumStockAlert: 200,
      warehouseLocation: 'Rack E-08',
    },
    {
      name: 'MCB 3-Pole 32A C-Curve 10kA Electrical Breaker',
      sku: 'ELEC-MCB-3P32A',
      category: 'Electrical',
      unitPrice: 680.0,
      currentStock: 220,
      minimumStockAlert: 50,
      warehouseLocation: 'Rack F-02',
    },
    {
      name: 'Industrial Flexible Copper Cable 3-Core 2.5 sq mm (100m Roll)',
      sku: 'ELEC-CAB-3C25-100',
      category: 'Electrical',
      unitPrice: 4850.0,
      currentStock: 30,
      minimumStockAlert: 10,
      warehouseLocation: 'Rack F-10',
    },
    {
      name: '3-Phase Induction Electric Motor 2HP 1440 RPM',
      sku: 'ELEC-MOT-2HP-3P',
      category: 'Electrical',
      unitPrice: 9200.0,
      currentStock: 12,
      minimumStockAlert: 5,
      warehouseLocation: 'Rack F-15',
    },
    {
      name: 'Hydraulic High Pressure Hose 3/8 Inch 200 Bar (50m)',
      sku: 'HYDR-HOS-038-50',
      category: 'Hydraulics',
      unitPrice: 3750.0,
      currentStock: 15,
      minimumStockAlert: 5,
      warehouseLocation: 'Rack G-03',
    },
    {
      name: 'Double Acting Hydraulic Cylinder 50mm Bore x 200mm Stroke',
      sku: 'HYDR-CYL-50X200',
      category: 'Hydraulics',
      unitPrice: 8600.0,
      currentStock: 4, // LOW STOCK
      minimumStockAlert: 6,
      warehouseLocation: 'Rack G-07',
    },
    {
      name: 'Silicon Carbide Grinding Wheel 7 Inch x 1/4 Inch',
      sku: 'ABRA-WHL-07X025',
      category: 'Abrasives',
      unitPrice: 110.0,
      currentStock: 420,
      minimumStockAlert: 100,
      warehouseLocation: 'Rack H-02',
    },
    {
      name: 'Flap Disc 4 Inch Grit 80 Zirconia',
      sku: 'ABRA-FLP-04-G80',
      category: 'Abrasives',
      unitPrice: 65.0,
      currentStock: 750,
      minimumStockAlert: 150,
      warehouseLocation: 'Rack H-05',
    },
    {
      name: 'Industrial Teflon Thread Seal Tape 12mm x 10m (Pack of 10)',
      sku: 'SEAL-TEF-12MM-10P',
      category: 'Consumables',
      unitPrice: 150.0,
      currentStock: 310,
      minimumStockAlert: 80,
      warehouseLocation: 'Rack H-12',
    },
  ];

  const createdProducts = [];
  for (const pData of productData) {
    const prod = await prisma.product.create({
      data: pData,
    });
    createdProducts.push(prod);
  }
  console.log(`📦 Created ${createdProducts.length} products with category & stock thresholds.`);

  // 5. Initial Stock IN Movements
  for (const prod of createdProducts) {
    await prisma.stockMovement.create({
      data: {
        productId: prod.id,
        quantity: prod.currentStock + 50,
        movementType: MovementType.IN,
        reason: 'Initial PO Purchase Receiving - Batch 2026-Q1',
        referenceId: 'PO-2026-001',
        createdById: warehouseUser.id,
      },
    });
  }
  console.log('📥 Recorded initial Stock IN movements.');

  // 6. Create Challans with snapshots and Stock Movements
  const currentYear = new Date().getFullYear();

  // Challan 1: CONFIRMED
  const item1Prod = createdProducts[0]; // Stainless Steel Hex Bolt
  const item2Prod = createdProducts[3]; // Ball Bearing 6204
  const item1Qty = 100;
  const item2Qty = 20;
  const subtotal1 = item1Prod.unitPrice * item1Qty + item2Prod.unitPrice * item2Qty;
  const tax1 = Math.round(subtotal1 * 0.18 * 100) / 100;
  const total1 = subtotal1 + tax1;

  const challan1 = await prisma.challan.create({
    data: {
      challanNumber: `CH-${currentYear}-0001`,
      customerId: createdCustomers[0].id,
      status: ChallanStatus.CONFIRMED,
      totalQuantity: item1Qty + item2Qty,
      subtotal: subtotal1,
      taxAmount: tax1,
      totalAmount: total1,
      notes: 'Delivered via Express Transport. GST Invoice pending from Accounts.',
      createdById: salesUser.id,
      items: {
        create: [
          {
            productId: item1Prod.id,
            productNameSnapshot: item1Prod.name,
            skuSnapshot: item1Prod.sku,
            unitPriceSnapshot: item1Prod.unitPrice,
            quantity: item1Qty,
            subtotal: item1Prod.unitPrice * item1Qty,
          },
          {
            productId: item2Prod.id,
            productNameSnapshot: item2Prod.name,
            skuSnapshot: item2Prod.sku,
            unitPriceSnapshot: item2Prod.unitPrice,
            quantity: item2Qty,
            subtotal: item2Prod.unitPrice * item2Qty,
          },
        ],
      },
    },
  });

  // Create corresponding OUT movements for Confirmed Challan 1
  await prisma.stockMovement.createMany({
    data: [
      {
        productId: item1Prod.id,
        quantity: item1Qty,
        movementType: MovementType.OUT,
        reason: `Sales Challan ${challan1.challanNumber}`,
        referenceId: challan1.challanNumber,
        createdById: salesUser.id,
      },
      {
        productId: item2Prod.id,
        quantity: item2Qty,
        movementType: MovementType.OUT,
        reason: `Sales Challan ${challan1.challanNumber}`,
        referenceId: challan1.challanNumber,
        createdById: salesUser.id,
      },
    ],
  });

  // Challan 2: DRAFT
  const item3Prod = createdProducts[7]; // Angle Grinder
  const item3Qty = 5;
  const subtotal2 = item3Prod.unitPrice * item3Qty;
  const tax2 = Math.round(subtotal2 * 0.18 * 100) / 100;
  const total2 = subtotal2 + tax2;

  await prisma.challan.create({
    data: {
      challanNumber: `CH-${currentYear}-0002`,
      customerId: createdCustomers[3].id,
      status: ChallanStatus.DRAFT,
      totalQuantity: item3Qty,
      subtotal: subtotal2,
      taxAmount: tax2,
      totalAmount: total2,
      notes: 'Draft quotation awaiting customer purchase order confirmation.',
      createdById: salesUser.id,
      items: {
        create: [
          {
            productId: item3Prod.id,
            productNameSnapshot: item3Prod.name,
            skuSnapshot: item3Prod.sku,
            unitPriceSnapshot: item3Prod.unitPrice,
            quantity: item3Qty,
            subtotal: subtotal2,
          },
        ],
      },
    },
  });

  // Challan 3: CONFIRMED
  const item4Prod = createdProducts[9]; // Safety Helmet
  const item4Qty = 50;
  const subtotal3 = item4Prod.unitPrice * item4Qty;
  const tax3 = Math.round(subtotal3 * 0.18 * 100) / 100;
  const total3 = subtotal3 + tax3;

  const challan3 = await prisma.challan.create({
    data: {
      challanNumber: `CH-${currentYear}-0003`,
      customerId: createdCustomers[1].id,
      status: ChallanStatus.CONFIRMED,
      totalQuantity: item4Qty,
      subtotal: subtotal3,
      taxAmount: tax3,
      totalAmount: total3,
      notes: 'Dispatched to Kolkata hub via V-Trans.',
      createdById: salesUser.id,
      items: {
        create: [
          {
            productId: item4Prod.id,
            productNameSnapshot: item4Prod.name,
            skuSnapshot: item4Prod.sku,
            unitPriceSnapshot: item4Prod.unitPrice,
            quantity: item4Qty,
            subtotal: subtotal3,
          },
        ],
      },
    },
  });

  await prisma.stockMovement.create({
    data: {
      productId: item4Prod.id,
      quantity: item4Qty,
      movementType: MovementType.OUT,
      reason: `Sales Challan ${challan3.challanNumber}`,
      referenceId: challan3.challanNumber,
      createdById: salesUser.id,
    },
  });

  console.log('📄 Created sample DRAFT & CONFIRMED sales challans with items and stock movements.');

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
