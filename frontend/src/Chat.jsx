import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from './api'
import { useAuth } from './auth'
import { useI18n } from './i18n'

// Диалог с одним собеседником: читает историю, опрашивает сервер
// каждые 4 секунды, отправляет сообщения.
export default function Chat({ peerUserId, productId, peerName }) {
  const { user } = useAuth()
  const { t } = useI18n()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const boxRef = useRef(null)

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams({ peerUserId: String(peerUserId) })
      if (productId) params.set('productId', String(productId))
      setMessages(await api(`/messages/thread?${params}`))
      setError('')
    } catch (e) {
      setError(e.message)
    }
  }, [peerUserId, productId])

  useEffect(() => {
    if (!user) return undefined
    load()
    const timer = setInterval(load, 4000)
    return () => clearInterval(timer)
  }, [user, load])

  useEffect(() => {
    const box = boxRef.current
    if (box) box.scrollTop = box.scrollHeight
  }, [messages])

  if (!user) {
    return <p className="muted">{t('Войдите, чтобы написать сообщение.')}</p>
  }

  async function send(e) {
    e.preventDefault()
    const body = text.trim()
    if (!body || sending) return
    setSending(true)
    setError('')
    try {
      await api('/messages', {
        method: 'POST',
        body: { peerUserId, productId: productId || null, text: body },
      })
      setText('')
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="chat">
      <div className="chat-head">
        💬 {t('Переписка')} · {peerName}
        {productId ? ` · ${t('Товар')} #${productId}` : ''}
      </div>

      {error && <div className="error">{error}</div>}

      <div className="chat-box" ref={boxRef}>
        {messages.length === 0 && (
          <p className="muted">{t('Пока нет сообщений — напишите первым.')}</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`msg ${m.fromMe ? 'me' : ''}`}>
            <span className="msg-text">{m.text}</span>
            <span className="msg-time">
              {new Date(m.createdAt).toLocaleString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        ))}
      </div>

      <form className="chat-form" onSubmit={send}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('Написать сообщение…')}
          maxLength={2000}
        />
        <button className="btn btn-small" disabled={sending || !text.trim()}>
          {sending ? t('Отправляем…') : t('Отправить')}
        </button>
      </form>
    </div>
  )
}
