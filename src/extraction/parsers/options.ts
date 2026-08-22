export interface ExtractionHTMLOptions {
  /**
   * HTML attributes to extract
   *
   * @default ['title', 'alt', 'placeholder', 'label', 'aria-label']
   */
  attributes?: string[]

  /**
   * HTML tags to be ignored
   *
   * @default ['script', 'style']
   */
  ignoredTags?: string[]

  /**
   * Extract Vue v-bind syntax
   *
   * @default true
   */
  vBind?: boolean

  /**
   * TODO: Extract inline text in HTML
   *
   * @default true
   */
  inlineText?: boolean
}

export interface ExtractionBabelOptions {
  /**
   * HTML tags to be ignored
   *
   * @default ['class', 'className', 'key', 'style', 'ref', 'onClick']
   */
  ignoredJSXAttributes?: string[]
}

export type PythonFStringArgumentStyle = 'keyword-arguments' | 'format'

export interface ExtractionPythonOptions {
  /**
   * How named f-string interpolation arguments are applied.
   *
   * @default 'keyword-arguments'
   */
  fStringArgumentStyle?: PythonFStringArgumentStyle

  /**
   * Calls whose string arguments should not be extracted. Both simple and
   * qualified call names are supported.
   */
  ignoredCalls?: string[]

  /**
   * Python line-comment directives that suppress hard-coded string extraction
   * on the same physical line. The leading `#` is optional.
   *
   * @default ['i18n-ally-ignore']
   */
  ignoredLineComments?: string[]
}
