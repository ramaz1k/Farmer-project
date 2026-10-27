import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import { useCart } from '../cart'

export default function ProductPage() {
  const { id } = useParams()
  const { add } = useCart()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [error, setError] = useState('')
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

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
  if (!product) return <p className="muted">Загрузка…</p>

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
              {product.categoryName} · урожай{' '}
              {product.harvestDate
                ? new Date(product.harvestDate).toLocaleDateString('ru-RU')
                : '—'}
              {product.isPreorder ? ' · предзаказ' : ''}
            </p>
            <p>{product.description || 'Описание отсутствует.'}</p>
            <p>
              Фермер:{' '}
              <Link to={`/farmer/${product.farmerProfileId}`}>
                {product.farmerName}
              </Link>{' '}
              <span className="muted">({product.farmerRegion})</span>
            </p>
            {avg !== null && (
              <p className="stars">
                {'★'.repeat(Math.round(avg))}
                {'☆'.repeat(5 - Math.round(avg))}{' '}
                <span className="muted">({reviews.length} отз.)</span>
              </p>
            )}
          </div>

          <div>
            <p className="price" style={{ fontSize: 28 }}>
              {product.price} сом / {product.unit}
            </p>
            <p className="muted">
              {product.stock > 0
                ? `В наличии: ${product.stock} ${product.unit}`
                : 'Нет в наличии'}
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
                  {added ? '✓ Добавлено' : 'В корзину'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <h2>Отзывы о фермере</h2>
      {reviews.length === 0 && <p className="muted">Отзывов пока нет.</p>}
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
