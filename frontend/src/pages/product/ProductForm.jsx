import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import ErrorBanner from '../../components/ErrorBanner.jsx'
import LoadingState from '../../components/LoadingState.jsx'
import ProductFormFields from '../../components/ProductFormFields.jsx'
import { createProduct, fetchProductFormInit } from '../../data/products.js'

const INITIAL_VALUES = {
  name: '',
  category: '',
  totalQuantity: '',
  initialStock: '',
  locationId: '',
  manufactureType: '',
  rawMaterialIds: [],
}

function validate(values, productCode) {
  const errors = {}

  if (!values.name.trim()) {
    errors.name = 'Product name is required.'
  }

  if (!values.category) {
    errors.category = 'Category is required.'
  }

  if (!productCode) {
    errors.productCode = 'Product code is unavailable. Reload the form.'
  }

  const totalQuantity = Number(values.totalQuantity)
  if (values.totalQuantity === '' || Number.isNaN(totalQuantity) || totalQuantity < 0) {
    errors.totalQuantity = 'Enter a valid quantity (0 or more).'
  }

  const initialStock = Number(values.initialStock)
  if (values.initialStock === '' || Number.isNaN(initialStock) || initialStock < 0) {
    errors.initialStock = 'Enter a valid initial stock (0 or more).'
  } else if (!errors.totalQuantity && initialStock > totalQuantity) {
    errors.initialStock = 'Initial stock cannot exceed total quantity.'
  }

  if (!values.locationId) {
    errors.locationId = 'Location is required.'
  }

  if (!values.manufactureType) {
    errors.manufactureType = 'Select trading or manufacturing.'
  }

  if (values.category === 'finished_goods' && values.rawMaterialIds.length === 0) {
    errors.rawMaterialIds = 'Select at least one raw material.'
  }

  return errors
}

function ProductForm() {
  const navigate = useNavigate()
  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [locations, setLocations] = useState([])
  const [rawMaterials, setRawMaterials] = useState([])
  const [productCode, setProductCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await fetchProductFormInit()
        if (!cancelled) {
          setLocations(data.locations ?? [])
          setRawMaterials(data.rawMaterials ?? [])
          setProductCode(data.nextProductCode ?? '')
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load form data. Please try again.')
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

  function handleChange(event) {
    const { name, value } = event.target
    setValues((prev) => {
      const next = { ...prev, [name]: value }
      if (name === 'category' && value !== 'finished_goods') {
        next.rawMaterialIds = []
      }
      return next
    })
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  function handleToggleRawMaterial(id) {
    setValues((prev) => {
      const exists = prev.rawMaterialIds.includes(id)
      return {
        ...prev,
        rawMaterialIds: exists
          ? prev.rawMaterialIds.filter((item) => item !== id)
          : [...prev.rawMaterialIds, id],
      }
    })
    setErrors((prev) => ({ ...prev, rawMaterialIds: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSuccess('')

    const nextErrors = validate(values, productCode)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      setError('Please fix the errors below before submitting.')
      return
    }

    const payload = {
      name: values.name.trim(),
      category: values.category,
      totalQuantity: Number(values.totalQuantity),
      locationId: values.locationId,
      productCode,
      initialStock: Number(values.initialStock),
      manufactureType: values.manufactureType,
    }

    if (values.category === 'finished_goods') {
      payload.rawMaterialIds = values.rawMaterialIds
    }

    setSaving(true)
    setError('')
    try {
      await createProduct(payload)
      setSuccess('Product created successfully.')
      setTimeout(() => navigate('/product'), 600)
    } catch {
      setError('Failed to create product. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-5xl bg-white p-6 text-gray-900">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">New product</h1>
        <Link to="/product" className="border border-gray-300 px-4 py-2 text-sm text-gray-800 hover:bg-gray-50">
          Back to list
        </Link>
      </div>

      <ErrorBanner message={error} onDismiss={() => setError('')} />

      {success ? (
        <div className="mb-4 border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800">
          {success}
        </div>
      ) : null}

      {loading ? (
        <LoadingState label="Loading form…" />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <ProductFormFields
            values={values}
            errors={errors}
            locations={locations}
            rawMaterials={rawMaterials}
            productCode={productCode}
            onChange={handleChange}
            onToggleRawMaterial={handleToggleRawMaterial}
          />

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving || !productCode}
              className="border border-gray-800 bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Create product'}
            </button>
            <Link
              to="/product"
              className="border border-gray-300 px-4 py-2 text-sm text-gray-800 hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      )}
    </div>
  )
}

export default ProductForm
