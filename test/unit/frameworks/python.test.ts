import { mkdirSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { expect } from 'chai'
import packageJson from '../../../package.json'
import {
  DEFAULT_PYTHON_IGNORED_CALLS,
  DEFAULT_PYTHON_IGNORED_LINE_COMMENTS,
} from '../../../src/extraction/parsers/python'
import { buildPythonRefactorTemplate, isPythonProject } from '../../../src/frameworks/python-utils'
import { applyRefactorTemplate } from '../../../src/utils/resolveRefactorTemplate'

const namedArgs = [
  { name: 'name', expression: 'user.name', order: 0 },
  { name: 'value', expression: 'load_value()', order: 1 },
]

describe('python framework helpers', () => {
  it('builds keyword-argument and format replacements', () => {
    expect(buildPythonRefactorTemplate('welcome.title', namedArgs, 'keyword-arguments'))
      .to
      .equal(`_("welcome.title", name=user.name, value=load_value())`)
    expect(buildPythonRefactorTemplate('welcome.title', namedArgs, 'format'))
      .to
      .equal(`_("welcome.title").format(name=user.name, value=load_value())`)
    expect(buildPythonRefactorTemplate('welcome.title', [], 'keyword-arguments'))
      .to
      .equal(`_("welcome.title")`)
  })

  it('expands the custom namedArgs template variable', () => {
    expect(applyRefactorTemplate(`translate("{key}"{namedArgs})`, 'welcome.title', [], namedArgs))
      .to
      .equal(`translate("welcome.title", name=user.name, value=load_value())`)
    expect(applyRefactorTemplate(`translate("{key}"{namedArgs})`, 'plain.title'))
      .to
      .equal(`translate("plain.title")`)
  })

  it('keeps the configured ignored-call defaults aligned with the parser', () => {
    const configured = packageJson.contributes.configuration.properties['i18n-ally-next.extract.parsers.python.ignoredCalls'].default
    expect(configured).to.deep.equal([...DEFAULT_PYTHON_IGNORED_CALLS])
  })

  it('keeps the configured ignored-comment defaults aligned with the parser', () => {
    const configured = packageJson.contributes.configuration.properties['i18n-ally-next.extract.parsers.python.ignoredLineComments'].default
    expect(configured).to.deep.equal([...DEFAULT_PYTHON_IGNORED_LINE_COMMENTS])
  })

  it('detects Python project markers and root Python files', () => {
    const markerRoot = join(tmpdir(), `i18n-ally-python-marker-${Date.now()}`)
    const fileRoot = join(tmpdir(), `i18n-ally-python-file-${Date.now()}`)
    const emptyRoot = join(tmpdir(), `i18n-ally-python-empty-${Date.now()}`)
    mkdirSync(markerRoot, { recursive: true })
    mkdirSync(fileRoot, { recursive: true })
    mkdirSync(emptyRoot, { recursive: true })
    try {
      writeFileSync(join(markerRoot, 'pyproject.toml'), '[project]')
      writeFileSync(join(fileRoot, 'app.py'), 'print("hello")')
      expect(isPythonProject(markerRoot)).to.equal(true)
      expect(isPythonProject(fileRoot)).to.equal(true)
      expect(isPythonProject(emptyRoot)).to.equal(false)
    }
    finally {
      rmSync(markerRoot, { recursive: true, force: true })
      rmSync(fileRoot, { recursive: true, force: true })
      rmSync(emptyRoot, { recursive: true, force: true })
    }
  })
})
