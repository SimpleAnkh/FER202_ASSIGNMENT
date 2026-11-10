import { Col, Row } from 'react-bootstrap';
import PropTypes from 'prop-types';
import CakeCard from './CakeCard';

export default function CakeGrid({ cakes }) {
  if (!cakes.length) return <div className="empty-results">Chưa tìm thấy chiếc bánh phù hợp.</div>;
  return (
    <Row className="g-4">
      {cakes.map((cake) => (
        <Col key={cake.id} xs={12} sm={6} lg={4} xl={3}><CakeCard cake={cake} /></Col>
      ))}
    </Row>
  );
}

CakeGrid.propTypes = { cakes: PropTypes.arrayOf(PropTypes.object).isRequired };
