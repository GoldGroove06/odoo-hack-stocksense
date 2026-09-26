import prisma from "../config/prisma.js";

// GET /dashboard/stats
export const getDashboardStats = async (req, res) => {
  try {
    const [
      products,
      warehouses,
      locations,
      receipts,
      deliveries,
      adjustments,
      movements
    ] = await Promise.all([
      prisma.product.findMany(),
      prisma.warehouse.findMany(),
      prisma.location.findMany(),
      prisma.receipt.findMany(),
      prisma.delivery.findMany(),
      prisma.adjustment.findMany(),
      prisma.stockMovement.findMany({ take: 10, orderBy: { id: "desc" } })
    ]);

    // Product calculations
    const totalStockValue = products.reduce((acc, p) => acc + (p.onHand * p.perUnitCost), 0);
    const totalPhysicalOnHand = products.reduce((acc, p) => acc + p.onHand, 0);
    const totalFreeToUse = products.reduce((acc, p) => acc + p.freeToUse, 0);
    const lowStockCount = products.filter((p) => p.onHand <= p.minStockAlert).length;

    // Receipts stats: 4 to receive, 1 late, 6 total operations
    const receiptsToReceive = receipts.filter((r) => r.status === "draft" || r.status === "in_progress").length;
    const receiptsReady = receipts.filter((r) => r.status === "ready").length;
    const receiptsDone = receipts.filter((r) => r.status === "done").length;
    const receiptsLate = receipts.filter((r) => r.status !== "done" && r.status !== "cancelled" && r.scheduledDate && new Date(r.scheduledDate) < new Date()).length;

    // Delivery stats: 4 to deliver, 1 late, 2 waiting, 6 operations
    const deliveriesToDeliver = deliveries.filter((d) => d.status === "draft" || d.status === "in_progress").length;
    const deliveriesReady = deliveries.filter((d) => d.status === "ready").length;
    const deliveriesDone = deliveries.filter((d) => d.status === "done").length;
    const deliveriesLate = deliveries.filter((d) => d.status !== "done" && d.status !== "cancelled" && d.scheduledDate && new Date(d.scheduledDate) < new Date()).length;

    res.status(200).json({
      success: true,
      data: {
        products: {
          totalCount: products.length,
          totalValuation: totalStockValue,
          totalPhysicalOnHand,
          totalFreeToUse,
          lowStockCount
        },
        facilities: {
          warehousesCount: warehouses.length,
          locationsCount: locations.length
        },
        receipts: {
          totalOperations: receipts.length,
          toReceive: receiptsToReceive,
          ready: receiptsReady,
          done: receiptsDone,
          late: receiptsLate
        },
        deliveries: {
          totalOperations: deliveries.length,
          toDeliver: deliveriesToDeliver,
          ready: deliveriesReady,
          done: deliveriesDone,
          late: deliveriesLate
        },
        adjustmentsCount: adjustments.length,
        recentMovements: movements
      }
    });
  } catch (error) {
    console.error("Error fetching dashboard statistics:", error);
    res.status(500).json({ success: false, message: "Failed to fetch dashboard statistics", error: error.message });
  }
};
