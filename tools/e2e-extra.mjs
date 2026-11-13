// Kiểm tra bổ sung (giai đoạn 10): E ngoài tầm, mất focus, bước thời gian lớn, nhiều kích thước màn hình.
// Cách chạy giống tools/e2e.mjs (cần pnpm dev và Edge headless với --remote-debugging-port=9222).
//   node tools/e2e-extra.mjs <thư-mục-ảnh-chụp>
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
  m: [77, 'KeyM'], q: [81, 'KeyQ'], Enter: [13, 'Enter'], ArrowRight: [39, 'ArrowRight'], ArrowLeft: [37, 'ArrowLeft'], ArrowDown: [40, 'ArrowDown'], ArrowUp: [38, 'ArrowUp'], f: [70, 'KeyF'], 1: [49, 'Digit1'], 2: [50, 'Digit2'], 3: [51, 'Digit3'], 4: [52, 'Digit4'], 5: [53, 'Digit5'], 6: [54, 'Digit6'], u: [85, 'KeyU'], i: [73, 'KeyI'], Escape: [27, 'Escape'],
}
const keyEv = (type, k) =>
  send('Input.dispatchKeyEvent', { type, key: k, code: KEYS[k][1], windowsVirtualKeyCode: KEYS[k][0], nativeVirtualKeyCode: KEYS[k][0] })
const tap = async (k, wait = 150) => {
  await keyEv('keyDown', k)
  await sleep(160)
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

// ---- Kiểm tra bổ sung: ngoài tầm, mất focus, bước thời gian lớn, kích thước màn hình ----
await send('Runtime.enable')
await send('Page.enable')
await send('Page.navigate', { url: 'http://localhost:5173/' })
await sleep(1500)
await waitScene('Title')
await evalJs(`localStorage.clear()`)
await send('Page.reload')
await sleep(1500)
await waitScene('Title')
await tap('Enter', 600)

const sceneKeys = () => evalJs(`__game.scene.getScenes(true).map(s=>s.sys.settings.key).join(',')`)
check('đang ở PlayScene', (await sceneKeys()) === 'Play')
check('game bắt đầu ở khu chợ', (await evalJs(`${play()}.map.id`)) === 'hub', await evalJs(`${play()}.map.id`))

// 0) Giao diện bấm chuột: nút menu mở túi đồ, bấm hạt để chọn, nút thư mở đơn hàng, nút Xong đóng
const clickGame = async (gx, gy) => {
  const r = JSON.parse(await evalJs(`JSON.stringify(document.querySelector('canvas').getBoundingClientRect())`))
  const sc = r.width / 960
  const x = r.left + gx * sc
  const y = r.top + gy * sc
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y })
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 })
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 })
  await sleep(250)
}
await evalJs(`(() => { const s = ${play()}.state; s.flags.gotStarter = true; s.inventory = { seed_carrot: 1, seed_tomato: 1 } })()`)
await sleep(300)
await clickGame(44, 38)
check('bấm nút menu: túi đồ mở, hiện nút Xong', (await evalJs(`${play()}.hud.inventoryOpen`)) === true)
await shot('ui-inventory')
await clickGame(160, 136)
check('bấm vào hạt cà chua trong túi: chọn hạt đó', (await evalJs(`${play()}.selectedSeed`)) === 'seed_tomato', await evalJs(`${play()}.selectedSeed`))
await clickGame(74, 509)
check('bấm Xong: đóng túi đồ', (await evalJs(`${play()}.hud.inventoryOpen`)) === false)
await clickGame(110, 38)
check('bấm nút thư: mở bảng đơn hàng', (await evalJs(`${play()}.mode`)) === 'dialog' && (await evalJs(`${play()}.panel.text`)).includes('ĐƠN HÀNG'), (await evalJs(`${play()}.panel.text`)).split('\n')[0])
await shot('ui-mail')
await clickGame(74, 509)
check('bấm Xong: đóng bảng đơn hàng', (await evalJs(`${play()}.mode`)) === 'play')
await tap('i', 300)
check('phím I mở túi đồ, ESC đóng', (await evalJs(`${play()}.hud.inventoryOpen`)) === true)
await tap('Escape', 300)
check('ESC đóng túi đồ', (await evalJs(`${play()}.hud.inventoryOpen`)) === false)
await evalJs(`(() => { const s = ${play()}.state; s.inventory = {}; s.flags.gotStarter = false })()`)

// 1) E ngoài tầm: đứng xa mọi đối tượng, bấm E -> không có gì xảy ra
const s0 = await stateJs()
await tap('e', 300)
const s1 = await stateJs()
check('E ngoài tầm không kích hoạt gì', JSON.stringify(s0.inventory) === JSON.stringify(s1.inventory) && (await evalJs(`${play()}.mode`)) === 'play', JSON.stringify(s1.inventory))

// 2) Mất focus khi đang giữ phím: nhân vật phải dừng
const pa = await pos()
await keyEv('keyDown', 'd')
await sleep(300)
const pb = await pos()
await evalJs(`window.dispatchEvent(new Event('blur'))`)
await sleep(200)
const pc = await pos()
await sleep(400)
const pd = await pos()
await keyEv('keyUp', 'd')
check('đang đi bình thường khi giữ phím', pb.col > pa.col + 0.1, `${pa.col.toFixed(2)} -> ${pb.col.toFixed(2)}`)
check('mất focus: nhân vật dừng, không kẹt phím', Math.abs(pd.col - pc.col) < 0.02, `${pc.col.toFixed(2)} -> ${pd.col.toFixed(2)}`)

// 3) Bước thời gian rất lớn (quay lại từ tab khác): cây chỉ lớn tối đa 250ms
await evalJs(`(() => { const s = ${play()}.state; const id = Object.keys(s.plots)[0]; s.plots[id] = { planted: true, crop: 'seed_carrot', watered: true, growMs: 0 }; })()`)
await evalJs(`${play()}.update(0, 60000)`)
const grown = await evalJs(`Object.values(${play()}.state.plots)[0].growMs`)
// 250ms (giới hạn) + vài frame thường chạy xen giữa; quan trọng là KHÔNG phải 60000.
check('bước thời gian 60 giây bị chặn (không lớn nhảy vọt)', grown > 0 && grown < 500, `growMs=${grown}`)

// 4a) Chuyển bản đồ: vào nhà, cây vẫn lớn, giường lưu, reload trong nhà, ra khỏi nhà
// Căn chỉnh vị trí theo một trục bằng các bước ngắn và đọc lại vị trí thật (không phụ thuộc thời gian,
// nên không bị "vượt quá" khi trình duyệt headless chạy chậm).
async function goTo(axis, target, tol = 0.3, timeout = 10000) {
  const t0 = Date.now()
  while (Date.now() - t0 < timeout) {
    const p = await pos()
    const d = target - p[axis]
    if (Math.abs(d) <= tol) return p
    const key = axis === 'col' ? (d > 0 ? 'd' : 'a') : d > 0 ? 's' : 'w'
    await keyEv('keyDown', key)
    await sleep(Math.min(300, Math.abs(d) * 180))
    await keyEv('keyUp', key)
    await sleep(120)
  }
  return pos()
}
async function holdUntilJs(k, jsCond, timeout = 8000) {
  await keyEv('keyDown', k)
  const t0 = Date.now()
  while (Date.now() - t0 < timeout) {
    if (await evalJs(jsCond)) break
    await sleep(40)
  }
  await keyEv('keyUp', k)
  await sleep(150)
}
const mapNow = () => evalJs(`${play()}.state.map`)
// Chờ chuyển bản đồ xong (máy chậm thì mờ dần/khởi động lại scene lâu hơn): đúng bản đồ, scene mới đã sẵn sàng.
const waitMap = async (name, timeout = 8000) => {
  const t0 = Date.now()
  while (Date.now() - t0 < timeout) {
    if ((await mapNow()) === name && !(await evalJs(`${play()}.transitioning`))) break
    await sleep(100)
  }
  await sleep(300)
}
const enterMap = async (name, col, row) => {
  await evalJs(`(() => { const p = ${play()}; p.state.map = '${name}'; p.state.player = { col: ${col}, row: ${row} }; p.scene.restart({ state: p.state }) })()`)
  await sleep(300)
  await waitMap(name)
}
const plot0 = () => evalJs(`Object.values(${play()}.state.plots)[0].growMs`)
// Dịch chuyển tức thời (chỉ dùng khi không kiểm tra việc đi bộ) và đọc bố cục thật từ bản đồ đang chạy.
const tpTo = async (col, row) => { await evalJs(`${play()}.state.player = { col: ${col}, row: ${row} }`); await sleep(300) }
const mapInfo = () => evalJs(`JSON.stringify({ cols: ${play()}.cols, rows: ${play()}.map.rows, plots: ${play()}.map.plots, buildings: ${play()}.map.buildings, signs: ${play()}.map.signs, slots: ${play()}.map.animalSlots, pond: ${play()}.map.pond, pondYard: ${play()}.map.pondYard })`).then(JSON.parse)
const plotCenter = async (id) => { const m = await mapInfo(); const p = m.plots.find((x) => x.id === id); return [p.col + 0.5, p.row + 0.5] }
const spotOf = async (id) => { const b = (await mapInfo()).buildings.find((x) => x.id === id); return [b.col + Math.floor(b.w / 2) + 0.5, b.row + b.h + 0.5] }
const standBySign = async (zone) => { const s = (await mapInfo()).signs.find((x) => x.zone === zone); return [s.col + 1.5, s.row + 0.5] }

// Hai bản đồ nối nhau: qua cổng FARM (khu chợ -> nông trại), lối ở tường dưới (nông trại -> khu chợ).
const growBefore = await plot0()
await tpTo(11.5, 10.6)
await waitMap('farm')
check('bước qua cổng FARM: sang nông trại', (await mapNow()) === 'farm', await mapNow())
const inside = await pos()
check('vào nông trại đúng vị trí xuất hiện (trên lối ra)', Math.abs(inside.col - 25.5) < 0.3 && Math.abs(inside.row - 14.6) < 0.3, JSON.stringify(inside))
check('đang ở PlayScene sau khi chuyển (điều khiển được trả lại)', (await sceneKeys()) === 'Play' && !(await evalJs(`${play()}.transitioning`)))
check('hồ cá có sẵn từ đầu: có chỗ cá trong hồ và hình cá dựng sẵn', (await evalJs(`${play()}.animalViews.has('fish_0_0')`)) === true && (await evalJs(`${play()}.map.animalSlots.filter((s) => s.pond).length`)) === 9)
await shot('farm-after-gate')
await sleep(1500)
const growAfter = await plot0()
check('cây vẫn lớn khi người chơi chuyển bản đồ', growAfter > growBefore + 500, `${growBefore.toFixed(0)} -> ${growAfter.toFixed(0)} ms`)

await tpTo(14.5, 13.5)
const savedPos = await pos()
await evalJs(`${play()}.save()`)
await send('Page.reload')
await sleep(1500)
await waitScene('Title')
await tap('Enter', 800)
check('reload khi đang ở nông trại: khôi phục đúng bản đồ', (await mapNow()) === 'farm', await mapNow())
const reloaded = await pos()
check('reload: vị trí khôi phục', Math.abs(reloaded.col - savedPos.col) < 0.05 && Math.abs(reloaded.row - savedPos.row) < 0.05, JSON.stringify(reloaded))

await tpTo(25.5, 16.2)
await waitMap('hub')
check('lối ở tường dưới: về khu chợ', (await mapNow()) === 'hub', await mapNow())
const outside = await pos()
check('về khu chợ đúng vị trí (trước cổng FARM)', Math.abs(outside.col - 11.5) < 0.3 && Math.abs(outside.row - 12.6) < 0.3, JSON.stringify(outside))
await shot('hub-after-exit')
await enterMap('farm', 25.5, 14.6)
check('cây ở nông trại còn nguyên sau khi đi ra vào', await evalJs(`Object.values(${play()}.state.plots)[0].planted`))

// 4b) Cà chua: chọn hạt bằng Q, trồng, lớn chậm hơn cà rốt, thu hoạch ra cà chua
const SEL = `${play()}.selectedSeed`
await evalJs(`(() => { ${play()}.state.inventory = { seed_carrot: 1, seed_tomato: 1 } })()`)
await tpTo(...(await plotCenter('plot_0_1'))) // đi bộ đã kiểm ở trên; ở đây đứng trên ô đất cần trồng
await sleep(200)
check('hạt đang chọn mặc định là cà rốt', (await evalJs(SEL)) === 'seed_carrot', await evalJs(SEL))
await tap('q', 200)
check('Q đổi sang hạt cà chua', (await evalJs(SEL)) === 'seed_tomato', await evalJs(SEL))
await tap('e', 300)
let tst = await stateJs()
check('trồng cà chua: ô ghi đúng loại cây, chỉ trừ hạt cà chua', tst.plots.plot_0_1.crop === 'seed_tomato' && !tst.inventory.seed_tomato && tst.inventory.seed_carrot === 1, JSON.stringify(tst.plots.plot_0_1) + JSON.stringify(tst.inventory) + ' | vị trí ' + JSON.stringify(await pos()) + ' | gợi ý "' + (await evalJs(`${play()}.hint.text`)) + '" | mode ' + (await evalJs(`${play()}.mode`)) + ' | map ' + (await mapNow()))
await tap('e', 300)
await evalJs(`${play()}.state.plots.plot_0_1.growMs = 25000`) // quá thời gian cà rốt (20s) nhưng chưa tới cà chua (45s)
await sleep(300)
check('25 giây: cà chua chưa chín (vẫn là mầm)', (await evalJs(`${play()}.views.get('plot_0_1').plant.texture.key`)) === 'plant-tomato-sprout')
await evalJs(`${play()}.state.plots.plot_0_1.growMs = 45000`)
await sleep(300)
check('45 giây: hiện ảnh cà chua chín và gợi ý thu hoạch', (await evalJs(`${play()}.views.get('plot_0_1').plant.texture.key`)) === 'plant-ready-tomato' && (await evalJs(`${play()}.hint.text`)).includes('Thu hoạch'))
await shot('tomato-ready')
await tap('e', 300)
tst = await stateJs()
check('thu hoạch được 1 cà chua (không phải cà rốt)', tst.inventory.tomato === 1 && !tst.inventory.carrot, JSON.stringify(tst.inventory))
check('thu hoạch xong ô trống, loại cây xóa', tst.plots.plot_0_1.crop === '' && !tst.plots.plot_0_1.planted)

// 4d) Bình tưới lớn, đồng hồ, giấc ngủ, ánh sáng
const DAY_MS = 270000 // khớp src/state/clock.ts
const toast = () => evalJs(`${play()}.toast.text`)
await evalJs(`(() => { const s = ${play()}.state; s.inventory = { seed_carrot: 2 } })()`)
await tap('e', 300)
let es = await stateJs()
check('trồng được ngay (không còn năng lượng), trừ 1 hạt', es.plots.plot_0_1.planted === true && es.inventory.seed_carrot === 1, JSON.stringify(es.inventory))
check('không còn trường energy trong state', !('energy' in es), Object.keys(es).join(','))

// Bình tưới lớn cấp 1: tưới ô đó và ô kề trái/phải cùng hàng
await evalJs(`(() => { const s = ${play()}.state; s.upgrades.can = 1; for (const id of ['plot_1_1', 'plot_2_1']) s.plots[id] = { planted: true, crop: 'seed_carrot', watered: false, growMs: 0 } })()`)
await tap('e', 300)
es = await stateJs()
check('bình tưới lớn cấp 1: tưới ô đang đứng và ô kề cùng hàng, không tưới ô cách 2 ô', es.plots.plot_0_1.watered && es.plots.plot_1_1.watered && !es.plots.plot_2_1.watered, JSON.stringify([es.plots.plot_0_1.watered, es.plots.plot_1_1.watered, es.plots.plot_2_1.watered]))
await shot('water-area')

// Đồng hồ trôi theo thời gian thật
const t1 = await evalJs(`${play()}.state.time`)
await sleep(1500)
const t2 = await evalJs(`${play()}.state.time`)
check('đồng hồ game trôi theo thời gian thật', t2 - t1 > 1000 && t2 - t1 < 2600, `${(t2 - t1).toFixed(0)} ms trong ~1500 ms`)

// Ánh sáng: ban đêm tối và có đom đóm; ban ngày sáng
await evalJs(`${play()}.state.time = ${DAY_MS * 0.85}`)
await sleep(400)
const nightAlpha = await evalJs(`${play()}.light.fillAlpha`)
const fireflyAlpha = await evalJs(`${play()}.fireflies[0].alpha`)
check('ban đêm: lớp phủ tối và đom đóm hiện', nightAlpha > 0.4 && fireflyAlpha > 0.5, `phủ ${nightAlpha}, đom đóm ${fireflyAlpha}`)
await shot('night')
await evalJs(`${play()}.state.time = ${DAY_MS * 0.4}`)
await sleep(400)
check('ban ngày: không phủ tối, đom đóm ẩn', (await evalJs(`${play()}.light.fillAlpha`)) === 0 && (await evalJs(`${play()}.fireflies[0].alpha`)) === 0)

// Qua nửa đêm khi chưa ngủ: sang ngày mới
await evalJs(`(() => { const s = ${play()}.state; s.time = ${DAY_MS} - 1200 })()`) // chừa 1,2 giây để đọc "ngày trước" kịp
const dayBefore = await evalJs(`${play()}.state.day`)
await sleep(2000)
es = await stateJs()
check('qua nửa đêm: sang ngày mới', es.day === dayBefore + 1 && es.time < 2000 && (await toast()).includes('nửa đêm'), `ngày ${dayBefore} -> ${es.day}`)

// 4e) Vật nuôi: mua ở cửa hàng đã kiểm ở e2e chính; ở đây đi ra chuồng cho ăn, chờ, nhặt trứng
await evalJs(`(() => { const s = ${play()}.state; s.zones.pen = 1; s.animals.free_0 = { kind: 'chicken', fed: false, prodMs: 0 }; s.inventory = { feed: 2 } })()`)
await tpTo(13.5, 12.5) // bãi cỏ thả rông, ngay chỗ free_0
const penPos = await pos()
await sleep(300)
check('đi tới bãi thả rông, vật nuôi hiện ra và có bong bóng báo đói', (await evalJs(`${play()}.animalViews.get('free_0').sprite.visible`)) === true && (await evalJs(`${play()}.animalViews.get('free_0').bubble.visible`)) === true, JSON.stringify(penPos))
check('gợi ý cho ăn', (await evalJs(`${play()}.hint.text`)).includes('ăn'), await evalJs(`${play()}.hint.text`))
await tap('e', 300)
es = await stateJs()
check('cho gà ăn: trừ 1 thức ăn, gà đã ăn', es.animals.free_0.fed === true && es.inventory.feed === 1, `fed ${es.animals.free_0.fed}, ${JSON.stringify(es.inventory)}`)
await tap('e', 200) // bấm khi đang ăn: không đổi
es = await stateJs()
check('bấm E khi gà đang ăn không làm gì thêm', es.inventory.feed === 1)
await evalJs(`${play()}.state.animals.free_0.prodMs = 40000`)
await sleep(400)
check('chín: gà tự đẻ vào ổ, nằm chờ thức ăn (bong bóng đói), trứng chưa vào kho', (await evalJs(`${play()}.state.nests.egg`)) === 1 && (await evalJs(`${play()}.animalViews.get('free_0').bubble.texture.key`)) === 'icon-feed' && !((await stateJs()).inventory.egg), JSON.stringify(await evalJs(`${play()}.state.nests`)))
await shot('pen-ready')
await evalJs(`${play()}.state.player = { col: 13.5, row: 12.6 }`)
await sleep(300)
check('đứng gần ổ: gợi ý lấy trứng', (await evalJs(`${play()}.hint.text`)).includes('Lấy 1 trứng gà'), await evalJs(`${play()}.hint.text`))
await tap('e', 300)
es = await stateJs()
check('lấy trứng từ ổ: +1 trứng gà vào kho, ổ trống, gà vẫn chờ ăn', es.inventory.egg === 1 && es.nests.egg === 0 && es.animals.free_0.fed === false, `${JSON.stringify(es.inventory)}`)
await tap('e', 200) // ổ trống: E rải thức ăn cho gà đói, không nhặt thêm trứng
es = await stateJs()
check('bấm lặp lại không nhân đôi trứng', es.inventory.egg === 1, JSON.stringify(es.inventory))
// Hàng rào/biển chuồng chặn đường: đi sang trái từ bãi thả rông, không vào được chuồng (khung nhỏ: biển ở cột 5-7 tùy cấp bản đồ đang dựng)
await keyEv('keyDown', 'a')
await sleep(1500)
await keyEv('keyUp', 'a')
const fenced = await pos()
check('hàng rào chặn đường (không đi xuyên)', fenced.col >= 6.2, `col ${fenced.col.toFixed(2)}`)
// Hết thức ăn thì không cho ăn được, không mất gì
await tpTo(13.5, 12.5)
await evalJs(`(() => { const s = ${play()}.state; s.inventory = {}; s.animals.free_0 = { kind: 'chicken', fed: false, prodMs: 0 } })()`)
await sleep(200)
await tap('e', 300)
es = await stateJs()
check('hết thức ăn: không cho ăn được, có thông báo', es.animals.free_0.fed === false && (await toast()).includes('Hết'), `"${await toast()}"`)
await evalJs(`${play()}.state.zones.pen = 0`) // trả về cấp 0 cho phần mở rộng bên dưới

// 4f) Mở rộng từng khu: biển MUA bên phải mỗi khu, mua làm các khu phía sau dịch sang phải
let m0 = await mapInfo()
check('bản đồ cấp 0 cao đúng một màn hình, dài hơn màn hình', m0.rows * 32 <= 544 && m0.cols * 32 > 960, `${m0.cols}x${m0.rows} ô`)
check('có đủ 5 biển MUA (chuồng, nhà bếp, nhà kho, ruộng, ao)', m0.signs.map((s) => s.zone).sort().join() === 'field,kitchen,pen,pond,warehouse', JSON.stringify(m0.signs))
await tpTo(...(await standBySign('field')))
check('biển MUA ruộng: có gợi ý kèm tên khu và giá', (await evalJs(`${play()}.hint.text`)).includes('khu trồng trọt') && (await evalJs(`${play()}.hint.text`)).includes('40 tiền'), await evalJs(`${play()}.hint.text`))
check('ô đất kế tiếp (plot_3_0) chưa tồn tại', (await evalJs(`${play()}.views.has('plot_3_0')`)) === false)
await evalJs(`${play()}.state.money = 39`)
await tap('e', 300)
es = await stateJs()
check('thiếu tiền: không mở rộng, không mất tiền, có thông báo', es.zones.field === 0 && es.money === 39 && (await toast()).includes('Không đủ'), `"${await toast()}"`)
await evalJs(`${play()}.state.money = 1000`)
await tap('e', 300)
await sleep(800)
es = await stateJs()
let m1 = await mapInfo()
check('đủ tiền: mở rộng ruộng cấp 1, trừ 40, bản đồ giữ nguyên kích thước', es.zones.field === 1 && es.money === 960 && m1.cols === m0.cols, `field ${es.zones.field}, money ${es.money}, cols ${m0.cols} -> ${m1.cols}`)
check('ô đất mới plot_3_0 xuất hiện (đúng 1 ô)', (await evalJs(`${play()}.views.has('plot_3_0')`)) === true && (await evalJs(`${play()}.views.has('plot_3_1')`)) === false)
check('biển MUA ruộng dời sang ô kế tiếp', JSON.stringify((await mapInfo()).signs.find((x) => x.zone === 'field')) !== JSON.stringify(m0.signs.find((x) => x.zone === 'field')))
await tpTo(...(await standBySign('pen')))
await evalJs(`${play()}.state.money = 1000`)
check('biển MUA chuồng: gợi ý kèm giá 300', (await evalJs(`${play()}.hint.text`)).includes('khu chăn nuôi') && (await evalJs(`${play()}.hint.text`)).includes('300'), await evalJs(`${play()}.hint.text`))
await tap('e', 300)
await sleep(800)
es = await stateJs()
let m2 = await mapInfo()
check('mở rộng chuồng: +4 chỗ chuồng và +3 chỗ thả rông, bản đồ và nhà bếp giữ nguyên chỗ', es.zones.pen === 1 && m2.slots.filter((s) => !s.pond).length === 14 && m2.cols === m1.cols && m2.buildings[0].col === m1.buildings[0].col, `slots ${m2.slots.length}, cols ${m1.cols} -> ${m2.cols}`)
check('chỗ chuồng mới có hình', (await evalJs(`${play()}.animalViews.has('pen_7')`)) === true)
await tpTo(...(await standBySign('pond')))
await evalJs(`${play()}.state.money = 1000`)
await tap('e', 300)
await sleep(800)
es = await stateJs()
let m3 = await mapInfo()
check('mở rộng hồ cá: hồ rộng ra (6 -> 12 chỗ cá, mặt nước 4x3), sân hồ và hàng rào to theo, bản đồ giữ nguyên kích thước', es.zones.pond === 1 && m3.slots.filter((s) => s.pond).length === 12 && m3.pond.w === 4 && m3.pond.h === 3 && m3.pondYard.h === 7 && m3.cols === m2.cols, `cols ${m2.cols} -> ${m3.cols}, hồ ${JSON.stringify(m3.pond)}`)
check('mỗi khu một lần mua: khu khác không đổi', es.zones.field === 1 && es.zones.pen === 1)

// Nhà bếp và nhà kho: biển MUA mở rộng công năng, KHÔNG làm dài bản đồ
await tpTo(...(await standBySign('kitchen')))
await evalJs(`${play()}.state.money = 1000`)
check('biển MUA nhà bếp: gợi ý kèm hiệu ứng', (await evalJs(`${play()}.hint.text`)).includes('nhà bếp') && (await evalJs(`${play()}.hint.text`)).includes('mẻ'), await evalJs(`${play()}.hint.text`))
await tap('e', 300)
await sleep(800)
es = await stateJs()
let m4 = await mapInfo()
check('mở rộng nhà bếp: thêm 1 mẻ nấu, bản đồ không đổi chiều dài', es.zones.kitchen === 1 && es.money === 650 && m4.cols === m3.cols, `kitchen ${es.zones.kitchen}, money ${es.money}, cols ${m3.cols} -> ${m4.cols}`)
await tpTo(...(await standBySign('warehouse')))
await evalJs(`${play()}.state.money = 1000`)
await tap('e', 300)
await sleep(800)
es = await stateJs()
let m5 = await mapInfo()
check('mở rộng nhà kho: sức chứa 150, bản đồ không đổi chiều dài', es.zones.warehouse === 1 && es.money === 750 && m5.cols === m3.cols && (await evalJs(`${play()}.warehouseText()`)).includes('/150'), `warehouse ${es.zones.warehouse}, money ${es.money}`)
check('còn đủ biển MUA cho các khu chưa mở hết', (await mapInfo()).signs.length === 5)

// 4g) Thế giới cuộn ngang: camera đi theo trái/phải, KHÔNG cuộn dọc; dừng ở hai đầu bản đồ
const camPos = () => evalJs(`JSON.stringify({ x: ${play()}.cameras.main.scrollX, y: ${play()}.cameras.main.scrollY })`).then(JSON.parse)
await tpTo(20.5, 13.5)
await sleep(700)
const cam0 = await camPos()
await holdUntil('d', (q) => q.col >= 25, 8000)
await sleep(700)
const cam1 = await camPos()
check('đi sang phải: camera cuộn sang phải theo', cam1.x > cam0.x + 40, `scrollX ${cam0.x.toFixed(0)} -> ${cam1.x.toFixed(0)}`)
await holdUntil('a', (q) => q.col <= 21, 8000)
await sleep(700)
const cam2 = await camPos()
check('đi sang trái: camera cuộn sang trái theo', cam2.x < cam1.x - 40, `scrollX ${cam1.x.toFixed(0)} -> ${cam2.x.toFixed(0)}`)
await holdUntil('w', (q) => q.row <= 12.5, 1500)
await holdUntil('s', (q) => q.row >= 13.5, 3000)
await sleep(500)
const cam3 = await camPos()
check('đi lên/xuống: camera KHÔNG cuộn dọc (màn hình cố định theo chiều dọc)', Math.abs(cam3.y - cam0.y) < 1, `scrollY ${cam0.y.toFixed(1)} -> ${cam3.y.toFixed(1)}`)
await tpTo(1.5, 15.5)
await sleep(700)
const camL = await camPos()
check('đầu trái bản đồ: camera dừng ở mép trái', Math.abs(camL.x) < 2, JSON.stringify(camL))
await tpTo(m3.cols - 3.5, 15.5)
await sleep(700)
const camR = await camPos()
check('đầu phải bản đồ: camera dừng ở mép phải', Math.abs(camR.x - (m3.cols * 32 - 960)) < 2, `${JSON.stringify(camR)} (tối đa ${m3.cols * 32 - 960})`)
await shot('right-end')

// Nhà bếp: đứng dưới nhà bếp, nấu bằng phím số, nấu xong ra lấy
await evalJs(`(() => { const s = ${play()}.state; s.inventory = { tomato: 2 }; s.zones.kitchen = 0; s.kitchen = [null, null, null] })()`)
await tpTo(...(await spotOf('kitchen')))
await sleep(300)
check('đứng cạnh nhà bếp: có gợi ý', (await evalJs(`${play()}.hint.text`)).includes('Nhà bếp'), await evalJs(`${play()}.hint.text`))
await shot('kitchen-spot')
await tap('e', 300)
check('E mở bảng nhà bếp', (await evalJs(`${play()}.mode`)) === 'kitchen')
await tap('1', 300) // nước ép cà rốt: thiếu cà rốt
es = await stateJs()
check('thiếu nguyên liệu: không nấu, không mất gì', es.kitchen.every((j) => j === null) && es.inventory.tomato === 2, JSON.stringify(es.inventory))
await tap('2', 300) // sốt cà chua
es = await stateJs()
check('nấu sốt cà chua: trừ 2 cà chua, nhà bếp bận, bảng đóng', es.kitchen[0]?.recipe === 'tomato_sauce' && !es.inventory.tomato && (await evalJs(`${play()}.mode`)) === 'play', JSON.stringify(es.kitchen))
await tap('e', 300)
check('đang nấu: E chỉ báo tiến độ, không lấy được', (await toast()).includes('đang nấu') && !(await stateJs()).inventory.sauce, `"${await toast()}"`)
await evalJs(`${play()}.state.kitchen[0].ms = 30000`)
await sleep(300)
check('nấu xong: gợi ý lấy', (await evalJs(`${play()}.hint.text`)).includes('Lấy'), await evalJs(`${play()}.hint.text`))
await tap('e', 300)
es = await stateJs()
check('lấy thành phẩm: +1 sốt cà chua, nhà bếp rảnh', es.inventory.sauce === 1 && es.kitchen[0] === null, JSON.stringify(es.inventory))

// Nhiều mẻ cùng lúc + công thức cá/sữa/nấm cục (nhà bếp cấp 1 = 2 mẻ)
await evalJs(`(() => { const s = ${play()}.state; s.zones.kitchen = 1; s.inventory = { milk: 2, fish: 2, tomato: 2 } })()`)
await tap('e', 300)
check('E mở bảng nhà bếp (còn bếp trống)', (await evalJs(`${play()}.mode`)) === 'kitchen')
check('bảng nhà bếp liệt kê đủ 6 công thức, có phô mai, súp cá, nấm cục hầm', (await evalJs(`${play()}.panel.text`)).includes('Phô mai') && (await evalJs(`${play()}.panel.text`)).includes('Súp cá') && (await evalJs(`${play()}.panel.text`)).includes('Nấm cục hầm'))
await tap('5', 300) // phô mai (2 sữa)
check('nấu phô mai: bảng vẫn mở vì còn bếp trống', (await evalJs(`${play()}.mode`)) === 'kitchen' && (await stateJs()).kitchen[0]?.recipe === 'cheese' && !(await stateJs()).inventory.milk)
await tap('4', 300) // súp cá (2 cá)
es = await stateJs()
check('nấu súp cá ở bếp thứ hai: bảng đóng vì hết bếp trống', es.kitchen[1]?.recipe === 'fish_soup' && !es.inventory.fish && (await evalJs(`${play()}.mode`)) === 'play', JSON.stringify(es.kitchen))
await evalJs(`(() => { const s = ${play()}.state; s.kitchen[1].ms = 40000 })()`)
await sleep(300)
await tap('e', 300)
es = await stateJs()
check('lấy mẻ chín trước: +1 súp cá, mẻ phô mai vẫn đang nấu', es.inventory.fish_soup === 1 && es.kitchen[1] === null && es.kitchen[0]?.recipe === 'cheese', JSON.stringify(es.inventory))
await evalJs(`(() => { const s = ${play()}.state; s.zones.kitchen = 0; s.kitchen = [null, null, null] })()`)

// Nhà kho: mở bảng, nâng cấp sức chứa
await tpTo(...(await spotOf('warehouse')))
await sleep(300)
await evalJs(`${play()}.state.money = 1000`)
await tap('e', 300)
check('E mở bảng nhà kho', (await evalJs(`${play()}.mode`)) === 'warehouse')
await tap('1', 300)
es = await stateJs()
check('mua mở rộng nhà kho ngay trong bảng: cấp 2, trừ 600, sức chứa 250', es.zones.warehouse === 2 && es.money === 400 && (await evalJs(`${play()}.warehouseText()`)).includes('/250'), `warehouse ${es.zones.warehouse}, money ${es.money}`)
await sleep(800)

// Kho đầy: thu hoạch bị từ chối, không mất cây
await evalJs(`(() => { const s = ${play()}.state; s.zones.warehouse = 0; s.inventory = { carrot: 50 }; s.plots.plot_0_1 = { planted: true, crop: 'seed_carrot', watered: true, growMs: 99999 } })()`)
await tpTo(...(await plotCenter('plot_0_1')))
await sleep(300)
await tap('e', 300)
es = await stateJs()
check('kho đầy: không thu hoạch, cây còn, có thông báo', es.plots.plot_0_1.planted === true && es.inventory.carrot === 50 && (await toast()).includes('Kho đầy'), `"${await toast()}"`)
await shot('stock-full')
check('HUD hiện sức chứa kho', (await evalJs(`${play()}.hud.selectedText.text`)).includes('50/50'), await evalJs(`${play()}.hud.selectedText.text`))

// 4h) Heo và bò: mua ở trang Vật nuôi bằng phím thật
await evalJs(`(() => { const s = ${play()}.state; s.money = 5000; s.inventory = {}; s.flags.gotStarter = true; s.zones.pen = 3 })()`)
await enterMap('hub', 3.5, 12.5)
await sleep(300)
await tap('e', 300)
check('E ở lái buôn mở cửa hàng', (await evalJs(`${play()}.mode`)) === 'shop')
// Điều khiển bàn phím trong cửa hàng: A/D hoặc ←→ đổi tab, S/↓ xuống lưới, W/↑ lên tab, Enter bấm nút chính
const nav = () => evalJs(`JSON.stringify({ tab: ${play()}.shopTab, sel: ${play()}.shopSel, focus: ${play()}.shopFocus })`).then(JSON.parse)
let nv = await nav()
check('mở cửa hàng: tab Giống, bàn phím đang ở hàng tab', nv.tab === 'seeds' && nv.focus === 'tabs', JSON.stringify(nv))
await tap('d', 200)
nv = await nav()
check('D: sang tab Vật nuôi', nv.tab === 'animals' && nv.sel === 0, JSON.stringify(nv))
await tap('ArrowRight', 200)
nv = await nav()
check('mũi tên phải: sang tab Vật phẩm', nv.tab === 'items', JSON.stringify(nv))
await tap('a', 200)
await tap('ArrowLeft', 200)
nv = await nav()
check('A và mũi tên trái: quay về tab Giống, không vượt quá tab đầu', nv.tab === 'seeds', JSON.stringify(nv))
await tap('ArrowLeft', 200)
check('tab đầu: bấm trái nữa vẫn ở tab Giống', (await nav()).tab === 'seeds')
await tap('s', 200)
nv = await nav()
check('S: xuống lưới vật phẩm', nv.focus === 'grid' && nv.sel === 0, JSON.stringify(nv))
await tap('d', 200)
nv = await nav()
check('D khi ở lưới: chọn ô kế tiếp (không đổi tab)', nv.focus === 'grid' && nv.sel === 1 && nv.tab === 'seeds', JSON.stringify(nv))
await tap('ArrowDown', 200)
check('xuống: sang hàng dưới (8 hạt giống = 2 hàng), ô 1 -> 7', (await nav()).sel === 7)
await tap('ArrowDown', 200)
check('xuống khi không còn hàng dưới: giữ nguyên ô', (await nav()).sel === 7)
await tap('ArrowUp', 200)
check('lên: về hàng trên, ô 7 -> 1 (chưa lên tab)', (await nav()).sel === 1 && (await nav()).focus === 'grid')
await evalJs(`(() => { const s = ${play()}.state; s.money = 1000; s.inventory = {} })()`)
await tap('a', 200)
await tap('Enter', 300)
es = await stateJs()
check('Enter: mua hạt cà rốt đang chọn (trừ 10 tiền)', es.inventory.seed_carrot === 1 && es.money === 990, `${JSON.stringify(es.inventory)} money ${es.money}`)
await tap('w', 200)
nv = await nav()
check('W ở hàng đầu của lưới: lên hàng tab', nv.focus === 'tabs', JSON.stringify(nv))
await tap('d', 200)
await tap('d', 200)
await tap('d', 200)
nv = await nav()
check('đổi ba tab: tới tab Kho hàng', nv.tab === 'sell', JSON.stringify(nv))
await evalJs(`${play()}.state.inventory = { carrot: 4 }`)
await tap('s', 200)
await tap('Enter', 300)
es = await stateJs()
check('Kho hàng: Enter bán cả chồng cà rốt (+100 tiền)', !es.inventory.carrot && es.money === 1090, `${JSON.stringify(es.inventory)} money ${es.money}`)
await shot('shop-keyboard')
await tap('Escape', 300)
await tap('e', 300)
check('mở lại cửa hàng: về tab Giống, focus ở hàng tab', (await nav()).tab === 'seeds' && (await nav()).focus === 'tabs')
await evalJs(`(() => { const s = ${play()}.state; s.money = 5000; s.inventory = {} })()`)
await tap('u', 200)
await tap('u', 200)
check('U hai lần: trang Vật nuôi, có heo và bò', (await evalJs(`${play()}.panel.text`)).includes('Heo') && (await evalJs(`${play()}.panel.text`)).includes('Bò'), (await evalJs(`${play()}.panel.text`)).split('\n').slice(0, 7).join(' | '))
const animalsBefore = Object.values((await stateJs()).animals).filter((a) => a.kind).length
await tap('3', 300) // heo
await tap('4', 300) // bò
es = await stateJs()
const kinds = Object.values(es.animals).filter((a) => a.kind).map((a) => a.kind)
check('mua heo và bò: vào chuồng, trừ đúng tiền', kinds.includes('pig') && kinds.includes('cow') && es.money === 5000 - 450 - 800 && kinds.length === animalsBefore + 2, `${kinds.join(',')} money ${es.money}`)
await tap('e', 300)
await sleep(300)
await enterMap('farm', 6.5, 10.5)
await sleep(700)
const pigSlot = Object.keys(es.animals).find((id) => es.animals[id].kind === 'pig')
check('heo hiện đúng hình trong chuồng', (await evalJs(`${play()}.animalViews.get('${pigSlot}').sprite.texture.key`)).startsWith('pig_'), pigSlot)
await shot('pen-full')

// 4i) Hồ cá: nuôi nhiều cá như heo, bò; một lần rải thức ăn cho cả hồ; vớt cá; mặt nước chặn đường
await evalJs(`(() => { const s = ${play()}.state; s.zones.pond = 0; s.inventory = { feed_fish: 3 }; for (const id of Object.keys(s.animals)) if (id.startsWith('fish_')) s.animals[id] = { kind: '', fed: false, prodMs: 0 }; for (const k of ['fish_0_0', 'fish_0_1', 'fish_1_1']) s.animals[k] = { kind: 'fish', fed: false, prodMs: 0 } })()`)
await tpTo(48.5, 9.5) // bờ phía trên mặt nước
await sleep(600)
check('mặt nước chặn đường', (await evalJs(`${play()}.isBlocked(48.5, 10.5)`)) === true)
check('3 con cá hiện trong hồ, có bong bóng báo đói bằng thức ăn cá', (await evalJs(`['fish_0_0', 'fish_0_1', 'fish_1_1'].every((id) => { const v = ${play()}.animalViews.get(id); return v.sprite.visible && v.sprite.texture.key.startsWith('fish_') && v.bubble.visible && v.bubble.texture.key === 'icon-feed_fish' })`)) === true)
check('gợi ý rải thức ăn xuống hồ cho cả nhóm', (await evalJs(`${play()}.hint.text`)).includes('Rải thức ăn xuống hồ') && (await evalJs(`${play()}.hint.text`)).includes('3 con'), await evalJs(`${play()}.hint.text`))
await tap('e', 400)
es = await stateJs()
check('một lần rải: cả 3 con cá cùng được ăn, trừ đúng 3 thức ăn cá', ['fish_0_0', 'fish_0_1', 'fish_1_1'].every((id) => es.animals[id].fed === true) && !es.inventory.feed_fish, JSON.stringify(es.inventory))
await shot('pond-fed')
await evalJs(`(() => { const s = ${play()}.state; for (const k of ['fish_0_0', 'fish_0_1', 'fish_1_1']) s.animals[k].prodMs = 50000 })()`)
await sleep(400)
check('cá lớn: gợi ý vớt cá', (await evalJs(`${play()}.hint.text`)).includes('Vớt cá'), await evalJs(`${play()}.hint.text`))
await tap('e', 300)
es = await stateJs()
check('vớt cá: +1 cá, con cá đó đói lại (chờ rải thức ăn)', es.inventory.fish === 1 && Object.values(es.animals).filter((a) => a.kind === 'fish' && !a.fed).length === 1, JSON.stringify(es.inventory))

// 4) Kích thước màn hình: không có thanh cuộn, canvas vừa khung
const sizes = [
  ['1920x1080', 1920, 1080],
  ['1366x768', 1366, 768],
  ['1024x600', 1024, 600],
  ['800x450', 800, 450],
  ['390x844-dien-thoai-doc', 390, 844],
]
for (const [name, w, h] of sizes) {
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false })
  await sleep(800)
  const m = JSON.parse(
    await evalJs(`JSON.stringify({ sw: document.documentElement.scrollWidth, sh: document.documentElement.scrollHeight, cw: document.querySelector('canvas').getBoundingClientRect().width, ch: document.querySelector('canvas').getBoundingClientRect().height, iw: innerWidth, ih: innerHeight })`),
  )
  const noScroll = m.sw <= m.iw && m.sh <= m.ih
  const fits = m.cw <= m.iw + 1 && m.ch <= m.ih + 1
  check(`kích thước ${name}: không thanh cuộn, canvas vừa khung`, noScroll && fits, `canvas ${m.cw.toFixed(0)}x${m.ch.toFixed(0)} trong ${m.iw}x${m.ih}`)
  await shot(`size-${name}`)
}
await send('Emulation.clearDeviceMetricsOverride')

console.log('\nTổng:', results.filter((r) => r.ok).length, '/', results.length, 'qua')
ws.close()
process.exit(results.every((r) => r.ok) ? 0 : 1)
