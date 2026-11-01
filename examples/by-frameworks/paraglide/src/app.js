import * as m from './paraglide/messages.js'
import { m as messages } from './paraglide/messages.js'

m.hello_world()
m['hello-world']({ name: 'Ada' })
messages.hello_world()
m['hello\x2dworld']()
other.hello_world()
console.log('m.hello_world()')
// m.hello_world()
function unrelated(m) { return m.hello_world() }
