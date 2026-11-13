// Vật nuôi: mua ở cửa hàng, rải/đổ thức ăn (cả nhóm một lần), chờ ra sản phẩm (trứng, nấm cục, sữa) rồi nhặt. Không import gì để test Node đọc được.

import type { Unlock } from './world.ts'

export interface AnimalDef {
  name: string
  price: number
  produceMs: number // thời gian (chỉ tính khi đã cho ăn và game đang mở) để ra sản phẩm
  product: string // ID vật phẩm sản phẩm (xem ITEMS)
  yield: number
  texture: string // khóa ảnh trong game
  size: number // kích thước hiển thị (px) của hình vuông chứa con vật
  home: 'free' | 'pen' | 'pond' // gà, vịt thả rông ngoài bãi cỏ; heo, bò ở trong chuồng (ăn ở máng); cá ở hồ
  feed: string // ID thức ăn riêng của loài (xem ITEMS); một lần rải/đổ thức ăn dùng 1 phần cho mỗi con đang đói
  unlock?: Unlock // cấp mở rộng của một khu cần đạt thì mới được mua
}

export const ANIMALS: Record<string, AnimalDef> = {
  chicken: { name: 'Gà', price: 120, produceMs: 40_000, product: 'egg', yield: 1, texture: 'chicken', size: 44, home: 'free', feed: 'feed', unlock: { zone: 'pen', level: 1 } },
  duck: { name: 'Vịt', price: 260, produceMs: 70_000, product: 'duck_egg', yield: 1, texture: 'duck', size: 44, home: 'free', feed: 'feed', unlock: { zone: 'pen', level: 2 } },
  pig: { name: 'Heo', price: 450, produceMs: 100_000, product: 'truffle', yield: 1, texture: 'pig', size: 56, home: 'pen', feed: 'feed_pig', unlock: { zone: 'pen', level: 2 } },
  cow: { name: 'Bò', price: 800, produceMs: 140_000, product: 'milk', yield: 1, texture: 'cow', size: 64, home: 'pen', feed: 'feed_cow', unlock: { zone: 'pen', level: 3 } },
  fish: { name: 'Cá', price: 35, produceMs: 50_000, product: 'fish', yield: 1, texture: 'fish', size: 40, home: 'pond', feed: 'feed_fish' },
}

export const NEST_CAP = 24 // mỗi ổ trứng chứa tối đa 24 trứng; đầy thì gà/vịt giữ trứng cho tới khi có chỗ
export const ANIMAL_KINDS = Object.keys(ANIMALS)
