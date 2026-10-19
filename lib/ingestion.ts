import { lstat, readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { buildIndex, type SourceDocument } from './retrieval'

/** Local-only ingestion: never fetches URLs or follows symlinks. */
export async function ingestDirectory(root: string) {
  const documents: SourceDocument[] = []
  async function visit(path: string) {
    const info = await lstat(path)
    if (info.isSymbolicLink()) throw new Error('Symlinks are not accepted')
    if (info.isDirectory()) {
      for (const name of (await readdir(path)).sort()) {
        if (!name.startsWith('.')) await visit(join(path, name))
      }
    } else if (/\.(md|txt)$/i.test(path)) {
      if (info.size > 200_000) throw new Error('Document exceeds 200 KB')
      if (documents.length >= 100) throw new Error('Maximum 100 documents')
      documents.push({ path: relative(root, path).split('\\').join('/'), text: await readFile(path, 'utf8') })
    }
  }
  await visit(root)
  return buildIndex(documents)
}
