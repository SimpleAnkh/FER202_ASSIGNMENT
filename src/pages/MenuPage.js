import { Container, Spinner } from 'react-bootstrap';
import Catalog from '../components/cakes/Catalog';
import PageIntro from '../components/PageIntro';
import useCakes from '../hooks/useCakes';

export default function MenuPage() {
  const { cakes, error, loading } = useCakes();
  return (
    <main className="page-main">
      <Container>
        <PageIntro kicker="PANN CAKE" title={<>Thực đơn mỗi ngày</>}/>
        {loading && <p className="loading-note"><Spinner size="sm" animation="border" /> Đang tải thực đơn...</p>}
        <Catalog cakes={cakes} error={error} />
      </Container>
    </main>
  );
}
