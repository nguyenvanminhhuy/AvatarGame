# Gameplay tổng hợp

> Tài liệu tổng hợp gameplay hiện tại của game (cập nhật theo code, save bản 15). Bạn có thể sửa trực tiếp file này để ghi lại ý định thiết kế mới; số liệu gốc nằm trong `src/data/*.ts`.

## 1. Vòng chơi chính

Game 2D nhìn từ trên xuống, chơi một mình, lưu tự động trong trình duyệt (localStorage).

1. Bắt đầu ở **khu chợ**, nói chuyện với lái buôn để nhận 3 hạt cà rốt.
2. Đi qua cổng FARM vào **nông trại** (bản đồ dài, cuộn ngang).
3. **Trồng → tưới → chờ lớn → thu hoạch**, hoặc **nuôi vật nuôi → cho ăn → nhặt sản phẩm**.
4. Mang nông sản đến **nhà bếp** nấu thành phẩm giá cao, hoặc **bán ở cửa hàng** ở khu chợ.
5. Lấy tiền **mua hạt, thức ăn, vật nuôi, nâng cấp và mở rộng các khu**.

Tiền khởi đầu: **100.000** (`START_MONEY` trong `src/data/items.ts`). Đây là số tạm để thử mọi chức năng, cần giảm khi cân bằng game.

## 2. Điều khiển

| Phím | Tác dụng |
|---|---|
| Mũi tên / WASD | Di chuyển (có va chạm với hàng rào, nước, biển, công trình) |
| E | Tương tác với đối tượng gần nhất (ô đất, vật nuôi, nơi rải thức ăn, nhà bếp, nhà kho, biển MUA, NPC, bảng tin, cửa hàng) |
| Q | Đổi loại hạt đang chọn |
| I | Mở túi đồ |
| H | Hướng dẫn |
| M | Bật/tắt âm thanh |
| ESC | Đóng bảng đang mở |

**Cửa hàng, kho, nhà bếp:**
- ←→ hoặc A/D: đổi tab (hoặc di chuyển ô chọn)
- ↓ / S: xuống các món; ↑ / W: lên hàng tab
- Enter (hoặc Space): nút chính (Mua, Bán, Nấu)
- F: nút phụ (Giao đơn, Mở rộng)
- E hoặc ESC: đóng
- Chuột vẫn dùng được.

## 3. Trồng trọt (khu trồng trọt)

8 loại cây; hạt mở khóa dần theo cấp mở rộng khu trồng trọt. Giá bán nông sản luôn lớn hơn giá hạt.

| Cây | Hạt | Lớn sau | Bán | Mở khóa (cấp ruộng) |
|---|---|---|---|---|
| Cà rốt | 10 | 20 giây | 25 | Có sẵn |
| Cà chua | 25 | 45 giây | 70 | 1 |
| Khoai tây | 15 | 30 giây | 40 | 3 |
| Lúa mì | 12 | 35 giây | 32 | 6 |
| Cải bắp | 30 | 40 giây | 85 | 10 |
| Ngô | 35 | 50 giây | 100 | 15 |
| Dâu tây | 45 | 55 giây | 130 | 22 |
| Bí ngô | 60 | 70 giây | 180 | 30 |

- Cây chỉ lớn khi **đã tưới** và game đang mở (không lớn khi offline).
- Mỗi lô ruộng là 6 cột × 3 hàng = **18 ô**; có 4 lô (72 ô).
- Có sẵn **9 ô**; mỗi lần mua mở rộng thêm đúng **1 ô** (tối đa 63 lần mua). Ô mở lần lượt theo cột, hết lô này sang lô sau.
- Biển "MUA" cắm ngay tại ô sắp mở. Giá bắt đầu từ 40, tăng 10 mỗi ô (ô cuối khoảng 660).

**Nâng cấp ở cửa hàng:**

| Nâng cấp | Cấp | Giá | Hiệu ứng |
|---|---|---|---|
| Phân bón | 2 | 200, 500 | Cây lớn nhanh hơn 25% mỗi cấp |
| Bình tưới lớn | 2 | 300, 700 | Tưới 1 ô → 3 ô cùng hàng → khối 3×3 |

## 4. Vật nuôi

Mua ở tab **Vật nuôi** của cửa hàng. Mỗi con cần được cho ăn, sau một thời gian ra sản phẩm để nhặt. Nhặt xong, con vật đói lại và cần cho ăn lần nữa.

| Con | Giá | Nơi ở | Thức ăn | Sản phẩm (sau) | Mở khóa |
|---|---|---|---|---|---|
| Gà | 120 | Thả rông ngoài bãi cỏ | Thóc | Trứng gà (40 giây) | Chăn nuôi cấp 1 |
| Vịt | 260 | Thả rông | Thóc | Trứng vịt (70 giây) | Chăn nuôi cấp 2 |
| Heo | 450 | Trong chuồng | Cám heo | Nấm cục (100 giây) | Chăn nuôi cấp 2 |
| Bò | 800 | Trong chuồng | Cỏ khô | Sữa (140 giây) | Chăn nuôi cấp 3 |
| Cá | 35 | Trong hồ | Thức ăn cá | Cá (50 giây) | Có sẵn |

**Thức ăn** (mua ở tab Vật phẩm): Thóc 8, Cám heo 14, Cỏ khô 20, Thức ăn cá 6. Cám heo mở ở chăn nuôi cấp 2, cỏ khô ở cấp 3.

**Cho ăn bằng một lần bấm E cho cả nhóm:**
- Gà, vịt: rải thóc ra đất (bãi cỏ).
- Heo, bò: đổ thức ăn vào **máng** trong chuồng. Chỉ có **một máng duy nhất**, nằm sát cổng chuồng (cổng 1 ô ở góc trái cạnh dưới); máng đầy dần theo số con đã ăn.
- Cá: rải thức ăn xuống hồ. Cá bơi nhanh khắp mặt nước (không lên bờ), lượn đuôi, thỉnh thoảng phóng sang chỗ khác.
- Mỗi con đang đói dùng 1 phần thức ăn đúng loài. Thiếu loại nào thì con loài đó vẫn đói, thông báo cho biết thiếu gì.
- Đứng gần con đã chín thì E nhặt/vớt sản phẩm trước; không có con nào trong tầm thì E rải thức ăn.
- **Ổ trứng (gà, vịt):** mỗi bãi cỏ có một ổ (gà bãi trái, vịt bãi phải). Gà, vịt đẻ xong tự cho trứng vào ổ rồi đứng chờ thức ăn lần sau. E ở ổ lấy **hết** trứng của loài đó về kho (kho thiếu chỗ thì lấy được bấy nhiêu, phần dư nằm lại). Ổ chứa tối đa 24 trứng; đầy thì con gà/vịt giữ trứng, nhặt tay như cũ. Save bản 16.

**Số chỗ:**

| Nơi | Cấp 0 | Mỗi cấp thêm | Ghi chú |
|---|---|---|---|
| Chuồng (heo, bò) | 4 | +4 | Khung chuồng rộng ra theo cấp |
| Bãi thả rông (gà, vịt) | 3 | +3 | Gà, vịt tự đi lại quanh chỗ ở |
| Hồ cá | 9 (3×3) | Cấp 1: 12 (4×3); cấp 2: 16 (4×4) | Mặt nước, sân và hàng rào to dần |

## 5. Mở rộng các khu (biển "MUA")

Không mở khóa bằng nhiệm vụ nữa; mở rộng khu đến một cấp nhất định là mở thêm vật phẩm.

| Khu | Số cấp | Giá từng cấp | Hiệu ứng |
|---|---|---|---|
| Chăn nuôi | 3 | 300, 700, 1200 | Thêm chỗ chuồng và chỗ thả rông; mở vịt, heo, bò, cám heo, cỏ khô |
| Hồ cá | 2 | 300, 700 | Hồ rộng ra, nuôi được nhiều cá hơn |
| Nhà bếp | 2 | 350, 900 | Nấu 1 → 2 → 3 mẻ cùng lúc |
| Nhà kho | 3 | 250, 600, 1200 | Sức chứa 50, +100 mỗi cấp |
| Trồng trọt | 63 | 40 + 10 mỗi ô | +1 ô đất mỗi lần mua |

Món chưa mở khóa vẫn hiện mờ trong cửa hàng, ghi rõ cần mở rộng khu nào lên cấp mấy.

## 6. Nhà bếp (chế biến)

Nấu nông sản thành thành phẩm giá cao hơn tổng nguyên liệu (có test kiểm tra). Thời gian nấu chỉ chạy khi game đang mở. Ảnh món lấy từ bộ art dishes; mỗi món khớp với cây trồng của nó.

| Món | Nguyên liệu | Nấu | Bán |
|---|---|---|---|
| Nước ép cà rốt | 3 cà rốt | 25 giây | 110 |
| Súp cà chua | 2 cà chua | 30 giây | 200 |
| Trứng ốp la | 2 trứng gà | 35 giây | 130 |
| Súp cá | 2 cá | 40 giây | 340 |
| Phô mai | 2 sữa | 50 giây | 600 |
| Nấm cục hầm | 2 nấm cục | 45 giây | 380 |
| Khoai tây chiên | 3 khoai tây | 30 giây | 160 |
| Khoai tây nghiền | 2 khoai tây + 1 sữa | 40 giây | 400 |
| Bánh mì | 3 lúa mì | 30 giây | 150 |
| Salad cải bắp | 2 cải bắp | 30 giây | 220 |
| Sandwich rau | 2 lúa mì + 1 cải bắp + 1 cà chua | 40 giây | 330 |
| Ngô nướng | 2 ngô | 30 giây | 250 |
| Bánh ngô | 2 ngô + 1 trứng gà | 45 giây | 420 |
| Nước ép dâu | 2 dâu tây | 30 giây | 330 |
| Mứt dâu | 3 dâu tây | 35 giây | 480 |
| Bánh dâu | 2 dâu tây + 2 lúa mì + 1 trứng gà | 60 giây | 650 |
| Súp bí ngô | 2 bí ngô | 45 giây | 460 |
| Bánh bí ngô | 1 bí ngô + 2 lúa mì + 1 trứng gà | 50 giây | 450 |

Bảng công thức hiện 18 món cùng lúc. Cửa hàng/kho có hơn 18 vật phẩm thì chia trang (↓/↑ để qua trang).

## 7. Cửa hàng, kho và đơn hàng

**Cửa hàng** (khu chợ) có các tab: Hạt giống, Vật nuôi, Vật phẩm (thức ăn và nâng cấp), Bán, Kho.

**Giá bán nguyên liệu:** xem bảng cây trồng ở mục 3; trứng gà 40, trứng vịt 80, cá 110, nấm cục 130, sữa 220.

**Kho:** sức chứa giới hạn (bắt đầu 50 vật phẩm). Kho đầy thì không thu hoạch hay nhặt được.

**Đơn hàng** (bảng tin hoặc nút thư): chuỗi **22 đơn** làm tuần tự, chỉ thưởng tiền. Giao đơn ở cửa hàng (nút phụ, phím F). Đơn đi theo tiến trình mở khóa (cây, vật nuôi, món nấu).

| # | Đơn | Cần | Thưởng |
|---|---|---|---|
| 1 | Đơn hàng đầu tiên | 3 cà rốt | 90 |
| 2 | Cà chua cho bữa tiệc | 2 cà chua | 220 |
| 3 | Mở rộng vườn | 6 cà rốt + 3 cà chua | 500 |
| 4 | Khoai cho bữa trưa | 4 khoai tây | 300 |
| 5 | Trứng cho ngày mới | 4 trứng gà | 350 |
| 6 | Bột cho lò bánh | 6 lúa mì | 400 |
| 7 | Bữa sáng của đầu bếp | 2 trứng ốp la | 600 |
| 8 | Cá của hồ nhà | 3 cá | 500 |
| 9 | Khoai chiên giòn | 3 khoai tây chiên | 700 |
| 10 | Bánh mì nóng | 3 bánh mì | 700 |
| 11 | Luống cải bắp | 5 cải bắp | 650 |
| 12 | Salad tươi | 2 salad cải bắp | 800 |
| 13 | Sữa tươi mỗi sáng | 3 sữa | 900 |
| 14 | Ngô mùa hè | 6 ngô | 800 |
| 15 | Ngô nướng cho lễ hội | 4 ngô nướng | 1100 |
| 16 | Phô mai thơm | 2 phô mai | 1500 |
| 17 | Mứt dâu mùa đông | 3 mứt dâu | 1800 |
| 18 | Bánh dâu cho tiệc | 2 bánh dâu | 2500 |
| 19 | Mùa bí ngô | 6 bí ngô | 2000 |
| 20 | Súp bí ngô ấm bụng | 3 súp bí ngô | 2800 |
| 21 | Bánh bí ngô mùa gặt | 2 bánh bí ngô | 3000 |
| 22 | Đại tiệc nông trại | 2 phô mai + 2 bánh dâu + 2 bánh bí ngô + 2 nấm cục hầm | 8000 |

## 8. Thời gian, không khí và lưu game

- **Ngày và đêm:** đồng hồ chạy; ban đêm trời tối và có đom đóm; qua nửa đêm thì sang ngày mới.
- **HUD:** tiền, ngày và giờ, sức chứa kho, hạt đang chọn, thông báo.
- **Âm thanh:** hiệu ứng, bật/tắt bằng M.
- **Lưu:** tự động mỗi 10 giây và khi đóng/ẩn trang. Save cũ được nâng cấp tự động qua các bản (hiện là bản 14).

## 9. Ý tưởng / việc cần quyết (chỉnh sửa tại đây)

- [ ] **Cân bằng:** với 100.000 tiền khởi đầu, giá mua và mở rộng chưa còn ý nghĩa. Chọn tiền khởi đầu và chỉnh giá.
- [ ] **Mục tiêu dài hạn:** ngoài 3 đơn hàng, game chưa có đích đến rõ ràng. Thêm chuỗi đơn dài hơn hoặc đơn ngẫu nhiên?
- [ ] **Thức ăn tự sản xuất:** hiện chỉ mua. Cho trồng cỏ/thóc để cho ăn?
- [ ] **Chưa có:** mùa vụ, thời tiết, giá chợ biến động, nhân vật phụ ngoài lái buôn.
- [ ] **Chưa kiểm bằng tay:** hướng quay mặt của cá khi bơi; cảm giác chọn máng so với con vật khi đứng sát; mua nhiều ô ruộng liên tiếp (mỗi lần mua màn chơi tải lại một lần).

## Thanh phát triển của vật nuôi

- Mỗi con đã ăn và chưa ra sản phẩm có một **thanh phát triển nhỏ** (xanh lá) trên đầu, đầy dần tới khi chín; chín thì hiện biểu tượng sản phẩm.
- **Cá** lớn dần theo thanh này: cá con nhỏ khi mới thả hoặc mới vớt, to hết cỡ khi chín.
