import { NextResponse } from 'next/server'
import { answer, type Index } from '../../../lib/retrieval'
import demoIndex from '../../../examples/index.json'

export async function POST(request: Request) {
  try {
    const reader = request.body?.getReader()
    const parts: Uint8Array[] = []
    let length = 0
    if (reader) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        length += value.byteLength
        if (length > 4096) {
          await reader.cancel()
          return NextResponse.json({ error: 'Request too large' }, { status: 413 })
        }
        parts.push(value)
      }
    }
    const content = Buffer.concat(parts).toString('utf8')
    const { question } = JSON.parse(content)
    if (typeof question !== 'string') return NextResponse.json({ error: 'question must be a string' }, { status: 400 })
    return NextResponse.json(answer(demoIndex as Index, question))
  } catch {
    return NextResponse.json({ error: 'Invalid search request' }, { status: 400 })
  }
}
