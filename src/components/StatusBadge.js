import { Badge } from 'react-bootstrap';
import PropTypes from 'prop-types';

export default function StatusBadge({ status }) {
  const variant = {
    'Đã báo giá': 'info',
    'Khách đã chốt': 'success',
    'Đã xác nhận': 'success',
    'Đã hủy': 'secondary',
    'Đang làm bánh': 'primary',
    'Đang giao': 'primary',
    'Hoàn thành': 'success',
  }[status] || 'warning';

  return <Badge bg={variant} className="status-badge">{status}</Badge>;
}

StatusBadge.propTypes = { status: PropTypes.string.isRequired };
