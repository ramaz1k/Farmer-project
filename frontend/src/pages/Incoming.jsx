import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import { useI18n } from '../i18n'

// Допустимые переходы статусов (как в OrderService.CanTransition)
const ACTION = {
  New: [
    { to: 1, label: 'Подтвердить', cls: '' },
    { to: 3, label: 'Отменить (вернуть на склад)', cls: 'btn-danger' },
  ],
  Confirmed: [
    { to: 2, label: 'Заказ выполнен', cls: '' },
    { to: 3, label: 'Отменить (вернуть на склад)', cls: 'btn-danger' },
  ],
}

const STATUS_LABEL = {
  New: 'Новый',
  Confirmed: 'Подтверждён',
  Completed: 'Выдан',
  Cancelled: 'Отменён',
}

export default function Incoming() {
  const { user } = useAuth()
  const { t } = useI18n()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    api('/orders/incoming')
      .then(setOrders)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (user?.role === 'Farmer') load()
    else setLoading(false)
  }, [user, load])

  async function changeStatus(order, to) {
    if (
      to === 3 &&
      !window.confirm(
        t('Отменить заказ №{id}? Товары вернутся на склад, отменить отмену нельзя.', {
          id: order.id,
        }),
      )
    )
      return
    setError('')
    setNotice('')
    setBusyId(order.id)
    try {
      await api(`/orders/${order.id}/status`, { method: 'PATCH', body: { status: to } })
      setNotice(
        t(
          to === 1
            ? 'Заказ №{id}: подтверждён'
            : to === 2
              ? 'Заказ №{id}: выдан'
              : 'Заказ №{id}: отменён',
          { id: order.id },
        ),
      )
      load()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusyId(null)
    }
  }

  if (!user) return <p className="muted">{t('Войдите в аккаунт.')}</p>

  if (user.role !== 'Farmer') {
    return (
      <>
        <h1>{t('Входящие заказы')}</h1>
        <p className="muted">
          {t(
            'Входящие заказы видят только фермеры. Вы вошли как {role} — свои заказы смотрите во вкладке {tab}.',
            {
              role: t(user.role === 'Buyer' ? 'покупатель' : 'пользователь'),
              tab: t('«Мои заказы»'),
            },
          )}
        </p>
      </>
    )
  }

  return (
    <>
      <h1>{t('Входящие заказы')}</h1>
      {error && <div className="error">{error}</div>}
      {notice && <div className="success">{notice}</div>}
      {loading && <p className="muted">{t('Загрузка…')}</p>}

      {!loading && orders.length === 0 && (
        <p className="muted">
          {t('Заказов пока нет. Добавьте товары во вкладке «Мои товары».')}
        </p>
      )}

      {orders.map((o) => (
        <div key={o.id} className="order-card">
          <div className="order-head">
            <div>
              <strong>{t('Заказ №{id}', { id: o.id })}</strong>{' '}
              <span className="muted">{new Date(o.createdAt).toLocaleString('ru-RU')}</span>
            </div>
            <span className={`status status-${o.status}`}>{t(STATUS_LABEL[o.status])}</span>
          </div>

          <p className="muted">
            {t('Покупатель:')} {o.buyerEmail}
          </p>

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
            <span className="muted">{t(STATUS_LABEL[o.status])}</span>
            <strong>
              {o.totalPrice} {t('сом')}
            </strong>
          </div>

          {ACTION[o.status] && (
            <div className="order-actions">
              {ACTION[o.status].map((a) => (
                <button
                  key={a.to}
                  className={`btn btn-small ${a.cls}`}
                  disabled={busyId === o.id}
                  onClick={() => changeStatus(o, a.to)}
                >
                  {busyId === o.id ? t('Сохраняем…') : t(a.label)}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </>
  )
}