'use client'
import { useState, type FormEvent } from 'react'

type Result = { answer: string; abstained: boolean; corpusHash: string; citations: { id: string; source: string; title: string; excerpt: string; score: number }[] }
export default function Page() {
  const [question, setQuestion] = useState('How long does delivery take?')
  const [result, setResult] = useState<Result | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  async function submit(event: FormEvent) {
    event.preventDefault(); setPending(true); setError(''); setResult(null)
    try {
      const response = await fetch('/api/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? 'Search failed')
      setResult(data)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Search failed') }
    finally { setPending(false) }
  }
  return <main>
    <header><p className="eyebrow">HAMED MINAEI / PORTFOLIO 03</p><h1>Knowledge workbench</h1><p>Trace every retrieved answer back to its document.</p></header>
    <p className="notice">Synthetic corpus · Extractive retrieval · No LLM or database connected</p>
    <form onSubmit={submit}><label htmlFor="question">Ask the document library</label><textarea id="question" value={question} maxLength={2000} required onChange={e => setQuestion(e.target.value)} /><button disabled={pending || !question.trim()} type="submit">{pending ? 'Searching…' : 'Retrieve passages'}</button></form>
    {error ? <p role="alert">{error}</p> : null}
    <section aria-live="polite" aria-busy={pending}>
      {result ? <><h2>{result.abstained ? 'No supporting evidence' : 'Retrieved passage'}</h2><blockquote>{result.answer}</blockquote><h2>Sources ({result.citations.length})</h2>{result.citations.map(c => <article key={c.id}><h3>{c.title}</h3><p>{c.excerpt}</p><code>{c.source} · {c.id}</code><small>Retrieval score {c.score.toFixed(3)}</small></article>)}<p className="hash">Corpus SHA-256: {result.corpusHash}</p></> : <p className="empty">Search delivery or transcript retention. Unknown topics return no evidence.</p>}
    </section>
    <footer>This preview evaluates retrieval and citations. Generated-answer faithfulness and enterprise authorization are not implemented.</footer>
  </main>
}
