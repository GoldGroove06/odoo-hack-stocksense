import { useEffect, useId, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'

function NavDropdown({ label, items = [], actions = [], align = 'left', triggerClassName = '' }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const menuId = useId()
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!open) return undefined

    function handlePointerDown(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const alignClass = align === 'right' ? 'right-0' : 'left-0'

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        className={triggerClassName}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((prev) => !prev)}
      >
        {label}
        <span className="ml-1 text-xs text-gray-500" aria-hidden="true">
          ▾
        </span>
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className={`absolute ${alignClass} z-20 mt-1 min-w-[12rem] border border-gray-200 bg-white py-1`}
        >
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              role="menuitem"
              className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              role="menuitem"
              className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              onClick={() => {
                setOpen(false)
                action.onClick?.()
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default NavDropdown
