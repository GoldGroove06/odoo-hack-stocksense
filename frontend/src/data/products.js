const DEMO_PRODUCTS = [
  {
    id: '1',
    name: 'Steel Glass Panel',
    category: 'finished_goods',
    totalQuantity: 120,
    qtyOnHand: 120,
    reorderPoint: 20,
    location: { id: 'loc-1', name: 'Warehouse A' },
    productCode: 'FG-001',
    initialStock: 40,
    manufactureType: 'manufacturing',
    rawMaterials: [
      { id: 'rm-1', name: 'Steel' },
      { id: 'rm-2', name: 'Glass' },
      { id: 'rm-3', name: 'XYZ' },
    ],
  },
  {
    id: '2',
    name: 'Steel',
    category: 'raw_material',
    totalQuantity: 500,
    qtyOnHand: 500,
    reorderPoint: 100,
    location: { id: 'loc-1', name: 'Warehouse A' },
    productCode: 'RM-001',
    initialStock: 500,
    manufactureType: 'trading',
    rawMaterials: [],
  },
  {
    id: '3',
    name: 'Glass',
    category: 'raw_material',
    totalQuantity: 300,
    qtyOnHand: 12,
    reorderPoint: 50,
    location: { id: 'loc-2', name: 'Warehouse B' },
    productCode: 'RM-002',
    initialStock: 300,
    manufactureType: 'trading',
    rawMaterials: [],
  },
  {
    id: '4',
    name: 'XYZ',
    category: 'raw_material',
    totalQuantity: 150,
    qtyOnHand: 8,
    reorderPoint: 30,
    location: { id: 'loc-2', name: 'Warehouse B' },
    productCode: 'RM-003',
    initialStock: 150,
    manufactureType: 'trading',
    rawMaterials: [],
  },
  {
    id: '5',
    name: 'Aluminum Frame',
    category: 'raw_material',
    totalQuantity: 0,
    qtyOnHand: 0,
    reorderPoint: 25,
    location: { id: 'loc-1', name: 'Warehouse A' },
    productCode: 'RM-004',
    initialStock: 80,
    manufactureType: 'trading',
    rawMaterials: [],
  },
  {
    id: '6',
    name: 'Sealant Kit',
    category: 'finished_goods',
    totalQuantity: 0,
    qtyOnHand: 0,
    reorderPoint: 15,
    location: { id: 'loc-2', name: 'Warehouse B' },
    productCode: 'FG-002',
    initialStock: 40,
    manufactureType: 'trading',
    rawMaterials: [],
  },
]

const DEMO_FORM_INIT = {
  nextProductCode: 'FG-004',
  locations: [
    { id: 'loc-1', name: 'Warehouse A' },
    { id: 'loc-2', name: 'Warehouse B' },
  ],
  rawMaterials: [
    { id: 'rm-1', name: 'Steel' },
    { id: 'rm-2', name: 'Glass' },
    { id: 'rm-3', name: 'XYZ' },
  ],
}

function delay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function applyFilter(products, filter) {
  if (filter === 'out_of_stock') {
    return products.filter((p) => p.qtyOnHand <= 0)
  }
  if (filter === 'low_stock') {
    return products.filter((p) => p.qtyOnHand > 0 && p.qtyOnHand <= p.reorderPoint)
  }
  return products
}

export async function fetchProducts({ filter } = {}) {
  await delay(400)
  return { products: applyFilter(DEMO_PRODUCTS, filter) }
}

export async function fetchProductFormInit() {
  await delay(400)
  return { ...DEMO_FORM_INIT }
}

export async function createProduct(payload) {
  await delay(400)
  console.log(payload)
  return { ok: true }
}
