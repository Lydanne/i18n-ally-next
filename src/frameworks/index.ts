import type { Framework, PackageFileType } from './base'
import { workspace } from 'vscode'
import i18n from '~/i18n'
import { Log } from '~/utils'
import { ComposerJSONParser, GemfileParser, PackageJSONParser, PubspecYAMLParser } from '../packagesParsers'
import ChromeExtensionFramework from './chrome-ext'
import CustomFramework from './custom'
import EmberFramework from './ember'
import FluentVueFramework from './fluent-vue'
import FluentVueSFCFramework from './fluent-vue-sfc'
import FlutterFramework from './flutter'
import GeneralFramework from './general'
import GlobalizeFramework from './globalize'
import I18nTagFramework from './i18n-tag'
import I18nextFramework from './i18next'
import ShopifyI18nextFramework from './i18next-shopify'
import JekyllFramework from './jekyll'
import LaravelFramework from './laravel'
import LinguiFramework from './lingui'
import NextInternationalFramework from './next-international'
import NextIntlFramework from './next-intl'
import NextTranslateFramework from './next-translate'
import NgxTranslateFramework from './ngx-translate'
import PhpGettextFramework from './php-gettext'
import PhpJoomlaFramework from './php-joomla'
import PolyglotFramework from './polyglot'
import ReactI18nextFramework from './react-i18next'
import ReactFramework from './react-intl'
import RubyRailsFramework from './ruby-rails'
import SvelteFramework from './svelte'
import TranslocoFramework from './transloco'
import UI5Framework from './ui5'
import VSCodeFramework from './vscode'
import VueFramework from './vue'
import VueSFCFramework from './vue-sfc'

export * from './base'

export type PackageDependencies = Partial<Record<PackageFileType, string[]>>

export const frameworks: Framework[] = [
  // Custom should be the first one
  new CustomFramework(),

  new VueFramework(),
  new ReactFramework(),
  new NgxTranslateFramework(),
  new VSCodeFramework(),
  new FlutterFramework(),
  new EmberFramework(),
  new I18nextFramework(),
  new ShopifyI18nextFramework(),
  new ReactI18nextFramework(),
  new NextIntlFramework(),
  new NextInternationalFramework(),
  new I18nTagFramework(),
  new FluentVueFramework(),
  new PhpJoomlaFramework(),
  new LaravelFramework(),
  new ChromeExtensionFramework(),
  new RubyRailsFramework(),
  new TranslocoFramework(),
  new SvelteFramework(),
  new PolyglotFramework(),
  new GlobalizeFramework(),
  new UI5Framework(),
  new NextTranslateFramework(),
  new PhpGettextFramework(),
  new LinguiFramework(),
  new JekyllFramework(),
  new GeneralFramework(),

  // Vue SFC and FluentVue SFC should be the last ones
  new VueSFCFramework(),
  new FluentVueSFCFramework(),
]

export function getFramework(id: string): Framework | undefined {
  return frameworks.find(f => f.id === id)
}

export function getPackageDependencies(projectUrl: string): PackageDependencies {
  const result: PackageDependencies = {}

  if (!projectUrl || !workspace.workspaceFolders)
    return result

  result.none = []
  result.packageJSON = PackageJSONParser.load(projectUrl)
  result.pubspecYAML = PubspecYAMLParser.load(projectUrl)
  result.composerJSON = ComposerJSONParser.load(projectUrl)
  result.gemfile = GemfileParser.load(projectUrl)

  return result
}

export function getEnabledFrameworks(dependencies: PackageDependencies, root: string) {
  let enabledFrameworks = frameworks.filter((framework) => {
    for (const k of Object.keys(dependencies)) {
      const key = k as PackageFileType
      const packages = dependencies[key]
      const req = framework.detection[key]

      if (packages && req) {
        if (typeof req === 'function') {
          return req(packages, root)
        }
        else if (Array.isArray(req)) {
          return req.some(key => packages.includes(key))
        }
        else {
          const none = req.none ? !req.none.some(key => packages.includes(key)) : true
          const any = req.any ? req.any.some(key => packages.includes(key)) : true
          const every = req.every ? req.every.every(key => packages.includes(key)) : true

          return none && any && every
        }
      }
    }

    return false
  })

  for (const framework of enabledFrameworks) {
    if (framework.monopoly)
      enabledFrameworks = [framework]
  }

  // don't enable if only general framework is presented
  if (enabledFrameworks.length === 1 && enabledFrameworks[0].id === 'general')
    enabledFrameworks = []

  return enabledFrameworks
}

export function getEnabledFrameworksByIds(ids: string[], root: string) {
  const missedFrameworks: string[] = []
  const enabledFrameworks = ids.flatMap((id) => {
    const framework = frameworks.find(f => f.id === id)
    if (!framework) {
      missedFrameworks.push(id)
      return []
    }

    if (framework instanceof CustomFramework)
      framework.load(root)

    return [framework]
  })

  if (missedFrameworks.length > 0)
    Log.warn(i18n.t('prompt.frameworks_not_found', missedFrameworks.join(', ')), true)

  return enabledFrameworks
}
