'use client'

import React, { createContext, useContext, useState, useMemo } from 'react'
import { toast } from 'sonner'

export type Product = {
  id: string
  name: string
  barcode: string
  price: number
  weight: number
  image_url: string | null
}

export type CartItem = Product & {
  quantity: number
}

type CartContextType = {
  items: CartItem[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalPrice: number
  totalWeight: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = (product: Product) => {
    setItems((currentItems) => {
      const existing = currentItems.find((item) => item.id === product.id)
      if (existing) {
        toast.success(`Increased ${product.name} quantity to ${existing.quantity + 1}`)
        return currentItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      toast.success(`Added ${product.name} to cart`)
      return [...currentItems, { ...product, quantity: 1 }]
    })
  }

  const removeItem = (productId: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => setItems([])

  const totalPrice = useMemo(() => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0)
  }, [items])

  const totalWeight = useMemo(() => {
    return items.reduce((total, item) => total + item.weight * item.quantity, 0)
  }, [items])

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalPrice, totalWeight }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
