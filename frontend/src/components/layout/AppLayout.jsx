import { Outlet } from 'react-router'
import Navbar from './Navbar.jsx'

function AppLayout() {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-3.5rem)] bg-white">
        <Outlet />
      </main>
    </>
  )
}

export default AppLayout
