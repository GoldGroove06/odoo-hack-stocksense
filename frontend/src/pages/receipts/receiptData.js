// Sample initial data and catalog for Goods Receipt Note (GRN)

export const SAMPLE_SUPPLIERS = [
  {
    id: 'sup-1',
    name: 'TechLogix Industrial Solutions Ltd.',
    gstNumber: '27AAACT2727Q1ZR',
    phone: '+91 98201 44521',
    email: 'dispatch@techlogix.ind.in',
    address: 'Plot 48, Electronic Zone, Phase II',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411057',
    contactPerson: 'Vikram Mehta'
  },
  {
    id: 'sup-2',
    name: 'Apex Precision Metals & Hardware',
    gstNumber: '07AABCA1234F1Z5',
    phone: '+91 98112 33490',
    email: 'orders@apexmetals.com',
    address: 'Building 12, Okhla Industrial Area, Phase III',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110020',
    contactPerson: 'Suresh Singhania'
  },
  {
    id: 'sup-3',
    name: 'GreenEarth Packaging Corp',
    gstNumber: '29ABCDE6789K1Z3',
    phone: '+91 94480 88219',
    email: 'sales@greenearthpack.com',
    address: '77, Peenya Industrial Complex 4th Cross',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560058',
    contactPerson: 'Pooja Hegde'
  }
];

export const STAFF_MEMBERS = [
  { id: 'staff-1', name: 'Rohit Maurya', role: 'Warehouse Lead' },
  { id: 'staff-2', name: 'Ananya Sharma', role: 'Inventory Controller' },
  { id: 'staff-3', name: 'Devendra Patel', role: 'Operations Manager' },
  { id: 'staff-4', name: 'Priya Iyer', role: 'Quality Inspector' }
];

export const PRODUCT_CATALOG = [
  {
    id: 'prod-101',
    name: 'Industrial Micro-Controller Board v2.4',
    sku: 'MCU-IND-240',
    unit: 'Units',
    defaultCost: 1450,
    category: 'Electronics'
  },
  {
    id: 'prod-102',
    name: 'High-Tensile Hex Bolt M12 x 50mm',
    sku: 'BLT-HT-M12',
    unit: 'Pcs',
    defaultCost: 18.5,
    category: 'Hardware'
  },
  {
    id: 'prod-103',
    name: 'Thermal Silicone Sealant (300ml)',
    sku: 'SLNT-TH-300',
    unit: 'Cartridge',
    defaultCost: 320,
    category: 'Consumables'
  },
  {
    id: 'prod-104',
    name: 'Reinforced Corrugated Pallet Box (Heavy Duty)',
    sku: 'BOX-CRG-HD80',
    unit: 'Box',
    defaultCost: 210,
    category: 'Packaging'
  },
  {
    id: 'prod-105',
    name: 'Shielded Copper Cat6A Cable (305m Drum)',
    sku: 'CBL-C6A-305',
    unit: 'Drum',
    defaultCost: 7800,
    category: 'Cabling'
  },
  {
    id: 'prod-106',
    name: 'Lithium Battery Pack 48V 20Ah',
    sku: 'BAT-LITH-48V',
    unit: 'Units',
    defaultCost: 16500,
    category: 'Energy'
  }
];

// Helper to generate formatted reference: <Warehouse>/<Operation>/<ID>
export function generateReference(warehouse = 'WH', operation = 'IN', idNumber = 1) {
  const paddedId = String(idNumber).padStart(3, '0');
  return `${warehouse}/${operation}/${paddedId}`;
}

export const INITIAL_RECEIPTS_LIST = [
  {
    id: 'rec-001',
    warehouseCode: 'WH',
    operationCode: 'IN',
    numericId: 1,
    internalNumber: 'WH/IN/001',
    from: 'TechLogix Industrial Solutions Ltd.',
    to: 'WH/Stock/Main Bay A1',
    contact: 'Vikram Mehta (+91 98201 44521)',
    sellerBillNumber: 'INV-TL-2026-904',
    createdOn: '2026-09-26 10:30 AM',
    scheduledDate: '2026-09-28',
    responsible: 'Rohit Maurya',
    responsibleId: 'staff-1',
    status: 'ready', // 'draft' | 'in_progress' | 'ready' | 'done' | 'cancelled'
    movementStatus: 'arrived',
    sourceDocument: 'PO-2026-0189',
    warehouseLocation: 'WH/Stock/Main Bay A1',
    notes: 'Fragile electronics. Keep pallets dry and inspect tamper-evident seals on delivery.',
    // Linked Manufacturing & Work Orders
    manufacturingOrder: {
      moNumber: 'MO/2026/001',
      productName: 'Smart Energy Management Unit',
      targetQty: 50,
      workOrders: [
        { id: 'WO/001', name: 'PCB Assembly & Soldering', workstation: 'Workstation 1', status: 'In Progress', progress: 75 },
        { id: 'WO/002', name: 'Sub-assembly Wire Harnessing', workstation: 'Workstation 2', status: 'Ready', progress: 40 },
        { id: 'WO/003', name: 'High-Voltage Safety Testing', workstation: 'QC Station 4', status: 'Pending', progress: 0 }
      ]
    },
    supplier: {
      id: 'sup-1',
      name: 'TechLogix Industrial Solutions Ltd.',
      gstNumber: '27AAACT2727Q1ZR',
      phone: '+91 98201 44521',
      email: 'dispatch@techlogix.ind.in',
      address: 'Plot 48, Electronic Zone, Phase II',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411057',
      contactPerson: 'Vikram Mehta'
    },
    taxRate: 18,
    items: [
      {
        id: 'item-1',
        productId: 'prod-101',
        productName: 'Industrial Micro-Controller Board v2.4',
        sku: 'MCU-IND-240',
        cost: 1450,
        unit: 'Units',
        qty: 50,
        receivedQty: 50,
        totalPrice: 72500
      },
      {
        id: 'item-2',
        productId: 'prod-103',
        productName: 'Thermal Silicone Sealant (300ml)',
        sku: 'SLNT-TH-300',
        cost: 320,
        unit: 'Cartridge',
        qty: 40,
        receivedQty: 40,
        totalPrice: 12800
      }
    ]
  },
  {
    id: 'rec-002',
    warehouseCode: 'WH',
    operationCode: 'IN',
    numericId: 2,
    internalNumber: 'WH/IN/002',
    from: 'Apex Precision Metals & Hardware',
    to: 'WH/Stock/Heavy Rack B1',
    contact: 'Suresh Singhania (+91 98112 33490)',
    sellerBillNumber: 'APEX-BILL-771',
    createdOn: '2026-09-26 11:00 AM',
    scheduledDate: '2026-09-29',
    responsible: 'Devendra Patel',
    responsibleId: 'staff-3',
    status: 'in_progress',
    movementStatus: 'moving',
    sourceDocument: 'PO-2026-0195',
    warehouseLocation: 'WH/Stock/Heavy Rack B1',
    notes: 'Heavy hardware fasteners. Palletized delivery via flatbed truck.',
    manufacturingOrder: {
      moNumber: 'MO/2026/002',
      productName: 'Heavy Duty Structural Frame Assembly',
      targetQty: 100,
      workOrders: [
        { id: 'WO/101', name: 'CNC Cutting & Metal Bending', workstation: 'Workstation 3', status: 'Done', progress: 100 },
        { id: 'WO/102', name: 'Bolt Fastening & Torque Calibration', workstation: 'Assembly Bay 2', status: 'In Progress', progress: 50 }
      ]
    },
    supplier: {
      id: 'sup-2',
      name: 'Apex Precision Metals & Hardware',
      gstNumber: '07AABCA1234F1Z5',
      phone: '+91 98112 33490',
      email: 'orders@apexmetals.com',
      address: 'Building 12, Okhla Industrial Area, Phase III',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110020',
      contactPerson: 'Suresh Singhania'
    },
    taxRate: 18,
    items: [
      {
        id: 'item-201',
        productId: 'prod-102',
        productName: 'High-Tensile Hex Bolt M12 x 50mm',
        sku: 'BLT-HT-M12',
        cost: 18.5,
        unit: 'Pcs',
        qty: 2000,
        receivedQty: 2000,
        totalPrice: 37000
      }
    ]
  },
  {
    id: 'rec-003',
    warehouseCode: 'WH',
    operationCode: 'IN',
    numericId: 3,
    internalNumber: 'WH/IN/003',
    from: 'GreenEarth Packaging Corp',
    to: 'WH/Stock/Packaging Bay C2',
    contact: 'Pooja Hegde (+91 94480 88219)',
    sellerBillNumber: 'GE-PAC-992',
    createdOn: '2026-09-25 04:15 PM',
    scheduledDate: '2026-09-26',
    responsible: 'Ananya Sharma',
    responsibleId: 'staff-2',
    status: 'done',
    movementStatus: 'received',
    sourceDocument: 'PO-2026-0182',
    warehouseLocation: 'WH/Stock/Packaging Bay C2',
    notes: 'Received and verified in full. Stored in dry bay.',
    manufacturingOrder: null,
    supplier: {
      id: 'sup-3',
      name: 'GreenEarth Packaging Corp',
      gstNumber: '29ABCDE6789K1Z3',
      phone: '+91 94480 88219',
      email: 'sales@greenearthpack.com',
      address: '77, Peenya Industrial Complex 4th Cross',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560058',
      contactPerson: 'Pooja Hegde'
    },
    taxRate: 12,
    items: [
      {
        id: 'item-301',
        productId: 'prod-104',
        productName: 'Reinforced Corrugated Pallet Box (Heavy Duty)',
        sku: 'BOX-CRG-HD80',
        cost: 210,
        unit: 'Box',
        qty: 300,
        receivedQty: 300,
        totalPrice: 63000
      }
    ]
  },
  {
    id: 'rec-004',
    warehouseCode: 'WH',
    operationCode: 'IN',
    numericId: 4,
    internalNumber: 'WH/IN/004',
    from: 'TechLogix Industrial Solutions Ltd.',
    to: 'WH/Stock/High-Value Bay A2',
    contact: 'Vikram Mehta (+91 98201 44521)',
    sellerBillNumber: 'INV-TL-2026-950',
    createdOn: '2026-09-26 09:00 AM',
    scheduledDate: '2026-10-02',
    responsible: 'Rohit Maurya',
    responsibleId: 'staff-1',
    status: 'draft',
    movementStatus: 'creation',
    sourceDocument: 'PO-2026-0204',
    warehouseLocation: 'WH/Stock/High-Value Bay A2',
    notes: 'Draft purchase receipt awaiting vendor confirmation.',
    manufacturingOrder: {
      moNumber: 'MO/2026/004',
      productName: 'High Capacity Energy Storage Pack',
      targetQty: 25,
      workOrders: [
        { id: 'WO/201', name: 'Lithium Cell Array Balancing', workstation: 'Battery Lab 1', status: 'Pending', progress: 0 },
        { id: 'WO/202', name: 'Thermal Insulation Packing', workstation: 'Assembly Bay 4', status: 'Pending', progress: 0 }
      ]
    },
    supplier: {
      id: 'sup-1',
      name: 'TechLogix Industrial Solutions Ltd.',
      gstNumber: '27AAACT2727Q1ZR',
      phone: '+91 98201 44521',
      email: 'dispatch@techlogix.ind.in',
      address: 'Plot 48, Electronic Zone, Phase II',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411057',
      contactPerson: 'Vikram Mehta'
    },
    taxRate: 18,
    items: [
      {
        id: 'item-401',
        productId: 'prod-106',
        productName: 'Lithium Battery Pack 48V 20Ah',
        sku: 'BAT-LITH-48V',
        cost: 16500,
        unit: 'Units',
        qty: 25,
        receivedQty: 0,
        totalPrice: 412500
      }
    ]
  }
];

export const INITIAL_RECEIPT = INITIAL_RECEIPTS_LIST[0];
