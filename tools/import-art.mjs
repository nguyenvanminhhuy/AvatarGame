// Nhập art từ art-source/ (các bộ sprite pixel-art 4x do chủ dự án cung cấp) vào public/assets/game/ với tên khóa phẳng,
// và sinh src/assets.gen.ts (danh sách khóa + bảng frame của atlas môi trường). Chạy lại bất cứ lúc nào: pnpm art
//   node tools/import-art.mjs
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'

const SRC = 'art-source'
const OUT = 'public/assets/game'
rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })

const keys = []
const put = (from, key) => {
  const src = join(SRC, from)
  if (!existsSync(src)) throw new Error(`Thiếu file nguồn: ${src}`)
  if (keys.includes(key)) throw new Error(`Trùng khóa: ${key}`)
  copyFileSync(src, join(OUT, `${key}.png`))
  keys.push(key)
}
// Copy mọi PNG trong một thư mục; khóa = prefix + tên file.
const putDir = (dir, prefix = '') => {
  for (const f of readdirSync(join(SRC, dir)).sort()) if (f.endsWith('.png')) put(join(dir, f), prefix + basename(f, '.png'))
}

// --- Môi trường: atlas 8x8 ô 128 px (4x của ô 32 px) ---
put('env_sprites_patched/atlas_patched_4x.png', 'env')
const envManifest = JSON.parse(readFileSync(join(SRC, 'env_sprites_patched/manifest.json'), 'utf8'))
const envFrames = Object.fromEntries(envManifest.sprites.map((s) => [s.name, (s.row - 1) * envManifest.columns + (s.col - 1)]))

// --- Cây, công trình, trang trí của nông trại (cắt sát; vẽ ở 0.5x file 4x = 2x gốc) ---
for (const g of ['trees', 'buildings', 'haystack', 'bushes', 'decor', 'wheat', 'flowers', 'fences']) putDir(`farm_bc_sprites_4x/sprites/${g}`)

// --- Khu chợ (hub): cổng, quầy, cửa hàng, bảng tin, rương, lái buôn ---
for (const n of ['gate_farm', 'stall_fruit', 'notice_board', 'chest']) put(`farm_hub_structures_split/sprites_4x/structures/${n}.png`, n)
put('farm_hub_structures_split/sprites_4x/patched/farm_shop_filled.png', 'farm_shop')
putDir('farm_hub_structures_split/sprites_4x/npc')

// --- Nhân vật (ô 128 px) ---
putDir('farm_boy_chibi_split/sprites_4x/idle')
putDir('farm_boy_chibi_split/sprites_4x/walk')
putDir('farm_boy_chibi_split/sprites_4x/actions')

// --- Vật nuôi (ô 128 px): idle + ăn ---
for (const a of ['chicken', 'duck', 'cow', 'pig']) putDir(`farm_animals_dishes_split/sprites_4x/animals/${a}`)

// --- Ô đất, cây trồng, cá ---
put('farm_crops_icons_split/sprites_4x/plots/plot_dry.png', 'plot-dry')
put('farm_crops_icons_split/sprites_4x/plots/plot_wet.png', 'plot-wet')
const stages = [['1_seed', 'seed'], ['2_sprout', 'sprout'], ['3_growing', 'grow']]
const CROP_NAMES = ['carrot', 'tomato', 'potato', 'wheat', 'cabbage', 'corn', 'strawberry', 'pumpkin']
for (const crop of CROP_NAMES) {
  for (const [file, stage] of stages) put(`farm_crops_icons_split/sprites_4x/crops/${crop}/${crop}_${file}.png`, `plant-${crop}-${stage}`)
}
put('farm_crops_icons_split/sprites_4x/crops/carrot/carrot_4_ripe.png', 'plant-ready') // cà rốt dùng khóa 'plant-ready'
for (const crop of CROP_NAMES.slice(1)) put(`farm_crops_icons_split/sprites_4x/crops/${crop}/${crop}_4_ripe.png`, `plant-ready-${crop}`)
// Cá nuôi trong hồ: bơi (4 khung) và đứng yên (2 khung đầu) cho animal 'fish' (khóa fish_walk_n / fish_idle_n)
for (let n = 1; n <= 4; n++) put(`farm_fish_split/sprites_4x/fish/carp/carp_adult_${n}.png`, `fish_walk_${n}`)
for (let n = 1; n <= 2; n++) put(`farm_fish_split/sprites_4x/fish/carp/carp_adult_${n}.png`, `fish_idle_${n}`)
put('farm_fish_split/sprites_4x/effects/splash_ring_a.png', 'splash_ring')
put('farm_fish_split/sprites_4x/structures/sign_fish.png', 'sign_fish')

// --- Icon vật phẩm: khóa icon-<id> khớp ITEMS (hạt giống và trứng vịt được ghép/nhuộm lúc khởi động, xem BootScene) ---
const C = 'farm_crops_icons_split/sprites_4x'
const D = 'farm_animals_dishes_split/sprites_4x'
put(`${C}/icons/icon_carrot.png`, 'icon-carrot')
for (const crop of CROP_NAMES.slice(1)) put(`${C}/icons/icon_${crop === 'wheat' ? 'wheat_bundle' : crop}.png`, `icon-${crop}`)
put(`${C}/icons/seed_bag.png`, 'seed_bag')
put(`${C}/ui_currency/coin.png`, 'icon-coin')
put(`${D}/products/product_egg.png`, 'icon-egg')
put(`${D}/products/product_milk.png`, 'icon-milk')
put(`${D}/dishes/dish_tomato_soup.png`, 'icon-sauce')
put(`${D}/dishes/dish_carrot_juice.png`, 'icon-juice')
put(`${D}/dishes/dish_fried_egg.png`, 'icon-omelette')
put(`${D}/dishes/dish_cheese.png`, 'icon-cheese')
put('farm_ui_split/sprites_4x/icons_items/icon_soup_bowl.png', 'icon-fish_soup')
put('farm_ui_split/sprites_4x/icons_items/icon_cooking_pot.png', 'icon-truffle_stew')
// Món theo cây trồng: khóa icon-<id món> khớp ITEMS
for (const d of ['cabbage_salad', 'veg_sandwich', 'french_fries', 'mashed_potato', 'bread', 'grilled_corn', 'cornbread', 'strawberry_juice', 'strawberry_jam', 'strawberry_cake', 'pumpkin_soup', 'pumpkin_pie']) put(`${D}/dishes/dish_${d}.png`, `icon-${d}`)
put('farm_sprites_4x/decor/mushrooms.png', 'icon-truffle')
put('farm_fish_split/sprites_4x/icons/icon_carp.png', 'icon-fish')
put('farm_hub_ui_items_split/sprites_4x/items/feed_livestock.png', 'icon-feed_pig')
put('farm_hub_ui_items_split/sprites_4x/items/hay_bale.png', 'icon-feed_cow')
put('farm_fish_split/sprites_4x/items/fish_food.png', 'icon-feed_fish')
put('farm_hub_ui_items_split/sprites_4x/items/feed_poultry.png', 'icon-feed')

// --- Giao diện ---
for (const g of ['buttons', 'indicators', 'panels']) putDir(`farm_ui_split/sprites_4x/${g}`, 'ui_')
for (const n of ['mail_icon', 'icon_backpack', 'icon_quest_scroll', 'icon_clock']) put(`farm_ui_split/sprites_4x/icons_system/${n}.png`, `ui_${n}`)
for (const n of ['shop_window', 'item_card', 'item_card_selected', 'label_plain']) put(`farm_hub_ui_items_split/sprites_4x/ui/${n}.png`, `hub_${n}`)
put('farm_sprites_4x/ui/sign_mua_a.png', 'sign_mua')
// Bộ giao diện gỗ (farm_ui_kit_wood): nút, tab, nút icon, huy hiệu; khóa kit_<tên>. Nút/tab là 9-slice (xem src/ui/kit.ts).
for (const g of ['buttons', 'tabs', 'iconbuttons']) putDir(`farm_ui_kit_wood/sprites_4x/${g}`, 'kit_')

// --- Hiệu ứng ---
for (const g of ['sparkle', 'harvest_pop', 'water_drops', 'seed_scatter', 'coin_pop']) putDir(`farm_effects_split/sprites_4x/${g}`, 'fx_')

writeFileSync(
  'src/assets.gen.ts',
  `// FILE SINH TỰ ĐỘNG bởi tools/import-art.mjs (pnpm art). Không sửa tay.
// Mỗi khóa ứng với public/assets/game/<khóa>.png (ảnh 4x của pixel-art gốc).
export const ASSET_KEYS: string[] = ${JSON.stringify(keys.filter((k) => k !== 'env'), null, 0)}

// Atlas môi trường 'env': lưới ${envManifest.columns}x${envManifest.rows} ô 128 px; tên sprite -> chỉ số frame.
export const ENV_CELL = 128
export const ENV_FRAMES: Record<string, number> = ${JSON.stringify(envFrames)}
`,
)
console.log(`Đã nhập ${keys.length} ảnh vào ${OUT} và ghi src/assets.gen.ts`)
