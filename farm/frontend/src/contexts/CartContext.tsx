import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  seller: {
    name: string;
    location: string;
    rating: number;
    phone: string;
  };
  image: string;
  inStock: boolean;
  deliveryAvailable: boolean;
  features: string[];
  benefits: string[];
  sku: string;
  weight?: string;
  origin?: string;
  categoryLabel: string;
  quantity?: number; // Added quantity to CartItem interface
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  cartItemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex((cartItem) => cartItem.id === item.id);
      if (existingItemIndex > -1) {
        // Item exists, increment quantity
        const newCart = [...prevCart];
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: (newCart[existingItemIndex].quantity || 1) + 1,
        };
        return newCart;
      } else {
        // Item does not exist, add with quantity 1
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex((cartItem) => cartItem.id === itemId);

      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        if ((newCart[existingItemIndex].quantity || 1) > 1) {
          // If quantity > 1, decrement quantity
          newCart[existingItemIndex] = {
            ...newCart[existingItemIndex],
            quantity: (newCart[existingItemIndex].quantity || 1) - 1,
          };
          return newCart;
        } else {
          // If quantity is 1, remove item entirely
          return prevCart.filter((cartItem) => cartItem.id !== itemId);
        }
      }
      return prevCart; // Item not found, return current cart
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartItemCount = cart.length;

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, cartItemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
