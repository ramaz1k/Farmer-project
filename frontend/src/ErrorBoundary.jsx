import { Component, useState } from 'react'
import { useI18n } from './i18n'

class Boundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Ошибка приложения:', error, info)
  }

  render() {
    if (this.state.error) return this.props.renderError(this.state.error)
    return this.props.children
  }
}

// Ловит ошибки рендера: вместо белого экрана — понятное сообщение
// и кнопки «попробовать снова» / «обновить страницу».
export default function ErrorBoundary({ children }) {
  const { t } = useI18n()
  const [attempt, setAttempt] = useState(0)

  return (
    <Boundary
      key={attempt}
      renderError={(err) => (
        <main className="container">
          <div className="error">
            <strong>{t('Что-то пошло не так.')}</strong>
            <p>{err?.message}</p>
            <div className="order-actions">
              <button
                type="button"
                className="btn btn-small"
                onClick={() => setAttempt((a) => a + 1)}
              >
                {t('Попробовать снова')}
              </button>
              <button
                type="button"
                className="btn btn-small btn-outline"
                onClick={() => window.location.reload()}
              >
                {t('Обновить страницу')}
              </button>
            </div>
          </div>
        </main>
      )}
    >
      {children}
    </Boundary>
  )
}
