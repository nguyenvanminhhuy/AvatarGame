 // Catalog: dữ liệu ĐỊNH NGHĨA vật phẩm và cây trồng. Số lượng người chơi sở hữu nằm ở GameState.

import type { Unlock } from './world.ts'

export interface ItemDef {
  name: string
  buyPrice?: number // có giá mua thì bán ở cửa hàng
  sellPrice?: number // có giá bán thì người chơi bán được
  unlock?: Unlock // cấp mở rộng của một khu cần đạt thì mới được mua
}

export const ITEMS: Record<string, ItemDef> = {
  seed_carrot: { name: 'Hạt cà rốt', buyPrice: 10 },
  carrot: { name: 'Cà rốt', sellPrice: 25 },
  seed_tomato: { name: 'Hạt cà chua', buyPrice: 25, unlock: { zone: 'field', level: 1 } },
  tomato: { name: 'Cà chua', sellPrice: 70 },
  // Cây trồng thêm theo cấp ruộng (xem CROPS bên dưới): hạt giống mở khóa dần khi mở rộng khu trồng trọt.
  seed_potato: { name: 'Hạt khoai tây', buyPrice: 15, unlock: { zone: 'field', level: 3 } },
  potato: { name: 'Khoai tây', sellPrice: 40 },
  seed_wheat: { name: 'Hạt lúa mì', buyPrice: 12, unlock: { zone: 'field', level: 6 } },
  wheat: { name: 'Lúa mì', sellPrice: 32 },
  seed_cabbage: { name: 'Hạt cải bắp', buyPrice: 30, unlock: { zone: 'field', level: 10 } },
  cabbage: { name: 'Cải bắp', sellPrice: 85 },
  seed_corn: { name: 'Hạt ngô', buyPrice: 35, unlock: { zone: 'field', level: 15 } },
  corn: { name: 'Ngô', sellPrice: 100 },
  seed_strawberry: { name: 'Hạt dâu tây', buyPrice: 45, unlock: { zone: 'field', level: 22 } },
  strawberry: { name: 'Dâu tây', sellPrice: 130 },
  seed_pumpkin: { name: 'Hạt bí ngô', buyPrice: 60, unlock: { zone: 'field', level: 30 } },
  pumpkin: { name: 'Bí ngô', sellPrice: 180 },
  fish: { name: 'Cá', sellPrice: 110 },
  feed: { name: 'Thóc (gà, vịt)', buyPrice: 8, unlock: { zone: 'pen', level: 1 } },
  feed_pig: { name: 'Cám heo', buyPrice: 14, unlock: { zone: 'pen', level: 2 } },
  feed_cow: { name: 'Cỏ khô (bò)', buyPrice: 20, unlock: { zone: 'pen', level: 3 } },
  feed_fish: { name: 'Thức ăn cá', buyPrice: 6 },
  egg: { name: 'Trứng gà', sellPrice: 40 },
  duck_egg: { name: 'Trứng vịt', sellPrice: 80 },
  truffle: { name: 'Nấm cục', sellPrice: 130 },
  milk: { name: 'Sữa bò', sellPrice: 220 },
  // Thành phẩm từ nhà chế biến (xem recipes.ts): bán giá cao hơn nguyên liệu.
  sauce: { name: 'Súp cà chua', sellPrice: 200 }, // ID cũ 'sauce' giữ nguyên để save cũ còn dùng được
  juice: { name: 'Nước ép cà rốt', sellPrice: 110 },
  omelette: { name: 'Trứng ốp la', sellPrice: 130 },
  fish_soup: { name: 'Súp cá', sellPrice: 340 },
  cheese: { name: 'Phô mai', sellPrice: 600 },
  truffle_stew: { name: 'Nấm cục hầm', sellPrice: 380 },
  cabbage_salad: { name: 'Salad cải bắp', sellPrice: 220 },
  veg_sandwich: { name: 'Sandwich rau', sellPrice: 330 },
  french_fries: { name: 'Khoai tây chiên', sellPrice: 160 },
  mashed_potato: { name: 'Khoai tây nghiền', sellPrice: 400 },
  bread: { name: 'Bánh mì', sellPrice: 150 },
  grilled_corn: { name: 'Ngô nướng', sellPrice: 250 },
  cornbread: { name: 'Bánh ngô', sellPrice: 420 },
  strawberry_juice: { name: 'Nước ép dâu', sellPrice: 330 },
  strawberry_jam: { name: 'Mứt dâu', sellPrice: 480 },
  strawberry_cake: { name: 'Bánh dâu', sellPrice: 650 },
  pumpkin_soup: { name: 'Súp bí ngô', sellPrice: 460 },
  pumpkin_pie: { name: 'Bánh bí ngô', sellPrice: 450 },
}

export interface CropDef {
  growMs: number // thời gian lớn (chỉ tính khi đã tưới và game đang mở)
  seedArt: string // khóa texture giai đoạn đầu
  sproutArt: string // nảy mầm
  growArt: string // đang lớn
  readyArt: string // khóa texture khi chín
  harvestItem: string
  yield: number
}

// Khóa là ID hạt giống. Ảnh cây: plant-<tên>-seed / -sprout / -grow và plant-ready-<tên> (cà rốt dùng 'plant-ready').
const crop = (name: string, growMs: number, harvestItem: string): CropDef => ({
  growMs,
  seedArt: `plant-${name}-seed`,
  sproutArt: `plant-${name}-sprout`,
  growArt: `plant-${name}-grow`,
  readyArt: `plant-ready-${name}`,
  harvestItem,
  yield: 1,
})
export const CROPS: Record<string, CropDef> = {
  seed_carrot: { growMs: 20_000, seedArt: 'plant-carrot-seed', sproutArt: 'plant-carrot-sprout', growArt: 'plant-carrot-grow', readyArt: 'plant-ready', harvestItem: 'carrot', yield: 1 },
  seed_tomato: { growMs: 45_000, seedArt: 'plant-tomato-seed', sproutArt: 'plant-tomato-sprout', growArt: 'plant-tomato-grow', readyArt: 'plant-ready-tomato', harvestItem: 'tomato', yield: 1 },
  seed_potato: crop('potato', 30_000, 'potato'),
  seed_wheat: crop('wheat', 35_000, 'wheat'),
  seed_cabbage: crop('cabbage', 40_000, 'cabbage'),
  seed_corn: crop('corn', 50_000, 'corn'),
  seed_strawberry: crop('strawberry', 55_000, 'strawberry'),
  seed_pumpkin: crop('pumpkin', 70_000, 'pumpkin'),
}

export const STARTER_SEEDS = { id: 'seed_carrot', qty: 3 }
export const START_MONEY = 100_000 // tiền khởi đầu hào phóng để thử mọi chức năng; đặt lại số nhỏ khi cân bằng game
