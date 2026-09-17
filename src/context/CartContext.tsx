"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export interface CartItem {
  id: string;
  title: string;
  variant?: string;
  color?: string;
  price: number;
  quantity: number;
  image: string;
  stock?: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "id"> & { id?: string }) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalAmount: number;
  itemCount: number;
}

const STORAGE_KEY = "sohoj_life_cart";
const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setCartItems(JSON.parse(saved));
    } catch (error) {
      console.error("Failed to load cart", error);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems, hydrated]);

  const addToCart = (item: Omit<CartItem, "id"> & { id?: string }) => {
    const id = item.id || `${item.title}-${item.variant || "default"}-${item.color || "default"}`;
    setCartItems((prev) => {
      const existing = prev.find((x) => x.id === id);
      if (existing) {
        const max = existing.stock ?? 999;
        return prev.map((x) => x.id === id ? { ...x, quantity: Math.min(x.quantity + item.quantity, max) } : x);
      }
      return [...prev, { ...item, id, quantity: Math.max(1, item.quantity) }];
    });
  };

  const removeFromCart = (id: string) => setCartItems((prev) => prev.filter((x) => x.id !== id));

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) return removeFromCart(id);
    setCartItems((prev) => prev.map((x) => {
      if (x.id !== id) return x;
      return { ...x, quantity: Math.min(qty, x.stock ?? 999) };
    }));
  };

  const clearCart = () => setCartItems([]);

  const totalAmount = useMemo(() => cartItems.reduce((sum, x) => sum + x.price * x.quantity, 0), [cartItems]);
  const itemCount = useMemo(() => cartItems.reduce((sum, x) => sum + x.quantity, 0), [cartItems]);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, isCartOpen, setIsCartOpen, totalAmount, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
