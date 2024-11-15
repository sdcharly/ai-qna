import fs from 'fs'
import path from 'path'

const KEEP_FILES = [
  'setup-supabase.sql',
  'run-setup.ts',
  'test-auth.ts',
  'tsconfig.json',
  'README.md',
  'cleanup.ts'
]

async function cleanup() {
  const scriptsDir = __dirname
  const files = fs.readdirSync(scriptsDir)

  console.log('Cleaning up scripts directory...\n')

  for (const file of files) {
    if (!KEEP_FILES.includes(file)) {
      const filePath = path.join(scriptsDir, file)
      try {
        fs.unlinkSync(filePath)
        console.log(`Removed: ${file}`)
      } catch (error) {
        console.error(`Error removing ${file}:`, error)
      }
    }
  }

  console.log('\nCleanup complete!')
  console.log('\nKept files:')
  KEEP_FILES.forEach(file => console.log(`- ${file}`))
}

cleanup()
