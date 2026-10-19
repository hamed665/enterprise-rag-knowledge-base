import { createHash } from 'node:crypto'

export type SourceDocument = { path: string; text: string }
export type Chunk = { id: string; source: string; title: string; offset: number; text: string }
export type Index = { schemaVersion: 1; corpusHash: string; chunks: Chunk[] }

const hash = (text: string) => createHash('sha256').update(text).digest('hex')
const stopwords = new Set('a an the is are what how when does do in on to of and for with can i my'.split(' '))

export function tokens(text: string): string[] {
  return (text.normalize('NFKC').toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []).filter(word => !stopwords.has(word))
}

export function buildIndex(documents: SourceDocument[], size = 600, overlap = 100): Index {
  if (!Number.isInteger(size) || !Number.isInteger(overlap) || size < 100 || overlap < 0 || overlap >= size) throw new Error('Invalid chunk settings')
  if (documents.length > 100) throw new Error('Maximum 100 documents')
  const seen = new Set<string>()
  const sorted = [...documents].sort((a, b) => a.path.localeCompare(b.path))
  const chunks: Chunk[] = []
  for (const document of sorted) {
    if (!document.path || document.path.includes('..') || document.path.startsWith('/') || !/\.(md|txt)$/i.test(document.path)) throw new Error('Unsafe document source')
    if (seen.has(document.path)) throw new Error('Duplicate document source')
    seen.add(document.path)
    if (Buffer.byteLength(document.text) > 200_000) throw new Error('Document exceeds 200 KB')
    const text = document.text.replace(/\r\n/g, '\n').trim()
    const title = text.match(/^#\s+(.+)$/m)?.[1] ?? document.path
    const points = Array.from(text)
    for (let offset = 0; offset < points.length; offset += size - overlap) {
      const passage = points.slice(offset, offset + size).join('')
      chunks.push({ id: hash(`${document.path}\0${offset}\0${passage}`).slice(0, 20), source: document.path, title, offset, text: passage })
      if (chunks.length > 5000) throw new Error('Maximum 5000 chunks')
      if (offset + size >= points.length) break
    }
  }
  return { schemaVersion: 1, corpusHash: hash(JSON.stringify(sorted)), chunks }
}

export function search(index: Index, question: string, limit = 3) {
  if (!question.trim() || question.length > 2000 || !Number.isInteger(limit) || limit < 1 || limit > 10) throw new Error('Invalid search request')
  const query = new Set(tokens(question))
  const sets = index.chunks.map(chunk => new Set(tokens(chunk.text)))
  return index.chunks.map((chunk, position) => {
    const matches = [...query].filter(term => sets[position].has(term))
    const score = matches.reduce((total, term) => total + Math.log(1 + index.chunks.length / (1 + sets.filter(set => set.has(term)).length)), 0)
    return { ...chunk, score, matchedTerms: matches }
  }).filter(hit => hit.score > 0).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id)).slice(0, limit)
}

export function answer(index: Index, question: string) {
  const hits = search(index, question)
  return {
    mode: 'extractive' as const,
    abstained: hits.length === 0,
    answer: hits[0]?.text ?? 'No supporting passage was found in this corpus.',
    citations: hits.map(hit => ({ id: hit.id, source: hit.source, title: hit.title, offset: hit.offset, excerpt: hit.text, score: hit.score })),
    corpusHash: index.corpusHash,
  }
}

export type EvalCase = { question: string; expectedSource: string | null }
export function evaluate(index: Index, cases: EvalCase[]) {
  if (cases.length === 0) throw new Error('Evaluation cases are required')
  let correct = 0
  let reciprocal = 0
  let answerable = 0
  const results = cases.map(item => {
    const result = answer(index, item.question)
    const rank = item.expectedSource ? result.citations.findIndex(c => c.source === item.expectedSource) + 1 : 0
    const passed = item.expectedSource ? rank > 0 : result.abstained
    if (item.expectedSource) { answerable++; reciprocal += rank > 0 ? 1 / rank : 0 }
    if (passed) correct++
    return { ...item, passed, rank, abstained: result.abstained }
  })
  return { cases: cases.length, retrievalAndAbstentionAccuracy: correct / cases.length, meanReciprocalRank: answerable ? reciprocal / answerable : null, results }
}
