// Kiểm thử end-to-end: điều khiển trình duyệt Edge headless qua giao thức DevTools (CDP) để chơi thật một vòng:
// vào game, nói chuyện NPC, trồng, tưới, thu hoạch, bán/mua, reload (lưu), save hỏng. Cần Node 22 (có WebSocket).
// Cách chạy (3 cửa sổ/tiến trình):
//   1) pnpm dev                          (cổng 5173; bản dev có window.__game)
//   2) msedge --headless=new --disable-gpu --use-angle=swiftshader --enable-unsafe-swiftshader \
//        --remote-debugging-port=9222 --user-data-dir=<thư mục tạm> about:blank
//      (đường dẫn Edge trên máy bạn có thể khác)
//   3) node tools/e2e.mjs <thư-mục-ảnh-chụp>
// Mất khoảng 1 phút (chờ cây lớn 20 giây). Ảnh chụp và profile tạm không được commit.
// Kịch bản kiểm thử end-to-end: điều khiển Edge headless qua CDP (WebSocket có sẵn trong Node 22).
import { writeFileSync } from 'node:fs'

const OUT = process.argv[2]
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const targets = await (await fetch('http://127.0.0.1:9222/json')).json()
const page = targets.find((t) => t.type === 'page')
const ws = new WebSocket(page.webSocketDebuggerUrl)
await new Promise((r) => (ws.onopen = r))

let id = 0
const pending = new Map()
const consoleErrors = []
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data)
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m)
    pending.delete(m.id)
  } else if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(m.params.type)) {
    consoleErrors.push(m.params.type + ': ' + m.params.args.map((a) => a.value ?? a.description).join(' '))
  } else if (m.method === 'Runtime.exceptionThrown') {
    consoleErrors.push('EXCEPTION: ' + (m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text))
  }
}
const send = (method, params = {}) =>
  new Promise((res) => {
    const i = ++id
    pending.set(i, res)
    ws.send(JSON.stringify({ id: i, method, params }))
  })
const evalJs = async (expr) => {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })
  if (r.result?.exceptionDetails) throw new Error('eval failed: ' + expr + ' -> ' + JSON.stringify(r.result.exceptionDetails))
  return r.result?.result?.value
}
// Chờ scene đang chạy có khóa mong muốn (tải ~200 ảnh nên lần đầu có thể chậm trên máy yếu).
const waitScene = async (name, timeout = 40000) => {
  const t0 = Date.now()
  while (Date.now() - t0 < timeout) {
    try {
      if ((await evalJs(`__game.scene.getScenes(true).map(s=>s.sys.settings.key).join(',')`)) === name) return true
    } catch {}
    await sleep(300)
  }
  return false
}
const shot = async (name) => {
  const r = await send('Page.captureScreenshot', { format: 'png' })
  writeFileSync(`${OUT}/${name}.png`, Buffer.from(r.result.data, 'base64'))
}

const KEYS = {
  d: [68, 'KeyD'], a: [65, 'KeyA'], w: [87, 'KeyW'], s: [83, 'KeyS'], e: [69, 'KeyE'], h: [72, 'KeyH'],
  m: [77, 'KeyM'], q: [81, 'KeyQ'], u: [85, 'KeyU'], Enter: [13, 'Enter'], 1: [49, 'Digit1'], 2: [50, 'Digit2'], 3: [51, 'Digit3'], 4: [52, 'Digit4'], Escape: [27, 'Escape'],
}
const keyEv = (type, k) =>
  send('Input.dispatchKeyEvent', { type, key: k, code: KEYS[k][1], windowsVirtualKeyCode: KEYS[k][0], nativeVirtualKeyCode: KEYS[k][0] })
const tap = async (k, wait = 150) => {
  await keyEv('keyDown', k)
  await sleep(80)
  await keyEv('keyUp', k)
  await sleep(wait)
}
const play = () => `__game.scene.getScene('Play')`
const pos = () => evalJs(`JSON.stringify(${play()}.state.player)`).then(JSON.parse)
const stateJs = () => evalJs(`JSON.stringify(${play()}.state)`).then(JSON.parse)
// Giữ phím cho đến khi điều kiện đúng (đọc vị trí thật từ game) hoặc hết thời gian.
async function holdUntil(k, cond, timeout = 8000) {
  await keyEv('keyDown', k)
  const t0 = Date.now()
  let p
  while (Date.now() - t0 < timeout) {
    p = await pos()
    if (cond(p)) break
    await sleep(40)
  }
  await keyEv('keyUp', k)
  await sleep(120)
  return p
}

const results = []
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name} ${detail}`)
}

await send('Runtime.enable')
await send('Page.enable')
await send('Page.navigate', { url: 'http://localhost:5173/' })
await sleep(1500)
await waitScene('Title')
await evalJs(`localStorage.clear()`)
await send('Page.reload')
await sleep(1500)
await waitScene('Title')

const sceneKeys = () => evalJs(`__game.scene.getScenes(true).map(s=>s.sys.settings.key).join(',')`)
check('vào màn hình bắt đầu sau khi tải', (await sceneKeys()) === 'Title', await sceneKeys())
await shot('01-title')

await tap('Enter', 600)
check('Enter vào PlayScene', (await sceneKeys()) === 'Play', await sceneKeys())
await shot('02-play-start')

// Hướng dẫn
await tap('h')
check('H mở hướng dẫn', (await evalJs(`${play()}.mode`)) === 'help')
await shot('03-help')
await tap('h')
check('H đóng hướng dẫn', (await evalJs(`${play()}.mode`)) === 'play')

// Bố cục (xem src/data/world.ts): game bắt đầu ở khu chợ, xuất phát (5.5, 13.5), lái buôn ở ô (3, 11); nông trại 54x17 ô.
// Dịch chuyển tức thời tới chỗ cần (chỉ dùng khi không phải đang kiểm tra việc đi bộ).
const tp = async (col, row) => {
  await evalJs(`${play()}.state.player = { col: ${col}, row: ${row} }`)
  await sleep(300)
}
// Đi đến NPC: đi sang trái rồi lên sát lái buôn (đứng ngay dưới), nhận hạt
let p = await holdUntil('a', (q) => q.col <= 3.7)
if (p.col < 3.2) p = await holdUntil('d', (q) => q.col >= 3.5) // máy chậm có thể đi quá: lùi lại
p = await holdUntil('w', (q) => q.row <= 12.6)
await shot('04-near-npc')
await tap('e', 300)
let st = await stateJs()
check('nói chuyện NPC nhận 3 hạt', st.inventory.seed_carrot === 3 && st.flags.gotStarter, JSON.stringify(st.inventory))
await sleep(200)
const slotsInfo = JSON.parse(await evalJs(`JSON.stringify(${play()}.hud.slots.map(s => ({ id: s.id, count: s.count.text, stroke: s.frame.strokeColor })))`))
const carrotSlot = slotsInfo.find((s) => s.id === 'seed_carrot')
check('HUD: ô túi đồ hiện 3 hạt cà rốt và được chọn (viền vàng)', carrotSlot.count === '3' && carrotSlot.stroke === 0xffd23f, JSON.stringify(carrotSlot))
check('HUD: ô nông sản chưa có thì để trống', slotsInfo.find((s) => s.id === 'carrot').count === '', JSON.stringify(slotsInfo))
check('HUD: có ngày/giờ', (await evalJs(`${play()}.hud.clockText.text`)).startsWith('Ngày 1'), await evalJs(`${play()}.hud.clockText.text`))
await shot('05-dialog')
await tap('e', 200)
check('đóng hội thoại trả lại điều khiển', (await evalJs(`${play()}.mode`)) === 'play')

// Va chạm: đi lên vào NPC không xuyên
await tp(3.5, 12.4)
const before = await pos()
await holdUntil('w', () => false, 800)
const after = await pos()
check('NPC chặn đường (không xuyên)', after.row > 11.9, `row ${before.row.toFixed(2)} -> ${after.row.toFixed(2)}`)

// Qua cổng FARM (khu chợ -> nông trại), rồi tới ô đất plot_0_1 (tâm (30.5, 9.5)): đứng ngay dưới nó
const waitMap = async (id) => {
  for (let i = 0; i < 100; i++) {
    if ((await evalJs(`${play()}.map.id + ':' + ${play()}.transitioning`)) === id + ':false') return true
    await sleep(100)
  }
  return false
}
await tp(11.5, 10.6)
check('bước qua cổng FARM: vào nông trại', await waitMap('farm'), await evalJs(`${play()}.map.id`))
await shot('05b-farm')
await tp(30.5, 10.4)
p = await pos()
check('đi tới gần ô đất', Math.abs(p.col - 30.5) < 0.1, JSON.stringify(p))
await tap('e', 300) // trồng
st = await stateJs()
const planted = Object.entries(st.plots).filter(([, v]) => v.planted)
check('trồng hạt (trừ 1 hạt)', planted.length === 1 && st.inventory.seed_carrot === 2, JSON.stringify(st.inventory))
await tap('e', 300) // tưới
st = await stateJs()
check('tưới nước', Object.values(st.plots).some((v) => v.planted && v.watered))
await shot('06-planted-watered')
await tap('e', 200) // bấm khi đang lớn: không đổi
st = await stateJs()
check('bấm E khi đang lớn không làm gì', st.inventory.seed_carrot === 2 && !st.inventory.carrot)

await sleep(21000)
await shot('07-ready')
await tap('e', 300)
st = await stateJs()
check('thu hoạch được 1 cà rốt', st.inventory.carrot === 1, JSON.stringify(st.inventory))
await shot('08-harvested')
await tap('e', 200)
st = await stateJs()
check('bấm E lặp lại không nhân đôi thưởng', st.inventory.carrot === 1, JSON.stringify(st.inventory))

// Lưu và tải lại
await evalJs(`${play()}.save()`)
await send('Page.reload')
await sleep(1500)
await waitScene('Title')
await tap('Enter', 600)
const st2 = await stateJs()
check('reload khôi phục túi đồ, tiền và ô đất', JSON.stringify(st2.inventory) === JSON.stringify(st.inventory) && JSON.stringify(st2.plots) === JSON.stringify(st.plots) && st2.money === st.money, JSON.stringify(st2.inventory))
check('reload khôi phục vị trí', Math.abs(st2.player.col - st.player.col) < 0.01, JSON.stringify(st2.player))

// Bán cà rốt: về khu chợ qua lối ở tường dưới, đến lái buôn
await tp(25.5, 16.2)
check('lối ở tường dưới: về khu chợ', await waitMap('hub'), await evalJs(`${play()}.map.id`))
await tp(3.5, 12.5)
await tap('e', 300)
check('mở cửa hàng', (await evalJs(`${play()}.mode`)) === 'shop', await evalJs(`${play()}.mode`))
await shot('09-shop')
await evalJs(`${play()}.state.money = 0`) // tiền khởi đầu thật là 100000; các phép tính bên dưới tính từ 0
await tap('3', 200)
st = await stateJs()
check('bán cà rốt: tiền +25', st.money === 25 && !st.inventory.carrot, `money ${st.money}`)
await sleep(200)
check('HUD: số tiền hiển thị khớp trạng thái', (await evalJs(`${play()}.hud.coinText.text`)) === String(st.money), await evalJs(`${play()}.hud.coinText.text`))
const seedsBefore = st.inventory.seed_carrot
await tap('1', 200)
st = await stateJs()
check('mua hạt: tiền -10, hạt +1', st.money === 15 && st.inventory.seed_carrot === seedsBefore + 1, `money ${st.money}, ${JSON.stringify(st.inventory)}`)
await tap('1', 200)
await tap('1', 200)
st = await stateJs()
check('không đủ tiền thì không mua (tiền không âm)', st.money === 5 && st.inventory.seed_carrot === seedsBefore + 2, `money ${st.money}, ${JSON.stringify(st.inventory)}`)

// Đơn hàng: hạt cà chua bị khóa đến khi giao đơn đầu tiên. Phím: 1 mua cà rốt, 2 bán, 3 giao (khi cà chua còn khóa).
check('hạt cà chua đang khóa: cửa hàng hiện dòng "chưa mở"', (await evalJs(`${play()}.shopText()`)).includes('chưa mở'))
await tap('4', 200) // giao đơn khi chưa đủ hàng
st = await stateJs()
check('giao đơn khi thiếu hàng: không nhận thưởng, đơn chưa xong', st.money === 5 && st.flags.done.length === 0 && (await evalJs(`${play()}.shopNote`)).includes('chưa đủ'), `money ${st.money}, done ${JSON.stringify(st.flags.done)}`)
await evalJs(`${play()}.state.inventory.carrot = 3`)
await tap('4', 200)
st = await stateJs()
check('giao đơn đầu tiên: trừ 3 cà rốt, +90 tiền, đơn xong', st.money === 95 && !st.inventory.carrot && JSON.stringify(st.flags.done) === '["first_order"]', `money ${st.money}, ${JSON.stringify(st.inventory)}, ${JSON.stringify(st.flags.done)}`)
await sleep(200)
check('bảng đơn hàng chuyển sang đơn kế tiếp', (await evalJs(`${play()}.questText.text`)).includes('Cà chua cho bữa tiệc'), await evalJs(`${play()}.questText.text`))
await tap('4', 200) // giao lại: đơn kế tiếp chưa đủ hàng, không nhận thưởng lần hai
st = await stateJs()
check('giao lặp lại không nhận thưởng hai lần', st.money === 95, `money ${st.money}`)
check('giao đơn không còn mở khóa hạt cà chua (vẫn "chưa mở")', (await evalJs(`${play()}.shopText()`)).includes('chưa mở') && !(await evalJs(`${play()}.shopText()`)).includes('Mua Hạt cà chua'))
await evalJs(`${play()}.state.zones.field = 1`) // mở khóa bằng cấp mở rộng ruộng
check('hạt cà chua mở khóa khi ruộng lên cấp 1', (await evalJs(`${play()}.shopText()`)).includes('Mua Hạt cà chua'))
await tap('2', 200) // giờ phím 2 là mua hạt cà chua
st = await stateJs()
check('mua hạt cà chua: tiền -25, hạt cà chua +1', st.money === 70 && st.inventory.seed_tomato === 1, `money ${st.money}, ${JSON.stringify(st.inventory)}`)
await tap('4', 200) // giờ phím 4 là bán nông sản (không có gì để bán)
st = await stateJs()
check('bán khi không có nông sản: tiền không đổi', st.money === 70, `money ${st.money}`)

// Trang nâng cấp của cửa hàng (phím U): mua phân bón, kiểm tra tiền, quay lại cửa hàng
await tap('u', 200)
check('phím U mở trang nâng cấp', (await evalJs(`${play()}.shopText()`)).includes('NÂNG CẤP'))
await evalJs(`${play()}.state.money = 200`)
await tap('1', 200)
st = await stateJs()
check('mua phân bón cấp 1: trừ 200 tiền, cấp tăng lên 1', st.money === 0 && st.upgrades.fertilizer === 1, `money ${st.money}, ${JSON.stringify(st.upgrades)}`)
await tap('1', 200) // hết tiền: không nâng thêm
st = await stateJs()
check('không đủ tiền: không nâng cấp, tiền không âm', st.money === 0 && st.upgrades.fertilizer === 1 && (await evalJs(`${play()}.shopNote`)).includes('Không đủ tiền'), `money ${st.money}`)
await tap('u', 200)
check('phím U lần hai mở trang vật nuôi, đang khóa', (await evalJs(`${play()}.shopText()`)).includes('VẬT NUÔI') && (await evalJs(`${play()}.shopText()`)).includes('chưa mở'))
await evalJs(`${play()}.state.money = 500`)
await tap('1', 200) // chưa mở khóa: không mua được, không mất tiền
st = await stateJs()
check('vật nuôi bị khóa: không mua được, không mất tiền', st.money === 500 && Object.values(st.animals).every((a) => a.kind === ''), `money ${st.money}`)
await evalJs(`${play()}.state.zones.pen = 1`) // mở khóa bằng cấp mở rộng khu chăn nuôi
await tap('1', 200)
st = await stateJs()
check('mở khóa rồi mua gà: trừ 120 tiền, gà vào chỗ thả rông đầu tiên', st.money === 380 && st.animals.free_0.kind === 'chicken' && st.animals.pen_0.kind === '', `money ${st.money}, ${JSON.stringify(st.animals.free_0)}`)
await tap('u', 200)
check('phím U lần ba quay lại trang cửa hàng', (await evalJs(`${play()}.shopText()`)).includes('CỬA HÀNG'))
await evalJs(`(() => { const s = ${play()}.state; s.animals.free_0 = { kind: '', fed: false, prodMs: 0 }; s.zones.field = 0; s.zones.pen = 0 })()`) // trả về trạng thái đầu cho phần sau



// Tắt âm thanh
await tap('Escape', 200)
await tap('m', 200)
check('M tắt âm thanh', (await evalJs(`JSON.parse(localStorage.getItem('avatar-settings')).muted`)) === true)

// Save hỏng
const errsBefore = consoleErrors.length
await evalJs(`${play()}.events.emit('shutdown')`) // gỡ listener pagehide để không ghi đè dữ liệu hỏng
await evalJs(`localStorage.setItem('avatar-save','{bad json')`)
await send('Page.reload')
await sleep(1500)
await waitScene('Title')
check('save hỏng: vẫn vào màn bắt đầu, không sập', (await sceneKeys()) === 'Title')
await shot('10-corrupt-title')
await tap('Enter', 600)
st = await stateJs()
check('save hỏng: chơi mới với túi đồ trống', Object.keys(st.inventory).length === 0 && st.money === 100000, JSON.stringify(st.inventory))

const real = consoleErrors.filter((e, i) => i < errsBefore || !e.includes('animatePlayer')) // bỏ lỗi do tự phát sự kiện shutdown trong kịch bản
check('không có lỗi console/exception', real.length === 0, real.join(' | '))
console.log('\nTổng:', results.filter((r) => r.ok).length, '/', results.length, 'qua')
ws.close()
process.exit(results.every((r) => r.ok) ? 0 : 1)
