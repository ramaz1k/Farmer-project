import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'

function ReviewForm({ orderId, onDone }) {
  const [rating, setRating] = useState(5)
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await api('/reviews', {
        method: 'POST',
        body: { orderId, rating, text },
      })
      onDone()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="review">
      <div className="stars">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className={n <= rating ? 'on' : ''}
            onClick={() => setRating(n)}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        rows={3}
        placeholder="Ваш отзыв о фермере…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ margin: '10px 0', width: '100%', padding: 10 }}
      />
      {error && <div className="error">{error}</div>}
      <button className="btn btn-small" disabled={busy}>
        {busy ? 'Отправляем…' : 'Оставить отзыв'}
      </button>
    </form>
  )
}

export default function Orders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [reviewFor, setReviewFor] = useState(null)
  const [notice, setNotice] = useState('')

  function load() {
    setLoading(true)
    api('/orders/my')
      .then((res) => setOrders(res))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function cancel(id) {
    setError('')
    try {
      await api(`/orders/${id}/cancel`, { method: 'POST' })
      load()
    } catch (e) {
      setError(e.message)
    }
  }

  if (user?.role !== 'Buyer') {
    return (
      <>
        <h1>Мои заказы</h1>
        <p className="muted">
          Заказы доступны только покупателям. Вы вошли как {user?.role === 'Farmer' ? 'фермер' : 'пользователь'}.
        </p>
        <p className="muted">
          Для фермера заказы приходят во вкладку{' '}
          <Link to="/incoming">«Входящие заказы»</Link>.
        </p>
      </>
    )
  }

  return (
    <>
      <h1>Мои заказы</h1>
      {error && <div className="error">{error}</div>}
      {notice && <div className="success">{notice}</div>}
      {loading && <p className="muted">Загрузка…</p>}
      {!loading && orders.length === 0 && (
        <p className="muted">
          Заказов пока нет. <Link to="/">Перейти в каталог</Link>
        </p>
      )}

      {orders.map((o) => (
        <div key={o.id} className="order-card">
          <div className="order-head">
            <div>
              <strong>Заказ №{o.id}</strong>{' '}
              <span className="muted">
                {new Date(o.createdAt).toLocaleString('ru-RU')}
              </span>
            </div>
            <span className={`status status-${o.status}`}>{o.status}</span>
          </div>

          <ul className="order-items">
            {o.items.map((it, idx) => (
              <li key={idx}>
                <span>
                  {it.productTitle} × {it.quantity} {it.unit}{' '}
                  <span className="muted">
                    ({it.priceAtOrder} сом/{it.unit})
                  </span>
                </span>
                <span>{(it.priceAtOrder * it.quantity).toFixed(2)} сом</span>
              </li>
            ))}
          </ul>

          <div className="order-head">
            <span className="muted">
              Фермер: <Link to={`/farmer/${o.farmerProfileId}`}>{o.farmerName}</Link>
            </span>
            <strong>{o.totalPrice} сом</strong>
          </div>

          <div className="order-actions">
            {o.status === 'New' && (
              <button
                className="btn btn-small btn-danger"
                onClick={() => cancel(o.id)}
              >
                Отменить заказ
              </button>
            )}
            {o.status === 'Completed' && reviewFor !== o.id && (
              <button
                className="btn btn-small btn-outline"
                onClick={() => {
                  setReviewFor(o.id)
                  setNotice('')
                }}
              >
                Оставить отзыв
              </button>
            )}
          </div>

          {o.status === 'Completed' && reviewFor === o.id && (
            <div style={{ marginTop: 12 }}>
              <ReviewForm
                orderId={o.id}
                onDone={() => {
                  setReviewFor(null)
                  setNotice(`Отзыв на заказ №${o.id} отправлен`)
                }}
              />
            </div>
          )}
        </div>
      ))}
    </>
  )
}
