import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Col, Container, Form, Modal, Row, Table } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import PageIntro from '../components/PageIntro';
import StatusBadge from '../components/StatusBadge';
import useCakes from '../hooks/useCakes';
import {
  apiErrorMessage,
  createCake,
  deleteCake,
  getCustomOrders,
  getOrders,
  updateCake,
  updateCustomOrder,
  updateOrder,
} from '../services/api';
import { money } from '../utils/format';
import { readOptimizedImage } from '../utils/image';

const emptyCake = {
  name: '', category: 'Bánh kem', price: '', image: '', description: '', size: '16cm', stock: 1,
};
const cakeSizes = { small: 'Nhỏ · 14cm', medium: 'Vừa · 18cm', large: 'Lớn · 22cm' };
const creamNames = {
  whipping: 'Kem tươi (Whipping)',
  buttercream: 'Kem bơ (Buttercream)',
  'cream-cheese': 'Kem phô mai (Cream Cheese)',
};
const orderStatuses = ['Chờ xác nhận', 'Đang làm bánh', 'Đang giao', 'Hoàn thành'];
const customOrderStatuses = ['Khách đã chốt', 'Đang làm bánh', 'Đang giao', 'Hoàn thành'];

export default function AdminPage() {
  const { pathname } = useLocation();
  const { cakes, error: cakeError, setCakes } = useCakes();
  const [customOrders, setCustomOrders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [quoteOrder, setQuoteOrder] = useState(null);
  const [finalPrice, setFinalPrice] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [productModal, setProductModal] = useState(false);
  const [editingCake, setEditingCake] = useState(null);
  const [cakeForm, setCakeForm] = useState(emptyCake);
  const [cakeSaving, setCakeSaving] = useState(false);
  const [notice, setNotice] = useState('');

  const activeTab = pathname.endsWith('/products')
    ? 'products'
    : pathname.endsWith('/orders') && !pathname.endsWith('/custom-orders')
      ? 'orders'
      : 'custom-orders';

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [requests, standardOrders] = await Promise.all([getCustomOrders(), getOrders()]);
        setCustomOrders(requests);
        setOrders(standardOrders);
      } catch (requestError) {
        setError(`Không tải được dữ liệu quản lý: ${apiErrorMessage(requestError)}.`);
      }
    }
    loadAdminData();
  }, []);

  function openQuote(order) {
    setQuoteOrder(order);
    setFinalPrice(String(order.finalPrice ?? order.basePrice));
    setAdminNote(order.adminNote || '');
  }

  async function sendQuote(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    const orderDetails = { ...quoteOrder };
    delete orderDetails.complexityLevel;
    delete orderDetails.complexityFee;
    delete orderDetails.surcharge;
    try {
      const updated = await updateCustomOrder(quoteOrder.id, {
        ...orderDetails,
        finalPrice: Number(finalPrice),
        quotedPrice: Number(finalPrice),
        adminNote,
        status: 'Đã báo giá',
        quotedAt: new Date().toISOString(),
      });
      setCustomOrders(customOrders.map((order) => (order.id === updated.id ? updated : order)));
      setQuoteOrder(null);
      setNotice(`Đã gửi báo giá cho yêu cầu #${updated.id}.`);
    } catch (requestError) {
      setError(`Không gửi được báo giá: ${apiErrorMessage(requestError)}.`);
    } finally {
      setSaving(false);
    }
  }

  async function saveCake(event) {
    event.preventDefault();
    if (!cakeForm.image) {
      setError('Vui lòng chọn ảnh sản phẩm từ máy tính.');
      return;
    }
    setCakeSaving(true);
    setError('');
    const changes = {
      ...cakeForm,
      price: Number(cakeForm.price),
      stock: Number(cakeForm.stock),
      rating: editingCake?.rating || 5,
      reviews: editingCake?.reviews || 0,
    };
    try {
      const saved = editingCake
        ? await updateCake(editingCake.id, changes)
        : await createCake(changes);
      setCakes(editingCake
        ? cakes.map((cake) => (cake.id === saved.id ? saved : cake))
        : [...cakes, saved]);
      setProductModal(false);
      setNotice(editingCake ? 'Đã cập nhật sản phẩm.' : 'Đã thêm bánh mới vào thực đơn.');
    } catch (requestError) {
      setError(`Không thể lưu sản phẩm: ${apiErrorMessage(requestError)}.`);
    } finally {
      setCakeSaving(false);
    }
  }

  async function removeProduct(cake) {
    setError('');
    try {
      await deleteCake(cake.id);
      setCakes(cakes.filter((item) => item.id !== cake.id));
      setNotice(`Đã xóa sản phẩm "${cake.name}".`);
    } catch (requestError) {
      setError(`Không thể xóa sản phẩm: ${apiErrorMessage(requestError)}.`);
    }
  }

  async function changeOrderStatus(order, status) {
    setError('');
    try {
      const updated = await updateOrder(order.id, { ...order, status });
      setOrders(orders.map((item) => (item.id === updated.id ? updated : item)));
      setNotice(`Đã cập nhật trạng thái đơn #${order.id}.`);
    } catch (requestError) {
      setError(`Không thể cập nhật đơn hàng: ${apiErrorMessage(requestError)}.`);
    }
  }

  async function changeCustomOrderStatus(order, status) {
    setError('');
    try {
      const updated = await updateCustomOrder(order.id, { ...order, status });
      setCustomOrders(customOrders.map((item) => (item.id === updated.id ? updated : item)));
      setNotice(`Đã cập nhật trạng thái bánh đặt riêng #${order.id}.`);
    } catch (requestError) {
      setError(`Không thể cập nhật yêu cầu bánh riêng: ${apiErrorMessage(requestError)}.`);
    }
  }

  return (
    <main className="page-main admin-page">
      <Container>
        <PageIntro kicker="PANN CAKE · QUẢN TRỊ" title={<>Quản lý <i>cửa hàng</i></>} subtitle="Sản phẩm, đơn hàng và yêu cầu bánh đặt riêng." />
        {error && <Alert variant="danger">{error}</Alert>}
        {cakeError && <Alert variant="warning">{cakeError}</Alert>}
        {notice && <Alert variant="success" dismissible onClose={() => setNotice('')}>{notice}</Alert>}
        <nav className="admin-tabs" aria-label="Khu vực quản lý">
          <AdminTab to="/admin/products" active={activeTab === 'products'}>Sản phẩm <Badge bg="light" text="dark">{cakes.length}</Badge></AdminTab>
          <AdminTab to="/admin/orders" active={activeTab === 'orders'}>Đơn hàng <Badge bg="light" text="dark">{orders.length}</Badge></AdminTab>
          <AdminTab to="/admin/custom-orders" active={activeTab === 'custom-orders'}>Bánh đặt riêng <Badge bg="light" text="dark">{customOrders.length}</Badge></AdminTab>
        </nav>
        {activeTab === 'products' && <ProductTable cakes={cakes} onAdd={() => { setEditingCake(null); setCakeForm(emptyCake); setProductModal(true); }} onEdit={(cake) => { setEditingCake(cake); setCakeForm({ ...emptyCake, ...cake }); setProductModal(true); }} onRemove={removeProduct} />}
        {activeTab === 'orders' && <OrderTable orders={orders} onStatusChange={changeOrderStatus} />}
        {activeTab === 'custom-orders' && <CustomOrderTable orders={customOrders} onQuote={openQuote} onStatusChange={changeCustomOrderStatus} />}
        <ProductModal show={productModal} editing={Boolean(editingCake)} form={cakeForm} setForm={setCakeForm} saving={cakeSaving} onHide={() => setProductModal(false)} onSubmit={saveCake} />
        <QuoteModal
          order={quoteOrder}
          finalPrice={finalPrice}
          adminNote={adminNote}
          setFinalPrice={setFinalPrice}
          setAdminNote={setAdminNote}
          saving={saving}
          onHide={() => setQuoteOrder(null)}
          onSubmit={sendQuote}
        />
      </Container>
    </main>
  );
}

function AdminTab({ to, active, children }) {
  return <Link to={to} className={`admin-tab ${active ? 'active' : ''}`} aria-current={active ? 'page' : undefined}>{children}</Link>;
}

function ProductTable({ cakes, onAdd, onEdit, onRemove }) {
  return (
    <section className="admin-panel">
      <div className="admin-panel-heading"><h2>Danh mục sản phẩm</h2><Button className="button-dark" onClick={onAdd}>Thêm bánh +</Button></div>
      <div className="table-responsive"><Table hover><thead><tr><th>Sản phẩm</th><th>Danh mục</th><th>Giá</th><th>Tồn kho</th><th>Thao tác</th></tr></thead><tbody>
        {cakes.map((cake) => <tr key={cake.id}><td><strong>{cake.name}</strong><small>{cake.description}</small></td><td>{cake.category}</td><td>{money(cake.price)}</td><td>{cake.stock}</td><td className="admin-row-actions"><Button size="sm" variant="outline-secondary" onClick={() => onEdit(cake)}>Sửa</Button><Button size="sm" variant="outline-danger" onClick={() => onRemove(cake)}>Xóa</Button></td></tr>)}
      </tbody></Table></div>
    </section>
  );
}

function OrderTable({ orders, onStatusChange }) {
  return (
    <section className="admin-panel"><h2>Đơn hàng bánh có sẵn</h2>
      {orders.length ? <div className="table-responsive"><Table hover><thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Chi tiết sản phẩm</th><th>Tổng tiền</th><th>Trạng thái xử lý</th></tr></thead><tbody>
        {orders.map((order) => <tr key={order.id}>
          <td>#{order.id}</td>
          <td><strong>{order.name}</strong><small>{order.phone}</small><small>{order.address}</small></td>
          <td>{order.items.map((item) => <div key={item.id}>{item.name} × {item.quantity} · {money(item.price * item.quantity)}</div>)}</td>
          <td>{money(order.total)}</td>
          <td><Form.Select aria-label={`Trạng thái đơn ${order.id}`} value={order.status} onChange={(event) => onStatusChange(order, event.target.value)}>{orderStatuses.map((status) => <option key={status}>{status}</option>)}</Form.Select></td>
        </tr>)}
      </tbody></Table></div> : <p className="admin-empty">Chưa có đơn hàng bánh có sẵn.</p>}
    </section>
  );
}

function CustomOrderTable({ orders, onQuote, onStatusChange }) {
  return (
    <section className="admin-panel"><h2>Yêu cầu bánh riêng</h2>
      {orders.length ? <div className="table-responsive"><Table hover><thead><tr><th>Khách hàng</th><th>Bánh</th><th>Thời gian nhận</th><th>Giá cơ bản</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>
        {orders.map((order) => <tr key={order.id}><td><strong>{order.name}</strong><small>{order.phone}</small></td><td>{cakeSizes[order.size] || order.size} · {order.flavor} · {order.layers} tầng</td><td>{order.deliveryDate}<small>{order.deliveryTime}</small></td><td>{money(order.basePrice)}</td><td>{order.status === 'Khách đã chốt' || customOrderStatuses.slice(1).includes(order.status) ? <Form.Select aria-label={`Trạng thái bánh đặt riêng ${order.id}`} value={order.status} onChange={(event) => onStatusChange(order, event.target.value)}>{customOrderStatuses.map((status) => <option key={status}>{status}</option>)}</Form.Select> : <StatusBadge status={order.status} />}</td><td>{order.status === 'Chờ báo giá' && <Button size="sm" className="quote-button" onClick={() => onQuote(order)}>Đánh giá & báo giá</Button>}</td></tr>)}
      </tbody></Table></div> : <p className="admin-empty">Chưa có yêu cầu bánh riêng nào.</p>}
    </section>
  );
}

function ProductModal({ show, editing, form, setForm, saving, onHide, onSubmit }) {
  const [imageError, setImageError] = useState('');
  const [imageReading, setImageReading] = useState(false);

  useEffect(() => {
    if (show) setImageError('');
  }, [show]);

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function handleImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    setImageReading(true);
    readOptimizedImage(file)
      .then((image) => {
        setForm((current) => ({ ...current, image }));
        setImageError('');
      })
      .catch((uploadError) => {
        setImageError(uploadError.message);
      })
      .finally(() => setImageReading(false));
  }

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton><Modal.Title>{editing ? 'Sửa sản phẩm' : 'Thêm bánh mới'}</Modal.Title></Modal.Header>
      <Form onSubmit={onSubmit}><Modal.Body>
        <Form.Group className="mb-3"><Form.Label>Tên bánh</Form.Label><Form.Control required name="name" value={form.name} onChange={updateField} /></Form.Group>
        <Row className="g-3">
          <Col sm={6}><Form.Group><Form.Label>Danh mục</Form.Label><Form.Select name="category" value={form.category} onChange={updateField}><option>Bánh kem</option><option>Mousse</option><option>Tiramisu</option><option>Bánh quy</option></Form.Select></Form.Group></Col>
          <Col sm={6}><Form.Group><Form.Label>Giá bán (đ)</Form.Label><Form.Control required type="number" min="1000" name="price" value={form.price} onChange={updateField} /></Form.Group></Col>
          <Col sm={6}><Form.Group><Form.Label>Kích thước</Form.Label><Form.Control name="size" value={form.size} onChange={updateField} /></Form.Group></Col>
          <Col sm={6}><Form.Group><Form.Label>Tồn kho</Form.Label><Form.Control required type="number" min="0" name="stock" value={form.stock} onChange={updateField} /></Form.Group></Col>
        </Row>
        <Form.Group className="mt-3">
          <Form.Label>Ảnh sản phẩm {!editing && '*'}</Form.Label>
          <Form.Control type="file" accept="image/*" required={!editing && !form.image} onChange={handleImage} aria-label="Ảnh sản phẩm" />
          <Form.Text>Chọn ảnh từ máy tính, dung lượng tối đa 2MB. Ảnh sẽ được tự động nén trước khi lưu.{editing && ' Để trống nếu muốn giữ ảnh hiện tại.'}</Form.Text>
          {imageError && <div className="text-danger small mt-1" role="alert">{imageError}</div>}
          {form.image && <div className="product-image-preview"><img src={form.image} alt="Xem trước ảnh sản phẩm" /></div>}
        </Form.Group>
        <Form.Group className="mt-3"><Form.Label>Mô tả</Form.Label><Form.Control as="textarea" rows={3} name="description" value={form.description} onChange={updateField} /></Form.Group>
      </Modal.Body><Modal.Footer><Button variant="outline-secondary" onClick={onHide}>Hủy</Button><Button type="submit" className="button-dark" disabled={saving || imageReading}>{imageReading ? 'Đang đọc ảnh...' : saving ? 'Đang lưu...' : 'Lưu sản phẩm'}</Button></Modal.Footer></Form>
    </Modal>
  );
}

function QuoteModal({
  order, finalPrice, adminNote, setFinalPrice, setAdminNote, saving, onHide, onSubmit,
}) {
  return (
    <Modal show={Boolean(order)} onHide={onHide} centered size="lg">
      <Modal.Header closeButton><Modal.Title>Đánh giá & báo giá · #{order?.id}</Modal.Title></Modal.Header>
      {order && <Form onSubmit={onSubmit}><Modal.Body>
        <Row className="g-3">
          <Col md={order.referenceImage ? 7 : 12}>
            <section className="quote-customer-details">
              <h3>Thông tin khách hàng</h3>
              <p><strong>{order.name}</strong> · {order.phone}</p>
              <p>Địa chỉ: {order.address}</p>
              <p>Nhận bánh: {order.deliveryDate} · {order.deliveryTime || 'Chưa chọn giờ'}</p>
              <h3>Thông số bánh</h3>
              <p>{cakeSizes[order.size] || order.size} · {order.flavor} · {creamNames[order.cream] || order.cream} · {order.layers} tầng</p>
              <p>Trang trí: {order.decoration || 'Chưa ghi chú'}</p>
              <p>Giá cơ bản: <strong>{money(order.basePrice)}</strong></p>
            </section>
          </Col>
          <Col md={5}>{order.referenceImage ? <img className="quote-reference-image" src={order.referenceImage} alt={`Ảnh mẫu của ${order.name}`} /> : <div className="quote-image-empty">Khách chưa gửi ảnh mẫu.</div>}</Col>
        </Row>
        <hr />
        <div className="quote-total"><span>Giá cơ bản</span><strong>{money(order.basePrice)}</strong></div>
        <Form.Group className="mt-3"><Form.Label>Giá cuối cùng (có thể điều chỉnh)</Form.Label><Form.Control required type="number" min="0" step="1000" value={finalPrice} onChange={(event) => setFinalPrice(event.target.value)} /></Form.Group>
        <Form.Group className="mt-3"><Form.Label>Ghi chú tư vấn cho khách</Form.Label><Form.Control as="textarea" rows={3} value={adminNote} onChange={(event) => setAdminNote(event.target.value)} placeholder="Ghi chú thêm về nguyên liệu, thiết kế hoặc thời gian..." /></Form.Group>
      </Modal.Body><Modal.Footer><Button variant="outline-secondary" onClick={onHide}>Để sau</Button><Button type="submit" className="button-dark" disabled={saving}>{saving ? 'Đang gửi...' : 'Gửi báo giá'}</Button></Modal.Footer></Form>}
    </Modal>
  );
}
