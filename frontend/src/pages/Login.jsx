import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      <h1>Вход</h1>
      {error && <div className="error">{error}</div>}
      <label>
        Почта
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <label>
        Пароль
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>
      <button className="btn" disabled={busy}>
        {busy ? 'Входим…' : 'Войти'}
      </button>
      <p className="muted">
        Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
      </p>
    </form>
  )
}

export function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState(0)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const res = await register(email, password, role)
      // фермер сразу идёт создавать профиль — без него нечем работать
      navigate(res.role === 'Farmer' ? '/profile' : '/')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      <h1>Регистрация</h1>
      {error && <div className="error">{error}</div>}
      <label>
        Почта
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <label>
        Пароль (минимум 6 символов)
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
      </label>
      <div className="radio-row">
        <label>
          <input
            type="radio"
            checked={role === 0}
            onChange={() => setRole(0)}
          />
          Покупатель
        </label>
        <label>
          <input
            type="radio"
            checked={role === 1}
            onChange={() => setRole(1)}
          />
          Фермер
        </label>
      </div>
      <button className="btn" disabled={busy}>
        {busy ? 'Создаём…' : 'Создать аккаунт'}
      </button>
      <p className="muted">
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </p>
    </form>
  )
}
