import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, ApiError } from '../api'
import { useAuth } from '../auth'

export default function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', region: '', phone: '', description: '' })
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
  if (error) return <div className="error">{error}</div>

  if (profile) {
    return (
      <div className="detail">
        <h1>Профиль фермера</h1>
        <p className="muted">{user.email}</p>
        <p>
          <strong>{profile.name}</strong>
        </p>
        <p className="muted">
          {profile.region} · {profile.phone}
        </p>
        <p>{profile.description || 'Без описания.'}</p>
        <p className="muted">Профиль уже создан — редактирование появится позже.</p>
        <Link to="/" className="btn">
          В каталог
        </Link>
      </div>
    )
  }

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const created = await api('/farmers', { method: 'POST', body: form })
      setProfile(created)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      <h1>Создать профиль фермера</h1>
      <p className="muted">
        Аккаунт создан, но профиля пока нет — заполните поля, и он появится в каталоге.
      </p>
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
      <button className="btn" disabled={busy}>
        {busy ? 'Создаём…' : 'Создать профиль'}
      </button>
    </form>
  )
}
