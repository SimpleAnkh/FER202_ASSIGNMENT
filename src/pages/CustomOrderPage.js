import { useState } from 'react';
import { Alert, Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PageIntro from '../components/PageIntro';
import { useAuth } from '../context/AuthContext';
import { apiErrorMessage, createCustomOrder } from '../services/api';
import { money } from '../utils/format';
import { readOptimizedImage } from '../utils/image';

const sizeOptions = [
  { value: 'small', label: 'Nhỏ · 14cm', price: 200000 },
  { value: 'medium', label: 'Vừa · 18cm', price: 300000 },
  { value: 'large', label: 'Lớn · 22cm', price: 450000 },
];
const creamOptions = [
  { value: 'whipping', label: 'Kem tươi (Whipping)', price: 0 },
  { value: 'buttercream', label: 'Kem bơ (Buttercream)', price: 30000 },
  { value: 'cream-cheese', label: 'Kem phô mai (Cream Cheese)', price: 50000 },
];
const layerOptions = [
  { value: 1, label: '1 tầng', price: 0 },
  { value: 2, label: '2 tầng', price: 150000 },
  { value: 3, label: '3 tầng', price: 300000 },
];
const initialForm = {
  name: '', phone: '', address: '', size: 'small', flavor: 'Vani',
  cream: 'whipping', layers: '1', decoration: '', deliveryDate: '', deliveryTime: '',
};

export default function CustomOrderPage() {
  const { user } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [referenceImage, setReferenceImage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const basePrice = sizeOptions.find((option) => option.value === form.size).price
    + layerOptions.find((option) => option.value === Number(form.layers)).price
    + creamOptions.find((option) => option.value === form.cream).price;

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function handleImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn tệp hình ảnh hợp lệ.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Ảnh mẫu cần nhỏ hơn 2MB để gửi được yêu cầu.');
      return;
    }
    readOptimizedImage(file)
      .then((image) => {
        setReferenceImage(image);
        setError('');
      })
      .catch((uploadError) => setError(uploadError.message));
  }

  async function submitRequest(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const result = await createCustomOrder({
        ...form,
        customerId: user.id,
        customerEmail: user.email,
        layers: Number(form.layers),
        basePrice,
        referenceImage,
        surcharge: 0,
        status: 'Chờ báo giá',
        createdAt: new Date().toISOString(),
      });
      setSuccess(`Pann đã nhận yêu cầu #${result.id}. Chúng mình sẽ liên hệ bạn sớm nhất!`);
      setForm(initialForm);
      setReferenceImage('');
    } catch (requestError) {
      setError(`Không gửi được yêu cầu: ${apiErrorMessage(requestError)}. Vui lòng thử lại.`);
    } finally {
      setSubmitting(false);
    }
  }

  const minDate = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const sizePrice = sizeOptions.find((option) => option.value === form.size).price;
  const creamPrice = creamOptions.find((option) => option.value === form.cream).price;
  const layerPrice = layerOptions.find((option) => option.value === Number(form.layers)).price;

  return (
    <main className="page-main custom-order-page">
      <Container>
        <PageIntro kicker="PANN CAKE" title={<>Thiết kế chiếc bánh của riêng bạn</>} />
        {success && <Alert variant="success">{success} <Link to="/my-custom-orders">Theo dõi yêu cầu →</Link></Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={submitRequest}>
          <Row className="g-5">
            <Col lg={7}>
              <section className="form-section">
                <div className="form-section-title"><span>01</span><div><h2>Thông tin của bạn</h2><p>Để Pann biết cách liên hệ và giao bánh.</p></div></div>
                <Row className="g-3">
                  <Col md={6}><Form.Group><Form.Label>Họ và tên *</Form.Label><Form.Control required name="name" value={form.name} onChange={updateField} placeholder="Tên của bạn" /></Form.Group></Col>
                  <Col md={6}><Form.Group><Form.Label>Số điện thoại *</Form.Label><Form.Control required type="tel" pattern="[0-9+ .-]{9,15}" name="phone" value={form.phone} onChange={updateField} placeholder="09xx xxx xxx" /></Form.Group></Col>
                  <Col xs={12}><Form.Group><Form.Label>Địa chỉ giao hàng *</Form.Label><Form.Control required name="address" value={form.address} onChange={updateField} placeholder="Số nhà, đường, quận..." /></Form.Group></Col>
                </Row>
              </section>
              <section className="form-section">
                <div className="form-section-title"><span>02</span><div><h2>Chiếc bánh của bạn</h2><p>Mỗi lựa chọn đều góp phần tạo nên hương vị riêng.</p></div></div>
                <Row className="g-3">
                  <Col md={6}><Form.Group><Form.Label>Kích thước bánh</Form.Label><Form.Select name="size" value={form.size} onChange={updateField}>{sizeOptions.map((option) => <option value={option.value} key={option.value}>{option.label} · {money(option.price)}</option>)}</Form.Select></Form.Group></Col>
                  <Col md={6}><Form.Group><Form.Label>Hương vị cốt bánh</Form.Label><Form.Select name="flavor" value={form.flavor} onChange={updateField}>{['Vani', 'Socola', 'Matcha', 'Red Velvet'].map((value) => <option key={value}>{value}</option>)}</Form.Select></Form.Group></Col>
                  <Col md={6}><Form.Group><Form.Label>Loại kem</Form.Label><Form.Select name="cream" value={form.cream} onChange={updateField}>{creamOptions.map((option) => <option value={option.value} key={option.value}>{option.label}{option.price ? ` · +${money(option.price)}` : ''}</option>)}</Form.Select></Form.Group></Col>
                  <Col md={6}><Form.Group><Form.Label>Số tầng</Form.Label><Form.Select name="layers" value={form.layers} onChange={updateField}>{layerOptions.map((option) => <option value={option.value} key={option.value}>{option.label}{option.price ? ` · +${money(option.price)}` : ''}</option>)}</Form.Select></Form.Group></Col>
                </Row>
              </section>
              <section className="form-section">
                <div className="form-section-title"><span>03</span><div><h2>Ý tưởng & ngày nhận</h2><p>Càng nhiều chi tiết, Pann càng hiểu điều bạn mong muốn.</p></div></div>
                <Form.Group className="mb-3"><Form.Label>Kiểu trang trí mong muốn</Form.Label><Form.Control as="textarea" rows={4} name="decoration" value={form.decoration} onChange={updateField} placeholder="Màu sắc, chủ đề, lời nhắn trên bánh..." /></Form.Group>
                <Form.Group className="mb-3"><Form.Label>Ảnh mẫu tham khảo</Form.Label><Form.Control type="file" accept="image/*" onChange={handleImage} /><Form.Text>Ảnh tối đa 2MB.</Form.Text>{referenceImage && <div className="reference-preview"><img src={referenceImage} alt="Ảnh mẫu bánh" /><span>Ảnh mẫu đã sẵn sàng</span><button type="button" onClick={() => setReferenceImage('')}>Gỡ ảnh</button></div>}</Form.Group>
                <Row className="g-3">
                  <Col md={6}><Form.Group><Form.Label>Ngày muốn nhận bánh *</Form.Label><Form.Control type="date" name="deliveryDate" required min={minDate} value={form.deliveryDate} onChange={updateField} /></Form.Group></Col>
                  <Col md={6}><Form.Group><Form.Label>Giờ muốn nhận bánh *</Form.Label><Form.Control type="time" name="deliveryTime" required value={form.deliveryTime} onChange={updateField} /></Form.Group></Col>
                </Row>
              </section>
            </Col>
            <Col lg={5}>
              <aside className="estimate-card">
                <span className="eyebrow">BẢN NHÁP CHIẾC BÁNH</span><h2>Ước tính của bạn</h2>
                <div className="estimate-item"><span>{sizeOptions.find((option) => option.value === form.size).label}</span><strong>{money(sizePrice)}</strong></div>
                <div className="estimate-item"><span>{form.flavor} · {creamOptions.find((option) => option.value === form.cream).label}</span><strong>{money(creamPrice)}</strong></div>
                <div className="estimate-item"><span>{layerOptions.find((option) => option.value === Number(form.layers)).label}</span><strong>{money(layerPrice)}</strong></div>
                <div className="estimate-total"><span>Giá cơ bản tạm tính</span><strong>{money(basePrice)}</strong></div>
                <p>Chưa bao gồm phụ phí trang trí. Pann sẽ xác nhận báo giá chính thức sau khi xem ý tưởng.</p>
                <Button type="submit" className="button-dark w-100" disabled={submitting}>{submitting ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu báo giá →'}</Button>
                <div className="estimate-foot">Không phát sinh phí cho đến khi bạn xác nhận báo giá.</div>
              </aside>
            </Col>
          </Row>
        </Form>
      </Container>
    </main>
  );
}
