import { useTranslation } from 'react-i18next'

export function App({ count }: { count: number }) {
  const { t } = useTranslation()
  return (
    <div>
      <h1>{t('cart.title')}</h1>
      <p>{t('cart.items', { count })}</p>
      <p>{t('cart.removed', { count: 1 })}</p>
    </div>
  )
}
