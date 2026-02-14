import { expect } from 'chai'

/**
 * NodeHelper 纯函数测试
 * 复制核心逻辑用于测试（避免依赖 vscode 模块）
 *
 * 回归测试：
 * 1. 修复 DefinitionProvider 跳转时未去掉 namespace 前缀导致定位不到 key 的问题
 * 2. 统一 namespace 拼接使用 namespaceDelimiter，不再硬编码 '.'
 */

interface NodeMeta {
  readonly namespace?: string
}

interface MockNode {
  readonly meta?: NodeMeta
}

/** 模拟 Global.namespaceEnabled */
let namespaceEnabled = false

/** 模拟 Global.getNamespaceDelimiter 的默认返回值 */
let namespaceDelimiter = '.'

function getPathWithoutNamespace(
  keypath: string,
  node?: MockNode,
  namespace?: string,
  delimiter?: string,
): string {
  if (namespaceEnabled) {
    namespace = node?.meta?.namespace || namespace
    const d = delimiter || namespaceDelimiter
    if (namespace && keypath.startsWith(namespace + d))
      return keypath.slice(namespace.length + d.length)
  }
  return keypath
}

function splitKeypath(keypath: string): string[] {
  const delimiter = namespaceEnabled ? namespaceDelimiter : undefined
  if (delimiter && delimiter !== '.') {
    const delimiterIndex = keypath.indexOf(delimiter)
    if (delimiterIndex >= 0) {
      const ns = keypath.slice(0, delimiterIndex)
      const rest = keypath.slice(delimiterIndex + delimiter.length)
      return [ns, ...rest.replace(/\[(.*?)\]/g, '.$1').split('.')]
    }
  }
  return keypath.replace(/\[(.*?)\]/g, '.$1').split('.')
}

describe('nodeHelper', () => {
  describe('getPathWithoutNamespace', () => {
    afterEach(() => {
      namespaceEnabled = false
      namespaceDelimiter = '.'
    })

    it('namespace 未启用时应返回原始 keypath', () => {
      namespaceEnabled = false
      expect(getPathWithoutNamespace('translation.common.stackTrace')).to.equal('translation.common.stackTrace')
    })

    it('namespace 启用但未提供 namespace 参数和 node 时应返回原始 keypath', () => {
      namespaceEnabled = true
      expect(getPathWithoutNamespace('common.stackTrace')).to.equal('common.stackTrace')
    })

    it('namespace 启用且通过参数提供 namespace 时应去掉前缀', () => {
      namespaceEnabled = true
      expect(getPathWithoutNamespace('translation.common.stackTrace', undefined, 'translation')).to.equal('common.stackTrace')
    })

    it('namespace 启用且通过 node.meta.namespace 提供时应去掉前缀', () => {
      namespaceEnabled = true
      const node: MockNode = { meta: { namespace: 'translation' } }
      expect(getPathWithoutNamespace('translation.common.stackTrace', node)).to.equal('common.stackTrace')
    })

    it('node.meta.namespace 应优先于参数中的 namespace', () => {
      namespaceEnabled = true
      const node: MockNode = { meta: { namespace: 'ns1' } }
      expect(getPathWithoutNamespace('ns1.key.path', node, 'ns2')).to.equal('key.path')
    })

    it('keypath 不以 namespace 开头时应返回原始 keypath', () => {
      namespaceEnabled = true
      expect(getPathWithoutNamespace('other.common.stackTrace', undefined, 'translation')).to.equal('other.common.stackTrace')
    })

    it('应支持自定义分隔符', () => {
      namespaceEnabled = true
      expect(getPathWithoutNamespace('translation:common.stackTrace', undefined, 'translation', ':')).to.equal('common.stackTrace')
    })

    it('delimiter 为 : 时应匹配 : 分隔符', () => {
      namespaceEnabled = true
      expect(getPathWithoutNamespace('translation:common.stackTrace', undefined, 'translation', ':')).to.equal('common.stackTrace')
    })

    it('delimiter 为 : 但 keypath 用 . 拼接时不应匹配', () => {
      namespaceEnabled = true
      expect(getPathWithoutNamespace('translation.common.stackTrace', undefined, 'translation', ':')).to.equal('translation.common.stackTrace')
    })

    it('应使用默认分隔符（当未传入 delimiter 参数时）', () => {
      namespaceEnabled = true
      namespaceDelimiter = ':'
      expect(getPathWithoutNamespace('translation:common.stackTrace', undefined, 'translation')).to.equal('common.stackTrace')
    })

    it('namespace 与 keypath 完全相同时应返回空字符串', () => {
      namespaceEnabled = true
      expect(getPathWithoutNamespace('translation.', undefined, 'translation')).to.equal('')
    })

    it('仅有 namespace 无后续路径时应返回原始 keypath（不含分隔符）', () => {
      namespaceEnabled = true
      expect(getPathWithoutNamespace('translation', undefined, 'translation')).to.equal('translation')
    })

    it('node.meta 为空对象时应回退到参数中的 namespace', () => {
      namespaceEnabled = true
      const node: MockNode = { meta: {} }
      expect(getPathWithoutNamespace('translation.common.key', node, 'translation')).to.equal('common.key')
    })

    it('node 无 meta 属性时应回退到参数中的 namespace', () => {
      namespaceEnabled = true
      const node: MockNode = {}
      expect(getPathWithoutNamespace('translation.common.key', node, 'translation')).to.equal('common.key')
    })
  })

  describe('splitKeypath', () => {
    afterEach(() => {
      namespaceEnabled = false
      namespaceDelimiter = '.'
    })

    it('namespace 未启用时按 . 拆分', () => {
      namespaceEnabled = false
      expect(splitKeypath('translation.common.stackTrace')).to.deep.equal(['translation', 'common', 'stackTrace'])
    })

    it('namespace 启用且 delimiter 为 . 时按 . 拆分', () => {
      namespaceEnabled = true
      namespaceDelimiter = '.'
      expect(splitKeypath('translation.common.stackTrace')).to.deep.equal(['translation', 'common', 'stackTrace'])
    })

    it('namespace 启用且 delimiter 为 : 时先按 : 拆出 namespace', () => {
      namespaceEnabled = true
      namespaceDelimiter = ':'
      expect(splitKeypath('translation:common.stackTrace')).to.deep.equal(['translation', 'common', 'stackTrace'])
    })

    it('delimiter 为 : 但 keypath 不含 : 时按 . 拆分', () => {
      namespaceEnabled = true
      namespaceDelimiter = ':'
      expect(splitKeypath('common.stackTrace')).to.deep.equal(['common', 'stackTrace'])
    })

    it('应处理数组下标语法', () => {
      namespaceEnabled = false
      expect(splitKeypath('items[0].name')).to.deep.equal(['items', '0', 'name'])
    })

    it('delimiter 为 : 时应处理数组下标语法', () => {
      namespaceEnabled = true
      namespaceDelimiter = ':'
      expect(splitKeypath('ns:items[0].name')).to.deep.equal(['ns', 'items', '0', 'name'])
    })
  })
})
