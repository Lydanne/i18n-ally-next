import { defineConfig } from 'vitepress'
import llmstxt from 'vitepress-plugin-llms'

export default defineConfig({
  title: 'i18n Ally Next',
  description: 'All in one i18n extension for VS Code',
  base: '/i18n-ally-next/',
  lastUpdated: true,
  cleanUrls: true,

  vite: {
    plugins: [llmstxt() as any],
  },

  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/logo.png' }],
  ],

  locales: {
    root: {
      label: 'English',
      lang: 'en',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/guide/getting-started' },
          { text: 'Config', link: '/config/' },
          {
            text: 'Links',
            items: [
              { text: 'VS Code Marketplace', link: 'https://marketplace.visualstudio.com/items?itemName=lydanne.i18n-ally-next' },
              { text: 'GitHub', link: 'https://github.com/lydanne/i18n-ally-next' },
              { text: 'Changelog', link: 'https://github.com/lydanne/i18n-ally-next/blob/main/changelog.md' },
            ],
          },
        ],
        sidebar: {
          '/guide/': [
            {
              text: 'Introduction',
              items: [
                { text: 'Getting Started', link: '/guide/getting-started' },
                { text: 'Supported Frameworks', link: '/guide/supported-frameworks' },
                { text: 'Locale Formats', link: '/guide/locale-formats' },
              ],
            },
            {
              text: 'Features',
              items: [
                { text: 'Namespace', link: '/guide/namespace' },
                { text: 'Custom Framework', link: '/guide/custom-framework' },
                { text: 'Extraction', link: '/guide/extraction' },
                { text: 'Review System', link: '/guide/review' },
                { text: 'Machine Translation', link: '/guide/translation' },
              ],
            },
            {
              text: 'Best Practices',
              items: [
                { text: 'Overview', link: '/guide/best-practices' },
                { text: 'Vue I18n', link: '/guide/frameworks/vue' },
                { text: 'React & Next.js', link: '/guide/frameworks/react' },
                { text: 'Angular', link: '/guide/frameworks/angular' },
                { text: 'Svelte, Laravel & Rails', link: '/guide/frameworks/others' },
                { text: 'Custom Framework', link: '/guide/frameworks/custom' },
                { text: 'Monorepo', link: '/guide/monorepo' },
              ],
            },
            {
              text: 'Advanced',
              items: [
                { text: 'Path Matcher', link: '/guide/path-matcher' },
                { text: 'Regex Usage Match', link: '/guide/regex-usage-match' },
                { text: 'FAQ', link: '/guide/faq' },
              ],
            },
          ],
          '/config/': [
            {
              text: 'Configuration',
              items: [
                { text: 'Overview', link: '/config/' },
              ],
            },
          ],
        },
      },
    },
    'zh-CN': {
      label: '简体中文',
      lang: 'zh-CN',
      themeConfig: {
        nav: [
          { text: '指南', link: '/zh-CN/guide/getting-started' },
          { text: '配置', link: '/zh-CN/config/' },
          {
            text: '链接',
            items: [
              { text: 'VS Code 插件市场', link: 'https://marketplace.visualstudio.com/items?itemName=lydanne.i18n-ally-next' },
              { text: 'GitHub', link: 'https://github.com/lydanne/i18n-ally-next' },
              { text: '更新日志', link: 'https://github.com/lydanne/i18n-ally-next/blob/main/changelog.md' },
            ],
          },
        ],
        sidebar: {
          '/zh-CN/guide/': [
            {
              text: '简介',
              items: [
                { text: '快速开始', link: '/zh-CN/guide/getting-started' },
                { text: '支持的框架', link: '/zh-CN/guide/supported-frameworks' },
                { text: '语言文件格式', link: '/zh-CN/guide/locale-formats' },
              ],
            },
            {
              text: '功能',
              items: [
                { text: '命名空间', link: '/zh-CN/guide/namespace' },
                { text: '自定义框架', link: '/zh-CN/guide/custom-framework' },
                { text: '文案提取', link: '/zh-CN/guide/extraction' },
                { text: '审阅系统', link: '/zh-CN/guide/review' },
                { text: '机器翻译', link: '/zh-CN/guide/translation' },
              ],
            },
            {
              text: '最佳实践',
              items: [
                { text: '总览', link: '/zh-CN/guide/best-practices' },
                { text: 'Vue I18n', link: '/zh-CN/guide/frameworks/vue' },
                { text: 'React & Next.js', link: '/zh-CN/guide/frameworks/react' },
                { text: 'Angular', link: '/zh-CN/guide/frameworks/angular' },
                { text: 'Svelte、Laravel 与 Rails', link: '/zh-CN/guide/frameworks/others' },
                { text: '自定义框架', link: '/zh-CN/guide/frameworks/custom' },
                { text: 'Monorepo', link: '/zh-CN/guide/monorepo' },
              ],
            },
            {
              text: '进阶',
              items: [
                { text: '路径匹配', link: '/zh-CN/guide/path-matcher' },
                { text: '正则匹配', link: '/zh-CN/guide/regex-usage-match' },
                { text: '常见问题', link: '/zh-CN/guide/faq' },
              ],
            },
          ],
          '/zh-CN/config/': [
            {
              text: '配置项',
              items: [
                { text: '总览', link: '/zh-CN/config/' },
              ],
            },
          ],
        },
      },
    },
  },

  themeConfig: {
    logo: '/logo.png',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/lydanne/i18n-ally-next' },
    ],
    search: {
      provider: 'local',
    },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025-PRESENT Lydanne',
    },
  },
})
