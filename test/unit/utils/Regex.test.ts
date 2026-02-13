import { expect } from 'chai'
import { findCallExpressionEnd, findCallExpressionStart } from '../../../src/utils/call-expression'

describe('findCallExpressionStart', () => {
  it('简单函数调用 t("key")', () => {
    const text = 't("key")'
    const matchString = 't("key"'
    const matchIndex = 0
    expect(findCallExpressionStart(text, matchIndex, matchString)).to.equal(0)
  })

  it('带空格前缀的函数调用 " t("key")"', () => {
    const text = '  t("key")'
    const matchString = '  t("key"'
    const matchIndex = 0
    expect(findCallExpressionStart(text, matchIndex, matchString)).to.equal(2)
  })

  it('带 $ 前缀的函数调用 $t("key")', () => {
    const text = '$t("key")'
    const matchString = '$t("key"'
    const matchIndex = 0
    expect(findCallExpressionStart(text, matchIndex, matchString)).to.equal(0)
  })

  it('带命名空间的函数调用 i18n.t("key")', () => {
    const text = 'i18n.t("key")'
    const matchString = 'i18n.t("key"'
    const matchIndex = 0
    expect(findCallExpressionStart(text, matchIndex, matchString)).to.equal(0)
  })

  it('嵌套在外层函数调用中 console.error(t("key"))', () => {
    const text = 'console.error(t("key"))'
    //                          ^ matchIndex = 14
    const matchString = 't("key"'
    const matchIndex = 14
    expect(findCallExpressionStart(text, matchIndex, matchString)).to.equal(14)
  })

  it('正则匹配包含外层括号 (t("key")', () => {
    const text = 'console.error(t("key"))'
    //                         ^ matchIndex = 13, matchString 包含了外层 (
    const matchString = '(t("key"'
    const matchIndex = 13
    // 应该返回 t 的位置 (14)，而不是 ( 的位置 (13)
    expect(findCallExpressionStart(text, matchIndex, matchString)).to.equal(14)
  })

  it('没有括号的匹配字符串', () => {
    const text = 'some text'
    const matchString = 'some'
    const matchIndex = 0
    expect(findCallExpressionStart(text, matchIndex, matchString)).to.equal(0)
  })

  it('多层嵌套括号 fn1(fn2(t("key")))', () => {
    const text = 'fn1(fn2(t("key")))'
    const matchString = '(t("key"'
    const matchIndex = 7
    // 应该返回 t 的位置 (8)
    expect(findCallExpressionStart(text, matchIndex, matchString)).to.equal(8)
  })
})

describe('findCallExpressionEnd', () => {
  it('简单函数调用 t("key")', () => {
    const text = 't("key")'
    // pos 从 key 的引号后开始，即 "key" 之后
    const pos = 7 // 指向 )
    expect(findCallExpressionEnd(text, pos)).to.equal(8)
  })

  it('带额外参数 t("key", { error: msg })', () => {
    const text = 't("key", { error: msg })'
    const pos = 7 // "key" 之后
    expect(findCallExpressionEnd(text, pos)).to.equal(text.length)
  })

  it('嵌套括号 t("key", fn())', () => {
    const text = 't("key", fn())'
    const pos = 7
    expect(findCallExpressionEnd(text, pos)).to.equal(text.length)
  })

  it('字符串中包含括号 t("key", "a(b)")', () => {
    const text = 't("key", "a(b)")'
    const pos = 7
    expect(findCallExpressionEnd(text, pos)).to.equal(text.length)
  })

  it('字符串中包含转义引号 t("key", "a\\"b")', () => {
    const text = 't("key", "a\\"b")'
    const pos = 7
    expect(findCallExpressionEnd(text, pos)).to.equal(text.length)
  })

  it('找不到右括号时返回原始位置', () => {
    const text = 't("key"'
    const pos = 7
    expect(findCallExpressionEnd(text, pos)).to.equal(pos)
  })

  it('模板字符串中包含括号', () => {
    // eslint-disable-next-line no-template-curly-in-string
    const text = 't("key", `a(${b})`)'
    const pos = 7
    // 模板字符串中的 ( 被跳过
    expect(findCallExpressionEnd(text, pos)).to.equal(text.length)
  })
})
