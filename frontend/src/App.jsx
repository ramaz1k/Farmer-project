import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { useAuth } from './auth'
import { useCart } from './cart'
import { useI18n } from './i18n'
import Catalog from './pages/Catalog'
import ProductPage from './pages/Product'
import FarmerPage from './pages/Farmer'
import Login, { Register } from './pages/Login'
import Cart from './pages/Cart'
import Orders from './pages/Orders'
import Profile from './pages/Profile'
import MyProducts from './pages/MyProducts'
import Incoming from './pages/Incoming'

function Header() {
  const { user, logout } = useAuth()
  const { items } = useCart()
  const { t, lang, toggle } = useI18n()
  const navigate = useNavigate()
  const count = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <header className="header">
      <Link to="/" className="logo">
        <span className="logo-icon">🥕</span>
        FarmMarket
      </Link>
      <nav>
        <Link to="/">{t('Каталог')}</Link>
        <Link to="/orders">{t('Мои заказы')}</Link>
        <Link to="/cart" className="cart-link">
          {t('Корзина')}
          {count > 0 && <span className="badge">{count}</span>}
        </Link>
        {user?.role === 'Farmer' && <Link to="/incoming">{t('Входящие заказы')}</Link>}
        {user?.role === 'Farmer' && <Link to="/my-products">{t('Мои товары')}</Link>}
        {user?.role === 'Farmer' && <Link to="/profile">{t('Мой профиль')}</Link>}
        <button
          type="button"
          className="btn btn-small btn-outline lang-btn"
          onClick={toggle}
          title={lang === 'ru' ? 'Тоҷикӣ' : 'Русский'}
        >
          {lang === 'ru' ? 'Тоҷ' : 'Рус'}
        </button>
        {user ? (
          <span className="user">
            {user.email}
            <button
              className="link-btn"
              onClick={() => {
                logout()
                navigate('/')
              }}
            >
              {t('Выйти')}
            </button>
          </span>
        ) : (
          <Link to="/login" className="btn btn-small">
            {t('Войти')}
          </Link>
        )}
      </nav>
    </header>
  )
}

function RequireAuth({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const { t } = useI18n()

  return (
    <>
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/farmer/:id" element={<FarmerPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/cart"
            element={
              <RequireAuth>
                <Cart />
              </RequireAuth>
            }
          />
          <Route
            path="/orders"
            element={
              <RequireAuth>
                <Orders />
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />
          <Route
            path="/my-products"
            element={
              <RequireAuth>
                <MyProducts />
              </RequireAuth>
            }
          />
          <Route
            path="/incoming"
            element={
              <RequireAuth>
                <Incoming />
              </RequireAuth>
            }
          />
          <Route path="*" element={<p>{t('Страница не найдена')}</p>} />
        </Routes>
      </main>
      <footer className="footer">
        <span>
          <strong>🥕 FarmMarket</strong> {t('— фермерский рынок Таджикистана')}
        </span>
        <span>
          {t('Свежие продукты напрямую от фермеров')} · {new Date().getFullYear()}
        </span>
      </footer>
    </>
  )
}