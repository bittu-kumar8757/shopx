import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import Orders from './pages/admin/Orders';
import MyOrders from './pages/MyOrders';

function ProtectedRoute({ children }) {
  const { isAdmin, loading } = useAuth();
  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-2)' }}>Loading...</div>;
  return isAdmin ? children : <Navigate to="/admin" replace />;
}

function StoreLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <Routes>
              {/* Store Routes */}
              <Route path="/" element={<StoreLayout><Home /></StoreLayout>} />
              <Route path="/shop" element={<StoreLayout><Shop /></StoreLayout>} />
              <Route path="/product/:id" element={<StoreLayout><ProductDetail /></StoreLayout>} />
              <Route path="/cart" element={<StoreLayout><Cart /></StoreLayout>} />
              <Route path="/checkout" element={<StoreLayout><Checkout /></StoreLayout>} />
              <Route path="/success" element={<StoreLayout><OrderSuccess /></StoreLayout>} />
              
              {/* 👈 Wrap with StoreLayout to show Navbar */}
              <Route path="/my-orders" element={<StoreLayout><MyOrders /></StoreLayout>} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="products" element={<Products />} />
                <Route path="orders" element={<Orders />} />
              </Route>
            </Routes>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}