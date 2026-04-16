import { readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join } from 'node:path'

const ROOT = process.cwd()
const SOURCE_DIRS = ['components', 'composables', 'pages', 'server', 'shared']
const INCLUDE_EXT = new Set(['.ts', '.js', '.mjs', '.cjs', '.vue'])

const LOGGING_PATTERNS = [
  { pattern: /\bconsole\s*\./g, message: 'console.* usage is forbidden' },
  { pattern: /\bprocess\s*\.\s*stderr\s*\.\s*write\s*\(/g, message: 'process.stderr.write usage is forbidden' },
  { pattern: /\bprocess\s*\.\s*stdout\s*\.\s*write\s*\(/g, message: 'process.stdout.write usage is forbidden' },
]

function walk(dir) {
  const entries = readdirSync(dir)
  const out = []
  for (const entry of entries) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) out.push(...walk(full))
    else out.push(full)
  }
  return out
}

function collectSourceFiles() {
  const files = []
  for (const dir of SOURCE_DIRS) {
    const full = join(ROOT, dir)
    try {
      const st = statSync(full)
      if (!st.isDirectory()) continue
      files.push(...walk(full))
    } catch {}
  }
  return files.filter((file) => INCLUDE_EXT.has(extname(file)))
}

function toLineNumber(text, index) {
  let line = 1
  for (let i = 0; i < index; i++) {
    if (text[i] === '\n') line += 1
  }
  return line
}

const violations = []
for (const file of collectSourceFiles()) {
  const source = readFileSync(file, 'utf8')
  for (const rule of LOGGING_PATTERNS) {
    rule.pattern.lastIndex = 0
    let match
    while ((match = rule.pattern.exec(source)) !== null) {
      violations.push({
        file,
        line: toLineNumber(source, match.index),
        message: rule.message,
      })
    }
  }
}

if (violations.length > 0) {
  const report = violations
    .map((v) => `- ${v.file}:${v.line} ${v.message}`)
    .join('\n')
  throw new Error(`No-logging lint rules failed:\n${report}`)
}
