// Nâng cấp mua bằng tiền ở cửa hàng. Không import gì để test Node đọc được.

export const GROWTH_BONUS_PER_LEVEL = 0.25 // phân bón: mỗi cấp cây lớn nhanh hơn 25%

export interface UpgradeDef {
  id: string // ID ổn định, dùng trong file lưu
  name: string
  costs: number[] // giá của từng cấp; độ dài = số cấp tối đa
  describe: (level: number) => string // mô tả hiệu ứng ở cấp `level` (0 = chưa nâng)
}

export const UPGRADES: UpgradeDef[] = [
  {
    id: 'fertilizer',
    name: 'Phân bón',
    costs: [200, 500],
    describe: (lv) => (lv === 0 ? 'cây lớn bình thường' : `cây lớn nhanh hơn ${Math.round(lv * GROWTH_BONUS_PER_LEVEL * 100)}%`),
  },
  {
    id: 'can',
    name: 'Bình tưới lớn',
    costs: [300, 700],
    describe: (lv) => ['tưới 1 ô', 'tưới 3 ô cùng hàng', 'tưới khối 3x3 ô'][lv] ?? '',
  },
]

export const BASE_CAPACITY = 50 // sức chứa kho (tổng số vật phẩm) khi chưa mở rộng nhà kho (xem ZONES.warehouse)
export const CAPACITY_PER_LEVEL = 100

export const UPGRADE_IDS = UPGRADES.map((u) => u.id)
