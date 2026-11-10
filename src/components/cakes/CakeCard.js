import { Button, Card } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { addToCart } from '../../store/cartSlice';
import { money } from '../../utils/format';

export default function CakeCard({ cake }) {
  const dispatch = useDispatch();

  return (
    <Card className="cake-card">
      <Link to={`/cakes/${cake.id}`} className="cake-image-wrap">
        <Card.Img variant="top" src={cake.image} alt={cake.name} />
      </Link>
      <Card.Body>
        <div className="cake-meta"><span>{cake.category}</span></div>
        <Card.Title as={Link} to={`/cakes/${cake.id}`}>{cake.name}</Card.Title>
        <div className="cake-card-bottom">
          <strong>{money(cake.price)}</strong>
          <Button className="add-button" variant="outline-dark" aria-label={`Thêm ${cake.name} vào giỏ`} onClick={() => dispatch(addToCart({ cake }))}>Thêm</Button>
        </div>
      </Card.Body>
    </Card>
  );
}

CakeCard.propTypes = {
  cake: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    category: PropTypes.string,
    price: PropTypes.number.isRequired,
    image: PropTypes.string.isRequired,
  }).isRequired,
};
