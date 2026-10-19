import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { setTimeout } from 'node:timers/promises'
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '3196'], { stdio: 'ignore' })
try {
  let ready = false
  for (let attempt = 0; attempt < 100; attempt++) {
    try { ready = (await fetch('http://127.0.0.1:3196/')).status === 200; if (ready) break } catch {}
    await setTimeout(200)
  }
  assert.ok(ready, 'Server readiness timeout')
  const request = (body) => fetch('http://127.0.0.1:3196/api/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })
  const response = await request(JSON.stringify({ question: 'delivery' }))
  assert.equal(response.status, 200)
  assert.equal((await response.json()).citations[0].source, 'delivery.md')
  assert.equal((await (await request(JSON.stringify({ question: 'quantum telescope orbit' }))).json()).abstained, true)
  assert.equal((await request('{')).status, 400)
  assert.equal((await request('x'.repeat(4097))).status, 413)
  assert.equal((await fetch('http://127.0.0.1:3196/api/search')).status, 405)
  console.log('PASS: built UI and search API, citations, abstention, validation, request limit, and method guard')
} finally { server.kill('SIGTERM') }
