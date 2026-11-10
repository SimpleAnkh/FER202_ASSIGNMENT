import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return <main className="page-main"><Container><div className="empty-state"><h2>Trang này chưa có trong thực đơn</h2><Link to="/">Trở về trang chủ →</Link></div></Container></main>;
}
