# GAME_DESIGN — Bản đầu (chơi đơn)
Ngày: 07/11/2026
Trạng thái: Bản nháp chờ chủ dự án duyệt. Chưa có code.

## 1. Quyết định đã chốt
- Nền tảng: web game, chơi trên PC (Phaser + TypeScript + Vite).
- Điều khiển bản đầu: WASD/mũi tên để di chuyển, phím E để tương tác. Không click-to-move.
- Công cụ vẽ: Piskel.
- Quỹ thời gian: khoảng 2 giờ/ngày. Kinh nghiệm vẽ pixel art: chưa có.
- Góc nhìn đích: isometric.
- Thứ tự thực hiện: prototype logic bằng top-down hình chữ nhật trước, sau đó thử isometric ở một bước riêng (xem mục 6).

## 2. Mục tiêu người chơi
Chăm một khu vườn nhỏ: trồng cây, thu hoạch, bán lấy tiền, dùng tiền mua thêm hạt giống.

## 3. Vòng chơi
Nhận hạt → trồng → tưới → chờ lớn → thu hoạch → bán → mua hạt.

### Lượt chơi mẫu
1. Người chơi bắt đầu trong căn nhà nhỏ.
2. Đi đến NPC, nhấn E để nói chuyện và nhận 3 hạt giống.
3. Ra sân vườn, đứng cạnh ô đất trống, nhấn E để trồng.
4. Nhấn E lần nữa để tưới.
5. Chờ cây qua các giai đoạn lớn; khi chín thì nhấn E để thu hoạch.
6. Đến cửa hàng của NPC, bán nông sản, thấy tiền tăng.
7. Dùng tiền mua thêm hạt và lặp lại.

## 4. Phạm vi bản đầu
- Một bản đồ nhỏ (nhà + sân vườn), một nhân vật, một NPC.
- Một loại cây, một loại hạt.
- Túi đồ, tiền, cửa hàng đơn giản.
- Lưu tiến trình cục bộ.

### Để sau (không làm trong bản đầu)
Multiplayer, chat, giao dịch, nhiều bản đồ, trang phục, bạn bè, mobile, click-to-move, đi chéo 8 hướng.

## 5. Quyết định triển khai (bản code hiện tại; đổi được trong src/data)
- ĐỔI HƯỚNG (07/11/2026): góc nhìn 3/4 trên xuống, lưới ô vuông (theo ảnh tham khảo của chủ dự án), phong cách cartoon mượt. Isometric và pixel art/Piskel bị bỏ. Các mục "isometric", "Piskel", "32×16" ở phần trên là lịch sử, xem ART_GUIDE.md.
- Cây KHÔNG lớn khi offline hoặc khi game không chạy (bước thời gian bị chặn tối đa 250ms/frame).
- Cây cần tưới 1 lần. Cà rốt: hạt 10, lớn 20 giây, bán 25. Cà chua: hạt 25, lớn 45 giây, bán 70. Phím Q đổi hạt đang chọn. Số liệu ở src/data/items.ts.
- Điều khiển: WASD/mũi tên, hướng theo màn hình; đi chéo được, đã chuẩn hóa tốc độ.
- Tương tác: nhấn E với đối tượng gần nhất trong tầm (chưa dùng hướng nhìn vì chưa có sprite hướng).
- Tiến trình: chuỗi đơn hàng (src/data/quests.ts) chỉ thưởng tiền; mở khóa theo cấp mở rộng các khu (xem README). Hàng và ô đất khóa khai báo bằng unlockedBy.
- Thời gian: ngày game 06:00-24:00 (4,5 phút thật), ngủ ở giường từ 18:00 để sang ngày mới. Không có hệ thống năng lượng (đã bỏ theo yêu cầu chủ dự án). Hằng số ở src/state/clock.ts.
- Nâng cấp ở cửa hàng (phím U): Phân bón, Bình tưới lớn, mỗi loại 2 cấp.
- Vật nuôi: chuồng ở phía trên giữa sân vườn (4 chỗ). Gà và vịt, mở sau đơn 'Cà chua cho bữa tiệc'. Mua ở trang Vật nuôi của cửa hàng, cho ăn bằng Thức ăn, chờ rồi nhặt trứng đem bán. Số liệu ở src/data/animals.ts.
- Trang trí: hàng rào, bụi cây, ao, đá, hoa, đèn đường (quầng sáng ban đêm). Khai báo trong src/data/world.ts (decor). Bố cục phải qua tests/World.test.ts (không chặn đường chính, không che bởi HUD).
- Bản đồ: Sân vườn (20x11 ô) và Trong nhà (10x7 ô). Cửa là một ô đi được; bước vào ô thì chuyển bản đồ. Giường trong nhà dùng để nghỉ ngơi và lưu. Dữ liệu ở src/data/world.ts.
- Lưu localStorage, tự lưu mỗi 10 giây và sau mỗi hành động; Delete hai lần để xóa tiến trình.

## 5b. Còn mở
- Tên game và tên nhân vật (phải là nội dung riêng, không dùng tên/thương hiệu Avatar).
- Hướng nhìn nhân vật và số hướng vẽ (4 hay 8).

## 6. Kế hoạch giảm rủi ro isometric
- Dữ liệu game dùng tọa độ lưới (cột, hàng), không dùng pixel. Ô đất có ID ổn định.
- Hiển thị gọi một hàm chuyển lưới → màn hình. Ban đầu hàm này là top-down; khi chuyển sang isometric chỉ đổi hàm này và thứ tự vẽ (depth).
- Bước thử riêng: vẽ 3 tile thoi (đề xuất 32×16) và một nhân vật một hướng, đặt lên lưới, đánh giá có đạt cảm giác mong muốn không. Quyết định tiếp tục hay quay lại top-down sau bước này.

## 7. Danh sách asset tối thiểu (dự kiến)
| Nhóm | Asset |
|---|---|
| Tile | cỏ, đất, đất đã tưới, sàn nhà, tường |
| Cây | hạt, mầm, cây lớn, cây chín (4 giai đoạn) |
| Nhân vật | đứng + đi, các hướng chốt sau bước thử isometric |
| NPC | một nhân vật đứng yên |
| UI | khung hội thoại, ô túi đồ, biểu tượng tiền, gợi ý phím E |
| Vật phẩm | hạt, nông sản |
