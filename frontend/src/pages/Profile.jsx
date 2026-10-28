import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, ApiError } from '../api'
import { useAuth } from '../auth'

const EMPTY = { name: '', region: '', phone: '', description: '' }

export default function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!user || user.role !== 'Farmer') {
      setLoaded(true)
      return
    }
    api('/farmers/me')
      .then(setProfile)
      .catch((e) => {
        if (!(e instanceof ApiError && e.status === 404)) setError(e.message)
      })
      .finally(() => setLoaded(true))
  }, [user])

  if (!user) return <p className="muted">Войдите в аккаунт.</p>

  if (user.role !== 'Farmer') {
    return (
      <form className="form">
        <h1>Мой профиль</h1>
        <p className="muted">
          Профиль фермера доступен только фермерам. Вы вошли как{' '}
          {user.role === 'Buyer' ? 'покупатель' : 'пользователь'}.
        </p>
        <Link to="/" className="btn">
          В каталог
        </Link>
      </form>
    )
  }

  if (!loaded) return <p className="muted">Загрузка…</p>

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  function startEdit() {
    setForm({
      name: profile.name,
      region: profile.region,
      phone: profile.phone,
      description: profile.description || '',
    })
    setError('')
    setNotice('')
    setEditing(true)
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (editing) {
        const updated = await api('/farmers/me', { method: 'PUT', body: form })
        setProfile(updated)
        setEditing(false)
        setNotice('Профиль обновлён.')
      } else {
        const created = await api('/farmers', { method: 'POST', body: form })
        setProfile(created)
        setNotice('Профиль создан — можно добавлять первое объявление.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  // Профиль есть и его не редактируем — карточка
  if (profile && !editing) {
    return (
      <div className="detail">
        <h1>Профиль фермера</h1>
        <p className="muted">{user.email}</p>
        {error && <div className="error">{error}</div>}
        {notice && <div className="success">{notice}</div>}
        <p>
          <strong>{profile.name}</strong>
        </p>
        <p className="muted">
          {profile.region} · {profile.phone}
        </p>
        <p>{profile.description || 'Без описания.'}</p>
        <div className="order-actions">
          <button className="btn" onClick={startEdit}>
            Изменить
          </button>
          <Link to="/my-products" className="btn btn-outline">
            Мои товары
          </Link>
          <Link to="/" className="btn btn-outline">
            В каталог
          </Link>
        </div>
      </div>
    )
  }

  // Форма: создание или редактирование
  return (
    <form className="form" onSubmit={submit}>
      <h1>{editing ? 'Редактировать профиль' : 'Создать профиль фермера'}</h1>
      {!editing && (
        <p className="muted">
          Аккаунт создан, но профиля пока нет — заполните поля, и он появится в каталоге.
        </p>
      )}
      {error && <div className="error">{error}</div>}
      <label>
        Название (имя или хозяйство)
        <input
          value={form.name}
          onChange={set('name')}
          maxLength={200}
          placeholder="Фермерское хозяйство «Ала-Тоо»"
          required
        />
      </label>
      <label>
        Регион
        <input
          value={form.region}
          onChange={set('region')}
          maxLength={100}
          placeholder="Чуйская область"
          required
        />
      </label>
      <label>
        Телефон
        <input
          type="tel"
          value={form.phone}
          onChange={set('phone')}
          maxLength={30}
          placeholder="+996 700 000 000"
          required
        />
      </label>
      <label>
        Описание (необязательно)
        <textarea
          value={form.description}
          onChange={set('description')}
          maxLength={2000}
          rows={4}
          placeholder="Что вы выращиваете, как доставляете…"
        />
      </label>
      <div className="order-actions">
        <button className="btn" disabled={busy}>
          {busy
            ? 'Сохраняем…'
            : editing
              ? 'Сохранить'
              : 'Создать профиль'}
        </button>
        {editing && (
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              setEditing(false)
              setError('')
            }}
          >
            Отмена
          </button>
        )}
      </div>
      {!editing && (
        <p className="muted">Сразу после создания можно будет добавить первое объявление.</p>
      )}
    </form>
  )
}
