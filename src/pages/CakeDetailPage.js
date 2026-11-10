import { useState } from 'react';
import { Button, Col, Container, Row, Spinner } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import useCakes from '../hooks/useCakes';
import { addToCart } from '../store/cartSlice';
import { money } from '../utils/format';

export default function CakeDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { cakes, loading, error } = useCakes();
  const cake = cakes.find((item) => String(item.id) === id);
  const [quantity, setQuantity] = useState(1);

  if (loading && !cake) {
    return <main className="page-main"><Container className="loading-note"><Spinner size="sm" animation="border" /> Đang tải thông tin bánh...</Container></main>;
  }
  if (!cake) {
    return <main className="page-main"><Container><div className="empty-state"><h2>Chưa tìm thấy chiếc bánh này</h2><p>{error}</p><Link to="/cakes">Quay lại thực đơn →</Link></div></Container></main>;
  }

  return (
    <main className="page-main">
      <Container>
        <div className="breadcrumb-line"><Link to="/">Trang chủ</Link> / <Link to="/cakes">Thực đơn</Link> / {cake.name}</div>
        <Row className="detail-layout g-5">
          <Col md={7}><img className="detail-image" src={cake.image} alt={cake.name} /></Col>
          <Col md={5}>
            <span className="eyebrow">{cake.category} - LÀM MỚI MỖI NGÀY</span>
            <h1 className="detail-title">{cake.name}</h1>
            <h2 className="detail-price">{money(cake.price)}</h2>
            <p className="detail-description">{cake.description}</p>
            <div className="detail-specs"><span>Kích thước <b>{cake.size || '16cm'}</b></span><span>Tình trạng <b>{cake.stock ? 'Còn hàng' : 'Hết hàng'}</b></span><span>Chuẩn bị <b>Trong ngày</b></span></div>
            <div className="quantity-row"><span>Số lượng</span><div className="quantity-control"><button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button><b>{quantity}</b><button type="button" onClick={() => setQuantity(quantity + 1)}>+</button></div></div>
            <Button className="button-dark add-detail" disabled={!cake.stock} onClick={() => dispatch(addToCart({ cake, quantity }))}>Thêm vào giỏ · {money(cake.price * quantity)}</Button>
          </Col>
        </Row>
      </Container>
    </main>
  );
}
