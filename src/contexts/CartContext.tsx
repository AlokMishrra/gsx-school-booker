import React, { createContext, useContext, useState, useCallback } from 'react';

export interface CartItem {
  inventoryItemId: string;
  schoolId: string;
  schoolName: string;
  itemName: string;
  itemType: 'facility' | 'equipment';
  pricePerHour: number;
  quantity: number;
  maxQuantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (inventoryItemId: string) => void;
  updateQuantity: (inventoryItemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((newItem: CartItem) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(item => item.inventoryItemId === newItem.inventoryItemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity = Math.min(
          updated[existingIndex].quantity + newItem.quantity,
          newItem.maxQuantity
        );
        return updated;
      }
      return [...prev, newItem];
    });
  }, []);

  const removeItem = useCallback((inventoryItemId: string) => {
    setItems(prev => prev.filter(item => item.inventoryItemId !== inventoryItemId));
  }, []);

  const updateQuantity = useCallback((inventoryItemId: string, quantity: number) => {
    setItems(prev => 
      prev.map(item => 
        item.inventoryItemId === inventoryItemId 
          ? { ...item, quantity: Math.max(1, Math.min(quantity, item.maxQuantity)) }
          : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + (item.pricePerHour * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems,
      subtotal,
    }}>
      {children}
    </CartContext.Provider>
  );
};
