const inputClass =
  'w-full border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-500'
const labelClass = 'mb-1 block text-sm font-medium text-gray-700'
const errorClass = 'mt-1 text-xs text-red-600'

function ProductFormFields({
  values,
  errors,
  locations,
  rawMaterials,
  productCode,
  onChange,
  onToggleRawMaterial,
}) {
  const showRawMaterials = values.category === 'finished_goods'

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className={labelClass} htmlFor="name">
          Product name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={values.name}
          onChange={onChange}
          className={inputClass}
        />
        {errors.name ? <p className={errorClass}>{errors.name}</p> : null}
      </div>

      <div>
        <label className={labelClass} htmlFor="category">
          Category
        </label>
        <select
          id="category"
          name="category"
          value={values.category}
          onChange={onChange}
          className={inputClass}
        >
          <option value="">Select category</option>
          <option value="raw_material">Raw material</option>
          <option value="finished_goods">Finished goods</option>
        </select>
        {errors.category ? <p className={errorClass}>{errors.category}</p> : null}
      </div>

      <div>
        <label className={labelClass} htmlFor="productCode">
          Product code
        </label>
        <input
          id="productCode"
          name="productCode"
          type="text"
          value={productCode}
          readOnly
          className={`${inputClass} bg-gray-50 text-gray-600`}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="totalQuantity">
          Total quantity
        </label>
        <input
          id="totalQuantity"
          name="totalQuantity"
          type="number"
          min="0"
          value={values.totalQuantity}
          onChange={onChange}
          className={inputClass}
        />
        {errors.totalQuantity ? <p className={errorClass}>{errors.totalQuantity}</p> : null}
      </div>

      <div>
        <label className={labelClass} htmlFor="initialStock">
          Initial stock
        </label>
        <input
          id="initialStock"
          name="initialStock"
          type="number"
          min="0"
          value={values.initialStock}
          onChange={onChange}
          className={inputClass}
        />
        {errors.initialStock ? <p className={errorClass}>{errors.initialStock}</p> : null}
      </div>

      <div>
        <label className={labelClass} htmlFor="locationId">
          Location / warehouse
        </label>
        <select
          id="locationId"
          name="locationId"
          value={values.locationId}
          onChange={onChange}
          className={inputClass}
        >
          <option value="">Select location</option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>
        {errors.locationId ? <p className={errorClass}>{errors.locationId}</p> : null}
      </div>

      <div>
        <label className={labelClass} htmlFor="manufactureType">
          Trading / manufacturing
        </label>
        <select
          id="manufactureType"
          name="manufactureType"
          value={values.manufactureType}
          onChange={onChange}
          className={inputClass}
        >
          <option value="">Select type</option>
          <option value="trading">Trading</option>
          <option value="manufacturing">Manufacturing</option>
        </select>
        {errors.manufactureType ? <p className={errorClass}>{errors.manufactureType}</p> : null}
      </div>

      {showRawMaterials ? (
        <div className="sm:col-span-2">
          <p className={labelClass}>Raw materials</p>
          <div className="grid gap-2 border border-gray-200 p-3 sm:grid-cols-2">
            {rawMaterials.map((rm) => {
              const checked = values.rawMaterialIds.includes(rm.id)
              return (
                <label key={rm.id} className="flex items-center gap-2 text-sm text-gray-800">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleRawMaterial(rm.id)}
                  />
                  {rm.name}
                </label>
              )
            })}
          </div>
          {errors.rawMaterialIds ? <p className={errorClass}>{errors.rawMaterialIds}</p> : null}
        </div>
      ) : null}
    </div>
  )
}

export default ProductFormFields
