import React from 'react';
import { RouterProvider, Routes, Route, useLocation } from './router/Router';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import CartDrawer from './components/common/CartDrawer';

// Storefront Pages
import HomePage from './pages/storefront/HomePage';
import ShopBrowsePage from './pages/storefront/ShopBrowsePage';
import ProductDetailPage from './pages/storefront/ProductDetailPage';
import ShopsListPage from './pages/storefront/ShopsListPage';
import VendorStorePage from './pages/storefront/VendorStorePage';
import ShoppableVideosPage from './pages/storefront/ShoppableVideosPage';
import TailoringPage from './pages/storefront/TailoringPage';
import CartPage from './pages/storefront/CartPage';
import CheckoutPage from './pages/storefront/CheckoutPage';
import OrdersPage from './pages/storefront/OrdersPage';
import AccountPage from './pages/storefront/AccountPage';
import SellerOnboardingPage from './pages/storefront/SellerOnboardingPage';
import AuthPage from './pages/storefront/AuthPage';

// Vendor Pages & Layout
import VendorLayout from './pages/vendor/VendorLayout';
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorOrders from './pages/vendor/VendorOrders';
import VendorProducts from './pages/vendor/VendorProducts';
import VendorEarnings from './pages/vendor/VendorEarnings';
import VendorReviews from './pages/vendor/VendorReviews';
import VendorSettings from './pages/vendor/VendorSettings';

// Admin Pages & Layout
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminShops from './pages/admin/AdminShops';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminPayouts from './pages/admin/AdminPayouts';
import AdminSettings from './pages/admin/AdminSettings';

const AppContent = () => {
  const { pathname } = useLocation();

  const isVendorRoute = pathname.startsWith('/vendor');
  const isAdminRoute = pathname.startsWith('/admin');

  if (isVendorRoute) {
    return (
      <VendorLayout>
        <Routes>
          <Route path="/vendor" element={<VendorDashboard />} />
          <Route path="/vendor/orders" element={<VendorOrders />} />
          <Route path="/vendor/products" element={<VendorProducts />} />
          <Route path="/vendor/earnings" element={<VendorEarnings />} />
          <Route path="/vendor/reviews" element={<VendorReviews />} />
          <Route path="/vendor/settings" element={<VendorSettings />} />
        </Routes>
      </VendorLayout>
    );
  }

  if (isAdminRoute) {
    return (
      <AdminLayout>
        <Routes>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/shops" element={<AdminShops />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/payouts" element={<AdminPayouts />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Routes>
      </AdminLayout>
    );
  }

  // Storefront Layout
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-[#0f172a]">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/browse" element={<ShopBrowsePage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/shops" element={<ShopsListPage />} />
          <Route path="/shop/:slug" element={<VendorStorePage />} />
          <Route path="/shoppable-videos" element={<ShoppableVideosPage />} />
          <Route path="/tailoring" element={<TailoringPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/sell" element={<SellerOnboardingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/login" element={<AuthPage initialMode="login" />} />
          <Route path="/register" element={<AuthPage initialMode="register" />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
};

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <RouterProvider>
            <AppContent />
          </RouterProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
