// Sample data for Outgoing Deliveries / Delivery Orders (WH/OUT)

export const SAMPLE_CUSTOMERS = [
  {
    id: 'cust-1',
    name: 'Bharat Dynamics & Infra Corp',
    gstNumber: '27AAACB3829M1ZQ',
    phone: '+91 98230 11982',
    email: 'procurement@bharatdynamics.co.in',
    shippingAddress: 'Plot 104, MIDC Industrial Area, Phase IV',
    city: 'Navi Mumbai',
    state: 'Maharashtra',
    pincode: '400705',
    contactPerson: 'Arun Deshmukh'
  },
  {
    id: 'cust-2',
    name: 'Zenith Robotics & Automation Pvt Ltd',
    gstNumber: '29AABCZ9981P1ZV',
    phone: '+91 97401 55621',
    email: 'stores@zenithrobotics.com',
    shippingAddress: 'Unit 5B, Electronic City Phase 1',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560100',
    contactPerson: 'Sandeep Varma'
  },
  {
    id: 'cust-3',
    name: 'Matrix Cloud Infrastructure Ltd',
    gstNumber: '06AAACM7712E1ZU',
    phone: '+91 98100 44329',
    email: 'logistics@matrixcloud.in',
    shippingAddress: 'Cyber City, Tower 8, 4th Floor',
    city: 'Gurugram',
    state: 'Haryana',
    pincode: '122002',
    contactPerson: 'Neha Kapoor'
  }
];

export const DISPATCH_STAFF = [
  { id: 'staff-1', name: 'Rohit Maurya', role: 'Logistics Supervisor' },
  { id: 'staff-2', name: 'Kavita Nair', role: 'Dispatch Coordinator' },
  { id: 'staff-3', name: 'Devendra Patel', role: 'Operations Manager' },
  { id: 'staff-4', name: 'Rahul Verma', role: 'Fleet Manager' }
];

export const DELIVERY_PRODUCT_CATALOG = [
  {
    id: 'prod-101',
    name: 'Industrial Micro-Controller Board v2.4',
    sku: 'MCU-IND-240',
    unit: 'Units',
    defaultPrice: 1850,
    category: 'Electronics'
  },
  {
    id: 'prod-102',
    name: 'High-Tensile Hex Bolt M12 x 50mm (Pack of 100)',
    sku: 'BLT-HT-M12-PK',
    unit: 'Box',
    defaultPrice: 950,
    category: 'Hardware'
  },
  {
    id: 'prod-103',
    name: 'Thermal Silicone Sealant (300ml)',
    sku: 'SLNT-TH-300',
    unit: 'Cartridge',
    defaultPrice: 420,
    category: 'Consumables'
  },
  {
    id: 'prod-105',
    name: 'Shielded Copper Cat6A Cable (305m Drum)',
    sku: 'CBL-C6A-305',
    unit: 'Drum',
    defaultPrice: 9800,
    category: 'Cabling'
  },
  {
    id: 'prod-106',
    name: 'Lithium Battery Pack 48V 20Ah',
    sku: 'BAT-LITH-48V',
    unit: 'Units',
    defaultPrice: 21500,
    category: 'Energy'
  }
];

// Helper to generate formatted delivery reference: <Warehouse>/<Operation>/<ID>
export function generateDeliveryReference(warehouse = 'WH', operation = 'OUT', idNumber = 1) {
  const paddedId = String(idNumber).padStart(3, '0');
  return `${warehouse}/${operation}/${paddedId}`;
}

export const INITIAL_DELIVERIES_LIST = [
  {
    id: 'del-001',
    warehouseCode: 'WH',
    operationCode: 'OUT',
    numericId: 1,
    internalNumber: 'WH/OUT/001',
    from: 'WH/Stock/Dispatch Bay 1',
    to: 'Bharat Dynamics - Navi Mumbai',
    contact: 'Arun Deshmukh (+91 98230 11982)',
    sourceDocument: 'SO-2026-0812',
    customerReference: 'PO-BD-7719',
    createdOn: '2026-09-26 11:15 AM',
    scheduledDate: '2026-09-29',
    responsible: 'Rohit Maurya',
    responsibleId: 'staff-1',
    status: 'ready', // 'draft' | 'in_progress' | 'ready' | 'done' | 'cancelled'
    movementStatus: 'packing',
    shippingPolicy: 'As soon as possible',
    carrier: 'BlueDart Express Cargo',
    trackingNumber: 'BD-EXP-8891042',
    vehicleNumber: 'MH-12-QX-4890',
    warehouseLocation: 'WH/Stock/Dispatch Bay 1',
    notes: 'Handle with care. Contact customer site manager 2 hours before arrival.',
    customer: {
      id: 'cust-1',
      name: 'Bharat Dynamics & Infra Corp',
      gstNumber: '27AAACB3829M1ZQ',
      phone: '+91 98230 11982',
      email: 'procurement@bharatdynamics.co.in',
      shippingAddress: 'Plot 104, MIDC Industrial Area, Phase IV',
      city: 'Navi Mumbai',
      state: 'Maharashtra',
      pincode: '400705',
      contactPerson: 'Arun Deshmukh'
    },
    taxRate: 18,
    items: [
      {
        id: 'del-item-1',
        productId: 'prod-101',
        productName: 'Industrial Micro-Controller Board v2.4',
        sku: 'MCU-IND-240',
        cost: 1850,
        unit: 'Units',
        qty: 25,
        doneQty: 25,
        totalPrice: 46250
      },
      {
        id: 'del-item-2',
        productId: 'prod-105',
        productName: 'Shielded Copper Cat6A Cable (305m Drum)',
        sku: 'CBL-C6A-305',
        cost: 9800,
        unit: 'Drum',
        qty: 3,
        doneQty: 3,
        totalPrice: 29400
      }
    ]
  },
  {
    id: 'del-002',
    warehouseCode: 'WH',
    operationCode: 'OUT',
    numericId: 2,
    internalNumber: 'WH/OUT/002',
    from: 'WH/Stock/High-Value Bay A2',
    to: 'Zenith Robotics - Electronic City Bengaluru',
    contact: 'Sandeep Varma (+91 97401 55621)',
    sourceDocument: 'SO-2026-0820',
    customerReference: 'ZR-PO-9912',
    createdOn: '2026-09-26 09:45 AM',
    scheduledDate: '2026-09-30',
    responsible: 'Kavita Nair',
    responsibleId: 'staff-2',
    status: 'in_progress',
    movementStatus: 'moving',
    shippingPolicy: 'Direct Delivery',
    carrier: 'FedEx Express Freight',
    trackingNumber: 'FX-IND-448201',
    vehicleNumber: 'KA-01-MJ-8821',
    warehouseLocation: 'WH/Stock/High-Value Bay A2',
    notes: 'Urgent delivery for robotics automation project.',
    customer: {
      id: 'cust-2',
      name: 'Zenith Robotics & Automation Pvt Ltd',
      gstNumber: '29AABCZ9981P1ZV',
      phone: '+91 97401 55621',
      email: 'stores@zenithrobotics.com',
      shippingAddress: 'Unit 5B, Electronic City Phase 1',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560100',
      contactPerson: 'Sandeep Varma'
    },
    taxRate: 18,
    items: [
      {
        id: 'del-item-201',
        productId: 'prod-106',
        productName: 'Lithium Battery Pack 48V 20Ah',
        sku: 'BAT-LITH-48V',
        cost: 21500,
        unit: 'Units',
        qty: 8,
        doneQty: 8,
        totalPrice: 172000
      }
    ]
  },
  {
    id: 'del-003',
    warehouseCode: 'WH',
    operationCode: 'OUT',
    numericId: 3,
    internalNumber: 'WH/OUT/003',
    from: 'WH/Stock/Heavy Bay B1',
    to: 'Matrix Cloud Infrastructure - Gurugram',
    contact: 'Neha Kapoor (+91 98100 44329)',
    sourceDocument: 'SO-2026-0798',
    customerReference: 'MC-2026-PO18',
    createdOn: '2026-09-25 02:30 PM',
    scheduledDate: '2026-09-26',
    responsible: 'Devendra Patel',
    responsibleId: 'staff-3',
    status: 'done',
    movementStatus: 'delivered',
    shippingPolicy: 'Standard Ground',
    carrier: 'DHL Supply Chain',
    trackingNumber: 'DHL-DEL-990184',
    vehicleNumber: 'HR-26-BV-1029',
    warehouseLocation: 'WH/Stock/Heavy Bay B1',
    notes: 'Signed proof of delivery uploaded.',
    customer: {
      id: 'cust-3',
      name: 'Matrix Cloud Infrastructure Ltd',
      gstNumber: '06AAACM7712E1ZU',
      phone: '+91 98100 44329',
      email: 'logistics@matrixcloud.in',
      shippingAddress: 'Cyber City, Tower 8, 4th Floor',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122002',
      contactPerson: 'Neha Kapoor'
    },
    taxRate: 18,
    items: [
      {
        id: 'del-item-301',
        productId: 'prod-102',
        productName: 'High-Tensile Hex Bolt M12 x 50mm (Pack of 100)',
        sku: 'BLT-HT-M12-PK',
        cost: 950,
        unit: 'Box',
        qty: 50,
        doneQty: 50,
        totalPrice: 47500
      }
    ]
  }
];

export const INITIAL_DELIVERY = INITIAL_DELIVERIES_LIST[0];
