import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { ingestDirectory } from '../lib/ingestion'

const source = resolve(process.argv[2] ?? 'examples/documents')
const destination = resolve(process.argv[3] ?? '.data/index.json')
if (!destination.endsWith('.json')) throw new Error('Output must be a JSON file')
const index = await ingestDirectory(source)
await mkdir(dirname(destination), { recursive: true })
await writeFile(destination, JSON.stringify(index, null, 2) + '\n')
console.log(JSON.stringify({ chunks: index.chunks.length, corpusHash: index.corpusHash, output: destination }))
