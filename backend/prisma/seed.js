import prisma from "../config/prisma.js";

async function main() {
  console.log("🌱 Starting Master Data Seeding...");

  // 1. Seed Categories
  const categoriesData = [
    { name: "Electronics", description: "Microcontrollers, ICs, PCBs, power boards" },
    { name: "Hardware", description: "Bolts, fasteners, enclosures, structural metal" },
    { name: "Consumables", description: "Sealants, pastes, lubricants, adhesives" },
    { name: "Packaging", description: "Corrugated boxes, bubble wrap, pallets" },
    { name: "Cabling", description: "Shielded Cat6A cables, copper wires, fiber" },
    { name: "Energy", description: "Lithium-ion battery packs, power supplies, inverters" }
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat
    });
  }
  console.log("✅ Categories seeded");

  // 2. Seed Units of Measure (UOMs)
  const uomsData = [
    { name: "Units", symbol: "unit" },
    { name: "Pieces", symbol: "pcs" },
    { name: "Kilograms", symbol: "kg" },
    { name: "Boxes", symbol: "box" },
    { name: "Cartridges", symbol: "crt" },
    { name: "Drums", symbol: "drm" },
    { name: "Liters", symbol: "L" },
    { name: "Meters", symbol: "m" }
  ];

  for (const uom of uomsData) {
    await prisma.unitOfMeasure.upsert({
      where: { name: uom.name },
      update: {},
      create: uom
    });
  }
  console.log("✅ Units of Measure (UOMs) seeded");

  // 3. Seed Warehouses
  const warehousesData = [
    {
      name: "Central Warehouse & Hub",
      shortcode: "WH",
      address: "Plot 48, Electronic Zone, Phase II, Pune, Maharashtra 411057",
      manager: "Warehouse Manager",
      phone: "+91 98201 44521"
    },
    {
      name: "North Logistics Facility",
      shortcode: "WH-N",
      address: "Building 12, Okhla Industrial Area Phase III, New Delhi 110020",
      manager: "Devendra Patel",
      phone: "+91 98112 33490"
    },
    {
      name: "South Regional Fulfillment Center",
      shortcode: "WH-S",
      address: "77, Peenya Industrial Complex 4th Cross, Bengaluru, Karnataka 560058",
      manager: "Ananya Sharma",
      phone: "+91 94480 88219"
    }
  ];

  for (const wh of warehousesData) {
    await prisma.warehouse.upsert({
      where: { shortcode: wh.shortcode },
      update: {},
      create: wh
    });
  }
  console.log("✅ Warehouses seeded");

  // 4. Seed Storage Locations
  const centralWh = await prisma.warehouse.findUnique({ where: { shortcode: "WH" } });

  const locationsData = [
    {
      name: "WH/Stock/Main Bay A1 (Electronics Bay)",
      shortcode: "WH/STOCK/A1",
      address: "Rack Row A, Section 1, Ground Floor",
      type: "Internal Storage",
      warehouseId: centralWh?.id
    },
    {
      name: "WH/Stock/High-Value Bay A2",
      shortcode: "WH/STOCK/A2",
      address: "Secure Vault A2, Climate Controlled",
      type: "Internal Storage",
      warehouseId: centralWh?.id
    },
    {
      name: "WH/Stock/Heavy Hardware Rack B1",
      shortcode: "WH/STOCK/B1",
      address: "Heavy Duty Racking B1, Ground Floor",
      type: "Internal Storage",
      warehouseId: centralWh?.id
    },
    {
      name: "WH/Stock/Packaging Bay C2",
      shortcode: "WH/STOCK/C2",
      address: "Packaging & Staging Floor C2",
      type: "Internal Storage",
      warehouseId: centralWh?.id
    },
    {
      name: "Vendors/Receiving Dock 1",
      shortcode: "WH/DOCK/IN1",
      address: "Gate 2, North Unloading Bay",
      type: "Incoming Dock",
      warehouseId: centralWh?.id
    },
    {
      name: "WH/Dispatch Bay 1 (Outbound)",
      shortcode: "WH/BAY/OUT1",
      address: "Gate 4, South Loading Dock",
      type: "Outgoing Staging",
      warehouseId: centralWh?.id
    }
  ];

  for (const loc of locationsData) {
    await prisma.location.upsert({
      where: { shortcode: loc.shortcode },
      update: {},
      create: loc
    });
  }
  console.log("✅ Locations seeded");

  // 5. Seed Products
  const electronicsCat = await prisma.category.findUnique({ where: { name: "Electronics" } });
  const hardwareCat = await prisma.category.findUnique({ where: { name: "Hardware" } });
  const consumablesCat = await prisma.category.findUnique({ where: { name: "Consumables" } });
  const packagingCat = await prisma.category.findUnique({ where: { name: "Packaging" } });
  const cablingCat = await prisma.category.findUnique({ where: { name: "Cabling" } });
  const energyCat = await prisma.category.findUnique({ where: { name: "Energy" } });

  const unitsUom = await prisma.unitOfMeasure.findUnique({ where: { name: "Units" } });
  const pcsUom = await prisma.unitOfMeasure.findUnique({ where: { name: "Pieces" } });
  const cartUom = await prisma.unitOfMeasure.findUnique({ where: { name: "Cartridges" } });
  const boxUom = await prisma.unitOfMeasure.findUnique({ where: { name: "Boxes" } });
  const drumUom = await prisma.unitOfMeasure.findUnique({ where: { name: "Drums" } });

  const locA1 = await prisma.location.findUnique({ where: { shortcode: "WH/STOCK/A1" } });
  const locA2 = await prisma.location.findUnique({ where: { shortcode: "WH/STOCK/A2" } });
  const locB1 = await prisma.location.findUnique({ where: { shortcode: "WH/STOCK/B1" } });
  const locC2 = await prisma.location.findUnique({ where: { shortcode: "WH/STOCK/C2" } });

  const productsData = [
    {
      name: "Industrial Micro-Controller Board v2.4",
      sku: "MCU-IND-240",
      description: "High-reliability industrial dual-core MCU control unit",
      perUnitCost: 1450,
      onHand: 150,
      freeToUse: 125,
      minStockAlert: 30,
      categoryId: electronicsCat?.id,
      uomId: unitsUom?.id,
      locationId: locA1?.id
    },
    {
      name: "High-Tensile Hex Bolt M12 x 50mm",
      sku: "BLT-HT-M12",
      description: "Grade 8.8 galvanized steel high-tensile fasteners",
      perUnitCost: 18.5,
      onHand: 2400,
      freeToUse: 2200,
      minStockAlert: 500,
      categoryId: hardwareCat?.id,
      uomId: pcsUom?.id,
      locationId: locB1?.id
    },
    {
      name: "Thermal Silicone Sealant (300ml)",
      sku: "SLNT-TH-300",
      description: "High thermal conductivity industrial electronics potting sealant",
      perUnitCost: 320,
      onHand: 180,
      freeToUse: 140,
      minStockAlert: 50,
      categoryId: consumablesCat?.id,
      uomId: cartUom?.id,
      locationId: locA1?.id
    },
    {
      name: "Reinforced Corrugated Pallet Box (Heavy Duty)",
      sku: "BOX-CRG-HD80",
      description: "Double-walled reinforced pallet storage container 80x80cm",
      perUnitCost: 210,
      onHand: 450,
      freeToUse: 400,
      minStockAlert: 100,
      categoryId: packagingCat?.id,
      uomId: boxUom?.id,
      locationId: locC2?.id
    },
    {
      name: "Shielded Copper Cat6A Cable (305m Drum)",
      sku: "CBL-C6A-305",
      description: "FTP Shielded 10Gbps high-speed networking cable drum",
      perUnitCost: 7800,
      onHand: 28,
      freeToUse: 25,
      minStockAlert: 5,
      categoryId: cablingCat?.id,
      uomId: drumUom?.id,
      locationId: locC2?.id
    },
    {
      name: "Lithium Battery Pack 48V 20Ah",
      sku: "BAT-LITH-48V",
      description: "Rechargeable LiFePO4 battery pack with integrated BMS",
      perUnitCost: 16500,
      onHand: 42,
      freeToUse: 34,
      minStockAlert: 10,
      categoryId: energyCat?.id,
      uomId: unitsUom?.id,
      locationId: locA2?.id
    }
  ];

  for (const prod of productsData) {
    await prisma.product.upsert({
      where: { sku: prod.sku },
      update: {},
      create: prod
    });
  }
  console.log("✅ Products seeded");
  console.log("🎉 Master Data Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
