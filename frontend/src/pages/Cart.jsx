import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useCart } from '../cart'
import { useAuth } from '../auth'

export default function Cart() {
  const { items, setQuantity, remove, clear, total } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (items.length === 0) {
    return (
      <>
        <h1>Корзина</h1>
        <p className="muted">
          Корзина пуста. <Link to="/">Перейти в каталог</Link>
        </p>
      </>
    )
  }

  async function checkout() {
    setError('')
    setBusy(true)
    try {
      if (user?.role !== 'Buyer') {
        throw new Error('Заказы может оформлять только покупатель')
      }

      // API принимает в одном заказе только товары одного фермера —
      // группируем корзину и создаём по заказу на каждого фермера.
      const byFarmer = new Map()
      for (const i of items) {
        const key = i.product.farmerProfileId
        if (!byFarmer.has(key)) byFarmer.set(key, [])
        byFarmer.get(key).push(i)
      }

      for (const group of byFarmer.values()) {
        await api('/orders', {
          method: 'POST',
          body: {
            items: group.map((i) => ({
              productId: i.product.id,
              quantity: i.quantity,
            })),
          },
        })
      }

      clear()
      navigate('/orders')
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const farmerNames = [...new Set(items.map((i) => i.product.farmerName))]

  return (
    <>
      <h1>Корзина</h1>
      {error && <div className="error">{error}</div>}
      {farmerNames.length > 1 && (
        <div className="success">
          В корзине товары разных фермеров — будет оформлено{' '}
          {farmerNames.length} отдельных заказа.
        </div>
      )}

      {items.map((i) => (
        <div key={i.product.id} className="order-card">
          <div className="order-head">
            <div>
              <Link to={`/product/${i.product.id}`}>
                <strong>{i.product.title}</strong>
              </Link>
              <div className="muted">
                {i.product.farmerName} · {i.product.price} сом /{' '}
                {i.product.unit}
              </div>
            </div>
            <div className="qty">
              <button onClick={() => setQuantity(i.product.id, i.quantity - 1)}>
                −
              </button>
              <span>{i.quantity}</span>
              <button onClick={() => setQuantity(i.product.id, i.quantity + 1)}>
                +
              </button>
            </div>
            <strong>
              {(Number(i.product.price) * i.quantity).toFixed(2)} сом
            </strong>
            <button
              className="link-btn"
              onClick={() => remove(i.product.id)}
            >
              Убрать
            </button>
          </div>
        </div>
      ))}

      <div className="order-head" style={{ marginTop: 20 }}>
        <h2 style={{ margin: 0 }}>Итого: {total.toFixed(2)} сом</h2>
        <button className="btn" onClick={checkout} disabled={busy}>
          {busy ? 'Оформляем…' : 'Оформить заказ'}
        </button>
      </div>
    </>
  )
}
