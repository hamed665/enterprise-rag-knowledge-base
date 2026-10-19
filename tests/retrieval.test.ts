import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtemp, writeFile, symlink, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { answer, buildIndex, evaluate, search } from '../lib/retrieval'
import { ingestDirectory } from '../lib/ingestion'

const docs = [{ path: 'delivery.md', text: '# Delivery\nDelivery takes three days.' }, { path: 'retention.md', text: '# Retention\nTranscripts expire after thirty days.' }]

test('ingestion is deterministic regardless of input order and retains source offsets', () => {
  const first = buildIndex(docs)
  assert.deepEqual(first, buildIndex([...docs].reverse()))
  assert.equal(answer(first, 'delivery').citations[0].source, 'delivery.md')
  assert.equal(answer(first, 'delivery').citations[0].offset, 0)
})

test('overlapping chunks are bounded and unicode codepoints survive', () => {
  const index = buildIndex([{ path: 'long.txt', text: '🌎'.repeat(300) }], 100, 20)
  assert.equal(index.chunks.length, 4)
  assert.equal(Array.from(index.chunks[0].text).length, 100)
  assert.equal(index.chunks[1].offset, 80)
})

test('empty and unsupported questions abstain without fabricated citations', () => {
  assert.equal(answer(buildIndex(docs), 'quantum telescope').abstained, true)
  assert.deepEqual(answer(buildIndex([]), 'delivery').citations, [])
  assert.throws(() => search(buildIndex(docs), ' '))
  assert.throws(() => search(buildIndex(docs), 'x'.repeat(2001)))
})

test('invalid documents, duplicate paths and chunk settings are rejected', () => {
  assert.throws(() => buildIndex([{ path: '../secret.md', text: 'x' }]))
  assert.throws(() => buildIndex([docs[0], docs[0]]))
  assert.throws(() => buildIndex(docs, 100, 100))
  assert.throws(() => buildIndex([{ path: 'big.md', text: 'x'.repeat(200001) }]))
})

test('content changes invalidate corpus hash and chunk identity', () => {
  const first = buildIndex(docs)
  const second = buildIndex([{ ...docs[0], text: 'New delivery policy.' }, docs[1]])
  assert.notEqual(first.corpusHash, second.corpusHash)
  assert.notEqual(first.chunks[0].id, second.chunks[0].id)
})

test('evaluation distinguishes rank, misses, and correct abstention', () => {
  const result = evaluate(buildIndex(docs), [{ question: 'delivery', expectedSource: 'delivery.md' }, { question: 'unknown', expectedSource: null }])
  assert.equal(result.retrievalAndAbstentionAccuracy, 1)
  assert.equal(result.meanReciprocalRank, 1)
  assert.throws(() => evaluate(buildIndex(docs), []))
})

test('directory ingestion ignores hidden files and rejects symlink traversal', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'rag-ingest-'))
  try {
    await writeFile(join(folder, 'policy.md'), 'Demo policy')
    await writeFile(join(folder, '.private.md'), 'Hidden')
    assert.equal((await ingestDirectory(folder)).chunks.length, 1)
    await symlink(join(folder, 'policy.md'), join(folder, 'alias.md'))
    await assert.rejects(ingestDirectory(folder), /Symlinks/)
  } finally { await rm(folder, { recursive: true }) }
})
