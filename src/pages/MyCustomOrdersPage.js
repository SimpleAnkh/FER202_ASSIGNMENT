import { useEffect, useState } from 'react';
import { Alert, Button, Card, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PageIntro from '../components/PageIntro';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import {
  apiErrorMessage,
  getCustomOrdersByCustomer,
  getOrdersByCustomer,
  updateCustomOrder,
} from '../services/api';
import { money } from '../utils/format';

export default function MyCustomOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      try {
        const [regularOrders, customOrders] = await Promise.all([
          getOrdersByCustomer(user.id),
          getCustomOrdersByCustomer(user.id),
        ]);
        if (active) {
          setOrders([
            ...regularOrders.map((order) => ({ ...order, orderType: 'regular' })),
            ...customOrders.map((order) => ({ ...order, orderType: 'custom' })),
          ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        }
      } catch (requestError) {
        if (active) setError(`Không tải được đơn hàng: ${apiErrorMessage(requestError)}. Vui lòng thử lại sau.`);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadOrders();
    return () => { active = false; };
  }, [user.id]);

  async function respond(order, status) {
    setError('');
    try {
      const updated = await updateCustomOrder(order.id, { ...order, status });
      setOrders((current) => current.map((item) => (
        item.orderType === 'custom' && item.id === order.id
          ? { ...updated, orderType: 'custom' }
          : item
      )));
    } catch (requestError) {
      setError(`Không cập nhật được yêu cầu: ${apiErrorMessage(requestError)}.`);
    }
  }

  return (
    <main className="page-main">
      <Container>
        <PageIntro
          kicker="PANN CAKE"
          title={<>Đơn hàng của bạn</>}
        />
        {error && <Alert variant="danger" className="tracking-alert">{error}</Alert>}
        {loading && <p className="text-center">Đang tải đơn hàng...</p>}
        {!loading && !error && !orders.length && (
          <div className="empty-state compact-empty">
            <h2>Bạn chưa có đơn hàng nào</h2>
            <p>Đơn hàng sau khi đặt sẽ xuất hiện tại đây.</p>
            <Button as={Link} to="/cakes" className="button-dark">Xem thực đơn</Button>
          </div>
        )}
        {orders.map((order) => (
          <Card className="tracking-card" key={`${order.orderType}-${order.id}`}>
            <Card.Body>
              <div className="tracking-card-head">
                <div>
                  <span className="eyebrow">{order.orderType === 'custom' ? 'BÁNH ĐẶT RIÊNG' : 'ĐƠN HÀNG'} #{order.id}</span>
                  <h2>{order.orderType === 'custom'
                    ? `${order.size} · ${order.flavor} · ${order.layers} tầng`
                    : order.items.map((item) => `${item.name} × ${item.quantity}`).join(', ')}</h2>
                </div>
                <StatusBadge status={order.status} />
              </div>
              <div className="tracking-details">
                <span>Thời gian nhận <b>{order.deliveryDate
                  ? `${order.deliveryDate}${order.deliveryTime ? ` · ${order.deliveryTime}` : ''}`
                  : 'Sẽ được xác nhận'}</b></span>
                <span>{order.orderType === 'custom' ? 'Giá cơ bản' : 'Tổng tiền'} <b>{money(order.basePrice ?? order.total)}</b></span>
                {order.orderType === 'custom' && (
                  <span>Báo giá chính thức <b>{(order.finalPrice ?? order.quotedPrice) != null ? money(order.finalPrice ?? order.quotedPrice) : 'Đang chờ báo giá'}</b></span>
                )}
              </div>
              {order.adminNote && <p className="admin-note">Ghi chú từ Pann: {order.adminNote}</p>}
              {order.orderType === 'custom' && order.status === 'Đã báo giá' && (
                <div className="quote-actions">
                  <p>Pann đã gửi báo giá chính thức <strong>{money(order.finalPrice ?? order.quotedPrice)}</strong>. Bạn muốn xác nhận đơn bánh này?</p>
                  <Button variant="success" onClick={() => respond(order, 'Khách đã chốt')}>Xác nhận đặt bánh</Button>
                  <Button variant="outline-secondary" onClick={() => respond(order, 'Đã hủy')}>Hủy yêu cầu</Button>
                </div>
              )}
            </Card.Body>
          </Card>
        ))}
      </Container>
    </main>
  );
}
