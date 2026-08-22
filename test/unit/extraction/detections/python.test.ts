import { expect } from 'chai'
import { extractionsParsers } from '../../../../src/extraction'
import { parseStringExpression } from '../../../../src/extraction/parsers/python'

const python = extractionsParsers.python

describe('detections - python', () => {
  it('extracts Python string forms, escapes, Unicode, and implicit concatenation', () => {
    const source = [
      `single = 'Hello world'`,
      `double = "Welcome back"`,
      `triple = '''First line\nSecond line'''`,
      String.raw`escaped = "Line one\nLine two \u4f60\u597d"`,
      String.raw`raw = r"Raw message\nfor user"`,
      `continued = ("Implicit " "string value")`,
      `upper_prefix = R"Upper raw message"`,
      `bytes_value = b"Binary payload"`,
      `raw_bytes = rb"Another binary payload"`,
    ].join('\n')

    const result = python.detect(source)
    expect(result.map(item => item.text)).to.deep.equal([
      'Hello world',
      'Welcome back',
      'First line\nSecond line',
      'Line one\nLine two 你好',
      String.raw`Raw message\nfor user`,
      'Implicit string value',
      'Upper raw message',
    ])
    expect(result.map(item => source.slice(item.start, item.end))).to.deep.equal([
      `'Hello world'`,
      `"Welcome back"`,
      `'''First line\nSecond line'''`,
      String.raw`"Line one\nLine two \u4f60\u597d"`,
      String.raw`r"Raw message\nfor user"`,
      `"Implicit " "string value"`,
      `R"Upper raw message"`,
    ])
  })

  it('converts f-strings to stable named placeholders', () => {
    const source = [
      `greeting = f"Hello {name}"`,
      `price_text = f"Price: {price:.2f}"`,
      `details = f"User {user.name!r}, {get_value()}, {items[0]}, {a + b}"`,
      `collisions = f"Hello {name}, {name}, {user.name}, {other.name}"`,
      `evaluation = f"Values {value}, {load()}, {load()}"`,
      `raw_format = rf"Raw path {path.name!s}"`,
    ].join('\n')

    const result = python.detect(source)
    expect(result.map(item => item.text)).to.deep.equal([
      'Hello {name}',
      'Price: {price:.2f}',
      'User {name!r}, {value}, {value2}, {value3}',
      'Hello {name}, {name}, {name2}, {name3}',
      'Values {value}, {value2}, {value3}',
      'Raw path {name!s}',
    ])
    expect(result[2].namedArgs).to.deep.equal([
      { name: 'name', expression: 'user.name', order: 0 },
      { name: 'value', expression: 'get_value()', order: 1 },
      { name: 'value2', expression: 'items[0]', order: 2 },
      { name: 'value3', expression: 'a + b', order: 3 },
    ])
    expect(result[3].namedArgs).to.deep.equal([
      { name: 'name', expression: 'name', order: 0 },
      { name: 'name2', expression: 'user.name', order: 1 },
      { name: 'name3', expression: 'other.name', order: 2 },
    ])
    expect(result[4].namedArgs).to.deep.equal([
      { name: 'value', expression: 'value', order: 0 },
      { name: 'value2', expression: 'load()', order: 1 },
      { name: 'value3', expression: 'load()', order: 2 },
    ])
  })

  it('preserves conversion, nested format specs, debug text, and evaluation order', () => {
    const source = [
      `nested = f"Value {amount:{width}.{precision}f}"`,
      `converted = f"Object {item!a:>20}"`,
      `debug = f"Result {result=}"`,
    ].join('\n')

    const result = python.detect(source)
    expect(result.map(item => item.text)).to.deep.equal([
      'Value {amount:{width}.{precision}f}',
      'Object {item!a:>20}',
      'Result result={result!r}',
    ])
    expect(result[0].namedArgs).to.deep.equal([
      { name: 'amount', expression: 'amount', order: 0 },
      { name: 'width', expression: 'width', order: 1 },
      { name: 'precision', expression: 'precision', order: 2 },
    ])
  })

  it('preserves escaped braces when formatting and collapses them without interpolation', () => {
    const source = [
      `formatted = f"Use {{literal}} with {name}"`,
      `literal = f"Use {{literal}} braces"`,
    ].join('\n')

    expect(python.detect(source).map(item => item.text)).to.deep.equal([
      'Use {{literal}} with {name}',
      'Use {literal} braces',
    ])
  })

  it('filters non-translatable Python contexts and retains user-facing calls', () => {
    const source = [
      `"""Module documentation text"""`,
      `def function():`,
      `    """Function documentation text"""`,
      `    "Standalone marker text"`,
      `    values = {"Visible dictionary key": "Visible dictionary value"}`,
      `    nested_values = {("Nested " "dictionary key"): "Nested dictionary value"}`,
      `    kind: Literal["Visible type annotation"] = "Visible assignment value"`,
      `    translated = _("Already translated text")`,
      `    translated2 = gettext("Already translated value")`,
      `    imported = importlib.import_module("Some dynamic module")`,
      `    path = Path("Some directory name")`,
      String.raw`    regex = re.compile("Some regular expression")`,
      `    reflected = getattr(obj, "Some attribute name")`,
      `    executed = eval("Some dynamic expression")`,
      `    print("Print this message")`,
      `    logger.info("Log this message")`,
      `    parser.add_argument("--name", help="Your display name")`,
      `    raise ValueError("Bad input value")`,
      `match status:`,
      `    case "Visible match literal":`,
      `        print("Matched status message")`,
    ].join('\n')

    expect(python.detect(source).map(item => item.text)).to.deep.equal([
      'Visible dictionary value',
      'Nested dictionary value',
      'Visible assignment value',
      'Print this message',
      'Log this message',
      'Your display name',
      'Bad input value',
      'Matched status message',
    ])
  })

  it('supports simple and qualified ignored call configuration', () => {
    const source = [
      `one = custom.skip("Skip this custom text")`,
      `two = other.skip("Skip this qualified text")`,
      `three = custom.keep("Keep this custom text")`,
    ].join('\n')

    expect(python.detect(source, undefined, { ignoredCalls: ['custom.skip'] }).map(item => item.text)).to.deep.equal([
      'Skip this qualified text',
      'Keep this custom text',
    ])
    expect(python.detect(source, undefined, { ignoredCalls: ['skip'] }).map(item => item.text)).to.deep.equal([
      'Keep this custom text',
    ])
  })

  it('ignores strings on lines with an ignored line-comment directive', () => {
    const source = [
      `ignored = "Generated identifier" # i18n-ally-ignore`,
      `ignored_with_reason = f"Generated value {name}" # i18n-ally-ignore: not user-facing`,
      `first = "First generated value"; second = "Second generated value" # i18n-ally-ignore generated values`,
      `inside_string = "保留 # i18n-ally-ignore 作为文本"`,
      `# i18n-ally-ignore`,
      `next_line = "Keep the next line"`,
      `similar = "Keep a similar directive" # i18n-ally-ignore-extra`,
      `unrelated = "Keep an unrelated comment" # noqa`,
    ].join('\n')

    expect(python.detect(source).map(item => item.text)).to.deep.equal([
      '保留 # i18n-ally-ignore 作为文本',
      'Keep the next line',
      'Keep a similar directive',
      'Keep an unrelated comment',
    ])
  })

  it('supports custom ignored line-comment directives', () => {
    const source = [
      `custom = "Ignore custom directive" # noqa: I18N`,
      `default_directive = "Keep default directive" # i18n-ally-ignore`,
    ].join('\n')

    expect(python.detect(source, undefined, { ignoredLineComments: ['# noqa'] }).map(item => item.text)).to.deep.equal([
      'Keep default directive',
    ])
    expect(python.detect(source, undefined, { ignoredLineComments: [] }).map(item => item.text)).to.deep.equal([
      'Ignore custom directive',
      'Keep default directive',
    ])
  })

  it('recovers after incomplete literals and skips uncertain boundaries', () => {
    const source = [
      `broken = "Unclosed text`,
      `valid = "Still valid text"`,
      `broken_f = f"Hello {name"`,
      `last = 'Last valid text'`,
    ].join('\n')

    expect(python.detect(source).map(item => item.text)).to.deep.equal([
      'Still valid text',
      'Last valid text',
    ])
  })

  it('parses a selected literal without treating it as a standalone statement', () => {
    expect(parseStringExpression(`f"Hello {user.name} from {load_place()}"`)).to.deep.equal({
      text: 'Hello {name} from {value}',
      source: 'python-fstring',
      namedArgs: [
        { name: 'name', expression: 'user.name', order: 0 },
        { name: 'value', expression: 'load_place()', order: 1 },
      ],
    })
  })
})
