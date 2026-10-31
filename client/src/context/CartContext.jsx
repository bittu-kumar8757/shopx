import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, size, colorIndex, qty } = action.payload;
      const existIdx = state.findIndex(
        i => i.id === product.id && i.size === size && i.colorIndex === colorIndex
      );
      if (existIdx !== -1) {
        const updated = [...state];
        updated[existIdx] = { ...updated[existIdx], qty: Math.min(10, updated[existIdx].qty + qty) };
        return updated;
      }
      return [...state, { id: product.id, product, size, colorIndex, qty }];
    }
    case 'REMOVE_ITEM':
      return state.filter(i => !(i.id === action.payload.id && i.size === action.payload.size && i.colorIndex === action.payload.colorIndex));
    case 'UPDATE_QTY': {
      return state.map(i =>
        i.id === action.payload.id && i.size === action.payload.size && i.colorIndex === action.payload.colorIndex
          ? { ...i, qty: Math.max(1, Math.min(10, i.qty + action.payload.delta)) }
          : i
      );
    }
    case 'CLEAR_CART':
      return [];
    case 'BUY_NOW': {
      const { product, size, colorIndex, qty } = action.payload;
      // 👈 Purana cart replace karke sirf NAYA SINGLE ITEM set hoga
      return [{ id: product.id, product, size, colorIndex, qty }];
    }
    case 'LOAD_CART':
      return action.payload;
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(
    cartReducer,
    [],
    () => {
      try { return JSON.parse(localStorage.getItem('shopx-cart') || '[]'); } catch { return []; }
    }
  );

  useEffect(() => {
    localStorage.setItem('shopx-cart', JSON.stringify(cart));
  }, [cart]);

  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + (i.product?.price || 0) * i.qty, 0);

  const addToCart = (product, size, colorIndex = 0, qty = 1) =>
    dispatch({ type: 'ADD_ITEM', payload: { product, size, colorIndex, qty } });

  // 👈 Buy Now Handler Add Kar Diya Hai
  const buyNow = (product, size, colorIndex = 0, qty = 1) =>
    dispatch({ type: 'BUY_NOW', payload: { product, size, colorIndex, qty } });

  const removeFromCart = (id, size, colorIndex) =>
    dispatch({ type: 'REMOVE_ITEM', payload: { id, size, colorIndex } });

  const updateQty = (id, size, colorIndex, delta) =>
    dispatch({ type: 'UPDATE_QTY', payload: { id, size, colorIndex, delta } });

  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  return (
    <CartContext.Provider value={{ cart, totalItems, totalPrice, addToCart, buyNow, removeFromCart, updateQty, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);