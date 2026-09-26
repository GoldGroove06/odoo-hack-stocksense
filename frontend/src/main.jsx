import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router'
import AppLayout from './components/layout/AppLayout.jsx'
import Dashboard from './pages/dashboard/Dashboard.jsx'
import ProductList from './pages/product/ProductList.jsx'
import ProductForm from './pages/product/ProductForm.jsx'
import Receipts from './pages/operations/Receipts.jsx'
import DeliveryOrder from './pages/operations/DeliveryOrder.jsx'
import InventoryAdjustment from './pages/operations/InventoryAdjustment.jsx'
import MoveHistory from './pages/move-history/MoveHistory.jsx'
import Settings from './pages/settings/Settings.jsx'
import Profile from './pages/profile/Profile.jsx'

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <Navigate to="/dashboard" replace /> },
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/product', element: <ProductList /> },
      { path: '/product/new', element: <ProductForm /> },
      { path: '/operations/receipts', element: <Receipts /> },
      { path: '/operations/delivery-order', element: <DeliveryOrder /> },
      { path: '/operations/inventory-adjustment', element: <InventoryAdjustment /> },
      { path: '/move-history', element: <MoveHistory /> },
      { path: '/settings', element: <Settings /> },
      { path: '/profile', element: <Profile /> },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
