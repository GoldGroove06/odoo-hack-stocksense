import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import ErrorBanner from '../../components/ErrorBanner.jsx'
import LoadingState from '../../components/LoadingState.jsx'
import ProductTable from '../../components/ProductTable.jsx'
import { fetchProducts } from '../../data/products.js'

const FILTER_LABELS = {
  low_stock: 'Low stock',
  out_of_stock: 'Out of stock',
}

function ProductList() {
  const [searchParams] = useSearchParams()
  const filter = searchParams.get('filter') || ''
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await fetchProducts({
          filter: FILTER_LABELS[filter] ? filter : undefined,
        })
        if (!cancelled) {
          setProducts(data.products ?? [])
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load products. Please try again.')
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
  }, [filter])

  const filterLabel = FILTER_LABELS[filter]

  return (
    <div className="mx-auto max-w-5xl bg-white p-6 text-gray-900">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Products</h1>
        <Link
          to="/product/new"
          className="border border-gray-800 bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
        >
          New product
        </Link>
      </div>

      {filterLabel ? (
        <div className="mb-4 flex flex-wrap items-center gap-2 border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
          <span>
            Showing: <span className="font-medium text-gray-900">{filterLabel}</span>
          </span>
          <Link to="/product" className="text-gray-900 underline hover:no-underline">
            Clear filter
          </Link>
        </div>
      ) : null}

      <ErrorBanner message={error} onDismiss={() => setError('')} />

      {loading ? <LoadingState label="Loading products…" /> : <ProductTable products={products} />}
    </div>
  )
}

export default ProductList
