import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Catalog from '../components/cakes/Catalog';
import useCakes from '../hooks/useCakes';

export default function HomePage() {
  const { cakes, error } = useCakes();

  return (
    <main>
      <section className="home-intro">
        <Container>
          <p className="eyebrow">PANN CAKE</p>
          <h1>Bánh tươi, làm mỗi ngày.</h1>
          <Link to="/custom-order" className="text-link">Đặt bánh theo yêu cầu</Link>
        </Container>
      </section>
      <Catalog cakes={cakes} error={error} featured />
    </main>
  );
}
