import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import { useI18n } from '../i18n'

const STATUS_LABEL = {
  New: 'Новый',
  Confirmed: 'Подтверждён',
  Completed: 'Выдан',
  Cancelled: 'Отменён',
}

function ReviewForm({ orderId, onDone }) {
  const { t } = useI18n()
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
        placeholder={t('Ваш отзыв о фермере…')}
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ margin: '10px 0', width: '100%', padding: 10 }}
      />
      {error && <div className="error">{error}</div>}
      <button className="btn btn-small" disabled={busy}>
        {busy ? t('Отправляем…') : t('Оставить отзыв')}
      </button>
    </form>
  )
}

export default function Orders() {
  const { user } = useAuth()
  const { t } = useI18n()
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
    const role = t(user?.role === 'Farmer' ? 'фермер' : 'пользователь')
    return (
      <>
        <h1>{t('Мои заказы')}</h1>
        <p className="muted">
          {user?.role === 'Farmer'
            ? t('Заказы покупателей видны во вкладке {tab}.', {
                tab: t('«Входящие заказы»'),
              })
            : t('Заказы доступны только покупателям. Вы вошли как {role}.', { role })}
        </p>
      </>
    )
  }

  return (
    <>
      <h1>{t('Мои заказы')}</h1>
      {error && <div className="error">{error}</div>}
      {notice && <div className="success">{notice}</div>}
      {loading && <p className="muted">{t('Загрузка…')}</p>}
      {!loading && orders.length === 0 && (
        <p className="muted">
          {t('Заказов пока нет.')} <Link to="/">{t('Перейти в каталог')}</Link>
        </p>
      )}

      {orders.map((o) => (
        <div key={o.id} className="order-card">
          <div className="order-head">
            <div>
              <strong>{t('Заказ №{id}', { id: o.id })}</strong>{' '}
              <span className="muted">
                {new Date(o.createdAt).toLocaleString('ru-RU')}
              </span>
            </div>
            <span className={`status status-${o.status}`}>
              {t(STATUS_LABEL[o.status])}
            </span>
          </div>

          <ul className="order-items">
            {o.items.map((it, idx) => (
              <li key={idx}>
                <span>
                  {it.productTitle} × {it.quantity} {it.unit}{' '}
                  <span className="muted">
                    ({it.priceAtOrder} {t('сом')}/{it.unit})
                  </span>
                </span>
                <span>
                  {(it.priceAtOrder * it.quantity).toFixed(2)} {t('сом')}
                </span>
              </li>
            ))}
          </ul>

          <div className="order-head">
            <span className="muted">
              {t('Фермер:')}{' '}
              <Link to={`/farmer/${o.farmerProfileId}`}>{o.farmerName}</Link>
            </span>
            <strong>
              {o.totalPrice} {t('сом')}
            </strong>
          </div>

          <div className="order-actions">
            {o.status === 'New' && (
              <button
                className="btn btn-small btn-danger"
                onClick={() => cancel(o.id)}
              >
                {t('Отменить заказ')}
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
                {t('Оставить отзыв')}
              </button>
            )}
          </div>

          {o.status === 'Completed' && reviewFor === o.id && (
            <div style={{ marginTop: 12 }}>
              <ReviewForm
                orderId={o.id}
                onDone={() => {
                  setReviewFor(null)
                  setNotice(
                    t('Отзыв на заказ №{id} отправлен', { id: o.id }),
                  )
                }}
              />
            </div>
          )}
        </div>
      ))}
    </>
  )
}