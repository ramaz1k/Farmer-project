import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, ApiError } from '../api'
import { useAuth } from '../auth'

const CATEGORIES = [
  { id: 1, name: 'Фрукты' },
  { id: 2, name: 'Овощи' },
  { id: 3, name: 'Орехи и сухофрукты' },
  { id: 4, name: 'Мёд' },
  { id: 5, name: 'Мясо' },
  { id: 6, name: 'Молочные продукты' },
]

const EMPTY = {
  title: '',
  description: '',
  categoryId: 1,
  price: '',
  unit: 'кг',
  stock: '',
  isPreorder: false,
  harvestDate: '',
}

export default function MyProducts() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [products, setProducts] = useState([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async (farmerProfileId) => {
    const res = await api(`/products?farmerProfileId=${farmerProfileId}&page=1&pageSize=50`, {
      auth: false,
    })
    setProducts(res.items)
  }, [])

  useEffect(() => {
    if (!user || user.role !== 'Farmer') {
      setLoaded(true)
      return
    }
    api('/farmers/me')
      .then((p) => {
        setProfile(p)
        return load(p.id)
      })
      .catch((e) => {
        if (!(e instanceof ApiError && e.status === 404)) setError(e.message)
      })
      .finally(() => setLoaded(true))
  }, [user, load])

  if (!user) return <p className="muted">Войдите в аккаунт.</p>

  if (user.role !== 'Farmer') {
    return (
      <div className="detail">
        <h1>Мои товары</h1>
        <p className="muted">
          Добавлять товары могут только фермеры. Вы вошли как{' '}
          {user.role === 'Buyer' ? 'покупатель' : 'пользователь'}.
        </p>
        <Link to="/" className="btn">
          В каталог
        </Link>
      </div>
    )
  }

  if (!loaded) return <p className="muted">Загрузка…</p>

  if (!profile) {
    return (
      <div className="detail">
        <h1>Мои товары</h1>
        <p className="muted">Сначала нужно профиль фермера — без него объявления не добавить.</p>
        <Link to="/profile" className="btn">
          Создать профиль
        </Link>
      </div>
    )
  }

  function set(field) {
    return (e) =>
      setForm((f) => ({
        ...f,
        [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
      }))
  }

  function startEdit(p) {
    setEditingId(p.id)
    setError('')
    setNotice('')
    setForm({
      title: p.title,
      description: p.description || '',
      categoryId: p.categoryId,
      price: String(p.price),
      unit: p.unit,
      stock: String(p.stock),
      isPreorder: p.isPreorder,
      harvestDate: p.harvestDate ? p.harvestDate.slice(0, 10) : '',
    })
    document.getElementById('product-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(EMPTY)
    setError('')
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    setNotice('')

    if (!form.title.trim()) return setError('Название обязательно.')
    if (!(Number(form.price) > 0)) return setError('Цена должна быть больше нуля.')
    if (!(Number(form.stock) >= 0)) return setError('Остаток не может быть отрицательным.')
    if (!form.unit.trim()) return setError('Укажите единицу измерения.')

    const body = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      categoryId: Number(form.categoryId),
      price: Number(form.price),
      unit: form.unit.trim(),
      stock: Number(form.stock),
      isPreorder: form.isPreorder,
      harvestDate: form.harvestDate || null,
    }

    setBusy(true)
    try {
      if (editingId) {
        const updated = await api(`/products/${editingId}`, { method: 'PUT', body })
        setProducts((list) => list.map((p) => (p.id === editingId ? updated : p)))
        setNotice(`Товар «${updated.title}» обновлён.`)
        setEditingId(null)
      } else {
        const created = await api('/products', { method: 'POST', body })
        setProducts((list) => [created, ...list])
        setNotice(`Товар «${created.title}» добавлен в каталог.`)
      }
      setForm(EMPTY)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function remove(p) {
    if (!window.confirm(`Удалить товар «${p.title}»?`)) return
    setError('')
    setNotice('')
    try {
      await api(`/products/${p.id}`, { method: 'DELETE' })
      setProducts((list) => list.filter((x) => x.id !== p.id))
      if (editingId === p.id) cancelEdit()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      <h1>Мои товары</h1>
      <p className="muted">
        Профиль: <strong>{profile.name}</strong> · {profile.region}
      </p>

      {error && <div className="error">{error}</div>}
      {notice && <div className="success">{notice}</div>}

      <form id="product-form" className="form" style={{ maxWidth: 560 }} onSubmit={submit}>
        <h2 style={{ margin: 0 }}>{editingId ? 'Редактировать товар' : 'Новое объявление'}</h2>

        <label>
          Название
          <input
            value={form.title}
            onChange={set('title')}
            maxLength={200}
            placeholder="Яблоки сезонные"
            required
          />
        </label>

        <label>
          Описание (необязательно)
          <textarea
            value={form.description}
            onChange={set('description')}
            maxLength={2000}
            rows={3}
            placeholder="Сорт, условия доставки, опт…"
          />
        </label>

        <label>
          Категория
          <select value={form.categoryId} onChange={set('categoryId')}>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <div className="radio-row" style={{ gap: 16 }}>
          <label style={{ flex: 1 }}>
            Цена, сом
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={form.price}
              onChange={set('price')}
              placeholder="120"
              required
            />
          </label>
          <label style={{ width: 110 }}>
            Единица
            <input
              value={form.unit}
              onChange={set('unit')}
              maxLength={20}
              placeholder="кг"
              required
            />
          </label>
        </div>

        <div className="radio-row" style={{ gap: 16 }}>
          <label style={{ flex: 1 }}>
            Остаток
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.stock}
              onChange={set('stock')}
              placeholder="50"
              required
            />
          </label>
          <label style={{ flex: 1 }}>
            Дата урожая (необязательно)
            <input type="date" value={form.harvestDate} onChange={set('harvestDate')} />
          </label>
        </div>

        <div className="radio-row">
          <label>
            <input
              type="checkbox"
              checked={form.isPreorder}
              onChange={set('isPreorder')}
            />
            Это предзаказ
          </label>
        </div>

        <div className="order-actions">
          <button className="btn" disabled={busy}>
            {busy ? 'Сохраняем…' : editingId ? 'Сохранить' : 'Добавить в каталог'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-outline" onClick={cancelEdit}>
              Отмена
            </button>
          )}
        </div>
      </form>

      <h2>Объявления ({products.length})</h2>
      {products.length === 0 && (
        <p className="muted">Товаров пока нет — заполните форму выше.</p>
      )}

      <div className="grid">
        {products.map((p) => (
          <div key={p.id} className="card">
            <Link to={`/product/${p.id}`} className="title">
              {p.title}
            </Link>
            <span className="meta">
              {p.categoryName} · {p.price} сом / {p.unit}
            </span>
            <span className="meta">
              {p.stock > 0 ? `В наличии: ${p.stock} ${p.unit}` : 'Нет в наличии'}
              {p.isPreorder ? ' · предзаказ' : ''}
            </span>
            <div className="order-actions">
              <button className="btn btn-small btn-outline" onClick={() => startEdit(p)}>
                Изменить
              </button>
              <button className="btn btn-small btn-danger" onClick={() => remove(p)}>
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
