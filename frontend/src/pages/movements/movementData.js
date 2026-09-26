// Movement Data, Warehouse Racks, BOMs, and Stock Shift History

export const WAREHOUSE_LOCATIONS = [
  { id: 'loc-rack-a1', name: 'WH/Rack-A1 (Electronics Bay)', type: 'internal', capacity: '1000 Units' },
  { id: 'loc-rack-a2', name: 'WH/Rack-A2 (High-Value Storage)', type: 'internal', capacity: '800 Units' },
  { id: 'loc-rack-b1', name: 'WH/Rack-B1 (Heavy Hardware)', type: 'internal', capacity: '2500 Pcs' },
  { id: 'loc-rack-b2', name: 'WH/Rack-B2 (Assembly Supplies)', type: 'internal', capacity: '1200 Units' },
  { id: 'loc-rack-c1', name: 'WH/Rack-C1 (Raw Materials Bay)', type: 'internal', capacity: '3000 Units' },
  { id: 'loc-dock-in', name: 'Vendors/Receiving Dock 1', type: 'incoming', capacity: 'Unloading' },
  { id: 'loc-dock-in2', name: 'Vendors/Receiving Dock 2', type: 'incoming', capacity: 'Unloading' },
  { id: 'loc-dispatch-1', name: 'WH/Dispatch Bay 1 (Outbound)', type: 'outgoing', capacity: 'Staging' },
  { id: 'loc-dispatch-2', name: 'WH/Dispatch Bay 2 (BlueDart Fleet)', type: 'outgoing', capacity: 'Staging' },
  { id: 'loc-production', name: 'WH/Production & Assembly Line 4', type: 'manufacturing', capacity: 'Active Line' }
];

export const STAFF_LIST = [
  { id: 'EMP-101', name: 'Rohit Maurya', role: 'Warehouse Lead' },
  { id: 'EMP-102', name: 'Devendra Patel', role: 'Inventory Shift Manager' },
  { id: 'EMP-103', name: 'Kavita Nair', role: 'Material Handler' },
  { id: 'EMP-104', name: 'Sandeep Varma', role: 'Forklift Operator' }
];

export const PRODUCTS_LIST = [
  {
    id: 'PRD-101',
    name: 'Industrial Micro-Controller Board v2.4',
    sku: 'MCU-IND-240',
    unit: 'Units',
    category: 'Electronics',
    isManufactured: true,
    currentLocation: 'WH/Rack-A1 (Electronics Bay)',
    stockAvailable: 150,
    bom: [
      { rawProductId: 'PRD-102', name: 'Hex Bolt M12 x 50mm', consumeQty: 4, unit: 'Pcs', location: 'WH/Rack-C1 (Raw Materials Bay)' },
      { rawProductId: 'PRD-103', name: 'Thermal Silicone Sealant (300ml)', consumeQty: 0.1, unit: 'Cartridge', location: 'WH/Rack-C1 (Raw Materials Bay)' },
      { rawProductId: 'PRD-105', name: 'Shielded Copper Cat6A Wire', consumeQty: 2, unit: 'Meters', location: 'WH/Rack-C1 (Raw Materials Bay)' }
    ]
  },
  {
    id: 'PRD-102',
    name: 'High-Tensile Hex Bolt M12 x 50mm',
    sku: 'BLT-HT-M12',
    unit: 'Pcs',
    category: 'Hardware',
    isManufactured: false,
    currentLocation: 'WH/Rack-B1 (Heavy Hardware)',
    stockAvailable: 2400
  },
  {
    id: 'PRD-103',
    name: 'Thermal Silicone Sealant (300ml)',
    sku: 'SLNT-TH-300',
    unit: 'Cartridge',
    category: 'Consumables',
    isManufactured: false,
    currentLocation: 'WH/Rack-C1 (Raw Materials Bay)',
    stockAvailable: 180
  },
  {
    id: 'PRD-104',
    name: 'Reinforced Corrugated Box 80x80',
    sku: 'BOX-CRG-HD80',
    unit: 'Box',
    category: 'Packaging',
    isManufactured: false,
    currentLocation: 'WH/Rack-B2 (Assembly Supplies)',
    stockAvailable: 450
  },
  {
    id: 'PRD-105',
    name: 'Shielded Copper Cat6A Cable (305m Drum)',
    sku: 'CBL-C6A-305',
    unit: 'Drum',
    category: 'Cabling',
    isManufactured: false,
    currentLocation: 'WH/Rack-C1 (Raw Materials Bay)',
    stockAvailable: 28
  },
  {
    id: 'PRD-106',
    name: 'Lithium Battery Pack 48V 20Ah',
    sku: 'BAT-LITH-48V',
    unit: 'Units',
    category: 'Energy',
    isManufactured: true,
    currentLocation: 'WH/Rack-A2 (High-Value Storage)',
    stockAvailable: 42,
    bom: [
      { rawProductId: 'PRD-102', name: 'Hex Bolt M12 x 50mm', consumeQty: 6, unit: 'Pcs', location: 'WH/Rack-C1 (Raw Materials Bay)' },
      { rawProductId: 'PRD-105', name: 'Shielded Copper Cat6A Wire', consumeQty: 5, unit: 'Meters', location: 'WH/Rack-C1 (Raw Materials Bay)' }
    ]
  }
];

export const INITIAL_MOVEMENT_HISTORY = [
  // Multi-product incoming receipt shift (IN - Green)
  {
    id: 'mov-101-a',
    reference: 'WH/IN/00042',
    date: '2026-09-26',
    pickTime: '09:30 AM',
    dropTime: '10:15 AM',
    contact: 'TechLogix Industrial Solutions Ltd.',
    fromLocation: 'Vendors/Receiving Dock 1',
    toLocation: 'WH/Rack-A1 (Electronics Bay)',
    productId: 'PRD-101',
    productName: 'Industrial Micro-Controller Board v2.4',
    quantity: 50,
    unit: 'Units',
    type: 'IN', // 'IN' | 'OUT' | 'INTERNAL' | 'MANUFACTURING'
    status: 'Done',
    staffId: 'EMP-101',
    staffName: 'Rohit Maurya',
    linkedDoc: 'WH/IN/00042',
    notes: 'Receipt put-away after dock quality verification'
  },
  {
    id: 'mov-101-b',
    reference: 'WH/IN/00042',
    date: '2026-09-26',
    pickTime: '09:30 AM',
    dropTime: '10:25 AM',
    contact: 'TechLogix Industrial Solutions Ltd.',
    fromLocation: 'Vendors/Receiving Dock 1',
    toLocation: 'WH/Rack-C1 (Raw Materials Bay)',
    productId: 'PRD-103',
    productName: 'Thermal Silicone Sealant (300ml)',
    quantity: 40,
    unit: 'Cartridge',
    type: 'IN',
    status: 'Done',
    staffId: 'EMP-101',
    staffName: 'Rohit Maurya',
    linkedDoc: 'WH/IN/00042',
    notes: 'Sealant cartridges shifted to chemical storage rack'
  },
  // Internal transfer Rack A to Rack B (INTERNAL - Blue)
  {
    id: 'mov-102',
    reference: 'INT/MOVE/00381',
    date: '2026-09-26',
    pickTime: '10:45 AM',
    dropTime: '11:05 AM',
    contact: 'Internal Warehouse Reorganization',
    fromLocation: 'WH/Rack-A1 (Electronics Bay)',
    toLocation: 'WH/Rack-B2 (Assembly Supplies)',
    productId: 'PRD-101',
    productName: 'Industrial Micro-Controller Board v2.4',
    quantity: 20,
    unit: 'Units',
    type: 'INTERNAL',
    status: 'Done',
    staffId: 'EMP-102',
    staffName: 'Devendra Patel',
    linkedDoc: 'INTERNAL-SHIFT',
    notes: 'Transferred 20 units to stage for assembly line'
  },
  // Outgoing delivery order move (OUT - Red)
  {
    id: 'mov-103-a',
    reference: 'WH/OUT/00028',
    date: '2026-09-26',
    pickTime: '11:15 AM',
    dropTime: '11:45 AM',
    contact: 'Bharat Dynamics & Infra Corp',
    fromLocation: 'WH/Rack-A1 (Electronics Bay)',
    toLocation: 'WH/Dispatch Bay 1 (Outbound)',
    productId: 'PRD-101',
    productName: 'Industrial Micro-Controller Board v2.4',
    quantity: 25,
    unit: 'Units',
    type: 'OUT',
    status: 'Done',
    staffId: 'EMP-104',
    staffName: 'Sandeep Varma',
    linkedDoc: 'WH/OUT/00028',
    notes: 'Loaded to dispatch staging pallet #4'
  },
  {
    id: 'mov-103-b',
    reference: 'WH/OUT/00028',
    date: '2026-09-26',
    pickTime: '11:15 AM',
    dropTime: '11:50 AM',
    contact: 'Bharat Dynamics & Infra Corp',
    fromLocation: 'WH/Rack-C1 (Raw Materials Bay)',
    toLocation: 'WH/Dispatch Bay 1 (Outbound)',
    productId: 'PRD-105',
    productName: 'Shielded Copper Cat6A Cable (305m Drum)',
    quantity: 3,
    unit: 'Drum',
    type: 'OUT',
    status: 'Done',
    staffId: 'EMP-104',
    staffName: 'Sandeep Varma',
    linkedDoc: 'WH/OUT/00028',
    notes: 'Moved heavy cable drums via forklift'
  },
  // Manufacturing production auto-consumption
  {
    id: 'mov-104-prod',
    reference: 'MO/PROD/2026-09',
    date: '2026-09-25',
    pickTime: '02:00 PM',
    dropTime: '02:40 PM',
    contact: 'Assembly Line 4 Production',
    fromLocation: 'WH/Production & Assembly Line 4',
    toLocation: 'WH/Rack-A2 (High-Value Storage)',
    productId: 'PRD-106',
    productName: 'Lithium Battery Pack 48V 20Ah',
    quantity: 10,
    unit: 'Units',
    type: 'INTERNAL',
    status: 'Done',
    staffId: 'EMP-103',
    staffName: 'Kavita Nair',
    linkedDoc: 'MO-2026-0012',
    notes: 'Manufactured 10 battery packs -> Auto-consumed 60 bolts and 50m cable'
  }
];
