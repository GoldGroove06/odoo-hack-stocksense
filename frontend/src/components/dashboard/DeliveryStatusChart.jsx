import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

const GRAYS = ['#111827', '#374151', '#4b5563', '#6b7280', '#9ca3af', '#d1d5db']

function DeliveryStatusChart({ data }) {
  const chartData = (data ?? []).map((item) => ({
    name: String(item.status).replace(/_/g, ' '),
    value: item.count,
  }))

  return (
    <div className="border border-gray-200 p-4">
      <h3 className="mb-3 text-sm font-medium text-gray-900">Delivery status mix</h3>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={2}
            >
              {chartData.map((_, index) => (
                <Cell key={index} fill={GRAYS[index % GRAYS.length]} stroke="#fff" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                border: '1px solid #e5e7eb',
                borderRadius: 0,
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default DeliveryStatusChart
