import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';
import Account from './pages/Account';
import Admin from './pages/Admin';

function AppLayout({ children, showFooter = true }) {
  return (
    <>
      <Header />
      <main style={{ minHeight: 'calc(100vh - 180px)' }}>{children}</main>
      {showFooter && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Admin has its own layout */}
            <Route path="/admin" element={<><Header /><Admin /></>} />

            {/* Public routes with header + footer */}
            <Route path="/" element={<AppLayout><Home /></AppLayout>} />
            <Route path="/catalog" element={<AppLayout><Catalog /></AppLayout>} />
            <Route path="/product/:id" element={<AppLayout><ProductDetail /></AppLayout>} />
            <Route path="/login" element={<AppLayout><Login /></AppLayout>} />
            <Route path="/register" element={<AppLayout><Register /></AppLayout>} />
            <Route path="/cart" element={<AppLayout><Cart /></AppLayout>} />
            <Route path="/checkout" element={<AppLayout><Checkout /></AppLayout>} />
            <Route path="/checkout/success" element={<AppLayout><CheckoutSuccess /></AppLayout>} />
            <Route path="/account" element={<AppLayout><Account /></AppLayout>} />
            <Route path="/account/:tab" element={<AppLayout><Account /></AppLayout>} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
