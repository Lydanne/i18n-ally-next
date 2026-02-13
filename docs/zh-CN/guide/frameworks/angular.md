# Angular

## ngx-translate

### 推荐配置

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.localesPaths": ["src/assets/i18n"],
  "i18n-ally-next.sourceLanguage": "en",
  "i18n-ally-next.keystyle": "nested"
}
```

### 项目结构

```text
src/
└── assets/
    └── i18n/
        ├── en.json
        ├── zh-CN.json
        └── ja.json
```

### 使用方式

```html
<!-- 管道语法 -->
<h1>{{ 'home.title' | translate }}</h1>
<p>{{ 'home.description' | translate:{ name: userName } }}</p>

<!-- 指令语法 -->
<p [translate]="'home.greeting'" [translateParams]="{ name: userName }"></p>
```

```typescript
import { TranslateService } from '@ngx-translate/core'

export class AppComponent {
  constructor(private translate: TranslateService) {
    // 异步获取
    this.translate.get('home.title').subscribe(value => {
      console.log(value)
    })

    // 同步获取
    const title = this.translate.instant('home.title')
  }
}
```
