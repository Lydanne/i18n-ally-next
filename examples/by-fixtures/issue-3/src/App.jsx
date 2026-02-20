import React from 'react';
import { useTranslation } from 'react-i18next';

export const App = () => {
  const { t } = useTranslation();

  return (
    <div>
      {/* 默认命名空间 (配置中设置为 errors) */}
      <p>{t('network.timeout')}</p>

      {/* 显式使用默认命名空间 (Issue #3 中提到的问题：带命名空间时提示不存在) */}
      <p>{t('errors:network.unauthorized')}</p>

      {/* 显式使用其他命名空间 */}
      <p>{t('translation:general.title')}</p>

      {/* 用于测试自动补全忽略分隔符的问题 */}
      <p>{t('translation:general.description')}</p>
    </div>
  );
};
