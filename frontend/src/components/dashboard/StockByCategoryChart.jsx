import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

function StockByCategoryChart({ data }) {
  return (
    <div className="border border-gray-200 p-4">
      <h3 className="mb-3 text-sm font-medium text-gray-900">Stock by category</h3>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
            <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#6b7280' }} stroke="#d1d5db" />
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} stroke="#d1d5db" width={40} />
            <Tooltip
              contentStyle={{
                border: '1px solid #e5e7eb',
                borderRadius: 0,
                fontSize: 12,
              }}
            />
            <Bar dataKey="quantity" fill="#4b5563" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default StockByCategoryChart
