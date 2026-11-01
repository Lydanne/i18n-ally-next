<template>
  <div>{{ m.hello_world() }}</div>
  <script>import * as m from './paraglide/messages.js'; m.fake()</script>
</template>
<script>
import * as m from './paraglide/messages.js'
m.hello_world()
</script>
