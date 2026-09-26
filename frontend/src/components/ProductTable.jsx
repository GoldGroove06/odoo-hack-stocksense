const CATEGORY_LABELS = {
  raw_material: 'Raw material',
  finished_goods: 'Finished goods',
}

const MANUFACTURE_LABELS = {
  trading: 'Trading',
  manufacturing: 'Manufacturing',
}

function ProductTable({ products }) {
  if (!products.length) {
    return (
      <p className="border border-gray-200 px-4 py-8 text-center text-sm text-gray-500">
        No products found.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto border border-gray-200">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead className="bg-gray-50 text-gray-700">
          <tr>
            <th className="border-b border-gray-200 px-3 py-2 font-medium">Name</th>
            <th className="border-b border-gray-200 px-3 py-2 font-medium">Code</th>
            <th className="border-b border-gray-200 px-3 py-2 font-medium">Category</th>
            <th className="border-b border-gray-200 px-3 py-2 font-medium">Qty</th>
            <th className="border-b border-gray-200 px-3 py-2 font-medium">Location</th>
            <th className="border-b border-gray-200 px-3 py-2 font-medium">Type</th>
            <th className="border-b border-gray-200 px-3 py-2 font-medium">Raw materials</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50">
              <td className="border-b border-gray-100 px-3 py-2 text-gray-900">{product.name}</td>
              <td className="border-b border-gray-100 px-3 py-2 text-gray-700">{product.productCode}</td>
              <td className="border-b border-gray-100 px-3 py-2 text-gray-700">
                {CATEGORY_LABELS[product.category] ?? product.category}
              </td>
              <td className="border-b border-gray-100 px-3 py-2 text-gray-700">{product.totalQuantity}</td>
              <td className="border-b border-gray-100 px-3 py-2 text-gray-700">
                {product.location?.name ?? '—'}
              </td>
              <td className="border-b border-gray-100 px-3 py-2 text-gray-700">
                {MANUFACTURE_LABELS[product.manufactureType] ?? product.manufactureType}
              </td>
              <td className="border-b border-gray-100 px-3 py-2 text-gray-700">
                {product.category === 'finished_goods' && product.rawMaterials?.length
                  ? product.rawMaterials.map((rm) => rm.name).join(', ')
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ProductTable
