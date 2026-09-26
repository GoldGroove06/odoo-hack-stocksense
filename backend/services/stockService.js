import prisma from "../config/prisma.js";

async function refreshProductTotals(tx, productId) {
  const aggregates = await tx.stockQuant.aggregate({
    where: { productId },
    _sum: { quantity: true, reservedQty: true },
  });
  const onHand = aggregates._sum.quantity || 0;
  const reserved = aggregates._sum.reservedQty || 0;
  const freeToUse = Math.max(0, onHand - reserved);

  await tx.product.update({
    where: { id: productId },
    data: { onHand, freeToUse },
  });

  return { onHand, freeToUse, reserved };
}

async function getOrCreateQuant(tx, productId, locationId) {
  return tx.stockQuant.upsert({
    where: {
      productId_locationId: { productId, locationId },
    },
    create: { productId, locationId, quantity: 0, reservedQty: 0 },
    update: {},
  });
}

async function resolveLocationName(tx, locationId) {
  if (!locationId) return null;
  const loc = await tx.location.findUnique({ where: { id: locationId } });
  return loc?.name || loc?.shortcode || null;
}

async function writeMovement(tx, {
  type,
  productId,
  productName,
  sku,
  quantity,
  unit = "Units",
  fromLocationId,
  toLocationId,
  fromLocation,
  toLocation,
  reason,
  responsible,
  userId,
  documentType,
  documentId,
  reference,
  balanceAfter,
}) {
  const fromName = fromLocation || (await resolveLocationName(tx, fromLocationId));
  const toName = toLocation || (await resolveLocationName(tx, toLocationId));

  return tx.stockMovement.create({
    data: {
      reference: reference || `${type}-${Date.now()}`,
      type,
      productId,
      productName: productName || "Unknown",
      sku: sku || null,
      quantity,
      unit,
      fromLocationId: fromLocationId || null,
      toLocationId: toLocationId || null,
      fromLocation: fromName,
      toLocation: toName,
      reason: reason || null,
      responsible: responsible || null,
      userId: userId || null,
      documentType: documentType || null,
      documentId: documentId || null,
      balanceAfter: balanceAfter ?? null,
    },
  });
}

/**
 * Increase stock at a location (receipts).
 */
export async function applyIn(tx, {
  productId,
  locationId,
  qty,
  unit,
  productName,
  sku,
  fromLocation,
  reason,
  responsible,
  userId,
  documentType,
  documentId,
  reference,
}) {
  if (!productId || !locationId) {
    throw new Error("productId and locationId are required for stock IN");
  }
  const quantity = Number(qty);
  if (!(quantity > 0)) throw new Error("IN quantity must be positive");

  const product = await tx.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error(`Product ${productId} not found`);

  await getOrCreateQuant(tx, productId, locationId);
  await tx.stockQuant.update({
    where: { productId_locationId: { productId, locationId } },
    data: { quantity: { increment: quantity } },
  });

  const totals = await refreshProductTotals(tx, productId);
  await tx.product.update({
    where: { id: productId },
    data: { locationId },
  });

  await writeMovement(tx, {
    type: "IN",
    productId,
    productName: productName || product.name,
    sku: sku || product.sku,
    quantity,
    unit: unit || "Units",
    fromLocation: fromLocation || null,
    toLocationId: locationId,
    reason,
    responsible,
    userId,
    documentType,
    documentId,
    reference,
    balanceAfter: totals.onHand,
  });

  return totals;
}

/**
 * Decrease stock at a location (deliveries).
 */
export async function applyOut(tx, {
  productId,
  locationId,
  qty,
  unit,
  productName,
  sku,
  reason,
  responsible,
  userId,
  documentType,
  documentId,
  reference,
  allowNegative = false,
}) {
  if (!productId || !locationId) {
    throw new Error("productId and locationId are required for stock OUT");
  }
  const quantity = Number(qty);
  if (!(quantity > 0)) throw new Error("OUT quantity must be positive");

  const product = await tx.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error(`Product ${productId} not found`);

  const quant = await getOrCreateQuant(tx, productId, locationId);
  const free = quant.quantity - quant.reservedQty;
  if (!allowNegative && free < quantity) {
    throw new Error(
      `Insufficient stock for ${product.name} at location ${locationId}: need ${quantity}, free ${free}`
    );
  }

  await tx.stockQuant.update({
    where: { productId_locationId: { productId, locationId } },
    data: { quantity: { decrement: quantity } },
  });

  const totals = await refreshProductTotals(tx, productId);

  await writeMovement(tx, {
    type: "OUT",
    productId,
    productName: productName || product.name,
    sku: sku || product.sku,
    quantity,
    unit: unit || "Units",
    fromLocationId: locationId,
    reason,
    responsible,
    userId,
    documentType,
    documentId,
    reference,
    balanceAfter: totals.onHand,
  });

  return totals;
}

/**
 * Move stock between locations (transfer drop).
 */
export async function applyMove(tx, {
  productId,
  fromLocationId,
  toLocationId,
  qty,
  unit,
  productName,
  sku,
  reason,
  responsible,
  userId,
  documentType,
  documentId,
  reference,
}) {
  if (!productId || !fromLocationId || !toLocationId) {
    throw new Error("productId, fromLocationId and toLocationId are required for move");
  }
  if (fromLocationId === toLocationId) {
    throw new Error("from and to locations must differ");
  }
  const quantity = Number(qty);
  if (!(quantity > 0)) throw new Error("Move quantity must be positive");

  const product = await tx.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error(`Product ${productId} not found`);

  const fromQuant = await getOrCreateQuant(tx, productId, fromLocationId);
  const free = fromQuant.quantity - fromQuant.reservedQty;
  if (free < quantity) {
    throw new Error(
      `Insufficient stock to move ${product.name}: need ${quantity}, free ${free}`
    );
  }

  await tx.stockQuant.update({
    where: { productId_locationId: { productId, locationId: fromLocationId } },
    data: { quantity: { decrement: quantity } },
  });
  await getOrCreateQuant(tx, productId, toLocationId);
  await tx.stockQuant.update({
    where: { productId_locationId: { productId, locationId: toLocationId } },
    data: { quantity: { increment: quantity } },
  });

  const totals = await refreshProductTotals(tx, productId);
  await tx.product.update({
    where: { id: productId },
    data: { locationId: toLocationId },
  });

  await writeMovement(tx, {
    type: "INTERNAL",
    productId,
    productName: productName || product.name,
    sku: sku || product.sku,
    quantity,
    unit: unit || "Units",
    fromLocationId,
    toLocationId,
    reason,
    responsible,
    userId,
    documentType,
    documentId,
    reference,
    balanceAfter: totals.onHand,
  });

  return totals;
}

/**
 * Set absolute quantity at a location (physical count / adjustment).
 */
export async function applyAdjustment(tx, {
  productId,
  locationId,
  countedQty,
  unit,
  productName,
  sku,
  reason,
  responsible,
  userId,
  documentType,
  documentId,
  reference,
}) {
  if (!productId || !locationId) {
    throw new Error("productId and locationId are required for adjustment");
  }
  const counted = Number(countedQty);
  if (Number.isNaN(counted) || counted < 0) {
    throw new Error("countedQty must be a non-negative number");
  }

  const product = await tx.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error(`Product ${productId} not found`);

  const quant = await getOrCreateQuant(tx, productId, locationId);
  const delta = counted - quant.quantity;

  await tx.stockQuant.update({
    where: { productId_locationId: { productId, locationId } },
    data: { quantity: counted },
  });

  const totals = await refreshProductTotals(tx, productId);

  await writeMovement(tx, {
    type: "ADJUSTMENT",
    productId,
    productName: productName || product.name,
    sku: sku || product.sku,
    quantity: Math.abs(delta),
    unit: unit || "Units",
    fromLocationId: delta < 0 ? locationId : null,
    toLocationId: delta > 0 ? locationId : locationId,
    reason: reason || `Adjustment delta ${delta}`,
    responsible,
    userId,
    documentType,
    documentId,
    reference,
    balanceAfter: totals.onHand,
  });

  return { ...totals, delta };
}

/**
 * Consume BOM components for a manufacturing finished good, then ensure FG qty at location.
 * Consumes componentQty * finishedQty of each BOM line from the same location (or component's home).
 */
export async function consumeBom(tx, {
  finishedProductId,
  locationId,
  qty,
  unit,
  reason,
  responsible,
  userId,
  documentType,
  documentId,
  reference,
}) {
  const quantity = Number(qty);
  if (!(quantity > 0)) throw new Error("BOM consume quantity must be positive");
  if (!finishedProductId || !locationId) {
    throw new Error("finishedProductId and locationId are required for BOM consume");
  }

  const finished = await tx.product.findUnique({
    where: { id: finishedProductId },
    include: {
      bomAsParent: {
        include: { componentProduct: true },
      },
    },
  });
  if (!finished) throw new Error(`Finished product ${finishedProductId} not found`);
  if (finished.productKind !== "MANUFACTURING") {
    throw new Error(`${finished.name} is not a manufacturing product`);
  }
  if (!finished.bomAsParent.length) {
    throw new Error(`${finished.name} has no BOM lines configured`);
  }

  for (const line of finished.bomAsParent) {
    const need = line.quantity * quantity;
    const componentLocationId = line.componentProduct.locationId || locationId;
    await applyOut(tx, {
      productId: line.componentProductId,
      locationId: componentLocationId,
      qty: need,
      unit: unit || "Units",
      productName: line.componentProduct.name,
      sku: line.componentProduct.sku,
      reason: reason || `BOM consume for ${finished.name}`,
      responsible,
      userId,
      documentType: documentType || "BOM",
      documentId,
      reference: reference || `BOM/${finished.sku}`,
    });
  }

  // Produce finished goods into location
  await applyIn(tx, {
    productId: finishedProductId,
    locationId,
    qty: quantity,
    unit: unit || "Units",
    productName: finished.name,
    sku: finished.sku,
    reason: reason || `Manufactured ${finished.name}`,
    responsible,
    userId,
    documentType: documentType || "BOM",
    documentId,
    reference: reference || `MFG/${finished.sku}`,
  });

  return refreshProductTotals(tx, finishedProductId);
}

/**
 * Run a callback inside a Prisma interactive transaction.
 */
export async function withStockTransaction(fn) {
  return prisma.$transaction(async (tx) => fn(tx), {
    maxWait: 10000,
    timeout: 30000,
  });
}

export async function getQuantQuantity(tx, productId, locationId) {
  const quant = await tx.stockQuant.findUnique({
    where: { productId_locationId: { productId, locationId } },
  });
  if (!quant) return 0;
  return quant.quantity - quant.reservedQty;
}

/**
 * Hard fail if free qty at location is less than needed.
 */
export async function assertAvailable(tx, productId, locationId, qty, productName) {
  const need = Number(qty) || 0;
  if (need <= 0) return 0;
  if (!productId || !locationId) {
    const err = new Error("productId and locationId are required to check availability");
    err.status = 400;
    throw err;
  }
  const free = await getQuantQuantity(tx, productId, locationId);
  if (free < need) {
    let name = productName;
    if (!name) {
      const p = await tx.product.findUnique({ where: { id: productId } });
      name = p?.name || `Product #${productId}`;
    }
    const err = new Error(
      `Insufficient stock for ${name}: need ${need}, available ${free}`
    );
    err.status = 400;
    throw err;
  }
  return free;
}

/**
 * Reserve free stock for a delivery pick (increases reservedQty).
 */
export async function reserveStock(tx, { productId, locationId, qty, productName }) {
  const quantity = Number(qty);
  if (!(quantity > 0)) throw new Error("Reserve quantity must be positive");
  await assertAvailable(tx, productId, locationId, quantity, productName);
  await getOrCreateQuant(tx, productId, locationId);
  await tx.stockQuant.update({
    where: { productId_locationId: { productId, locationId } },
    data: { reservedQty: { increment: quantity } },
  });
  return refreshProductTotals(tx, productId);
}

/**
 * Release previously reserved stock (delivery cancel/delete before validate).
 */
export async function releaseReservation(tx, { productId, locationId, qty }) {
  const quantity = Number(qty);
  if (!(quantity > 0) || !productId || !locationId) return;
  const quant = await tx.stockQuant.findUnique({
    where: { productId_locationId: { productId, locationId } },
  });
  if (!quant) return;
  const nextReserved = Math.max(0, (quant.reservedQty || 0) - quantity);
  await tx.stockQuant.update({
    where: { productId_locationId: { productId, locationId } },
    data: { reservedQty: nextReserved },
  });
  return refreshProductTotals(tx, productId);
}

/**
 * Ship reserved (or free) stock: decrement onHand and reserved together when fulfilling a pick.
 */
export async function applyOutReserved(tx, {
  productId,
  locationId,
  qty,
  unit,
  productName,
  sku,
  reason,
  responsible,
  userId,
  documentType,
  documentId,
  reference,
  wasReserved = false,
}) {
  if (!productId || !locationId) {
    throw new Error("productId and locationId are required for stock OUT");
  }
  const quantity = Number(qty);
  if (!(quantity > 0)) throw new Error("OUT quantity must be positive");

  const product = await tx.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error(`Product ${productId} not found`);

  const quant = await getOrCreateQuant(tx, productId, locationId);

  if (wasReserved) {
    // Reserved qty is already held; ensure physical qty covers the ship
    if (quant.quantity < quantity) {
      const err = new Error(
        `Insufficient stock for ${product.name}: need ${quantity}, on hand ${quant.quantity}`
      );
      err.status = 400;
      throw err;
    }
    await tx.stockQuant.update({
      where: { productId_locationId: { productId, locationId } },
      data: {
        quantity: { decrement: quantity },
        reservedQty: { decrement: Math.min(quant.reservedQty, quantity) },
      },
    });
  } else {
    const free = quant.quantity - quant.reservedQty;
    if (free < quantity) {
      const err = new Error(
        `Insufficient stock for ${product.name}: need ${quantity}, available ${free}`
      );
      err.status = 400;
      throw err;
    }
    await tx.stockQuant.update({
      where: { productId_locationId: { productId, locationId } },
      data: { quantity: { decrement: quantity } },
    });
  }

  const totals = await refreshProductTotals(tx, productId);

  await writeMovement(tx, {
    type: "OUT",
    productId,
    productName: productName || product.name,
    sku: sku || product.sku,
    quantity,
    unit: unit || "Units",
    fromLocationId: locationId,
    reason,
    responsible,
    userId,
    documentType,
    documentId,
    reference,
    balanceAfter: totals.onHand,
  });

  return totals;
}
