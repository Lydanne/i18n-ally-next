// Examples
// {namespaces}/{lang}.json
// {lang}/{namespace}/**/*.json
// something/{lang}/{namespace}/**/*.*
export function ParsePathMatcher(pathMatcher: string, exts = '') {
  let regstr = pathMatcher
    .replace(/\./g, '\\.')
    .replace('.*', '..*')
    .replace('*\\.', '.*\\.')
    .replace(/\/?\*\*\//g, '(?:.*/|^)')
    .replace('{locale}', '(?<locale>[\\w-_]+)')
    .replace('{locale?}', '(?<locale>[\\w-_]*?)')
    .replace('{namespace}', '(?<namespace>[^/\\\\]+)')
    .replace('{namespace?}', '(?<namespace>[^/\\\\]*?)')
    .replace('{namespaces}', '(?<namespace>.+)')
    .replace('{namespaces?}', '(?<namespace>.*?)')
    .replace('{ext}', `(?<ext>${exts})`)

  regstr = `^${regstr}$`

  return new RegExp(regstr)
}

export function ReplaceLocale(filepath: string, pathMatcher: string, locale: string, exts = '') {
  let regstr = pathMatcher
    .replace(/\./g, '\\.')
    .replace('.*', '..*')
    .replace('*\\.', '.*\\.')
    .replace(/\/?\*\*\//g, '(?:.*/|^)')
    .replace('{locale}', ')[\\w-_]+(')
    .replace('{namespace}', '(?:[^/\\\\]+)')
    .replace('{namespace?}', '(?:[^/\\\\]*?)')
    .replace('{namespaces}', '(?:.+)')
    .replace('{namespaces?}', '(?:.*?)')
    .replace('{ext}', `(?<ext>${exts})`)

  regstr = `^(${regstr})$`

  return filepath.replace(new RegExp(regstr), `$1${locale}$2`)
}

export function PathMatcherHasNamespace(pathMatcher: string) {
  return /\{namespaces?\??\}/.test(pathMatcher)
}

export function GetNamespaceFromKeypath(keypath: string, delimiter: string) {
  if (!delimiter)
    return undefined

  const delimiterIndex = keypath.indexOf(delimiter)
  if (delimiterIndex <= 0 || delimiterIndex + delimiter.length >= keypath.length)
    return undefined

  const namespace = keypath.slice(0, delimiterIndex).trim()
  return namespace || undefined
}

/**
 * Builds a concrete locale filepath from a path matcher. Recursive globs are
 * materialized without an extra directory; matchers containing an unresolved
 * single-level glob are intentionally rejected because there is no safe value
 * we can infer for it.
 */
export function MaterializePathMatcher(pathMatcher: string, locale: string, namespace: string, extension = 'json') {
  if (!PathMatcherHasNamespace(pathMatcher))
    return undefined

  extension = extension.replace(/^\./, '') || 'json'
  const nestedNamespace = namespace.replace(/\./g, '/')

  const filepath = pathMatcher
    .replace(/\?\{locale\?\}/g, locale)
    .replace(/\?\{namespaces\?\}/g, nestedNamespace)
    .replace(/\?\{namespace\?\}/g, namespace)
    .replace(/\{locale\??\}/g, locale)
    .replace(/\{namespaces\??\}/g, nestedNamespace)
    .replace(/\{namespace\??\}/g, namespace)
    .replace(/\{ext\}/g, extension)
    .replace(/\.\(([^/()]+)\)$/g, (_match, alternatives: string) => {
      const values = alternatives.split('|')
      return `.${values.includes(extension) ? extension : values[0]}`
    })
    .replace(/\.\*$/g, `.${extension}`)
    .replace(/(^|\/)\*\*(?=\/|$)/g, '$1')
    .replace(/\/{2,}/g, '/')
    .replace(/^\.\//, '')
    .replace(/^\//, '')

  if (!filepath || /[?*{}]/.test(filepath))
    return undefined

  return filepath
}
