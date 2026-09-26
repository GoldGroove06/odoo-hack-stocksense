import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

function StockValueChart({ data }) {
  return (
    <div className="border border-gray-200 p-4">
      <h3 className="mb-3 text-sm font-medium text-gray-900">Stock value over time</h3>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} stroke="#d1d5db" />
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} stroke="#d1d5db" width={56} />
            <Tooltip
              contentStyle={{
                border: '1px solid #e5e7eb',
                borderRadius: 0,
                fontSize: 12,
              }}
            />
            <Line type="monotone" dataKey="value" stroke="#111827" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default StockValueChart
