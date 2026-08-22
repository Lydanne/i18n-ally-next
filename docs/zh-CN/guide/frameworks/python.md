# Python
## 框架识别
项目中存在以下任一文件时，插件会自动识别 Python framework：

- `pyproject.toml`
- `requirements.txt`
- `setup.py`
- `setup.cfg`
- `Pipfile`
- 项目根目录下的 `.py` 文件

也可以在 `settings.json` 中强制启用

```json
{
    "i18n-ally-next.enabledFrameworks": ["python"]
}
```

当前，插件仅支持普通 `.py` 文件。

## 推荐的项目结构
### 单个语言文件模式

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

### 多个语言文件模式

```text
project/
├─ .vscode/
│  └─ settings.json
├─ locales/
│  ├─ zh-CN/
|  |  ├─ module1.json
|  |  ├─ module2.json
│  └─ en/
|  |  ├─ module1.json
|  |  ├─ module2.json
├─ pyproject.toml
├─ ...
└─ main.py
```

## 使用方式

i18n Ally Next 支持自动识别 Python 的如下用法

```python
print(_("key.hello"))
print(gettext("key.hello"))
print(ngettext("key.hello"))
print(ugettext("key.hello"))
```

同时，可以通过yaml配置文件中正则匹配来指定自定义的函数名，参见[自定义框架](./custom.md)

### 快捷键重命名
i18n Ally Next 同时为 Python 代码中 F2 快捷重命名提供了支持。

在 Python 源码中的 gettext 调用或插件能够识别的翻译调用中，可以使用 VS Code 的标准重命名功能：

```python
print(_("hello.welcome"))
```

当光标位于 `hello.welcome` 上时，按下 F2 键即可重命名，i18n Ally Next 会自动在语言包中查找对应的 key 并进行重命名。

> 当使用文件名作为 namespace 时，重命名功能**不能**将 key 移动到其他文件中。请手动处理语言包文件。

## 有关自动提取硬编码字符串的额外说明 (Experimental)
### 自动生成“文件名.文本 key”

如果希望 `loader.py` 中的 `print("Test")` 在单条提取时默认建议 `loader.test`，并让批量提取使用相同规则，可以配置：

```json
{
    "i18n-ally-next.extract.keygenStrategy": "templateWithKeygen",
    "i18n-ally-next.extract.keygenTemplateWithKeygen": "{{filename}}",
    "i18n-ally-next.extract.keygenTemplateWithKeygenStrategy": "slug",
    "i18n-ally-next.extract.keygenStyle": "kebab-case"
}
```

其中 <code v-pre>{{filename}}</code> 生成前缀 `loader`，文本 `Test` 继续通过 key 生成器得到 `test`，最终 key 为 `loader.test`。

单条提取会将完整 key 放入输入框，用户仍可手动修改；批量提取没有逐条输入框，会直接使用自动生成的完整 key。

`keygenTemplateWithKeygen` 支持 <code v-pre>{{dirname}}</code>、<code v-pre>{{filename}}</code>、<code v-pre>{{package.name}}</code> 和 <code v-pre>{{package_dirname}}</code>。模板前缀没有结尾分隔符时使用 `.` 连接；模板以 `.`, `:`, `/`, `_` 或 `-` 结尾时保留该分隔符。

`keygenTemplateWithKeygenStrategy` 决定最后一段 key 的生成方式：`slug` 根据文本生成 slug，`source` 使用原始翻译文本，`random` 使用随机 key。三种方式都会只对最后一段应用 `keygenStyle`，不会改变模板前缀的层级分隔符。

原有 `template` 策略保持不变，它仍然把 `keygenTemplate` 结果作为完整 key，不追加文本生成部分。

### 提取后格式

Python字符串提取支持 `i18n-ally-next.keystyle` 配置项中指定的格式，默认使用 `nested` 格式。

例如，如果设置了 `namespaceDelimiter` 为 `.`，且提取字符串时设置 `key` 为 `"hello.world"`，则提取后的翻译文本如下：

```json
{
  "hello": {
    "world": "hello world"
  }
}
```

使用 `flat` 格式时，提取后的语言包内容如下：

```json
{
  "hello.world": "hello world"
}
```

### f-string 支持
除了普通的字符串之外，i18n Ally Next 还支持提取 f-string 字符串

提取后的 key 会将 f-string 中的变量名作为占位符，示例如下：

```python
# 提取前
print(f"Hello {name}")
```

语言包中的翻译文本

```json
{
  "hello": "Hello {name}"
}
```

面对 f-string 中有复杂表达式（调用/索引/运算等）的情况，i18n Ally Next 会将其提取为占位符 `value1`、`value2` 等，示例如下：

```python
# 提取前
message = f"Price：{get_price():.2f}，Count：{items[0]}"
# 提取后
message = _("price").format(
    value=get_price(),
    value2=items[0],
)
```

#### 提取后函数格式

标准 gettext 用户推荐推荐使用 `format` 模式：

```json
{
  "i18n-ally-next.extract.parsers.python.fStringArgumentStyle": "format"
}
```
示例如下：
```python
# 提取前
message = f"Price：{get_price():.2f}，Count：{items[0]}"
# 提取后
message = _("price").format(
    value=get_price(),
    value2=items[0],
)
```

除此之外，插件支持还可配置为 `keyword-arguments` 模式：

```json
{
  "i18n-ally-next.extract.parsers.python.fStringArgumentStyle": "keyword-arguments"
}
```

示例如下：

```python
# 提取前
message = f"Price：{get_price():.2f}，Count：{items[0]}"
# 提取后
message = _("price", value=get_price(), value2=items[0])
```

该模式要求项目中的 `_()` 函数支持关键字参数传递

若希望使用其他格式，可以通过自定义 `i18n-ally-next.refactor.templates` 配置项来实现。

例如，希望 f-string 被替换为：

```python
translate("greeting", name=name)
```

可以配置：

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

模板变量：

- `{key}`：翻译 key。
- `{namedArgs}`：展开为 `, name=name, value=expression`。
- f-string 没有插值参数时，`{namedArgs}` 为空字符串。

### 提取过滤
以下内容默认不会被提取：

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

**字典键**会被过滤，但可能面向用户的**字典值仍可被提取**。

以下会被提取（包含但不限于）：

```python
print("操作成功")
logger.info("用户已经登录")
raise ValueError("用户名不能为空")
parser.add_argument("--name", help="请输入用户名")
```

#### 自定义忽略函数
例如，不希望提取 `api.query()` 参数中的字符串：

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

`ignoredCalls` 数组会成为实际使用的忽略列表。自定义时，应保留项目仍然需要的 gettext、路径、正则、反射和动态执行等默认项。

#### 使用注释忽略物理行

在 Python 行中添加 `# i18n-ally-ignore`，即可忽略该物理行中的所有硬编码字符串：

```python
machine_code = "ERR_CONNECTION_RESET"  # i18n-ally-ignore
```

指令后可以使用空格或冒号补充原因：

```python
machine_code = "ERR_CONNECTION_RESET"  # i18n-ally-ignore: 协议常量
```

若要使用其他指令，可以配置 `ignoredLineComments`。开头的 `#` 可以省略；配置的数组会替换默认指令列表：

```json
{
  "i18n-ally-next.extract.parsers.python.ignoredLineComments": [
    "noqa: I18N",
    "project-ignore-i18n"
  ]
}
```
