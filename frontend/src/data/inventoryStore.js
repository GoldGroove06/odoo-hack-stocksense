// Central Inventory Store: Stocks, Warehouses, Locations, Adjustments, Receipts & Deliveries

export const INITIAL_WAREHOUSES = [
  {
    id: 'wh-1',
    name: 'Central Warehouse & Hub',
    shortcode: 'WH',
    address: 'Plot 48, Electronic Zone, Phase II, Pune, Maharashtra 411057',
    manager: 'Warehouse Manager',
    phone: '+91 98201 44521',
    totalLocations: 6,
    capacity: '10,000 m³',
    status: 'Active'
  },
  {
    id: 'wh-2',
    name: 'North Logistics Facility',
    shortcode: 'WH-N',
    address: 'Building 12, Okhla Industrial Area Phase III, New Delhi 110020',
    manager: 'Devendra Patel',
    phone: '+91 98112 33490',
    totalLocations: 4,
    capacity: '6,500 m³',
    status: 'Active'
  },
  {
    id: 'wh-3',
    name: 'South Regional Fulfillment Center',
    shortcode: 'WH-S',
    address: '77, Peenya Industrial Complex 4th Cross, Bengaluru, Karnataka 560058',
    manager: 'Ananya Sharma',
    phone: '+91 94480 88219',
    totalLocations: 5,
    capacity: '8,200 m³',
    status: 'Active'
  }
];

export const INITIAL_LOCATIONS = [
  {
    id: 'loc-1',
    name: 'WH/Stock/Main Bay A1 (Electronics Bay)',
    shortcode: 'WH/STOCK/A1',
    warehouse: 'Central Warehouse & Hub (WH)',
    address: 'Rack Row A, Section 1, Ground Floor',
    type: 'Internal Storage',
    capacity: '1,500 Units',
    status: 'Active'
  },
  {
    id: 'loc-2',
    name: 'WH/Stock/High-Value Bay A2',
    shortcode: 'WH/STOCK/A2',
    warehouse: 'Central Warehouse & Hub (WH)',
    address: 'Secure Vault A2, Climate Controlled',
    type: 'Internal Storage',
    capacity: '800 Units',
    status: 'Active'
  },
  {
    id: 'loc-3',
    name: 'WH/Stock/Heavy Hardware Rack B1',
    shortcode: 'WH/STOCK/B1',
    warehouse: 'Central Warehouse & Hub (WH)',
    address: 'Heavy Duty Racking B1, Ground Floor',
    type: 'Internal Storage',
    capacity: '3,500 Pcs',
    status: 'Active'
  },
  {
    id: 'loc-4',
    name: 'WH/Stock/Packaging Bay C2',
    shortcode: 'WH/STOCK/C2',
    warehouse: 'Central Warehouse & Hub (WH)',
    address: 'Packaging & Staging Floor C2',
    type: 'Internal Storage',
    capacity: '2,000 Units',
    status: 'Active'
  },
  {
    id: 'loc-5',
    name: 'Vendors/Receiving Dock 1',
    shortcode: 'WH/DOCK/IN1',
    warehouse: 'Central Warehouse & Hub (WH)',
    address: 'Gate 2, North Unloading Bay',
    type: 'Incoming Dock',
    capacity: 'Unloading Staging',
    status: 'Active'
  },
  {
    id: 'loc-6',
    name: 'WH/Dispatch Bay 1 (Outbound)',
    shortcode: 'WH/BAY/OUT1',
    warehouse: 'Central Warehouse & Hub (WH)',
    address: 'Gate 4, South Loading Dock',
    type: 'Outgoing Staging',
    capacity: 'Dispatch Staging',
    status: 'Active'
  }
];

export const INITIAL_STOCKS = [
  {
    id: 'stk-101',
    name: 'Industrial Micro-Controller Board v2.4',
    sku: 'MCU-IND-240',
    category: 'Electronics',
    unit: 'Units',
    perUnitCost: 1450,
    onHand: 150,
    reserved: 25, // Reserved for active orders
    freeToUse: 125, // onHand - reserved
    location: 'WH/Stock/Main Bay A1 (Electronics Bay)',
    minStockAlert: 30
  },
  {
    id: 'stk-102',
    name: 'High-Tensile Hex Bolt M12 x 50mm',
    sku: 'BLT-HT-M12',
    category: 'Hardware',
    unit: 'Pcs',
    perUnitCost: 18.5,
    onHand: 2400,
    reserved: 200,
    freeToUse: 2200,
    location: 'WH/Stock/Heavy Hardware Rack B1',
    minStockAlert: 500
  },
  {
    id: 'stk-103',
    name: 'Thermal Silicone Sealant (300ml)',
    sku: 'SLNT-TH-300',
    category: 'Consumables',
    unit: 'Cartridge',
    perUnitCost: 320,
    onHand: 180,
    reserved: 40,
    freeToUse: 140,
    location: 'WH/Stock/Main Bay A1 (Electronics Bay)',
    minStockAlert: 50
  },
  {
    id: 'stk-104',
    name: 'Reinforced Corrugated Pallet Box (Heavy Duty)',
    sku: 'BOX-CRG-HD80',
    category: 'Packaging',
    unit: 'Box',
    perUnitCost: 210,
    onHand: 450,
    reserved: 50,
    freeToUse: 400,
    location: 'WH/Stock/Packaging Bay C2',
    minStockAlert: 100
  },
  {
    id: 'stk-105',
    name: 'Shielded Copper Cat6A Cable (305m Drum)',
    sku: 'CBL-C6A-305',
    category: 'Cabling',
    unit: 'Drum',
    perUnitCost: 7800,
    onHand: 28,
    reserved: 3,
    freeToUse: 25,
    location: 'WH/Stock/Packaging Bay C2',
    minStockAlert: 5
  },
  {
    id: 'stk-106',
    name: 'Lithium Battery Pack 48V 20Ah',
    sku: 'BAT-LITH-48V',
    category: 'Energy',
    unit: 'Units',
    perUnitCost: 16500,
    onHand: 42,
    reserved: 8,
    freeToUse: 34,
    location: 'WH/Stock/High-Value Bay A2',
    minStockAlert: 10
  }
];

export const INITIAL_ADJUSTMENTS = [
  {
    id: 'adj-001',
    reference: 'ADJ/2026/001',
    date: '2026-09-25',
    productName: 'High-Tensile Hex Bolt M12 x 50mm',
    sku: 'BLT-HT-M12',
    unit: 'Pcs',
    location: 'WH/Stock/Heavy Hardware Rack B1',
    theoreticalQty: 2450,
    countedQty: 2400,
    difference: -50,
    reason: 'Physical count discrepancy / Discarded damaged bolts',
    responsible: 'Warehouse Staff',
    status: 'Applied'
  },
  {
    id: 'adj-002',
    reference: 'ADJ/2026/002',
    date: '2026-09-26',
    productName: 'Thermal Silicone Sealant (300ml)',
    sku: 'SLNT-TH-300',
    unit: 'Cartridge',
    location: 'WH/Stock/Main Bay A1 (Electronics Bay)',
    theoreticalQty: 175,
    countedQty: 180,
    difference: 5,
    reason: 'Unregistered sample return from QC station',
    responsible: 'Devendra Patel',
    status: 'Applied'
  },
  {
    id: 'adj-003',
    reference: 'ADJ/2026/003',
    date: '2026-09-26',
    productName: 'Industrial Micro-Controller Board v2.4',
    sku: 'MCU-IND-240',
    unit: 'Units',
    location: 'WH/Stock/Main Bay A1 (Electronics Bay)',
    theoreticalQty: 152,
    countedQty: 150,
    difference: -2,
    reason: 'Damaged in transit inspection',
    responsible: 'Ananya Sharma',
    status: 'Draft'
  }
];
