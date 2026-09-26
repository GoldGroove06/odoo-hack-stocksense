import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import NavDropdown from './NavDropdown.jsx'

const linkBase = 'px-2 py-1 text-sm text-gray-600 hover:text-gray-900'
const linkActive = 'border-b-2 border-gray-900 px-2 py-1 text-sm font-medium text-gray-900'
const mobileLinkBase = 'block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50'
const mobileLinkActive = 'block bg-gray-50 px-3 py-2 text-sm font-medium text-gray-900'

const OPERATIONS_ITEMS = [
  { to: '/operations/receipts', label: 'Receipts' },
  { to: '/operations/delivery-order', label: 'Delivery order' },
  { to: '/operations/inventory-adjustment', label: 'Inventory adjustment' },
]

function navClass({ isActive }) {
  return isActive ? linkActive : linkBase
}

function mobileNavClass({ isActive }) {
  return isActive ? mobileLinkActive : mobileLinkBase
}

function isOperationsActive(pathname) {
  return pathname.startsWith('/operations')
}

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  function handleLogout() {
    console.log('logout')
  }

  const operationsTriggerClass = isOperationsActive(location.pathname)
    ? `${linkActive} inline-flex items-center`
    : `${linkBase} inline-flex items-center`

  return (
    <header className="relative z-30 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-sm font-semibold text-gray-900">
            StockSense
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            <NavLink to="/dashboard" className={navClass}>
              Dashboard
            </NavLink>
            <NavLink to="/product" className={navClass}>
              Product
            </NavLink>
            <NavDropdown
              label="Operations"
              items={OPERATIONS_ITEMS}
              triggerClassName={operationsTriggerClass}
            />
            <NavLink to="/move-history" className={navClass}>
              Move history
            </NavLink>
            <NavLink to="/settings" className={navClass}>
              Settings
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <NavDropdown
              label={
                <span className="inline-flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-xs font-medium text-gray-700">
                    U
                  </span>
                  <span className="text-sm text-gray-700">Profile</span>
                </span>
              }
              items={[{ to: '/profile', label: 'My profile' }]}
              actions={[{ label: 'Logout', onClick: handleLogout }]}
              align="right"
              triggerClassName="inline-flex items-center px-2 py-1 text-sm text-gray-700 hover:text-gray-900"
            />
          </div>

          <button
            type="button"
            className="border border-gray-300 px-3 py-1.5 text-sm text-gray-800 md:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            Menu
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <nav
          id="mobile-nav"
          className="border-t border-gray-200 bg-white md:hidden"
          aria-label="Mobile"
        >
          <div className="mx-auto max-w-6xl px-2 py-2">
            <NavLink to="/dashboard" className={mobileNavClass}>
              Dashboard
            </NavLink>
            <NavLink to="/product" className={mobileNavClass}>
              Product
            </NavLink>
            <p className="px-3 pt-2 text-xs font-medium uppercase tracking-wide text-gray-500">
              Operations
            </p>
            {OPERATIONS_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} className={mobileNavClass}>
                {item.label}
              </NavLink>
            ))}
            <NavLink to="/move-history" className={mobileNavClass}>
              Move history
            </NavLink>
            <NavLink to="/settings" className={mobileNavClass}>
              Settings
            </NavLink>
            <div className="my-2 border-t border-gray-200" />
            <NavLink to="/profile" className={mobileNavClass}>
              My profile
            </NavLink>
            <button
              type="button"
              className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </nav>
      ) : null}
    </header>
  )
}

export default Navbar
