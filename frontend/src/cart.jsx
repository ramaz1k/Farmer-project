import { createContext, useContext, useEffect, useState } from 'react'

const CART_KEY = 'fm_cart'
const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) || '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items])

  function add(product, quantity = 1) {
    setItems((prev) => {
      const found = prev.find((i) => i.product.id === product.id)
      if (found) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i,
        )
      }
      return [...prev, { product, quantity }]
    })
  }

  function setQuantity(productId, quantity) {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.product.id !== productId)
        : prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i)),
    )
  }

  function remove(productId) {
    setItems((prev) => prev.filter((i) => i.product.id !== productId))
  }

  function clear() {
    setItems([])
  }

  const total = items.reduce(
    (sum, i) => sum + Number(i.product.price) * i.quantity,
    0,
  )

  return (
    <CartContext.Provider value={{ items, add, setQuantity, remove, clear, total }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
