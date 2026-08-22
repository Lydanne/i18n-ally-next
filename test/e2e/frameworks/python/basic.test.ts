import type { CodeAction } from 'vscode'
import type { DetectionResult, KeyInDocument } from '../../../../src/core/types'
import type { Framework } from '../../../../src/frameworks/base'
import { commands, Range, window } from 'vscode'
import { Commands, CurrentFile, expect, getExt, Global, is, KeyDetector, not, openFile, setupTest, timeout } from '../../ctx'

setupTest('Python', () => {
  it('opens the Python project marker', async () => {
    await openFile('pyproject.toml')
    await timeout(500)
  })

  it('activates and auto-detects the Python framework', () => {
    const ext = getExt()
    is(ext?.isActive, true)
    not(Global, undefined)
    is(Global.enabled, true)
    expect(Global.enabledFrameworks.map((framework: Framework) => framework.id)).to.deep.equal(['python'])
  })

  it('detects gettext usages and Python hard-coded strings', async () => {
    await openFile('app.py')
    await timeout(500)
    const document = window.activeTextEditor!.document
    expect(KeyDetector.getKeys(document).map((item: KeyInDocument) => item.key)).to.include('existing.key')

    const detections = await CurrentFile.detectHardStrings(true)
    expect(detections?.map((detection: DetectionResult) => ({
      text: detection.text,
      source: detection.source,
      namedArgs: detection.namedArgs,
    }))).to.deep.equal([
      {
        text: 'Welcome back',
        source: 'python-string',
        namedArgs: [],
      },
      {
        text: 'Hello {name}, profile {name2!r}',
        source: 'python-fstring',
        namedArgs: [
          { name: 'name', expression: 'name', order: 0 },
          { name: 'name2', expression: 'user.name', order: 1 },
        ],
      },
    ])
  })

  it('provides the Python replacement and extraction quick fix', async () => {
    const document = window.activeTextEditor!.document
    const detection: DetectionResult | undefined = CurrentFile.hardStrings?.find((item: DetectionResult) => item.source === 'python-fstring')
    if (!detection)
      throw new Error('Expected a Python f-string detection')
    expect(Global.interpretRefactorTemplates('welcome.message', [], document, detection)[0])
      .to
      .equal(`_("welcome.message", name=name, name2=user.name)`)

    const range = new Range(document.positionAt(detection.start), document.positionAt(detection.end))
    const actions = await commands.executeCommand<CodeAction[]>('vscode.executeCodeActionProvider', document.uri, range)
    expect(actions.some(action => action.command?.command === Commands.extract_text)).to.equal(true)
  })
})
