import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'

const STEPS = [
  {
    icon: '🧺',
    title: 'Выберите товар',
    text: 'Найдите нужное в каталоге: фрукты, овощи, зерновые, мёд и многое другое.',
  },
  {
    icon: '💬',
    title: 'Договоритесь с фермером',
    text: 'Напишите в чате прямо на странице товара или сразу оформите заказ в корзине.',
  },
  {
    icon: '🤝',
    title: 'Получите свежее',
    text: 'Заберите заказ сами или согласуйте доставку напрямую с фермером.',
  },
]

const FOR_FARMERS = [
  { icon: '📷', text: 'Бесплатные объявления с фото' },
  { icon: '📦', text: 'Удобное управление заказами и чат с покупателями' },
  { icon: '⭐', text: 'Ваш профиль и отзывы видят все покупатели' },
]

const PRINCIPLES = [
  { icon: '🌍', text: 'Только Таджикистан и местные хозяйства' },
  { icon: '🤝', text: 'Честные цены без посредников' },
  { icon: '🥬', text: 'Свежесть и качество — приоритет номер один' },
]

export default function About() {
  const { t } = useI18n()

  return (
    <>
      <section className="hero">
        <div>
          <span className="hero-kicker">{t('О проекте')}</span>
          <h1>{t('FarmMarket — рынок напрямую от фермеров')}</h1>
          <p>
            {t(
              'Мы соединяем фермеров Таджикистана и покупателей без посредников: свежие продукты по честным ценам, а деньги остаются у тех, кто вырастил.',
            )}
          </p>
        </div>
        <div className="hero-art" aria-hidden="true">
          🌾
        </div>
      </section>

      <h2>{t('Как это работает')}</h2>
      <div className="grid">
        {STEPS.map((s, i) => (
          <div key={s.title} className="card">
            <span className="card-emoji">{s.icon}</span>
            <span className="title">
              {i + 1}. {t(s.title)}
            </span>
            <span className="meta">{t(s.text)}</span>
          </div>
        ))}
      </div>

      <h2>{t('Фермерам')}</h2>
      <div className="grid">
        {FOR_FARMERS.map((f) => (
          <div key={f.text} className="card">
            <span className="card-emoji">{f.icon}</span>
            <span className="meta">{t(f.text)}</span>
          </div>
        ))}
      </div>

      <h2>{t('Наши принципы')}</h2>
      <div className="grid">
        {PRINCIPLES.map((p) => (
          <div key={p.text} className="card">
            <span className="card-emoji">{p.icon}</span>
            <span className="meta">{t(p.text)}</span>
          </div>
        ))}
      </div>

      <div className="detail" style={{ marginTop: 26 }}>
        <h2 style={{ marginTop: 0 }}>{t('Присоединяйтесь')}</h2>
        <p className="muted">{t('Покупайте свежее у местных фермеров или размещайте свои товары.')}</p>
        <div className="order-actions">
          <Link to="/" className="btn">
            {t('В каталог')}
          </Link>
          <Link to="/register" className="btn btn-outline">
            {t('Зарегистрироваться')}
          </Link>
        </div>
      </div>
    </>
  )
}
