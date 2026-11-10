import { useState } from 'react';
import { Alert, Container, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import CakeGrid from './CakeGrid';

export default function Catalog({ cakes, error, featured = false }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Tất cả');
  const displayedCakes = featured ? cakes.slice(0, 4) : cakes;
  const categories = ['Tất cả', ...new Set(cakes.map((cake) => cake.category))];
  const filtered = displayedCakes.filter((cake) => (
    (category === 'Tất cả' || cake.category === category)
    && cake.name.toLocaleLowerCase('vi').includes(query.toLocaleLowerCase('vi'))
  ));

  return (
    <section className="catalog-section">
      <Container>
        <div className="section-heading">
          <div><span className="eyebrow">LÀM MỚI MỖI NGÀY</span><h2>{featured ? 'Bánh được yêu thích' : 'Thực đơn'}</h2></div>
          {featured && <Link to="/cakes" className="text-link">Xem tất cả</Link>}
        </div>
        {error && <Alert variant="warning" className="api-alert">{error} Đang hiển thị thực đơn mẫu.</Alert>}
        <div className="catalog-tools">
          <div className="category-pills">
            {categories.map((name) => <button type="button" className={category === name ? 'active' : ''} key={name} onClick={() => setCategory(name)}>{name}</button>)}
          </div>
          <Form.Control className="search-control" type="search" placeholder="Tìm bánh..." value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Tìm bánh" />
        </div>
        <CakeGrid cakes={filtered} />
      </Container>
    </section>
  );
}

Catalog.propTypes = {
  cakes: PropTypes.arrayOf(PropTypes.object).isRequired,
  error: PropTypes.string,
  featured: PropTypes.bool,
};
