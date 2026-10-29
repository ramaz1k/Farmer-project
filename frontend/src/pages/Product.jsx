import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import { useCart } from '../cart'
import { useI18n } from '../i18n'
import Chat from '../Chat'

export default function ProductPage() {
  const { id } = useParams()
  const { add } = useCart()
  const { t } = useI18n()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [error, setError] = useState('')
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)

  useEffect(() => {
    setError('')
    api(`/products/${id}`, { auth: false })
      .then(setProduct)
      .catch((e) => setError(e.message))
  }, [id])

  useEffect(() => {
    if (product?.farmerProfileId) {
      api(`/reviews/farmer/${product.farmerProfileId}`, { auth: false })
        .then(setReviews)
        .catch(() => {})
    }
  }, [product])

  if (error) return <div className="error">{error}</div>
  if (!product) return <p className="muted">{t('Загрузка…')}</p>

  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : null

  return (
    <>
      <div className="detail">
        <div className="detail-grid">
          <div>
            <h1>{product.title}</h1>
            <p className="muted">
              {t(product.categoryName)} · {t('урожай')}{' '}
              {product.harvestDate
                ? new Date(product.harvestDate).toLocaleDateString('ru-RU')
                : '—'}
              {product.isPreorder ? ` · ${t('предзаказ')}` : ''}
            </p>
            <p>{product.description || t('Описание отсутствует.')}</p>
            <p>
              {t('Фермер:')}{' '}
              <Link to={`/farmer/${product.farmerProfileId}`}>
                {product.farmerName}
              </Link>{' '}
              <span className="muted">({product.farmerRegion})</span>
            </p>
            {avg !== null && (
              <p className="stars">
                {'★'.repeat(Math.round(avg))}
                {'☆'.repeat(5 - Math.round(avg))}{' '}
                <span className="muted">
                  {t('({n} отз.)', { n: reviews.length })}
                </span>
              </p>
            )}
          </div>

          <div>
            <p className="price" style={{ fontSize: 28 }}>
              {product.price} {t('сом')} / {product.unit}
            </p>
            <p className="muted">
              {product.stock > 0
                ? t('В наличии: {stock} {unit}', {
                    stock: product.stock,
                    unit: product.unit,
                  })
                : t('Нет в наличии')}
            </p>

            {product.stock > 0 && (
              <>
                <div className="qty" style={{ margin: '12px 0' }}>
                  <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                  <span>{qty}</span>
                  <button
                    onClick={() =>
                      setQty(Math.min(Number(product.stock), qty + 1))
                    }
                  >
                    +
                  </button>
                </div>
                <button
                  className="btn"
                  onClick={() => {
                    add(product, qty)
                    setAdded(true)
                    setTimeout(() => setAdded(false), 1500)
                  }}
                >
                  {added ? t('✓ Добавлено') : t('В корзину')}
                </button>
              </>
            )}

            <button
              type="button"
              className="btn btn-outline chat-toggle"
              onClick={() => setChatOpen((o) => !o)}
            >
              💬 {t('Написать фермеру')}
            </button>
          </div>
        </div>
      </div>

      {chatOpen && (
        <div className="detail chat-wrap">
          <Chat
            peerUserId={product.farmerUserId}
            productId={product.id}
            peerName={product.farmerName}
          />
        </div>
      )}

      <h2>{t('Отзывы о фермере')}</h2>
      {reviews.length === 0 && <p className="muted">{t('Отзывов пока нет.')}</p>}
      {reviews.map((r) => (
        <div key={r.id} className="review">
          <div className="stars">
            {'★'.repeat(r.rating)}
            {'☆'.repeat(5 - r.rating)}
          </div>
          <p>{r.text}</p>
          <div className="meta">
            {new Date(r.createdAt).toLocaleDateString('ru-RU')}
          </div>
        </div>
      ))}
    </>
  )
}