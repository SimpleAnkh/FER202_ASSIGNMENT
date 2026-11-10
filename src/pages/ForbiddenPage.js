import { Button, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function ForbiddenPage() {
  return (
    <main className="page-main">
      <Container>
        <div className="empty-state">
          <h2>Bạn không có quyền truy cập trang này</h2>
          <p>Khu vực quản trị chỉ dành cho tài khoản quản trị viên.</p>
          <Button as={Link} to="/" className="button-dark">Về trang chủ</Button>
        </div>
      </Container>
    </main>
  );
}
