# Vue I18n

## 推荐配置

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.localesPaths": ["src/locales"],
  "i18n-ally-next.sourceLanguage": "en",
  "i18n-ally-next.keystyle": "nested",
  "i18n-ally-next.dirStructure": "file"
}
```

## 项目结构

```text
src/
├── locales/
│   ├── en.json
│   ├── zh-CN.json
│   └── ja.json
├── App.vue
└── main.ts
```

## 使用方式

i18n Ally Next 能识别以下 Vue I18n 用法：

```vue
<template>
  <!-- 模板中的 $t() -->
  <p>{{ $t('hello') }}</p>

  <!-- v-t 指令 -->
  <p v-t="'hello'"></p>

  <!-- 组件插值 -->
  <i18n-t keypath="greeting" tag="p">
    <template #name>{{ username }}</template>
  </i18n-t>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

// Composition API
const msg = t('hello')
</script>
```

## SFC i18n 块

Vue 单文件组件的 `<i18n>` 块开箱即用：

```vue
<i18n>
{
  "en": { "hello": "Hello" },
  "zh-CN": { "hello": "你好" }
}
</i18n>
```

如果自动检测未识别 SFC，可手动启用：

```jsonc
{
  "i18n-ally-next.enabledFrameworks": ["vue", "vue-sfc"]
}
```
