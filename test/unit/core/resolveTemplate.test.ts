import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { basename, dirname, extname, join, resolve } from 'path'
import { expect } from 'chai'

/**
 * resolveTemplate / findNearestPackageJson 纯函数测试
 * 复制核心逻辑用于测试（避免依赖 vscode 模块）
 */

function findNearestPackageJson(startDir: string): { data: Record<string, unknown>, dir: string } | undefined {
  let dir = startDir
  while (true) {
    const pkgPath = resolve(dir, 'package.json')
    if (existsSync(pkgPath)) {
      try {
        return { data: JSON.parse(readFileSync(pkgPath, 'utf-8')), dir }
      }
      catch {
        return undefined
      }
    }
    const parent = dirname(dir)
    if (parent === dir)
      return undefined
    dir = parent
  }
}

function resolveTemplate(template: string, filepath?: string): string {
  if (!template || !filepath)
    return ''
  const dir = dirname(filepath)
  const variables: Record<string, () => string> = {
    'dirname': () => basename(dir),
    'filename': () => basename(filepath, extname(filepath)),
    'package.name': () => {
      const pkg = findNearestPackageJson(dir)
      return (pkg?.data.name as string) ?? ''
    },
    'package_dirname': () => {
      const pkg = findNearestPackageJson(dir)
      return pkg ? basename(pkg.dir) : ''
    },
  }
  return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_, varName: string) => {
    const resolver = variables[varName]
    return resolver ? resolver() : ''
  })
}

describe('resolveTemplate', () => {
  it('模板为空时应返回空字符串', () => {
    expect(resolveTemplate('', '/some/path/file.ts')).to.equal('')
  })

  it('filepath 为空时应返回空字符串', () => {
    expect(resolveTemplate('{{dirname}}', undefined)).to.equal('')
  })

  it('应解析 {{dirname}} 为当前文件所在目录名', () => {
    expect(resolveTemplate('{{dirname}}', '/src/commands/setup/setup.command.ts')).to.equal('setup')
  })

  it('应解析 {{filename}} 为不含扩展名的文件名', () => {
    expect(resolveTemplate('{{filename}}', '/src/commands/setup/setup.command.ts')).to.equal('setup.command')
  })

  it('应同时解析多个变量', () => {
    const result = resolveTemplate('{{dirname}}:{{filename}}', '/src/commands/setup/setup.command.ts')
    expect(result).to.equal('setup:setup.command')
  })

  it('应保留模板中的静态文本', () => {
    const result = resolveTemplate('prefix.{{dirname}}.suffix', '/src/commands/setup/file.ts')
    expect(result).to.equal('prefix.setup.suffix')
  })

  it('未知变量应替换为空字符串', () => {
    const result = resolveTemplate('{{unknown}}', '/src/file.ts')
    expect(result).to.equal('')
  })

  it('无变量占位符的模板应原样返回', () => {
    expect(resolveTemplate('static-key', '/src/file.ts')).to.equal('static-key')
  })

  it('应处理单层目录的 filepath', () => {
    expect(resolveTemplate('{{dirname}}', '/setup/file.ts')).to.equal('setup')
  })

  it('应处理只有文件名的 filepath', () => {
    expect(resolveTemplate('{{filename}}', '/file.ts')).to.equal('file')
  })
})

describe('findNearestPackageJson', () => {
  const testRoot = join(tmpdir(), `i18n-ally-test-pkg-${Date.now()}`)
  const nestedDir = join(testRoot, 'a', 'b', 'c')

  before(() => {
    mkdirSync(nestedDir, { recursive: true })
    writeFileSync(join(testRoot, 'package.json'), JSON.stringify({ name: '@test/root' }))
  })

  after(() => {
    rmSync(testRoot, { recursive: true, force: true })
  })

  it('应找到当前目录的 package.json', () => {
    const pkg = findNearestPackageJson(testRoot)
    expect(pkg?.data).to.deep.include({ name: '@test/root' })
    expect(pkg?.dir).to.equal(testRoot)
  })

  it('应向上查找 package.json', () => {
    const pkg = findNearestPackageJson(nestedDir)
    expect(pkg?.data).to.deep.include({ name: '@test/root' })
    expect(pkg?.dir).to.equal(testRoot)
  })

  it('嵌套目录有自己的 package.json 时应优先使用', () => {
    const innerDir = join(testRoot, 'a')
    writeFileSync(join(innerDir, 'package.json'), JSON.stringify({ name: '@test/inner' }))
    const pkg = findNearestPackageJson(innerDir)
    expect(pkg?.data).to.deep.include({ name: '@test/inner' })
    expect(pkg?.dir).to.equal(innerDir)
  })
})

describe('resolveTemplate with {{package.name}}', () => {
  const testRoot = join(tmpdir(), `i18n-ally-test-tpl-${Date.now()}`)
  const srcDir = join(testRoot, 'src', 'commands')

  before(() => {
    mkdirSync(srcDir, { recursive: true })
    writeFileSync(join(testRoot, 'package.json'), JSON.stringify({ name: '@spaceflow/cli' }))
  })

  after(() => {
    rmSync(testRoot, { recursive: true, force: true })
  })

  it('应解析 {{package.name}} 为最近 package.json 的 name', () => {
    const filepath = join(srcDir, 'setup.ts')
    const result = resolveTemplate('{{package.name}}:{{filename}}', filepath)
    expect(result).to.equal('@spaceflow/cli:setup')
  })

  it('应解析 {{package_dirname}} 为最近 package.json 所在目录名', () => {
    const filepath = join(srcDir, 'setup.ts')
    const result = resolveTemplate('{{package_dirname}}:{{filename}}', filepath)
    expect(result).to.equal(`${basename(testRoot)}:setup`)
  })

  it('组合模板应正确解析所有变量', () => {
    const filepath = join(srcDir, 'setup.command.ts')
    const result = resolveTemplate('{{dirname}}:{{filename}}', filepath)
    expect(result).to.equal('commands:setup.command')
  })
})
