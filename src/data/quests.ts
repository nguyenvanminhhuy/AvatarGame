// Chuỗi đơn hàng của người bán hàng: làm lần lượt, đơn đầu chưa xong thì chưa thấy đơn sau.
// Đơn hàng chỉ thưởng tiền; việc mở khóa vật phẩm, vật nuôi, ô đất do cấp mở rộng các khu quyết định (ITEMS[...].unlock, ANIMALS[...].unlock, PlotDef.unlock).

export interface QuestDef {
  id: string // ID ổn định, dùng trong file lưu
  title: string
  require: Record<string, number> // vật phẩm -> số lượng cần giao
  rewardMoney: number
  rewardNote: string // mô tả phần thưởng mở khóa (chỉ để hiển thị)
}

export const QUESTS: QuestDef[] = [
  { id: 'first_order', title: 'Đơn hàng đầu tiên', require: { carrot: 3 }, rewardMoney: 90, rewardNote: '' },
  { id: 'tomato_party', title: 'Cà chua cho bữa tiệc', require: { tomato: 2 }, rewardMoney: 220, rewardNote: '' },
  { id: 'big_garden', title: 'Mở rộng vườn', require: { carrot: 6, tomato: 3 }, rewardMoney: 500, rewardNote: '' },
  // Chuỗi đơn dài: đi cùng tiến trình mở rộng (ruộng cấp 3 khoai tây, 6 lúa mì, 10 cải bắp, 15 ngô, 22 dâu, 30 bí; chăn nuôi, hồ cá).
  { id: 'potato_lunch', title: 'Khoai cho bữa trưa', require: { potato: 4 }, rewardMoney: 300, rewardNote: '' },
  { id: 'fresh_eggs', title: 'Trứng cho ngày mới', require: { egg: 4 }, rewardMoney: 350, rewardNote: '' },
  { id: 'flour_for_oven', title: 'Bột cho lò bánh', require: { wheat: 6 }, rewardMoney: 400, rewardNote: '' },
  { id: 'chef_breakfast', title: 'Bữa sáng của đầu bếp', require: { omelette: 2 }, rewardMoney: 600, rewardNote: '' },
  { id: 'pond_catch', title: 'Cá của hồ nhà', require: { fish: 3 }, rewardMoney: 500, rewardNote: '' },
  { id: 'crispy_fries', title: 'Khoai chiên giòn', require: { french_fries: 3 }, rewardMoney: 700, rewardNote: '' },
  { id: 'hot_bread', title: 'Bánh mì nóng', require: { bread: 3 }, rewardMoney: 700, rewardNote: '' },
  { id: 'cabbage_patch', title: 'Luống cải bắp', require: { cabbage: 5 }, rewardMoney: 650, rewardNote: '' },
  { id: 'green_salad', title: 'Salad tươi', require: { cabbage_salad: 2 }, rewardMoney: 800, rewardNote: '' },
  { id: 'fresh_milk', title: 'Sữa tươi mỗi sáng', require: { milk: 3 }, rewardMoney: 900, rewardNote: '' },
  { id: 'summer_corn', title: 'Ngô mùa hè', require: { corn: 6 }, rewardMoney: 800, rewardNote: '' },
  { id: 'corn_feast', title: 'Ngô nướng cho lễ hội', require: { grilled_corn: 4 }, rewardMoney: 1100, rewardNote: '' },
  { id: 'cheese_maker', title: 'Phô mai thơm', require: { cheese: 2 }, rewardMoney: 1500, rewardNote: '' },
  { id: 'berry_jam', title: 'Mứt dâu mùa đông', require: { strawberry_jam: 3 }, rewardMoney: 1800, rewardNote: '' },
  { id: 'berry_cake', title: 'Bánh dâu cho tiệc', require: { strawberry_cake: 2 }, rewardMoney: 2500, rewardNote: '' },
  { id: 'pumpkin_season', title: 'Mùa bí ngô', require: { pumpkin: 6 }, rewardMoney: 2000, rewardNote: '' },
  { id: 'pumpkin_soup_order', title: 'Súp bí ngô ấm bụng', require: { pumpkin_soup: 3 }, rewardMoney: 2800, rewardNote: '' },
  { id: 'harvest_pie', title: 'Bánh bí ngô mùa gặt', require: { pumpkin_pie: 2 }, rewardMoney: 3000, rewardNote: '' },
  { id: 'grand_feast', title: 'Đại tiệc nông trại', require: { cheese: 2, strawberry_cake: 2, pumpkin_pie: 2, truffle_stew: 2 }, rewardMoney: 8000, rewardNote: '' },
]

export const QUEST_IDS = QUESTS.map((q) => q.id)
