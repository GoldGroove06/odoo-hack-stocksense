function delay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const DEMO_DASHBOARD = {
  kpis: {
    totalProductsInStock: 42,
    lowStockCount: 5,
    outOfStockCount: 2,
    totalStockValue: 128450.5,
    totalQuantity: 1840,
  },
  charts: {
    stockValueTrend: [
      { date: '2026-09-13', value: 98000 },
      { date: '2026-09-15', value: 102500 },
      { date: '2026-09-17', value: 108200 },
      { date: '2026-09-19', value: 110000 },
      { date: '2026-09-21', value: 115400 },
      { date: '2026-09-23', value: 121000 },
      { date: '2026-09-25', value: 125800 },
      { date: '2026-09-26', value: 128450.5 },
    ],
    stockByCategory: [
      { category: 'Raw material', quantity: 950 },
      { category: 'Finished goods', quantity: 890 },
    ],
    deliveriesByStatus: [
      { status: 'created', count: 2 },
      { status: 'moving', count: 1 },
      { status: 'manufacturing', count: 2 },
      { status: 'packing', count: 3 },
      { status: 'ready', count: 1 },
      { status: 'validated', count: 4 },
    ],
  },
  pendingReceipts: [
    {
      id: 'rcpt-1',
      reference: 'IN/0001',
      partner: 'Acme Supply',
      status: 'pending',
      expectedDate: '2026-09-28',
      lines: 4,
    },
    {
      id: 'rcpt-2',
      reference: 'IN/0002',
      partner: 'North Metals',
      status: 'confirmed',
      expectedDate: '2026-09-30',
      lines: 2,
    },
    {
      id: 'rcpt-3',
      reference: 'IN/0003',
      partner: 'GlassCo',
      status: 'pending',
      expectedDate: '2026-10-02',
      lines: 6,
    },
  ],
  pendingDeliveries: [
    {
      id: 'do-1',
      reference: 'OUT/0001',
      partner: 'Beta Retail',
      status: 'packing',
      scheduledDate: '2026-09-27',
      lines: 3,
    },
    {
      id: 'do-2',
      reference: 'OUT/0002',
      partner: 'City Builders',
      status: 'manufacturing',
      scheduledDate: '2026-09-28',
      lines: 5,
    },
    {
      id: 'do-3',
      reference: 'OUT/0003',
      partner: 'Delta Traders',
      status: 'ready',
      scheduledDate: '2026-09-26',
      lines: 1,
    },
    {
      id: 'do-4',
      reference: 'OUT/0004',
      partner: 'East Logistics',
      status: 'created',
      scheduledDate: '2026-10-01',
      lines: 8,
    },
  ],
  internalTransfers: {
    pendingCount: 3,
    items: [
      {
        id: 'tr-1',
        reference: 'INT/0001',
        fromLocation: 'Warehouse A',
        toLocation: 'Warehouse B',
        status: 'scheduled',
        scheduledDate: '2026-09-26',
      },
      {
        id: 'tr-2',
        reference: 'INT/0002',
        fromLocation: 'Warehouse B',
        toLocation: 'Warehouse A',
        status: 'in_transit',
        scheduledDate: '2026-09-27',
      },
      {
        id: 'tr-3',
        reference: 'INT/0003',
        fromLocation: 'Warehouse A',
        toLocation: 'Warehouse B',
        status: 'scheduled',
        scheduledDate: '2026-09-29',
      },
    ],
  },
  notifications: [
    {
      id: 'n1',
      title: 'Low stock: Glass',
      body: 'Qty below reorder point',
      createdAt: '2026-09-26T08:00:00Z',
      read: false,
    },
    {
      id: 'n2',
      title: 'Receipt confirmed',
      body: 'IN/0002 from North Metals is confirmed',
      createdAt: '2026-09-26T07:30:00Z',
      read: false,
    },
    {
      id: 'n3',
      title: 'Delivery ready',
      body: 'OUT/0003 is ready for dispatch',
      createdAt: '2026-09-25T16:45:00Z',
      read: true,
    },
    {
      id: 'n4',
      title: 'Transfer scheduled',
      body: 'INT/0003 Warehouse A → Warehouse B',
      createdAt: '2026-09-25T12:10:00Z',
      read: true,
    },
  ],
}

export async function fetchDashboard() {
  await delay(400)
  return structuredClone(DEMO_DASHBOARD)
}
