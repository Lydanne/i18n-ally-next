# Python

## Framework Detection

i18n Ally Next automatically detects a Python project when any of the following files exists:

- `pyproject.toml`
- `requirements.txt`
- `setup.py`
- `setup.cfg`
- `Pipfile`
- A `.py` file in the project root

You can also force-enable Python support in `settings.json`:

```json
{
  "i18n-ally-next.enabledFrameworks": ["python"]
}
```

Currently, only regular `.py` files are supported.

## Recommended Project Structure

### Single Locale File per Language

```text
project/
├─ .vscode/
│  └─ settings.json
├─ locales/
│  ├─ zh-CN.json
│  └─ en.json
├─ pyproject.toml
├─ ...
└─ main.py
```

### Multiple Locale Files per Language

```text
project/
├─ .vscode/
│  └─ settings.json
├─ locales/
│  ├─ zh-CN/
│  │  ├─ module1.json
│  │  └─ module2.json
│  └─ en/
│     ├─ module1.json
│     └─ module2.json
├─ pyproject.toml
├─ ...
└─ main.py
```

## Usage Patterns

i18n Ally Next automatically recognizes the following Python translation calls:

```python
print(_("key.hello"))
print(gettext("key.hello"))
print(ngettext("key.hello"))
print(ugettext("key.hello"))
```

You can also define custom function names using regular expressions in the YAML configuration file. See [Custom Framework](./custom.md).

### Rename with F2

i18n Ally Next also supports renaming translation keys in Python code with F2.

Use the standard VS Code rename action on a gettext call or any other translation call recognized by the extension:

```python
print(_("hello.welcome"))
```

Place the cursor on `hello.welcome` and press F2. i18n Ally Next will find the corresponding key in the locale files and rename it.

> When filenames are used as namespaces, the rename action **cannot** move a key to another file. Update the locale files manually instead.

## Additional Notes on Automatic Hard-Coded String Extraction (Experimental)

### Generate `filename.text` Keys Automatically

If you want a one-off extraction of `print("Test")` in `loader.py` to suggest `loader.test` by default, with bulk extraction following the same rule, use the following configuration:

```json
{
  "i18n-ally-next.extract.keygenStrategy": "templateWithKeygen",
  "i18n-ally-next.extract.keygenTemplateWithKeygen": "{{filename}}",
  "i18n-ally-next.extract.keygenTemplateWithKeygenStrategy": "slug",
  "i18n-ally-next.extract.keygenStyle": "kebab-case"
}
```

Here, <code v-pre>{{filename}}</code> produces the `loader` prefix, while the key generator turns the text `Test` into `test`, resulting in the final key `loader.test`.

For a one-off extraction, the complete key appears in the input box and can still be edited. Bulk extraction has no per-entry input box, so it uses the complete generated key directly.

`keygenTemplateWithKeygen` supports <code v-pre>{{dirname}}</code>, <code v-pre>{{filename}}</code>, <code v-pre>{{package.name}}</code>, and <code v-pre>{{package_dirname}}</code>. When the template prefix has no trailing separator, `.` is used to join the parts. If the template ends with `.`, `:`, `/`, `_`, or `-`, that separator is preserved.

`keygenTemplateWithKeygenStrategy` controls how the final key segment is generated: `slug` creates a slug from the text, `source` uses the original translation text, and `random` creates a random key. All three strategies apply `keygenStyle` only to the final segment and do not change the hierarchy separators in the template prefix.

The existing `template` strategy is unchanged. It still uses the result of `keygenTemplate` as the complete key without appending a text-generated segment.

### Locale Entry Format After Extraction

Python string extraction supports the format selected by `i18n-ally-next.keystyle`. The default is `nested`.

For example, if `namespaceDelimiter` is set to `.` and the extraction key is `"hello.world"`, the resulting locale entry is:

```json
{
  "hello": {
    "world": "hello world"
  }
}
```

With the `flat` format, the locale file contains:

```json
{
  "hello.world": "hello world"
}
```

### F-string Support

In addition to regular strings, i18n Ally Next can extract Python f-strings.

Variable names in an f-string become placeholders in the extracted translation. For example:

```python
# Before extraction
print(f"Hello {name}")
```

The locale file will contain:

```json
{
  "hello": "Hello {name}"
}
```

Complex f-string expressions, such as calls, indexing, and arithmetic, are extracted as placeholders named `value`, `value2`, and so on. For example:

```python
# Before extraction
message = f"Price: {get_price():.2f}, Count: {items[0]}"
# After extraction
message = _("price").format(
    value=get_price(),
    value2=items[0],
)
```

#### Function Format After Extraction

The `format` mode is recommended for standard gettext usage:

```json
{
  "i18n-ally-next.extract.parsers.python.fStringArgumentStyle": "format"
}
```

For example:

```python
# Before extraction
message = f"Price: {get_price():.2f}, Count: {items[0]}"
# After extraction
message = _("price").format(
    value=get_price(),
    value2=items[0],
)
```

Alternatively, configure the extension to use `keyword-arguments` mode:

```json
{
  "i18n-ally-next.extract.parsers.python.fStringArgumentStyle": "keyword-arguments"
}
```

For example:

```python
# Before extraction
message = f"Price: {get_price():.2f}, Count: {items[0]}"
# After extraction
message = _("price", value=get_price(), value2=items[0])
```

This mode requires your project's `_()` function to accept keyword arguments.

For other output formats, define custom `i18n-ally-next.refactor.templates`.

For example, to replace an f-string with:

```python
translate("greeting", name=name)
```

Use this configuration:

```json
{
  "i18n-ally-next.refactor.templates": [
    {
      "source": "python-fstring",
      "template": "translate(\"{key}\"{namedArgs})"
    },
    {
      "source": "python-string",
      "template": "translate(\"{key}\")"
    }
  ]
}
```

Template variables:

- `{key}`: the translation key.
- `{namedArgs}`: expands to `, name=name, value=expression`.
- When an f-string has no interpolation arguments, `{namedArgs}` is an empty string.

### Extraction Filters

The following content is not extracted by default:

```python
"""module documentation"""

"Standalone string"

data = {
    "dictionary key": SomeValue
}

value: Literal["type annotation"] = SomeValue

payload = b"binary data"

_("already.translated")
gettext("already.translated")

Path("cache/directory")
re.compile("regular expression")
getattr(obj, "attribute_name")
eval("dynamic_expression")
```

**Dictionary keys** are filtered out, while user-facing **dictionary values can still be extracted**.

Examples of content that will be extracted include:

```python
print("Operation successful")
logger.info("User has logged in")
raise ValueError("Username is required")
parser.add_argument("--name", help="Enter a username")
```

#### Custom Ignored Functions

For example, to prevent strings passed to `api.query()` from being extracted:

```json
{
  "i18n-ally-next.extract.parsers.python.ignoredCalls": [
    "_",
    "gettext",
    "ngettext",
    "pgettext",
    "importlib.import_module",
    "Path",
    "re.compile",
    "getattr",
    "eval",
    "exec",
    "api.query"
  ]
}
```

The `ignoredCalls` array replaces the effective ignore list. When customizing it, retain the default entries your project still needs for gettext, paths, regular expressions, reflection, dynamic execution, and similar calls.
