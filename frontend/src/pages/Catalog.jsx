import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

const CATEGORIES = [
  { id: 1, name: 'Фрукты' },
  { id: 2, name: 'Овощи' },
  { id: 3, name: 'Орехи и сухофрукты' },
  { id: 4, name: 'Мёд' },
  { id: 5, name: 'Мясо' },
  { id: 6, name: 'Молочные продукты' },
]

const EMOJI = {
  1: '🍎',
  2: '🥬',
  3: '🥜',
  4: '🍯',
  5: '🍖',
  6: '🥛',
}

const PAGE_SIZE = 8

export default function Catalog() {
  const [filters, setFilters] = useState({
    categoryId: '',
    region: '',
    search: '',
    minPrice: '',
    maxPrice: '',
  })
  const [page, setPage] = useState(1)
  const [data, setData] = useState({ items: [], totalCount: 0 })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setLoading(true)
      setError('')
      const params = new URLSearchParams({ page, pageSize: PAGE_SIZE })
      if (filters.categoryId) params.set('categoryId', filters.categoryId)
      if (filters.region.trim()) params.set('region', filters.region.trim())
      if (filters.search.trim()) params.set('search', filters.search.trim())
      if (filters.minPrice) params.set('minPrice', filters.minPrice)
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
      try {
        const res = await api(`/products?${params}`, { auth: false })
        setData(res)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [filters, page])

  const totalPages = Math.max(1, Math.ceil(data.totalCount / PAGE_SIZE))

  function set(key, value) {
    setFilters((f) => ({ ...f, [key]: value }))
    setPage(1)
  }

  return (
    <>
      <section className="hero">
        <div>
          <span className="hero-kicker">Фермерский рынок Кыргызстана</span>
          <h1>Свежие продукты напрямую с фермы</h1>
          <p>
            Фрукты, овощи, мёд и молочные продукты от местных фермеров — без
            посредников, по честным ценам и с заботой о качестве.
          </p>
        </div>
        <div className="hero-art" aria-hidden="true">
          🥕
        </div>
      </section>

      <div className="chips">
        <button
          type="button"
          className={`chip ${!filters.categoryId ? 'active' : ''}`}
          onClick={() => set('categoryId', '')}
        >
          🧺 Все категории
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`chip ${String(filters.categoryId) === String(c.id) ? 'active' : ''}`}
            onClick={() => set('categoryId', String(c.id))}
          >
            {EMOJI[c.id]} {c.name}
          </button>
        ))}
      </div>

      <div className="filters">
        <input
          placeholder="Регион (например, Khatlon)"
          value={filters.region}
          onChange={(e) => set('region', e.target.value)}
        />
        <input
          placeholder="Поиск по названию"
          value={filters.search}
          onChange={(e) => set('search', e.target.value)}
        />
        <input
          type="number"
          placeholder="Цена от"
          value={filters.minPrice}
          onChange={(e) => set('minPrice', e.target.value)}
        />
        <input
          type="number"
          placeholder="Цена до"
          value={filters.maxPrice}
          onChange={(e) => set('maxPrice', e.target.value)}
        />
      </div>

      {error && <div className="error">{error}</div>}
      {loading && <p className="muted">Загрузка…</p>}

      {!loading && !error && data.items.length === 0 && (
        <p className="muted">Ничего не найдено. Попробуйте изменить фильтры.</p>
      )}

      <div className="grid">
        {data.items.map((p) => (
          <Link key={p.id} to={`/product/${p.id}`} className="card">
            <span className="card-emoji">{EMOJI[p.categoryId] || '🧺'}</span>
            <span className="title">{p.title}</span>
            <span className="meta">
              {p.categoryName} · {p.farmerName} ({p.farmerRegion})
            </span>
            <span className="price">
              {p.price} сом / {p.unit}
            </span>
            <span className="meta">
              {p.stock > 0 ? `В наличии: ${p.stock} ${p.unit}` : 'Нет в наличии'}
              {p.isPreorder ? ' · предзаказ' : ''}
            </span>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pager">
          <button
            className="btn btn-small btn-outline"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            ← Назад
          </button>
          <span className="muted">
            Страница {page} из {totalPages}
          </span>
          <button
            className="btn btn-small btn-outline"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Вперёд →
          </button>
        </div>
      )}
    </>
  )
}
