import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import RequireAuth from './components/auth/RequireAuth';
import SiteLayout from './components/layout/SiteLayout';
import AdminPage from './pages/AdminPage';
import CakeDetailPage from './pages/CakeDetailPage';
import CartPage from './pages/CartPage';
import CustomOrderPage from './pages/CustomOrderPage';
import AuthPage from './pages/AuthPage';
import ForbiddenPage from './pages/ForbiddenPage';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import MyCustomOrdersPage from './pages/MyCustomOrdersPage';
import NotFoundPage from './pages/NotFoundPage';
import { AuthProvider } from './context/AuthContext';
import './App.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/cakes" element={<MenuPage />} />
            <Route path="/cakes/:id" element={<CakeDetailPage />} />
            <Route path="/cart" element={<RequireAuth><CartPage /></RequireAuth>} />
            <Route path="/custom-order" element={<RequireAuth><CustomOrderPage /></RequireAuth>} />
            <Route path="/my-custom-orders" element={<RequireAuth><MyCustomOrdersPage /></RequireAuth>} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/register" element={<AuthPage mode="register" />} />
            <Route path="/forbidden" element={<ForbiddenPage />} />
            <Route path="/admin" element={<RequireAuth role="admin"><Navigate to="/admin/custom-orders" replace /></RequireAuth>} />
            <Route path="/admin/*" element={<RequireAuth role="admin"><AdminPage /></RequireAuth>} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
