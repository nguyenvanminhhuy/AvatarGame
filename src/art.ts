import Phaser from 'phaser'
import { ENV_FRAMES } from './assets.gen'

// Quy ước art (pixel-art 4x, xem tools/import-art.mjs):
//  - Ô môi trường 32 px: frame trong atlas 'env' (128 px) vẽ ở 0.25x.
//  - Sprite dạng ô 128 px (nhân vật, vật nuôi, cây trồng, icon): vẽ theo kích thước hiển thị mong muốn.
//  - Vật thể cắt sát (cây lớn, nhà, hàng rào...): vẽ ở OBJ_SCALE của file 4x (= 2x pixel gốc).
export const OBJ_SCALE = 0.5
export const HUB_SCALE = 0.3 // công trình khu chợ được vẽ to hơn trong atlas gốc nên thu nhỏ hơn
export const PLAYER_SIZE = 64 // khung nhân vật 128 px vẽ ở 64 px
export const PLAYER_FOOT = 0.9 // bàn chân nằm khoảng 90% chiều cao khung

export const DIRS = ['down', 'up', 'side'] as const
export type Dir = (typeof DIRS)[number]
// Hình nhìn ngang của nhân vật quay sang phải; đi sang trái thì lật ngang.
export const SIDE_FACES_RIGHT = true

// Frame đứng yên theo hướng.
export const IDLE_FRAME: Record<Dir, string> = { down: 'boy_idle_front_1', up: 'boy_idle_back', side: 'boy_idle_side_1' }

// Chỉ số frame của một sprite trong atlas môi trường.
export function env(name: string): number {
  const f = ENV_FRAMES[name]
  if (f === undefined) throw new Error(`Không có sprite môi trường: ${name}`)
  return f
}

const frames = (prefix: string, n: number) => Array.from({ length: n }, (_, i) => ({ key: `${prefix}_${i + 1}` }))

// Tạo các animation dùng chung (mỗi frame là một ảnh riêng).
export function registerAnimations(scene: Phaser.Scene) {
  const add = (key: string, fr: Array<{ key: string }>, frameRate: number, repeat = -1) => {
    if (!scene.anims.exists(key)) scene.anims.create({ key, frames: fr, frameRate, repeat })
  }
  add('player-walk-down', frames('boy_walk_down', 4), 8)
  add('player-walk-up', frames('boy_walk_up', 4), 8)
  add('player-walk-side', frames('boy_walk_side', 8), 12)
  add('player-idle-down', frames('boy_idle_front', 2), 2)
  add('player-idle-side', frames('boy_idle_side', 2), 2)
  // Hành động (phát một lần khi trồng, tưới, thu hoạch).
  for (const act of ['sow', 'water', 'harvest']) {
    add(`player-${act}-down`, frames(`boy_${act}_front`, 4), 10, 0)
    add(`player-${act}-side`, frames(`boy_${act}_side`, 4), 10, 0)
  }
  add('npc-trader', frames('npc_trader', 2), 2)
  for (const a of ['chicken', 'duck', 'cow', 'pig']) {
    add(`${a}-idle`, frames(`${a}_idle`, 2), 2)
    add(`${a}-eat`, frames(`${a}_eat`, 2), 3)
  }
  add('fx-sparkle', frames('fx_sparkle', 4), 12, 0)
  add('fx-harvest', frames('fx_harvest_pop', 3), 10, 0)
  add('fx-water', frames('fx_water_drops', 4), 12, 0)
  add('fx-seed', frames('fx_seed_scatter', 4), 12, 0)
  add('fx-coin', frames('fx_coin_pop', 4), 12, 0)
}
