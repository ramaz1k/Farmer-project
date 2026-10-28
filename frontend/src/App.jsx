import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { useAuth } from './auth'
import { useCart } from './cart'
import Catalog from './pages/Catalog'
import ProductPage from './pages/Product'
import FarmerPage from './pages/Farmer'
import Login, { Register } from './pages/Login'
import Cart from './pages/Cart'
import Orders from './pages/Orders'
import Profile from './pages/Profile'

function Header() {
  const { user, logout } = useAuth()
  const { items } = useCart()
  const navigate = useNavigate()
  const count = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <header className="header">
      <Link to="/" className="logo">
        🥕 FarmMarket
      </Link>
      <nav>
        <Link to="/">Каталог</Link>
        <Link to="/orders">Мои заказы</Link>
        <Link to="/cart" className="cart-link">
          Корзина{count > 0 && <span className="badge">{count}</span>}
        </Link>
        {user?.role === 'Farmer' && <Link to="/profile">Мой профиль</Link>}
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
              Выйти
            </button>
          </span>
        ) : (
          <Link to="/login" className="btn btn-small">
            Войти
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
          <Route path="*" element={<p>Страница не найдена</p>} />
        </Routes>
      </main>
    </>
  )
}
