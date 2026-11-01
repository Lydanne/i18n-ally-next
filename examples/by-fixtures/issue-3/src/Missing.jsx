import { useTranslation } from 'react-i18next'
export function Missing() {
  const { t } = useTranslation()
  return t('missing.value')
}
