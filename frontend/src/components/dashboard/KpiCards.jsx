import { Link } from 'react-router'

function formatMoney(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value ?? 0)
}

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value ?? 0)
}

function KpiTile({ label, value, to }) {
  const content = (
    <>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-gray-900">{value}</p>
    </>
  )

  if (to) {
    return (
      <Link
        to={to}
        className="block border border-gray-200 px-4 py-3 hover:border-gray-400 hover:bg-gray-50"
      >
        {content}
      </Link>
    )
  }

  return <div className="border border-gray-200 px-4 py-3">{content}</div>
}

function KpiCards({ kpis }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <KpiTile label="Products in stock" value={formatNumber(kpis.totalProductsInStock)} />
      <KpiTile
        label="Low stock"
        value={formatNumber(kpis.lowStockCount)}
        to="/product?filter=low_stock"
      />
      <KpiTile
        label="Out of stock"
        value={formatNumber(kpis.outOfStockCount)}
        to="/product?filter=out_of_stock"
      />
      <KpiTile label="Stock value" value={formatMoney(kpis.totalStockValue)} />
      <KpiTile label="Total quantity" value={formatNumber(kpis.totalQuantity)} />
    </div>
  )
}

export default KpiCards
