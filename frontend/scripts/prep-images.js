const fs = require('fs').promises
const path = require('path')

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif', '.svg'])
const SOURCE_DIR = path.join(process.cwd(), 'assets', 'images')
const TARGET_DIR = path.join(process.cwd(), 'public', 'images')

async function ensureDirectory(dir) {
  await fs.mkdir(dir, { recursive: true })
}

async function copyImage(src, dest) {
  await ensureDirectory(path.dirname(dest))
  await fs.copyFile(src, dest)
}

async function syncImages(srcDir, destDir) {
  const entries = await fs.readdir(srcDir, { withFileTypes: true })
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name)
    const destPath = path.join(destDir, entry.name)

    if (entry.isDirectory()) {
      await syncImages(srcPath, destPath)
      continue
    }

    const ext = path.extname(entry.name).toLowerCase()
    if (!IMAGE_EXTENSIONS.has(ext)) continue

    await copyImage(srcPath, destPath)
  }
}

async function run() {
  const start = Date.now()
  try {
    await fs.access(SOURCE_DIR)
  } catch {
    console.warn('No image assets found at', SOURCE_DIR)
    process.exit(0)
  }

  await syncImages(SOURCE_DIR, TARGET_DIR)
  console.info('Synced assets to %s in %dms', TARGET_DIR, Date.now() - start)
}

run().catch((error) => {
  console.error('prep-images failed:', error)
  process.exit(1)
})
