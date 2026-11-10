import { useState } from 'react';
import { Alert, Button, Container, Form } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PageIntro from '../components/PageIntro';
import { useAuth } from '../context/AuthContext';
import { apiErrorMessage } from '../services/api';

export default function AuthPage({ mode }) {
  const isRegister = mode === 'register';
  const { login, register } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    if (isRegister && form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận chưa khớp.');
      return;
    }

    setSubmitting(true);
    try {
      if (isRegister) {
        await register({ name: form.name, email: form.email, password: form.password });
      } else {
        await login(form.email, form.password);
      }
      const destination = location.state?.from?.pathname || '/';
      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page-main auth-page">
      <Container>
        <PageIntro
          kicker="PANN CAKE"
          title={isRegister ? 'Tạo tài khoản' : 'Đăng nhập'}
          subtitle={isRegister ? 'Đăng ký để đặt bánh và theo dõi yêu cầu của bạn.' : 'Đăng nhập để tiếp tục đặt bánh hoặc quản lý cửa hàng.'}
        />
        <section className="auth-card">
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={submit}>
            {isRegister && <Form.Group className="mb-3"><Form.Label>Họ và tên</Form.Label><Form.Control required name="name" autoComplete="name" value={form.name} onChange={updateField} /></Form.Group>}
            <Form.Group className="mb-3"><Form.Label>Email</Form.Label><Form.Control required type="email" name="email" autoComplete="email" value={form.email} onChange={updateField} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Mật khẩu</Form.Label><Form.Control required type="password" name="password" minLength={8} autoComplete={isRegister ? 'new-password' : 'current-password'} value={form.password} onChange={updateField} /><Form.Text>Mật khẩu tối thiểu 8 ký tự.</Form.Text></Form.Group>
            {isRegister && <Form.Group className="mb-3"><Form.Label>Nhập lại mật khẩu</Form.Label><Form.Control required type="password" name="confirmPassword" minLength={8} autoComplete="new-password" value={form.confirmPassword} onChange={updateField} /></Form.Group>}
            <Button type="submit" className="button-dark w-100" disabled={submitting}>{submitting ? 'Đang xử lý...' : isRegister ? 'Tạo tài khoản' : 'Đăng nhập'}</Button>
          </Form>
          <p className="auth-switch">
            {isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}{' '}
            <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Đăng nhập' : 'Đăng ký'}</Link>
          </p>
        </section>
      </Container>
    </main>
  );
}
