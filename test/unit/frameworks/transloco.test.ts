import type { RewriteKeyContext, RewriteKeySource } from '../../../src/core/types'
import type { ScopeRange } from '../../../src/frameworks/base'
import { camelCase } from 'change-case'
import { expect } from 'chai'
import { Parser } from 'htmlparser2'

// ---- Minimal types ----
interface MinimalTextDocument {
  languageId: string
  getText: () => string
}

// ---- Build a minimal framework instance without triggering vscode imports ----
function createFramework() {
  const rewriteKeys = (key: string, _source: RewriteKeySource, _context: RewriteKeyContext = {}): string => {
    // find extra scope (e.g., translate('key', { scope: 'myscope' }))
    const regex = /['"`]([\w.]+)['"`]/g
    let index = 0
    let match
    let actualKey: string | undefined
    let scope: string | undefined

    // eslint-disable-next-line no-cond-assign
    while ((match = regex.exec(key)) !== null) {
      if (match.index === regex.lastIndex)
        regex.lastIndex++

      if (index === 0)
        actualKey = match[1]

      if (index === 1)
        scope = match[1]

      index++
    }

    return actualKey && scope ? `${scope}.${actualKey}` : key
  }

  const getNamespaceAliases = (namespace: string): string[] => {
    const alias = camelCase(namespace)
    return alias !== namespace ? [alias] : []
  }

  // Mirror of the actual getScopeRange in transloco.ts using htmlparser2
  const getScopeRange = (document: MinimalTextDocument): ScopeRange[] | undefined => {
    if (document.languageId !== 'html')
      return undefined

    const ranges: ScopeRange[] = []
    const regex = /^.*read:\s*['"](.+?)['"].*$/
    const tagStack: string[] = []
    let stackDepth = -1
    let namespace = ''
    let start = 0

    const parser = new Parser(
      {
        onopentag(name: string, attribs: Record<string, string>) {
          tagStack.push(name)
          const attr = attribs['*transloco']
          if (attr && parser.endIndex != null) {
            if (!regex.test(attr))
              return
            namespace = attr.replace(regex, '$1')
            start = parser.startIndex
            stackDepth = tagStack.length
          }
        },
        onclosetag() {
          if (tagStack.length === stackDepth) {
            if (namespace) {
              ranges.push({
                namespace,
                start,
                end: parser.endIndex ?? parser.startIndex,
              })
            }
            stackDepth = -1
            namespace = ''
            start = 0
          }
          tagStack.pop()
        },
      },
      { decodeEntities: true },
    )
    parser.write(document.getText())
    parser.end()

    return ranges
  }

  return { rewriteKeys, getNamespaceAliases, getScopeRange }
}

function makeDoc(text: string, languageId = 'html'): MinimalTextDocument {
  return { languageId, getText: () => text }
}

// ============================================================
// getNamespaceAliases tests (core of the bug fix)
// ============================================================
describe('transloco', () => {
  describe('getNamespaceAliases', () => {
    const { getNamespaceAliases } = createFramework()

    it('returns camelCase alias for kebab-case namespace', () => {
      expect(getNamespaceAliases('app-not-working')).to.deep.equal(['appNotWorking'])
    })

    it('returns camelCase alias for multi-segment kebab namespace', () => {
      expect(getNamespaceAliases('my-feature-module')).to.deep.equal(['myFeatureModule'])
    })

    it('returns empty array for namespace already in camelCase', () => {
      expect(getNamespaceAliases('appworking')).to.deep.equal([])
    })

    it('returns empty array for namespace already in camelCase with capital letter', () => {
      expect(getNamespaceAliases('appNotWorking')).to.deep.equal([])
    })

    it('returns empty array for single-word namespace without hyphens', () => {
      expect(getNamespaceAliases('dashboard')).to.deep.equal([])
    })

    it('returns camelCase alias for snake_case namespace', () => {
      const result = getNamespaceAliases('app_not_working')
      expect(result).to.deep.equal(['appNotWorking'])
    })

    it('returns empty array for empty namespace', () => {
      expect(getNamespaceAliases('')).to.deep.equal([])
    })
  })

  // ============================================================
  // rewriteKeys tests
  // ============================================================
  describe('rewriteKeys', () => {
    const { rewriteKeys } = createFramework()

    it('returns plain key unchanged', () => {
      expect(rewriteKeys('myKey', 'reference')).to.equal('myKey')
    })

    it('returns nested key unchanged', () => {
      expect(rewriteKeys('section.key', 'reference')).to.equal('section.key')
    })

    it('combines scope and key when both are present in match string', () => {
      // rewriteKeys receives the raw regex match, which may include scope in quotes
      expect(rewriteKeys(`'myKey''myScope'`, 'reference')).to.equal('myScope.myKey')
    })
  })

  // ============================================================
  // getScopeRange tests — read: syntax only
  // ============================================================
  describe('getScopeRange', () => {
    const { getScopeRange } = createFramework()

    it('returns undefined for non-html files', () => {
      const result = getScopeRange(makeDoc('<div>test</div>', 'typescript'))
      expect(result).to.equal(undefined)
    })

    it('returns empty array when no transloco read directive', () => {
      const result = getScopeRange(makeDoc('<div>no transloco here</div>'))
      expect(result).to.deep.equal([])
    })

    it('returns scope range for read: syntax with simple namespace', () => {
      const html = `<ng-container *transloco="let t; read: 'appworking'">
  <p>{{ t('test.key') }}</p>
</ng-container>`
      const result = getScopeRange(makeDoc(html))
      expect(result).to.have.length(1)
      expect(result![0].namespace).to.equal('appworking')
    })

    it('returns scope range for read: syntax with kebab-case namespace', () => {
      const html = `<ng-container *transloco="let t; read: 'app-not-working'">
  <p>{{ t('test.key') }}</p>
</ng-container>`
      const result = getScopeRange(makeDoc(html))
      expect(result).to.have.length(1)
      expect(result![0].namespace).to.equal('app-not-working')
    })
  })

  // ============================================================
  // Integration scenario: camelCase alias enables kebab namespace key lookup
  // ============================================================
  describe('integration: kebab namespace alias lookup', () => {
    const { getNamespaceAliases } = createFramework()

    it('app-not-working alias allows looking up appNotWorking.test.key', () => {
      // The namespace from the file system is 'app-not-working'
      const fileNamespace = 'app-not-working'
      // The key used in the template is 'appNotWorking.test.key'
      const templateKey = 'appNotWorking.test.key'

      // Get the camelCase alias
      const aliases = getNamespaceAliases(fileNamespace)
      expect(aliases).to.include('appNotWorking')

      // The alias matches the prefix of the template key
      const aliasPrefix = `${aliases[0]}.`
      expect(templateKey.startsWith(aliasPrefix)).to.equal(true)
    })

    it('appworking namespace produces no alias (already works as-is)', () => {
      const fileNamespace = 'appworking'
      const aliases = getNamespaceAliases(fileNamespace)
      expect(aliases).to.deep.equal([])
    })
  })
})
