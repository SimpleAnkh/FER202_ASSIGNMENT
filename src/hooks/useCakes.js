import { useEffect, useState } from 'react';
import cakesSeed from '../data/cakes';
import { apiErrorMessage, getCakes } from '../services/api';

export default function useCakes() {
  const [cakes, setCakes] = useState(cakesSeed);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getCakes()
      .then((data) => {
        if (active) setCakes(data);
      })
      .catch((requestError) => {
        if (active) setError(`Không tải được dữ liệu cửa hàng: ${apiErrorMessage(requestError)}`);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { cakes, error, loading, setCakes };
}
