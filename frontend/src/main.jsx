import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import Product from './pages/product/index.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />
  },{
    path: "/product",
    element: <Product />
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
  ``<RouterProvider router={router} />
  </StrictMode>,
)
