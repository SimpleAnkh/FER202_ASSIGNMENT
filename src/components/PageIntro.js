import PropTypes from 'prop-types';

export default function PageIntro({ kicker, title, subtitle }) {
  return (
    <header className="page-intro">
      <span className="eyebrow">{kicker}</span>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </header>
  );
}

PageIntro.propTypes = {
  kicker: PropTypes.string.isRequired,
  title: PropTypes.node.isRequired,
  subtitle: PropTypes.string,
};
