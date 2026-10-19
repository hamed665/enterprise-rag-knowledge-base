import { readFile } from 'node:fs/promises'
import { evaluate } from '../lib/retrieval'
import { ingestDirectory } from '../lib/ingestion'

const index = await ingestDirectory('examples/documents')
const cases = JSON.parse(await readFile('examples/evaluation.json', 'utf8'))
const report = evaluate(index, cases)
console.log(JSON.stringify(report, null, 2))
if (report.retrievalAndAbstentionAccuracy !== 1) process.exitCode = 1
