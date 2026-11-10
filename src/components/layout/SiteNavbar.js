import { useState } from 'react';
import { Badge, Container, Nav, Navbar } from 'react-bootstrap';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '../../context/AuthContext';

export default function SiteNavbar() {
  const count = useSelector((state) => state.cart.items.reduce((sum, item) => sum + item.quantity, 0));
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  return (
    <Navbar expand="lg" className="site-nav" expanded={expanded} onToggle={setExpanded}>
      <Container>
        <Navbar.Brand as={Link} to="/" className="brand">
          <span>PANN <b>CAKE</b></span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="mx-auto nav-links">
            <Nav.Link as={NavLink} to="/" end onClick={() => setExpanded(false)}>Trang chủ</Nav.Link>
            <Nav.Link as={NavLink} to="/cakes" onClick={() => setExpanded(false)}>Thực đơn</Nav.Link>
            <Nav.Link as={NavLink} to="/custom-order" onClick={() => setExpanded(false)}>Đặt bánh riêng</Nav.Link>
            <Nav.Link as={NavLink} to="/my-custom-orders" onClick={() => setExpanded(false)}>Đơn của tôi</Nav.Link>
          </Nav>
          <div className="nav-actions">
            {user?.role === 'admin' && <Nav.Link as={Link} to="/admin/custom-orders" className="admin-link">Quản lý</Nav.Link>}
            <Link to="/cart" className="cart-link" aria-label={`Giỏ hàng, ${count} sản phẩm`}>
              <span>Giỏ hàng</span><Badge bg="dark" pill>{count}</Badge>
            </Link>
            {user ? (
              <div className="account-actions"><span className="account-name">{user.name}</span><button type="button" className="auth-nav-button" onClick={() => { logout(); navigate('/'); }}>Đăng xuất</button></div>
            ) : (
              <div className="account-actions"><Link className="auth-nav-link" to="/login">Đăng nhập</Link><Link className="auth-nav-link register-nav-link" to="/register">Đăng ký</Link></div>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
