import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, ApiError } from '../api'
import { useAuth } from '../auth'
import { useI18n } from '../i18n'

export default function Profile() {
  const { user } = useAuth()
  const { t } = useI18n()
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

  if (!user) return <p className="muted">{t('Войдите в аккаунт.')}</p>

  if (user.role !== 'Farmer') {
    return (
      <>
        <form className="form">
          <h1>{t('Мой профиль')}</h1>
          <p className="muted">
            {t('Профиль фермера доступен только фермерам. Вы вошли как {role}.', {
              role: t(user.role === 'Buyer' ? 'покупатель' : 'пользователь'),
            })}
          </p>
          <p className="muted">{user.email}</p>
          <Link to="/" className="btn">
            {t('В каталог')}
          </Link>
        </form>
        <PasswordForm />
      </>
    )
  }

  if (!loaded) return <p className="muted">{t('Загрузка…')}</p>
  if (error) return <div className="error">{error}</div>

  if (profile) {
    return (
      <>
        <div className="detail">
          <h1>{t('Профиль фермера')}</h1>
          <p className="muted">{user.email}</p>
          <p>
            <strong>{profile.name}</strong>
          </p>
          <p className="muted">
            {profile.region} · {profile.phone}
          </p>
          <p>{profile.description || t('Без описания.')}</p>
          <div className="order-actions">
            <Link to="/my-products" className="btn">
              {t('Мои товары')}
            </Link>
            <Link to="/" className="btn btn-outline">
              {t('В каталог')}
            </Link>
          </div>
        </div>
        <PasswordForm />
      </>
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
    <>
      <form className="form" onSubmit={submit}>
        <h1>{t('Создать профиль фермера')}</h1>
        <p className="muted">
          {t('Аккаунт создан, но профиля пока нет — заполните поля, и он появится в каталоге.')}
        </p>
        {error && <div className="error">{error}</div>}
        <label>
          {t('Название (имя или хозяйство)')}
          <input
            value={form.name}
            onChange={set('name')}
            maxLength={200}
            placeholder={t('Фермерское хозяйство «Душанбе»')}
            required
          />
        </label>
        <label>
          {t('Регион')}
          <input
            value={form.region}
            onChange={set('region')}
            maxLength={100}
            placeholder="Душанбе"
            required
          />
        </label>
        <label>
          {t('Телефон')}
          <input
            type="tel"
            value={form.phone}
            onChange={set('phone')}
            maxLength={30}
            placeholder="+992 900 000 000"
            required
          />
        </label>
        <label>
          {t('Описание (необязательно)')}
          <textarea
            value={form.description}
            onChange={set('description')}
            maxLength={2000}
            rows={4}
            placeholder={t('Что вы выращиваете, как доставляете…')}
          />
        </label>
        <button className="btn" disabled={busy}>
          {busy ? t('Создаём…') : t('Создать профиль')}
        </button>
        <p className="muted">{t('Сразу после создания можно будет добавить первое объявление.')}</p>
      </form>
      <PasswordForm />
    </>
  )
}

// Смена пароля — доступна всем ролям
function PasswordForm() {
  const { t } = useI18n()
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  function set(field) {
    return (e) => setPwd((p) => ({ ...p, [field]: e.target.value }))
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    setNotice('')

    if (pwd.next.length < 6) {
      return setError(t('Новый пароль слишком короткий — минимум 6 символов.'))
    }
    if (pwd.next !== pwd.confirm) {
      return setError(t('Пароли не совпадают.'))
    }

    setBusy(true)
    try {
      await api('/auth/change-password', {
        method: 'POST',
        body: { currentPassword: pwd.current, newPassword: pwd.next },
      })
      setNotice(t('Пароль обновлён.'))
      setPwd({ current: '', next: '', confirm: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      <h2 style={{ margin: 0 }}>{t('Сменить пароль')}</h2>
      {error && <div className="error">{error}</div>}
      {notice && <div className="success">{notice}</div>}
      <label>
        {t('Текущий пароль')}
        <input
          type="password"
          value={pwd.current}
          onChange={set('current')}
          autoComplete="current-password"
          required
        />
      </label>
      <label>
        {t('Новый пароль')}
        <input
          type="password"
          value={pwd.next}
          onChange={set('next')}
          minLength={6}
          autoComplete="new-password"
          required
        />
      </label>
      <label>
        {t('Повторите новый пароль')}
        <input
          type="password"
          value={pwd.confirm}
          onChange={set('confirm')}
          minLength={6}
          autoComplete="new-password"
          required
        />
      </label>
      <button className="btn" disabled={busy}>
        {busy ? t('Сохраняем…') : t('Сменить пароль')}
      </button>
    </form>
  )
}
