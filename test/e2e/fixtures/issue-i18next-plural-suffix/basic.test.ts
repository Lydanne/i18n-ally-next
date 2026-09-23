import { expect, getExt, Global, is, not, openFile, setupTest, timeout } from '../../ctx'

setupTest('i18next plural suffixes (Issue: counted key has no bare entry)', () => {
  it('opens entry file', async () => {
    await openFile('src/App.tsx')
  })

  it('is active', () => {
    const ext = getExt()
    is(ext?.isActive, true)
  })

  it('enables react-i18next framework', async () => {
    await timeout(1000)
    not(Global, undefined)
    is(Global.enabled, true)
    is(Global.enabledFrameworks[0].id, 'react-i18next')
  })

  it('reads a bare key as before', async () => {
    await timeout(500)
    is(Global.loader.getValueByKey('translation:cart.title', 'en'), 'Your cart')
  })

  it('reads the _other form for a key used with a count', async () => {
    is(Global.loader.getValueByKey('translation:cart.items', 'en'), '{{count}} items')
    is(Global.loader.getValueByKey('translation:cart.items', 'fr'), '{{count}} articles')
  })

  it('falls back to another plural form when _other is absent', async () => {
    is(Global.loader.getValueByKey('translation:cart.removed', 'en'), 'One item removed')
  })

  it('points the node lookup at the plural form', async () => {
    is(Global.loader.getNodeByKey('translation:cart.items')?.keypath, 'translation:cart.items_other')
  })

  it('leaves the raw tree lookup and unknown keys untouched', async () => {
    is(Global.loader.getTreeNodeByKey('translation:cart.items'), undefined)
    is(Global.loader.getValueByKey('translation:cart.missing', 'en'), undefined)
    expect(Global.loader.keys).to.include('translation:cart.items_other')
  })
})
