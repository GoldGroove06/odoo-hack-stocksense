import bcrypt from "bcrypt";
import prisma from "../config/prisma.js";
import {
  applyIn,
  applyMove,
  applyOutReserved,
  applyAdjustment,
  withStockTransaction
} from "../services/stockService.js";

async function main() {
  console.log("🌱 Starting StockSense demo seed...");

  const passwordHash = await bcrypt.hash("password123", 10);

  let company = await prisma.company.findFirst();
  if (!company) {
    company = await prisma.company.create({
      data: {
        name: "StockSense Demo Pvt Ltd",
        address: "Plot 48, Electronic Zone, Pune",
        phone: "+91 98201 44521",
        gstNumber: "27AABCU9603R1ZM"
      }
    });
  }

  const users = [
    { name: "Owner Admin", email: "owner@stocksense.demo", role: "OWNER", companyId: company.id },
    { name: "Inventory Manager", email: "manager@stocksense.demo", role: "INVENTORY_MANAGER", companyId: company.id },
    { name: "Warehouse Staff", email: "staff@stocksense.demo", role: "WAREHOUSE_STAFF", companyId: company.id }
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { role: u.role, companyId: u.companyId, password: passwordHash, mustResetPassword: false, name: u.name },
      create: { ...u, password: passwordHash, mustResetPassword: false }
    });
  }
  const manager = await prisma.user.findUnique({ where: { email: "manager@stocksense.demo" } });
  const staff = await prisma.user.findUnique({ where: { email: "staff@stocksense.demo" } });
  console.log("✅ Users (password: password123)");

  for (const cat of [
    { name: "Electronics", description: "Microcontrollers, ICs, PCBs" },
    { name: "Hardware", description: "Bolts, metal, structural" },
    { name: "Glass & Panels", description: "Glass and finished panels" },
    { name: "Raw Materials", description: "Inputs for manufacturing" },
    { name: "Packaging", description: "Boxes and packing materials" }
  ]) {
    await prisma.category.upsert({ where: { name: cat.name }, update: {}, create: cat });
  }

  for (const uom of [
    { name: "Units", symbol: "unit" },
    { name: "Pieces", symbol: "pcs" },
    { name: "Kilograms", symbol: "kg" },
    { name: "Boxes", symbol: "box" }
  ]) {
    await prisma.unitOfMeasure.upsert({ where: { name: uom.name }, update: {}, create: uom });
  }

  await prisma.warehouse.upsert({
    where: { shortcode: "WH" },
    update: {},
    create: {
      name: "Central Warehouse & Hub",
      shortcode: "WH",
      address: "Plot 48, Electronic Zone, Phase II, Pune",
      manager: "Rohit Maurya",
      phone: "+91 98201 44521"
    }
  });
  const centralWh = await prisma.warehouse.findUnique({ where: { shortcode: "WH" } });

  for (const loc of [
    { name: "Receiving Dock IN1", shortcode: "WH/DOCK/IN1", type: "Incoming Dock", address: "Gate 2" },
    { name: "Bay A1 Electronics", shortcode: "WH/STOCK/A1", type: "Internal Storage", address: "Rack A1" },
    { name: "Bay B1 Hardware", shortcode: "WH/STOCK/B1", type: "Internal Storage", address: "Rack B1" },
    { name: "Manufacturing Floor", shortcode: "WH/MFG/01", type: "Manufacturing", address: "Shop Floor" },
    { name: "Dispatch Bay OUT1", shortcode: "WH/BAY/OUT1", type: "Outgoing Staging", address: "Gate 4" }
  ]) {
    await prisma.location.upsert({
      where: { shortcode: loc.shortcode },
      update: { name: loc.name, type: loc.type, warehouseId: centralWh.id },
      create: { ...loc, warehouseId: centralWh.id }
    });
  }

  const locDock = await prisma.location.findUnique({ where: { shortcode: "WH/DOCK/IN1" } });
  const locA1 = await prisma.location.findUnique({ where: { shortcode: "WH/STOCK/A1" } });
  const locB1 = await prisma.location.findUnique({ where: { shortcode: "WH/STOCK/B1" } });
  const locMfg = await prisma.location.findUnique({ where: { shortcode: "WH/MFG/01" } });
  const locOut = await prisma.location.findUnique({ where: { shortcode: "WH/BAY/OUT1" } });

  const hardwareCat = await prisma.category.findUnique({ where: { name: "Hardware" } });
  const glassCat = await prisma.category.findUnique({ where: { name: "Glass & Panels" } });
  const rawCat = await prisma.category.findUnique({ where: { name: "Raw Materials" } });
  const electronicsCat = await prisma.category.findUnique({ where: { name: "Electronics" } });
  const packagingCat = await prisma.category.findUnique({ where: { name: "Packaging" } });
  const pcs = await prisma.unitOfMeasure.findUnique({ where: { name: "Pieces" } });
  const units = await prisma.unitOfMeasure.findUnique({ where: { name: "Units" } });
  const boxes = await prisma.unitOfMeasure.findUnique({ where: { name: "Boxes" } });
  const kg = await prisma.unitOfMeasure.findUnique({ where: { name: "Kilograms" } });

  async function upsertProduct(data, qty, locationId) {
    const product = await prisma.product.upsert({
      where: { sku: data.sku },
      update: {
        name: data.name,
        description: data.description,
        productKind: data.productKind,
        materialType: data.materialType,
        perUnitCost: data.perUnitCost,
        categoryId: data.categoryId,
        uomId: data.uomId,
        locationId,
        onHand: qty,
        freeToUse: qty,
        minStockAlert: data.minStockAlert ?? 10
      },
      create: {
        ...data,
        locationId,
        onHand: qty,
        freeToUse: qty
      }
    });
    if (locationId) {
      await prisma.stockQuant.upsert({
        where: { productId_locationId: { productId: product.id, locationId } },
        update: { quantity: qty, reservedQty: 0 },
        create: { productId: product.id, locationId, quantity: qty, reservedQty: 0 }
      });
    }
    return product;
  }

  // Clear old demo operations so re-seed is idempotent for docs
  await prisma.stockMovement.deleteMany({});
  await prisma.transferItem.deleteMany({});
  await prisma.transfer.deleteMany({});
  await prisma.receiptItem.deleteMany({});
  await prisma.receipt.deleteMany({});
  await prisma.deliveryItem.deleteMany({});
  await prisma.delivery.deleteMany({});
  await prisma.adjustmentItem.deleteMany({});
  await prisma.adjustment.deleteMany({});
  await prisma.bomLine.deleteMany({});
  await prisma.stockQuant.deleteMany({});

  const steel = await upsertProduct(
    {
      name: "Steel Sheet",
      sku: "RAW-STEEL-01",
      description: "Raw steel for panels",
      perUnitCost: 200,
      productKind: "TRADING",
      materialType: "RAW_MATERIAL",
      categoryId: rawCat.id,
      uomId: pcs.id,
      minStockAlert: 50
    },
    0,
    locB1.id
  );

  const glass = await upsertProduct(
    {
      name: "Tempered Glass",
      sku: "RAW-GLASS-01",
      description: "Glass for finished panels",
      perUnitCost: 350,
      productKind: "TRADING",
      materialType: "RAW_MATERIAL",
      categoryId: glassCat.id,
      uomId: pcs.id,
      minStockAlert: 30
    },
    0,
    locB1.id
  );

  const bolt = await upsertProduct(
    {
      name: "Hex Bolt M12",
      sku: "TRD-BOLT-M12",
      description: "Trading hardware bolt",
      perUnitCost: 18.5,
      productKind: "TRADING",
      materialType: "FINISHED_GOODS",
      categoryId: hardwareCat.id,
      uomId: pcs.id,
      minStockAlert: 200
    },
    0,
    locB1.id
  );

  const mcu = await upsertProduct(
    {
      name: "Industrial MCU Board",
      sku: "TRD-MCU-240",
      description: "Trading electronics",
      perUnitCost: 1450,
      productKind: "TRADING",
      materialType: "FINISHED_GOODS",
      categoryId: electronicsCat.id,
      uomId: units.id,
      minStockAlert: 20
    },
    0,
    locA1.id
  );

  const carton = await upsertProduct(
    {
      name: "Corrugated Carton Box",
      sku: "PKG-BOX-HD",
      description: "Heavy duty packing box",
      perUnitCost: 45,
      productKind: "TRADING",
      materialType: "FINISHED_GOODS",
      categoryId: packagingCat.id,
      uomId: boxes.id,
      minStockAlert: 40
    },
    0,
    locA1.id
  );

  const panel = await upsertProduct(
    {
      name: "Steel Glass Panel",
      sku: "MFG-PANEL-SG",
      description: "Manufactured finished panel (steel + glass)",
      perUnitCost: 2000,
      productKind: "MANUFACTURING",
      materialType: "FINISHED_GOODS",
      categoryId: glassCat.id,
      uomId: pcs.id,
      minStockAlert: 5
    },
    0,
    locMfg.id
  );

  await prisma.bomLine.createMany({
    data: [
      { parentProductId: panel.id, componentProductId: steel.id, quantity: 2 },
      { parentProductId: panel.id, componentProductId: glass.id, quantity: 1 }
    ]
  });

  let supplier = await prisma.supplier.findFirst({ where: { name: "MetalWorks India" } });
  if (!supplier) {
    supplier = await prisma.supplier.create({
      data: {
        name: "MetalWorks India",
        address: "MIDC Pune",
        gstNumber: "27AAECM1234A1Z5",
        phone: "+91 98765 11111",
        contactPerson: "Suresh Patil"
      }
    });
  }

  let supplier2 = await prisma.supplier.findFirst({ where: { name: "ElectroSupply Co" } });
  if (!supplier2) {
    supplier2 = await prisma.supplier.create({
      data: {
        name: "ElectroSupply Co",
        address: "Peenya, Bengaluru",
        gstNumber: "29AAECE9988E1Z2",
        phone: "+91 98800 33445",
        contactPerson: "Priya Nair"
      }
    });
  }

  let customer = await prisma.customer.findFirst({ where: { name: "BuildRight Contractors" } });
  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        name: "BuildRight Contractors",
        address: "Andheri East, Mumbai",
        gstNumber: "27AABCB9999B1Z8",
        phone: "+91 98765 22222",
        contactPerson: "Anita Desai"
      }
    });
  }

  let customer2 = await prisma.customer.findFirst({ where: { name: "Nova Fab Solutions" } });
  if (!customer2) {
    customer2 = await prisma.customer.create({
      data: {
        name: "Nova Fab Solutions",
        address: "Hinjewadi Phase 1, Pune",
        gstNumber: "27AABCN4455C1Z9",
        phone: "+91 97654 88990",
        contactPerson: "Vikram Shah"
      }
    });
  }

  console.log("✅ Master data + products/BOM");

  // -------------------------------------------------------------------------
  // Demo flow: receive → move → deliver → adjust (matches StockSense PDF)
  // -------------------------------------------------------------------------

  // 1) Validated receipt: steel, glass, bolts, MCU into receiving dock then stocked
  const receipt1 = await prisma.receipt.create({
    data: {
      reference: "WH/IN/001",
      status: "done",
      scheduledDate: "2026-09-20",
      receiveFrom: supplier.name,
      responsible: manager.name,
      sellerBillNumber: "MW-INV-4412",
      supplierId: supplier.id,
      warehouseId: centralWh.id,
      destinationLocationId: locDock.id,
      subtotal: 100 * 200 + 50 * 350 + 500 * 18.5,
      taxRate: 18,
      taxAmount: 0,
      totalAmount: 0,
      items: {
        create: [
          { productId: steel.id, name: steel.name, sku: steel.sku, quantity: 100, receivedQty: 100, unitCost: 200, totalPrice: 20000, unit: "Pieces" },
          { productId: glass.id, name: glass.name, sku: glass.sku, quantity: 50, receivedQty: 50, unitCost: 350, totalPrice: 17500, unit: "Pieces" },
          { productId: bolt.id, name: bolt.name, sku: bolt.sku, quantity: 500, receivedQty: 500, unitCost: 18.5, totalPrice: 9250, unit: "Pieces" }
        ]
      }
    }
  });
  await prisma.receipt.update({
    where: { id: receipt1.id },
    data: {
      taxAmount: receipt1.subtotal * 0.18,
      totalAmount: receipt1.subtotal * 1.18
    }
  });

  await withStockTransaction(async (tx) => {
    await applyIn(tx, { productId: steel.id, locationId: locDock.id, qty: 100, unit: "Pieces", productName: steel.name, sku: steel.sku, fromLocation: supplier.name, reason: "Demo receipt WH/IN/001", responsible: manager.name, userId: manager.id, documentType: "RECEIPT", documentId: receipt1.id, reference: "WH/IN/001" });
    await applyIn(tx, { productId: glass.id, locationId: locDock.id, qty: 50, unit: "Pieces", productName: glass.name, sku: glass.sku, fromLocation: supplier.name, reason: "Demo receipt WH/IN/001", responsible: manager.name, userId: manager.id, documentType: "RECEIPT", documentId: receipt1.id, reference: "WH/IN/001" });
    await applyIn(tx, { productId: bolt.id, locationId: locDock.id, qty: 500, unit: "Pieces", productName: bolt.name, sku: bolt.sku, fromLocation: supplier.name, reason: "Demo receipt WH/IN/001", responsible: manager.name, userId: manager.id, documentType: "RECEIPT", documentId: receipt1.id, reference: "WH/IN/001" });
  });

  const receipt2 = await prisma.receipt.create({
    data: {
      reference: "WH/IN/002",
      status: "done",
      scheduledDate: "2026-09-22",
      receiveFrom: supplier2.name,
      responsible: manager.name,
      sellerBillNumber: "ES-8821",
      supplierId: supplier2.id,
      warehouseId: centralWh.id,
      destinationLocationId: locA1.id,
      subtotal: 80 * 1450 + 120 * 45,
      taxRate: 18,
      items: {
        create: [
          { productId: mcu.id, name: mcu.name, sku: mcu.sku, quantity: 80, receivedQty: 80, unitCost: 1450, totalPrice: 116000, unit: "Units" },
          { productId: carton.id, name: carton.name, sku: carton.sku, quantity: 120, receivedQty: 120, unitCost: 45, totalPrice: 5400, unit: "Boxes" }
        ]
      }
    }
  });
  await prisma.receipt.update({
    where: { id: receipt2.id },
    data: { taxAmount: 121400 * 0.18, totalAmount: 121400 * 1.18 }
  });
  await withStockTransaction(async (tx) => {
    await applyIn(tx, { productId: mcu.id, locationId: locA1.id, qty: 80, unit: "Units", productName: mcu.name, sku: mcu.sku, fromLocation: supplier2.name, reason: "Demo receipt WH/IN/002", responsible: manager.name, userId: manager.id, documentType: "RECEIPT", documentId: receipt2.id, reference: "WH/IN/002" });
    await applyIn(tx, { productId: carton.id, locationId: locA1.id, qty: 120, unit: "Boxes", productName: carton.name, sku: carton.sku, fromLocation: supplier2.name, reason: "Demo receipt WH/IN/002", responsible: manager.name, userId: manager.id, documentType: "RECEIPT", documentId: receipt2.id, reference: "WH/IN/002" });
  });

  // Draft pending receipt
  await prisma.receipt.create({
    data: {
      reference: "WH/IN/003",
      status: "draft",
      scheduledDate: "2026-09-28",
      receiveFrom: supplier.name,
      responsible: manager.name,
      supplierId: supplier.id,
      warehouseId: centralWh.id,
      destinationLocationId: locDock.id,
      subtotal: 40 * 200,
      taxRate: 18,
      taxAmount: 40 * 200 * 0.18,
      totalAmount: 40 * 200 * 1.18,
      items: {
        create: [
          { productId: steel.id, name: steel.name, sku: steel.sku, quantity: 40, receivedQty: 0, unitCost: 200, totalPrice: 8000, unit: "Pieces" }
        ]
      }
    }
  });
  console.log("✅ Demo receipts");

  // 2) Internal transfers: Dock → Bay B1 (steel/glass/bolts), then steel/glass → MFG
  const trf1 = await prisma.transfer.create({
    data: {
      reference: "TRF/2026/001",
      status: "done",
      scheduledDate: "2026-09-21",
      fromLocationId: locDock.id,
      toLocationId: locB1.id,
      responsible: staff.name,
      staffUserId: staff.id,
      receiptId: receipt1.id,
      pickedAt: new Date("2026-09-21T09:00:00Z"),
      droppedAt: new Date("2026-09-21T10:00:00Z"),
      notes: "Putaway from receiving dock",
      items: {
        create: [
          { productId: steel.id, name: steel.name, sku: steel.sku, quantity: 100, pickedQty: 100, transferredQty: 100, unit: "Pieces" },
          { productId: glass.id, name: glass.name, sku: glass.sku, quantity: 50, pickedQty: 50, transferredQty: 50, unit: "Pieces" },
          { productId: bolt.id, name: bolt.name, sku: bolt.sku, quantity: 500, pickedQty: 500, transferredQty: 500, unit: "Pieces" }
        ]
      }
    }
  });
  await withStockTransaction(async (tx) => {
    await applyMove(tx, { productId: steel.id, fromLocationId: locDock.id, toLocationId: locB1.id, qty: 100, unit: "Pieces", productName: steel.name, sku: steel.sku, reason: "Demo putaway", responsible: staff.name, userId: staff.id, documentType: "TRANSFER", documentId: trf1.id, reference: trf1.reference });
    await applyMove(tx, { productId: glass.id, fromLocationId: locDock.id, toLocationId: locB1.id, qty: 50, unit: "Pieces", productName: glass.name, sku: glass.sku, reason: "Demo putaway", responsible: staff.name, userId: staff.id, documentType: "TRANSFER", documentId: trf1.id, reference: trf1.reference });
    await applyMove(tx, { productId: bolt.id, fromLocationId: locDock.id, toLocationId: locB1.id, qty: 500, unit: "Pieces", productName: bolt.name, sku: bolt.sku, reason: "Demo putaway", responsible: staff.name, userId: staff.id, documentType: "TRANSFER", documentId: trf1.id, reference: trf1.reference });
  });

  const trf2 = await prisma.transfer.create({
    data: {
      reference: "TRF/2026/002",
      status: "done",
      scheduledDate: "2026-09-22",
      fromLocationId: locB1.id,
      toLocationId: locMfg.id,
      responsible: staff.name,
      staffUserId: staff.id,
      isManufactured: true,
      moNumber: "MO-1001",
      pickedAt: new Date("2026-09-22T08:00:00Z"),
      droppedAt: new Date("2026-09-22T09:30:00Z"),
      notes: "Issue raw materials to manufacturing",
      items: {
        create: [
          { productId: steel.id, name: steel.name, sku: steel.sku, quantity: 40, pickedQty: 40, transferredQty: 40, unit: "Pieces" },
          { productId: glass.id, name: glass.name, sku: glass.sku, quantity: 20, pickedQty: 20, transferredQty: 20, unit: "Pieces" }
        ]
      }
    }
  });
  await withStockTransaction(async (tx) => {
    await applyMove(tx, { productId: steel.id, fromLocationId: locB1.id, toLocationId: locMfg.id, qty: 40, unit: "Pieces", productName: steel.name, sku: steel.sku, reason: "Issue to MFG", responsible: staff.name, userId: staff.id, documentType: "TRANSFER", documentId: trf2.id, reference: trf2.reference });
    await applyMove(tx, { productId: glass.id, fromLocationId: locB1.id, toLocationId: locMfg.id, qty: 20, unit: "Pieces", productName: glass.name, sku: glass.sku, reason: "Issue to MFG", responsible: staff.name, userId: staff.id, documentType: "TRANSFER", documentId: trf2.id, reference: trf2.reference });
    // Produce finished panels at MFG (20 panels need 40 steel + 20 glass)
    await applyIn(tx, { productId: panel.id, locationId: locMfg.id, qty: 20, unit: "Pieces", productName: panel.name, sku: panel.sku, reason: "Manufactured MO-1001", responsible: staff.name, userId: staff.id, documentType: "BOM", documentId: trf2.id, reference: "MFG/MO-1001" });
    await applyOutReserved(tx, { productId: steel.id, locationId: locMfg.id, qty: 40, unit: "Pieces", productName: steel.name, sku: steel.sku, reason: "BOM consume MO-1001", responsible: staff.name, userId: staff.id, documentType: "BOM", documentId: trf2.id, reference: "BOM/MO-1001", wasReserved: false });
    await applyOutReserved(tx, { productId: glass.id, locationId: locMfg.id, qty: 20, unit: "Pieces", productName: glass.name, sku: glass.sku, reason: "BOM consume MO-1001", responsible: staff.name, userId: staff.id, documentType: "BOM", documentId: trf2.id, reference: "BOM/MO-1001", wasReserved: false });
  });

  // Open transfer for staff to pick/drop
  await prisma.transfer.create({
    data: {
      reference: "TRF/2026/003",
      status: "draft",
      scheduledDate: "2026-09-26",
      fromLocationId: locA1.id,
      toLocationId: locOut.id,
      responsible: manager.name,
      notes: "Stage MCU boards for tomorrow dispatch",
      items: {
        create: [
          { productId: mcu.id, name: mcu.name, sku: mcu.sku, quantity: 10, pickedQty: 0, transferredQty: 0, unit: "Units" }
        ]
      }
    }
  });
  console.log("✅ Demo transfers");

  // 3) Completed delivery (bolts) + ready draft delivery
  const del1 = await prisma.delivery.create({
    data: {
      reference: "WH/OUT/001",
      status: "done",
      scheduledDate: "2026-09-23",
      destination: customer.address,
      responsible: manager.name,
      carrier: "Internal Logistics",
      customerId: customer.id,
      warehouseId: centralWh.id,
      sourceLocationId: locB1.id,
      subtotal: 100 * 18.5,
      taxRate: 18,
      taxAmount: 100 * 18.5 * 0.18,
      totalAmount: 100 * 18.5 * 1.18,
      items: {
        create: [
          { productId: bolt.id, name: bolt.name, sku: bolt.sku, quantity: 100, deliveredQty: 100, unitCost: 18.5, totalPrice: 1850, unit: "Pieces" }
        ]
      }
    }
  });
  await withStockTransaction(async (tx) => {
    await applyOutReserved(tx, {
      productId: bolt.id,
      locationId: locB1.id,
      qty: 100,
      unit: "Pieces",
      productName: bolt.name,
      sku: bolt.sku,
      reason: "Demo delivery WH/OUT/001",
      responsible: manager.name,
      userId: manager.id,
      documentType: "DELIVERY",
      documentId: del1.id,
      reference: del1.reference,
      wasReserved: false
    });
  });

  await prisma.delivery.create({
    data: {
      reference: "WH/OUT/002",
      status: "draft",
      scheduledDate: "2026-09-27",
      destination: customer2.address,
      responsible: manager.name,
      carrier: "BlueDart Express",
      customerId: customer2.id,
      warehouseId: centralWh.id,
      sourceLocationId: locMfg.id,
      subtotal: 5 * 2000,
      taxRate: 18,
      taxAmount: 5 * 2000 * 0.18,
      totalAmount: 5 * 2000 * 1.18,
      items: {
        create: [
          { productId: panel.id, name: panel.name, sku: panel.sku, quantity: 5, deliveredQty: 0, unitCost: 2000, totalPrice: 10000, unit: "Pieces" }
        ]
      }
    }
  });
  console.log("✅ Demo deliveries");

  // 4) Adjustment: 3 steel damaged at Bay B1
  const adj = await prisma.adjustment.create({
    data: {
      reference: "ADJ/2026/001",
      status: "done",
      countedDate: "2026-09-24",
      locationId: locB1.id,
      reason: "Damage / manufacturing wastage",
      responsible: staff.name,
      notes: "3 steel sheets water damaged",
      totalItems: 1,
      netVarianceQty: -3,
      netVarianceValue: -600,
      items: {
        create: [
          {
            productId: steel.id,
            name: steel.name,
            sku: steel.sku,
            theoreticalQty: 60,
            countedQty: 57,
            variance: -3,
            perUnitCost: 200,
            varianceValue: -600,
            unit: "Pieces"
          }
        ]
      }
    }
  });
  // After moves: dock putaway 100 to B1, then 40 to MFG → B1 steel should be 60; adjust to 57
  await withStockTransaction(async (tx) => {
    await applyAdjustment(tx, {
      productId: steel.id,
      locationId: locB1.id,
      countedQty: 57,
      unit: "Pieces",
      productName: steel.name,
      sku: steel.sku,
      reason: "Damage ADJ/2026/001",
      responsible: staff.name,
      userId: staff.id,
      documentType: "ADJUSTMENT",
      documentId: adj.id,
      reference: adj.reference
    });
  });

  // Draft adjustment for staff counting
  await prisma.adjustment.create({
    data: {
      reference: "ADJ/2026/002",
      status: "draft",
      countedDate: "2026-09-26",
      locationId: locA1.id,
      reason: "Physical count",
      responsible: staff.name,
      totalItems: 1,
      items: {
        create: [
          {
            productId: mcu.id,
            name: mcu.name,
            sku: mcu.sku,
            theoreticalQty: 80,
            countedQty: 80,
            variance: 0,
            perUnitCost: 1450,
            varianceValue: 0,
            unit: "Units"
          }
        ]
      }
    }
  });
  console.log("✅ Demo adjustments");

  const summary = {
    users: await prisma.user.count(),
    products: await prisma.product.count(),
    quants: await prisma.stockQuant.count(),
    receipts: await prisma.receipt.count(),
    deliveries: await prisma.delivery.count(),
    transfers: await prisma.transfer.count(),
    adjustments: await prisma.adjustment.count(),
    movements: await prisma.stockMovement.count()
  };

  const stockSnapshot = await prisma.product.findMany({
    select: {
      sku: true,
      onHand: true,
      freeToUse: true,
      stockQuants: { select: { quantity: true, reservedQty: true, location: { select: { shortcode: true } } } }
    },
    orderBy: { sku: "asc" }
  });

  console.log("🎉 Demo seed complete");
  console.log(summary);
  console.log("Stock snapshot:");
  for (const p of stockSnapshot) {
    const locs = p.stockQuants.map((q) => `${q.location.shortcode}:${q.quantity}(free ${q.quantity - q.reservedQty})`).join(", ");
    console.log(`  ${p.sku} onHand=${p.onHand} → ${locs || "none"}`);
  }
  console.log("");
  console.log("Login:");
  console.log("  owner@stocksense.demo / password123");
  console.log("  manager@stocksense.demo / password123");
  console.log("  staff@stocksense.demo / password123");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
