import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { apiErrorMessage } from './services/api';
import { readOptimizedImage } from './utils/image';

jest.mock('./utils/image', () => ({
  readOptimizedImage: jest.fn(() => Promise.resolve('data:image/jpeg;base64,compressed')),
}));

jest.mock('axios', () => {
  const client = {
    putCalls: [],
    postCalls: [],
    customOrderStatus: '',
    get(path, options = {}) {
      if (path === '/cakes') {
        return Promise.resolve({ data: [{ id: '1', name: 'Dâu tây kem tươi', category: 'Bánh kem', price: 320000, rating: 4.9, image: 'cake.jpg' }] });
      }
      if (path === '/customOrders') {
        return Promise.resolve({
          data: [{
            id: 'custom-1',
            customerId: 'customer-1',
            name: 'Nguyễn An',
            phone: '0912345678',
            address: 'Quận 1',
            size: 'medium',
            flavor: 'Matcha',
            cream: 'whipping',
            layers: 2,
            decoration: 'Hoa kem',
            budget: 500000,
            deliveryDate: '2026-12-01',
            deliveryTime: '15:30',
            basePrice: 450000,
            referenceImage: 'data:image/png;base64,c2FtcGxl',
            status: client.customOrderStatus || 'Chờ báo giá',
          }].filter((order) => !options.params?.customerId || order.customerId === options.params.customerId),
        });
      }
      if (path === '/orders') {
        return Promise.resolve({
          data: [{
            id: 'order-1',
            customerId: 'customer-1',
            name: 'Lê Minh',
            phone: '0987654321',
            address: 'Quận 3',
            items: [{ id: '1', name: 'Dâu tây kem tươi', price: 320000, quantity: 1 }],
            total: 320000,
            status: 'Chờ xác nhận',
          }].filter((order) => !options.params?.customerId || order.customerId === options.params.customerId),
        });
      }
      return Promise.resolve({ data: [] });
    },
    put(path, changes) {
      client.putCalls.push([path, changes]);
      return Promise.resolve({
        data: { ...changes, id: path.split('/').pop() },
      });
    },
    post(path, changes) {
      client.postCalls.push([path, changes]);
      return Promise.resolve({
        data: { ...changes, id: 'created-1' },
      });
    },
    delete() {
      return Promise.resolve({ data: {} });
    },
  };
  return { create: () => client, __client: client };
});
import App from './App';
import axios from 'axios';

async function renderAppAt(path) {
  window.history.pushState({}, '', path);
  await act(async () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );
    await Promise.resolve();
  });
}

beforeEach(() => {
  window.history.pushState({}, '', '/');
  axios.__client.putCalls.length = 0;
  axios.__client.postCalls.length = 0;
  axios.__client.customOrderStatus = '';
  readOptimizedImage.mockResolvedValue('data:image/jpeg;base64,compressed');
  localStorage.setItem('pann-cake-session', JSON.stringify({
    id: 'admin-1',
    name: 'Pann Admin',
    email: 'admin@panncake.vn',
    role: 'admin',
  }));
});

test('explains how to restore the API connection after a network error', () => {
  expect(apiErrorMessage({ code: 'ERR_NETWORK' })).toMatch(/npm start/);
  expect(apiErrorMessage({ code: 'ERR_NETWORK' })).toContain('http://localhost:3001');
});

test('renders the Pann Cake storefront and main navigation', async () => {
  await renderAppAt('/');
  expect(screen.getByRole('link', { name: /Trang chủ/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Thực đơn/i })).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: /Đặt bánh riêng/i }).length).toBeGreaterThan(0);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Bánh tươi, làm mỗi ngày/);
  expect((await screen.findAllByRole('link', { name: 'Dâu tây kem tươi' })).length).toBeGreaterThan(0);
  expect(screen.queryByText(/★/)).not.toBeInTheDocument();
});

test('saves an adjusted quote and customer note without complexity selection', async () => {
  await renderAppAt('/admin/custom-orders');

  fireEvent.click(await screen.findByRole('button', { name: 'Đánh giá & báo giá' }));
  expect(screen.queryByText(/Ngân sách dự kiến/)).not.toBeInTheDocument();
  expect(screen.queryByLabelText('Mức độ phức tạp')).not.toBeInTheDocument();
  expect(screen.getAllByText('Giá cơ bản').length).toBeGreaterThan(0);
  expect(screen.getByAltText('Ảnh mẫu của Nguyễn An')).toBeInTheDocument();

  fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '610000' } });
  fireEvent.change(screen.getByPlaceholderText(/Ghi chú thêm/), { target: { value: 'Có thể đổi màu hoa theo yêu cầu.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Gửi báo giá' }));

  await waitFor(() => {
    const savedQuote = axios.__client.putCalls.find(([path]) => path === '/customOrders/custom-1');
    expect(savedQuote).toBeDefined();
    expect(savedQuote[1]).toEqual(expect.objectContaining({
        finalPrice: 610000,
        adminNote: 'Có thể đổi màu hoa theo yêu cầu.',
        status: 'Đã báo giá',
      }));
    expect(savedQuote[1]).not.toHaveProperty('complexityLevel');
    expect(savedQuote[1]).not.toHaveProperty('complexityFee');
    expect(savedQuote[1]).not.toHaveProperty('surcharge');
  });
});

test('edits a product from the products administration route', async () => {
  await renderAppAt('/admin/products');

  fireEvent.click(await screen.findByRole('button', { name: 'Sửa' }));
  const image = new File(['cake image'], 'cake.png', { type: 'image/png' });
  fireEvent.change(screen.getByLabelText('Ảnh sản phẩm'), { target: { files: [image] } });
  await waitFor(() => {
    expect(screen.getByAltText('Xem trước ảnh sản phẩm').getAttribute('src')).toBe('data:image/jpeg;base64,compressed');
  });
  fireEvent.change(screen.getAllByRole('spinbutton')[0], { target: { value: '340000' } });
  fireEvent.click(screen.getByRole('button', { name: 'Lưu sản phẩm' }));

  await waitFor(() => {
    const savedProduct = axios.__client.putCalls.find(([path]) => path === '/cakes/1');
    expect(savedProduct).toBeDefined();
    expect(savedProduct[1].price).toBe(340000);
    expect(savedProduct[1].image).toBe('data:image/jpeg;base64,compressed');
  });
});

test('updates standard order status from the orders administration route', async () => {
  await renderAppAt('/admin/orders');

  const status = await screen.findByRole('combobox', { name: 'Trạng thái đơn order-1' });
  fireEvent.change(status, { target: { value: 'Đang làm bánh' } });

  await waitFor(() => {
    const savedOrder = axios.__client.putCalls.find(([path]) => path === '/orders/order-1');
    expect(savedOrder).toBeDefined();
    expect(savedOrder[1].status).toBe('Đang làm bánh');
  });
});

test('updates a confirmed custom cake order through production and delivery statuses', async () => {
  axios.__client.customOrderStatus = 'Khách đã chốt';
  await renderAppAt('/admin/custom-orders');

  const status = await screen.findByRole('combobox', { name: 'Trạng thái bánh đặt riêng custom-1' });
  fireEvent.change(status, { target: { value: 'Đang làm bánh' } });

  await waitFor(() => {
    const savedOrder = axios.__client.putCalls.find(([path]) => path === '/customOrders/custom-1');
    expect(savedOrder).toBeDefined();
    expect(savedOrder[1].status).toBe('Đang làm bánh');
  });
  expect(screen.getByRole('option', { name: 'Đang giao' })).toBeInTheDocument();
  expect(screen.getByRole('option', { name: 'Hoàn thành' })).toBeInTheDocument();
});

test('shows only this account’s regular and custom orders', async () => {
  localStorage.setItem('pann-cake-session', JSON.stringify({
    id: 'customer-1',
    name: 'Khách hàng',
    email: 'customer@example.com',
    role: 'customer',
  }));
  await renderAppAt('/my-custom-orders');

  expect(await screen.findByText(/Dâu tây kem tươi × 1/)).toBeInTheDocument();
  expect(screen.getByText(/medium · Matcha · 2 tầng/)).toBeInTheDocument();
  expect(screen.getByText('Chờ xác nhận')).toBeInTheDocument();
  expect(screen.getAllByText('Chờ báo giá').length).toBeGreaterThan(0);
  expect(screen.queryByRole('textbox', { name: /Số điện thoại/i })).not.toBeInTheDocument();
});

test('redirects guests to login before opening account-only order pages', async () => {
  localStorage.removeItem('pann-cake-session');
  await renderAppAt('/custom-order');

  expect(await screen.findByRole('heading', { name: 'Đăng nhập' })).toBeInTheDocument();
});

test('blocks customer accounts from the admin area', async () => {
  localStorage.setItem('pann-cake-session', JSON.stringify({
    id: 'customer-1',
    name: 'Khách hàng',
    email: 'customer@example.com',
    role: 'customer',
  }));
  await renderAppAt('/admin/products');

  expect(await screen.findByRole('heading', { name: 'Bạn không có quyền truy cập trang này' })).toBeInTheDocument();
});
