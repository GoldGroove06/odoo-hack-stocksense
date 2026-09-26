import { useEffect, useState } from 'react'
import ErrorBanner from '../../components/ErrorBanner.jsx'
import LoadingState from '../../components/LoadingState.jsx'
import KpiCards from '../../components/dashboard/KpiCards.jsx'
import StockValueChart from '../../components/dashboard/StockValueChart.jsx'
import StockByCategoryChart from '../../components/dashboard/StockByCategoryChart.jsx'
import DeliveryStatusChart from '../../components/dashboard/DeliveryStatusChart.jsx'
import PendingReceiptsTable from '../../components/dashboard/PendingReceiptsTable.jsx'
import PendingDeliveriesTable from '../../components/dashboard/PendingDeliveriesTable.jsx'
import InternalTransfersSection from '../../components/dashboard/InternalTransfersSection.jsx'
import NotificationsPanel from '../../components/dashboard/NotificationsPanel.jsx'
import { fetchDashboard } from '../../data/dashboard.js'

function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const result = await fetchDashboard()
        if (!cancelled) {
          setData(result)
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load dashboard. Please try again.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="mx-auto max-w-6xl p-6 text-gray-900">
      <h1 className="mb-6 text-xl font-semibold">Dashboard</h1>

      <ErrorBanner message={error} onDismiss={() => setError('')} />

      {loading ? (
        <LoadingState label="Loading dashboard…" />
      ) : data ? (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1 space-y-6">
            <KpiCards kpis={data.kpis} />

            <div className="grid gap-4 lg:grid-cols-3">
              <StockValueChart data={data.charts.stockValueTrend} />
              <StockByCategoryChart data={data.charts.stockByCategory} />
              <DeliveryStatusChart data={data.charts.deliveriesByStatus} />
            </div>

            <PendingReceiptsTable receipts={data.pendingReceipts} />
            <PendingDeliveriesTable deliveries={data.pendingDeliveries} />
            <InternalTransfersSection transfers={data.internalTransfers} />
          </div>

          <NotificationsPanel notifications={data.notifications} />
        </div>
      ) : null}
    </div>
  )
}

export default Dashboard
