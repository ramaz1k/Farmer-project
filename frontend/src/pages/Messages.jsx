import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import { useI18n } from '../i18n'
import Chat from '../Chat'

export default function Messages() {
  const { user } = useAuth()
  const { t } = useI18n()
  const [conversations, setConversations] = useState([])
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const res = await api('/messages/conversations')
      setConversations(Array.isArray(res) ? res : [])
      setError('')
    } catch (e) {
      setError(e.message)
    }
  }, [])

  useEffect(() => {
    if (!user) return undefined
    load()
    const timer = setInterval(load, 8000)
    return () => clearInterval(timer)
  }, [user, load])

  if (!user) return <p className="muted">{t('Войдите в аккаунт.')}</p>

  if (selected) {
    return (
      <>
        <button
          type="button"
          className="btn btn-small btn-outline"
          onClick={() => setSelected(null)}
        >
          ← {t('Все чаты')}
        </button>
        <h1>{selected.peerName}</h1>
        {selected.productTitle && (
          <p className="muted">
            {t('Товар')}: {selected.productTitle}
          </p>
        )}
        <Chat
          peerUserId={selected.peerUserId}
          productId={selected.productId}
          peerName={selected.peerName}
        />
      </>
    )
  }

  return (
    <>
      <h1>{t('Сообщения')}</h1>
      {error && <div className="error">{error}</div>}
      {conversations.length === 0 && (
        <p className="muted">{t('Сообщений пока нет.')}</p>
      )}
      <div className="conv-list">
        {conversations.map((c) => (
          <button
            key={c.peerUserId}
            type="button"
            className="conv"
            onClick={() => setSelected(c)}
          >
            <span className="conv-name">
              {c.peerName}
              {c.unreadCount > 0 && <span className="badge">{c.unreadCount}</span>}
            </span>
            {c.productTitle && <span className="conv-product">🌾 {c.productTitle}</span>}
            <span className="conv-last">{c.lastText}</span>
            <span className="conv-time muted">
              {new Date(c.lastAt).toLocaleString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </button>
        ))}
      </div>
      <p className="muted">
        {t('Написать фермеру можно на странице товара.')}{' '}
        <Link to="/">{t('В каталог')}</Link>
      </p>
    </>
  )
}
