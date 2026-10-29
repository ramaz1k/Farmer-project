import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, apiUpload, ApiError } from '../api'
import { useAuth } from '../auth'
import { useI18n } from '../i18n'

const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Фрукты' },
  { id: 2, name: 'Овощи' },
  { id: 3, name: 'Орехи и сухофрукты' },
  { id: 4, name: 'Мёд' },
  { id: 5, name: 'Мясо' },
  { id: 6, name: 'Молочные продукты' },
  { id: 7, name: 'Зерновые' },
  { id: 8, name: 'Хлопок' },
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
  const { t } = useI18n()
  const [profile, setProfile] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES)
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
    // категории — из БД, хардкод только если API недоступен
    api('/categories', { auth: false })
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) setCategories(res)
      })
      .catch(() => {})
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

  if (!user) return <p className="muted">{t('Войдите в аккаунт.')}</p>

  if (user.role !== 'Farmer') {
    return (
      <div className="detail">
        <h1>{t('Мои товары')}</h1>
        <p className="muted">
          {t('Добавлять товары могут только фермеры. Вы вошли как {role}.', {
            role: t(user.role === 'Buyer' ? 'покупатель' : 'пользователь'),
          })}
        </p>
        <Link to="/" className="btn">
          {t('В каталог')}
        </Link>
      </div>
    )
  }

  if (!loaded) return <p className="muted">{t('Загрузка…')}</p>

  if (!profile) {
    return (
      <div className="detail">
        <h1>{t('Мои товары')}</h1>
        <p className="muted">{t('Сначала нужно профиль фермера — без него объявления не добавить.')}</p>
        <Link to="/profile" className="btn">
          {t('Создать профиль')}
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

    if (!form.title.trim()) return setError(t('Название обязательно.'))
    if (!(Number(form.price) > 0)) return setError(t('Цена должна быть больше нуля.'))
    if (!(Number(form.stock) >= 0)) return setError(t('Остаток не может быть отрицательным.'))
    if (!form.unit.trim()) return setError(t('Укажите единицу измерения.'))

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
        setNotice(t('Товар «{title}» обновлён.', { title: updated.title }))
        setEditingId(null)
      } else {
        const created = await api('/products', { method: 'POST', body })
        setProducts((list) => [created, ...list])
        setNotice(t('Товар «{title}» добавлен в каталог.', { title: created.title }))
      }
      setForm(EMPTY)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function uploadPhoto(p, file, input) {
    if (input) input.value = ''
    if (!file) return
    setError('')
    setNotice('')
    try {
      const updated = await apiUpload(`/products/${p.id}/photo`, file)
      setProducts((list) => list.map((x) => (x.id === p.id ? updated : x)))
      setNotice(t('Фото обновлено.'))
    } catch (err) {
      setError(err.message)
    }
  }

  async function remove(p) {
    if (!window.confirm(t('Удалить товар «{title}»?', { title: p.title }))) return
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
      <h1>{t('Мои товары')}</h1>
      <p className="muted">
        {t('Профиль:')} <strong>{profile.name}</strong> · {profile.region}
      </p>

      {error && <div className="error">{error}</div>}
      {notice && <div className="success">{notice}</div>}

      <form id="product-form" className="form" style={{ maxWidth: 560 }} onSubmit={submit}>
        <h2 style={{ margin: 0 }}>
          {editingId ? t('Редактировать товар') : t('Новое объявление')}
        </h2>

        <label>
          {t('Название')}
          <input
            value={form.title}
            onChange={set('title')}
            maxLength={200}
            placeholder={t('Яблоки сезонные')}
            required
          />
        </label>

        <label>
          {t('Описание (необязательно)')}
          <textarea
            value={form.description}
            onChange={set('description')}
            maxLength={2000}
            rows={3}
            placeholder={t('Сорт, условия доставки, опт…')}
          />
        </label>

        <label>
          {t('Категория')}
          <select value={form.categoryId} onChange={set('categoryId')}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {t(c.name)}
              </option>
            ))}
          </select>
        </label>

        <div className="radio-row" style={{ gap: 16 }}>
          <label style={{ flex: 1 }}>
            {t('Цена, сом')}
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
            {t('Единица')}
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
            {t('Остаток')}
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
            {t('Дата урожая (необязательно)')}
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
            {t('Это предзаказ')}
          </label>
        </div>

        <div className="order-actions">
          <button className="btn" disabled={busy}>
            {busy ? t('Сохраняем…') : editingId ? t('Сохранить') : t('Добавить в каталог')}
          </button>
          {editingId && (
            <button type="button" className="btn btn-outline" onClick={cancelEdit}>
              {t('Отмена')}
            </button>
          )}
        </div>
      </form>

      <h2>{t('Объявления ({n})', { n: products.length })}</h2>
      {products.length === 0 && (
        <p className="muted">{t('Товаров пока нет — заполните форму выше.')}</p>
      )}

      <div className="grid">
        {products.map((p) => (
          <div key={p.id} className="card">
            {p.imageUrl ? (
              <img className="card-img" src={p.imageUrl} alt={p.title} loading="lazy" />
            ) : (
              <span className="card-emoji">🧺</span>
            )}
            <Link to={`/product/${p.id}`} className="title">
              {p.title}
            </Link>
            <span className="meta">
              {t(p.categoryName)} · {p.price} {t('сом')} / {p.unit}
            </span>
            <span className="meta">
              {p.stock > 0
                ? t('В наличии: {stock} {unit}', { stock: p.stock, unit: p.unit })
                : t('Нет в наличии')}
              {p.isPreorder ? ` · ${t('предзаказ')}` : ''}
            </span>
            <div className="order-actions">
              <label className="btn btn-small btn-outline photo-btn" title={t('Фото')}>
                📷 {p.imageUrl ? t('Заменить фото') : t('Добавить фото')}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  hidden
                  onChange={(e) => uploadPhoto(p, e.target.files?.[0], e.target)}
                />
              </label>
              <button className="btn btn-small btn-outline" onClick={() => startEdit(p)}>
                {t('Изменить')}
              </button>
              <button className="btn btn-small btn-danger" onClick={() => remove(p)}>
                {t('Удалить')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}