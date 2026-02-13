# Angular

## ngx-translate

### Recommended Setup

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.localesPaths": ["src/assets/i18n"],
  "i18n-ally-next.sourceLanguage": "en",
  "i18n-ally-next.keystyle": "nested"
}
```

### Project Structure

```text
src/
└── assets/
    └── i18n/
        ├── en.json
        ├── zh-CN.json
        └── ja.json
```

### Usage Patterns

```html
<!-- Pipe in templates -->
<h1>{{ 'home.title' | translate }}</h1>
<p>{{ 'home.description' | translate:{ name: userName } }}</p>

<!-- Directive -->
<p [translate]="'home.greeting'" [translateParams]="{ name: userName }"></p>
```

```typescript
import { TranslateService } from '@ngx-translate/core'

export class AppComponent {
  constructor(private translate: TranslateService) {
    // Programmatic usage
    this.translate.get('home.title').subscribe(value => {
      console.log(value)
    })

    // Instant (synchronous)
    const title = this.translate.instant('home.title')
  }
}
```
