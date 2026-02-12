import type { Parser } from './base'
import { EcmascriptParser } from './ecmascript'
import { FluentParser } from './ftl'
import { IniParser } from './ini'
import { JsonParser } from './json'
import { Json5Parser } from './json5'
import { PhpParser } from './php'
import { PoParser } from './po'
import { Properties } from './properties'
import { YamlParser } from './yaml'

export const DefaultEnabledParsers = ['json', 'yaml', 'json5']

export const AvailableParsers: Parser[] = [
  // enabled parsers
  new JsonParser(),
  new YamlParser(),
  new Json5Parser(),

  // available parsers
  new EcmascriptParser('js'),
  new EcmascriptParser('ts'),
  new IniParser(),
  new PoParser(),
  new PhpParser(),
  new Properties(),
  new FluentParser(),
]
