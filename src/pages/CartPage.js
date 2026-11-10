import { useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import PageIntro from '../components/PageIntro';
import { useAuth } from '../context/AuthContext';
import { apiErrorMessage, createOrder } from '../services/api';
import { clearCart, decrementItem, incrementItem, removeItem } from '../store/cartSlice';
import { money } from '../utils/format';

export default function CartPage() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const items = useSelector((state) => state.cart.items);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submitOrder(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);
    try {
      const order = await createOrder({
        ...customer,
        customerId: user.id,
        customerEmail: user.email,
        items: items.map(({ id, name, price, quantity }) => ({ id, name, price, quantity })),
        total: subtotal,
        status: 'Chờ xác nhận',
        createdAt: new Date().toISOString(),
      });
      setMessage(`Đặt hàng thành công! Mã đơn #${order.id}. Pann sẽ liên hệ xác nhận sớm nhé.`);
      dispatch(clearCart());
      setCustomer({ name: '', phone: '', address: '' });
    } catch (requestError) {
      setError(`Không thể tạo đơn hàng: ${apiErrorMessage(requestError)}. Vui lòng kiểm tra kết nối và thử lại.`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page-main cart-page">
      <Container>
        <PageIntro kicker="PANN CAKE" title={<>Giỏ hàng của bạn</>} />
        {message && <Alert variant="success">{message}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        {!items.length ? (
          <div className="empty-state"><h2>Giỏ hàng đang trống</h2><p>Chọn một chiếc bánh thật ngon để bắt đầu nhé.</p><Button as={Link} to="/cakes" className="button-dark">Xem thực đơn</Button></div>
        ) : (
          <Row className="g-5">
            <Col lg={7}>
              <div className="cart-list">
                {items.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <img src={item.image} alt={item.name} />
                    <div className="cart-item-info">
                      <Link to={`/cakes/${item.id}`}>{item.name}</Link>
                      <span>{item.size} · {money(item.price)}</span>
                      <div className="quantity-control">
                        <button type="button" aria-label="Giảm số lượng" onClick={() => dispatch(decrementItem(item.id))}>−</button>
                        <b>{item.quantity}</b>
                        <button type="button" aria-label="Tăng số lượng" onClick={() => dispatch(incrementItem(item.id))}>+</button>
                      </div>
                    </div>
                    <strong>{money(item.price * item.quantity)}</strong>
                    <button className="remove-button" type="button" aria-label={`Xóa ${item.name}`} onClick={() => dispatch(removeItem(item.id))}>×</button>
                  </div>
                ))}
              </div>
            </Col>
            <Col lg={5}>
              <Card className="checkout-card"><Card.Body>
                <h2>Thông tin nhận bánh</h2>
                <Form onSubmit={submitOrder}>
                  <Form.Group className="mb-3"><Form.Label>Họ và tên</Form.Label><Form.Control required value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} placeholder="Tên người nhận" /></Form.Group>
                  <Form.Group className="mb-3"><Form.Label>Số điện thoại</Form.Label><Form.Control required type="tel" pattern="[0-9+ .-]{9,15}" value={customer.phone} onChange={(event) => setCustomer({ ...customer, phone: event.target.value })} placeholder="09xx xxx xxx" /></Form.Group>
                  <Form.Group className="mb-3"><Form.Label>Địa chỉ giao hàng</Form.Label><Form.Control required as="textarea" rows={2} value={customer.address} onChange={(event) => setCustomer({ ...customer, address: event.target.value })} placeholder="Số nhà, đường, quận..." /></Form.Group>
                  <div className="checkout-total"><span>Tạm tính ({items.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm)</span><strong>{money(subtotal)}</strong></div>
                  <p className="checkout-hint">Phí giao hàng sẽ được xác nhận khi cửa hàng liên hệ.</p>
                  <Button type="submit" className="button-dark w-100" disabled={submitting}>{submitting ? 'Đang gửi...' : `Đặt hàng · ${money(subtotal)}`}</Button>
                </Form>
              </Card.Body></Card>
            </Col>
          </Row>
        )}
      </Container>
    </main>
  );
}
