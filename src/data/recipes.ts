// Công thức chế biến ở nhà bếp. Không import gì để test Node đọc được.
// Thời gian chỉ chạy khi game đang mở (giống cây trồng). Nhà bếp nấu nhiều mẻ cùng lúc: 1 mẻ ở cấp 0, +1 mẻ mỗi cấp mở rộng.

export const KITCHEN_MAX_SLOTS = 3 // số mẻ nấu cùng lúc tối đa (1 + số cấp mở rộng nhà bếp)

export interface RecipeDef {
  id: string // ID ổn định, dùng trong file lưu
  name: string
  inputs: Record<string, number> // ID vật phẩm -> số lượng cần
  output: string // ID vật phẩm tạo ra
  yield: number
  cookMs: number
}

export const RECIPES: RecipeDef[] = [
  { id: 'carrot_juice', name: 'Nước ép cà rốt', inputs: { carrot: 3 }, output: 'juice', yield: 1, cookMs: 25_000 },
  { id: 'tomato_sauce', name: 'Súp cà chua', inputs: { tomato: 2 }, output: 'sauce', yield: 1, cookMs: 30_000 },
  { id: 'omelette', name: 'Trứng ốp la', inputs: { egg: 2 }, output: 'omelette', yield: 1, cookMs: 35_000 },
  { id: 'fish_soup', name: 'Súp cá', inputs: { fish: 2 }, output: 'fish_soup', yield: 1, cookMs: 40_000 },
  { id: 'cheese', name: 'Phô mai', inputs: { milk: 2 }, output: 'cheese', yield: 1, cookMs: 50_000 },
  { id: 'truffle_stew', name: 'Nấm cục hầm', inputs: { truffle: 2 }, output: 'truffle_stew', yield: 1, cookMs: 45_000 },
  // Món theo cây trồng thêm (ảnh món lấy từ bộ art dishes)
  { id: 'french_fries', name: 'Khoai tây chiên', inputs: { potato: 3 }, output: 'french_fries', yield: 1, cookMs: 30_000 },
  { id: 'mashed_potato', name: 'Khoai tây nghiền', inputs: { potato: 2, milk: 1 }, output: 'mashed_potato', yield: 1, cookMs: 40_000 },
  { id: 'bread', name: 'Bánh mì', inputs: { wheat: 3 }, output: 'bread', yield: 1, cookMs: 30_000 },
  { id: 'cabbage_salad', name: 'Salad cải bắp', inputs: { cabbage: 2 }, output: 'cabbage_salad', yield: 1, cookMs: 30_000 },
  { id: 'veg_sandwich', name: 'Sandwich rau', inputs: { wheat: 2, cabbage: 1, tomato: 1 }, output: 'veg_sandwich', yield: 1, cookMs: 40_000 },
  { id: 'grilled_corn', name: 'Ngô nướng', inputs: { corn: 2 }, output: 'grilled_corn', yield: 1, cookMs: 30_000 },
  { id: 'cornbread', name: 'Bánh ngô', inputs: { corn: 2, egg: 1 }, output: 'cornbread', yield: 1, cookMs: 45_000 },
  { id: 'strawberry_juice', name: 'Nước ép dâu', inputs: { strawberry: 2 }, output: 'strawberry_juice', yield: 1, cookMs: 30_000 },
  { id: 'strawberry_jam', name: 'Mứt dâu', inputs: { strawberry: 3 }, output: 'strawberry_jam', yield: 1, cookMs: 35_000 },
  { id: 'strawberry_cake', name: 'Bánh dâu', inputs: { strawberry: 2, wheat: 2, egg: 1 }, output: 'strawberry_cake', yield: 1, cookMs: 60_000 },
  { id: 'pumpkin_soup', name: 'Súp bí ngô', inputs: { pumpkin: 2 }, output: 'pumpkin_soup', yield: 1, cookMs: 45_000 },
  { id: 'pumpkin_pie', name: 'Bánh bí ngô', inputs: { pumpkin: 1, wheat: 2, egg: 1 }, output: 'pumpkin_pie', yield: 1, cookMs: 50_000 },
]
export const RECIPE_IDS = RECIPES.map((r) => r.id)
