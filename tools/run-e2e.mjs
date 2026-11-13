// Chạy toàn bộ kiểm thử trình duyệt MỘT LẦN rồi dọn sạch: tự mở dev server (cổng 5173) và Edge headless (cổng 9222),
// chạy tools/e2e.mjs rồi tools/e2e-extra.mjs, và LUÔN tắt các tiến trình đó khi xong (kể cả khi lỗi hoặc bấm Ctrl+C),
// để không còn gì chạy ngầm làm nặng máy.
//   pnpm e2e [thư-mục-ảnh-chụp]      (mặc định: thư mục tạm của hệ điều hành)
import { spawn, spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const shots = process.argv[2] ?? join(tmpdir(), 'avatar-e2e-shots')
mkdirSync(shots, { recursive: true })
const profile = mkdtempSync(join(tmpdir(), 'avatar-edge-'))
const EDGE_PATHS = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
]
const edge = EDGE_PATHS.find(existsSync)
if (!edge) {
  console.error('Không tìm thấy Edge. Sửa EDGE_PATHS trong tools/run-e2e.mjs.')
  process.exit(2)
}

const children = []
const kill = () => {
  for (const c of children) if (c.pid) spawnSync('taskkill', ['/PID', String(c.pid), '/T', '/F'], { stdio: 'ignore' }) // tắt cả cây tiến trình
  children.length = 0
}
process.on('SIGINT', () => { kill(); process.exit(130) })
process.on('exit', kill)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
async function waitFor(url, what, timeout = 40000) {
  const t0 = Date.now()
  while (Date.now() - t0 < timeout) {
    try {
      if ((await fetch(url)).ok) return
    } catch {}
    await sleep(500)
  }
  throw new Error(`Hết thời gian chờ ${what}`)
}
const run = (script) =>
  new Promise((resolve) => {
    const p = spawn(process.execPath, [script, shots], { stdio: 'inherit' })
    children.push(p)
    p.on('exit', (code) => resolve(code ?? 1))
  })

let failed = false
try {
  children.push(spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--port', '5173', '--strictPort'], { stdio: 'ignore' }))
  children.push(
    spawn(edge, ['--headless=new', '--disable-gpu', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--remote-debugging-port=9222', `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' }),
  )
  await waitFor('http://localhost:5173/', 'dev server')
  await waitFor('http://127.0.0.1:9222/json', 'Edge headless')
  // E2E_SCRIPTS=a.mjs,b.mjs chạy kịch bản khác (vd. chụp ảnh nhanh) thay cho hai kịch bản mặc định.
  const scripts = process.env.E2E_SCRIPTS ? process.env.E2E_SCRIPTS.split(',') : ['tools/e2e.mjs', 'tools/e2e-extra.mjs']
  for (const script of scripts) {
    const code = await run(script)
    if (code !== 0) failed = true
  }
} catch (e) {
  console.error(e.message)
  failed = true
} finally {
  kill()
}
console.log(failed ? '\nE2E: CÓ LỖI' : '\nE2E: qua hết')
console.log(`Ảnh chụp: ${shots}. Đã tắt dev server và Edge headless.`)
process.exit(failed ? 1 : 0)
