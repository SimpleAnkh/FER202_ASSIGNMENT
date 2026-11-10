import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <Container className="footer-inner">
        <Link to="/" className="brand footer-brand"><span>PANN <b>CAKE</b></span></Link>
        <p>FER202 Assignment</p>
        <small>sonvhhe190274</small>
      </Container>
    </footer>
  );
}
