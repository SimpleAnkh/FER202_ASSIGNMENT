import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [] },
  reducers: {
    addToCart(state, action) {
      const { cake, quantity = 1 } = action.payload;
      const existing = state.items.find((item) => item.id === cake.id);
      if (existing) existing.quantity += quantity;
      else state.items.push({ ...cake, quantity });
    },
    incrementItem(state, action) {
      const item = state.items.find((entry) => entry.id === action.payload);
      if (item) item.quantity += 1;
    },
    decrementItem(state, action) {
      const item = state.items.find((entry) => entry.id === action.payload);
      if (item && item.quantity > 1) item.quantity -= 1;
    },
    removeItem(state, action) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

export const { addToCart, incrementItem, decrementItem, removeItem, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;
