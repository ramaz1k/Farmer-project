import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'

export default function FarmerPage() {
  const { id } = useParams()
  const [farmer, setFarmer] = useState(null)
  const [products, setProducts] = useState([])
  const [reviews, setReviews] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    setError('')
    api(`/farmers/${id}`, { auth: false })
      .then(setFarmer)
      .catch((e) => setError(e.message))
    api(`/reviews/farmer/${id}`, { auth: false })
      .then(setReviews)
      .catch(() => {})
    api(`/products?page=1&pageSize=50`, { auth: false })
      .then((res) => setProducts(res.items.filter((p) => p.farmerProfileId === Number(id))))
      .catch(() => {})
  }, [id])

  if (error) return <div className="error">{error}</div>
  if (!farmer) return <p className="muted">Загрузка…</p>

  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : null

  return (
    <>
      <div className="detail">
        <h1>{farmer.name}</h1>
        <p className="muted">
          {farmer.region} · {farmer.phone}
        </p>
        <p>{farmer.description || 'Без описания.'}</p>
        {avg !== null && (
          <p className="stars">
            {'★'.repeat(Math.round(avg))}
            {'☆'.repeat(5 - Math.round(avg))}{' '}
            <span className="muted">({reviews.length} отзывов)</span>
          </p>
        )}
      </div>

      <h2>Товары фермера</h2>
      {products.length === 0 && <p className="muted">Товаров нет.</p>}
      <div className="grid">
        {products.map((p) => (
          <Link key={p.id} to={`/product/${p.id}`} className="card">
            <span className="title">{p.title}</span>
            <span className="price">
              {p.price} сом / {p.unit}
            </span>
          </Link>
        ))}
      </div>

      <h2>Отзывы</h2>
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
