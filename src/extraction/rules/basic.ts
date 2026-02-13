import { ExtractionRule, ExtractionScore } from './base'

/** 常见非文案模式：文件路径、URL、CSS 类名、颜色值、技术标识符等 */
const TECHNICAL_PATTERNS: readonly RegExp[] = [
  /^[./\\]/, // 文件路径
  /^https?:\/\//, // URL
  /^[a-z]+:\/\//, // 协议
  /^#[0-9a-f]{3,8}$/i, // 颜色值
  /^rgba?\(/, // rgb/rgba
  /^\d+(\.\d+)?(px|em|rem|vh|vw|%|s|ms)$/, // CSS 单位
  /^[a-z][\w-]*\.[a-z][\w-]*/i, // 点分标识符 (e.g. module.exports)
  /^@[a-z]/i, // @ 前缀 (e.g. @click, @import)
  /^data-[a-z]/i, // data 属性
  /^aria-[a-z]/i, // aria 属性
  /^on[A-Z]/, // 事件处理器
  /^\$/, // $ 前缀变量
  /^__/, // 双下划线前缀
  /^[a-z]+_[a-z]+(_[a-z]+)*$/i, // snake_case 标识符
  /^[a-z]+-[a-z]+(-[a-z]+)*$/i, // kebab-case 标识符 (CSS 类名等)
  /^\.[a-z]/i, // CSS 类选择器
  /^[*>+~]$/, // CSS 选择器符号
  /^\w+\/\w+/, // MIME 类型或路径
  /^[a-z]+\([^)]*\)$/i, // 函数调用形式
]

/** 常见技术关键词，不应被识别为文案 */
const TECHNICAL_KEYWORDS: ReadonlySet<string> = new Set('div,span,input,button,form,label,select,option,table,tr,td,th,thead,tbody,img,a,p,h1,h2,h3,h4,h5,h6,ul,ol,li,nav,header,footer,main,section,article,aside,pre,code,textarea,svg,path,circle,rect,line,polygon,true,false,null,undefined,NaN,Infinity,GET,POST,PUT,DELETE,PATCH,HEAD,OPTIONS,utf-8,utf8,ascii,base64,hex,binary,json,xml,html,css,text,blob,click,change,submit,focus,blur,keydown,keyup,mousedown,mouseup,mouseover,mouseout,scroll,resize,flex,grid,block,inline,none,hidden,visible,absolute,relative,fixed,sticky,static,center,left,right,top,bottom,bold,normal,italic,inherit,initial,unset,auto,string,number,boolean,object,function,symbol,default,export,import,require,module,production,development,test,error,warn,info,debug,log,verbose,asc,desc,id,key,type,name,value,index,src,href'.split(','))

/**
 * 判断字符串是否匹配技术模式
 */
function isTechnicalString(s: string): boolean {
  if (TECHNICAL_KEYWORDS.has(s) || TECHNICAL_KEYWORDS.has(s.toLowerCase()))
    return true
  return TECHNICAL_PATTERNS.some(p => p.test(s))
}

export class BasicExtrationRule extends ExtractionRule {
  name = 'basic'

  shouldExtract(str: string) {
    const s = str.replace(/\$\{.*?\}/g, '').replace(/\{\{.*?\}\}/g, '').trim()

    if (s.length === 0)
      return ExtractionScore.MustExclude
    // ❌ brackets
    if (s.match(/^\{.*\}$/))
      return ExtractionScore.MustExclude
    // ❌ 技术性字符串（路径、URL、CSS 类名、关键词等）
    if (isTechnicalString(s))
      return ExtractionScore.MustExclude
    // ❌ camel case
    if (s.match(/[a-z][A-Z0-9]/))
      return ExtractionScore.ShouldExclude
    // ❌ all lower cases
    if (s.match(/^[a-z0-9-]+$/))
      return ExtractionScore.ShouldExclude
    // ❌ all upper cases
    if (s.match(/^[A-Z0-9-]+$/))
      return ExtractionScore.ShouldExclude
    // ❌ all digits
    if (s.match(/^[\d.]+$/))
      return ExtractionScore.ShouldExclude
    // ❌ 纯符号或特殊字符（不含任何 Unicode 字母）
    if (!s.match(/\p{Letter}/u))
      return ExtractionScore.MustExclude
    // ✅ has a space, and any meaningful letters (not just technical tokens)
    if (s.includes(' ') && s.match(/[a-z]{2,}/i))
      return ExtractionScore.ShouldInclude
    // ✅ all words (at least 2 chars to avoid single-letter false positives)
    if (s.length >= 2 && s.match(/^[A-Z][a-z]+$/))
      return ExtractionScore.ShouldInclude
  }
}
