# ART_GUIDE — Quy chuẩn đồ họa
Ngày: 07/11/2026 (viết lại sau khi đổi hướng)
Trạng thái: Bản nháp. Các con số là đề xuất, chốt sau khi thử asset thật trong game.

## 1. Hướng đã chốt
- Góc nhìn 3/4 trên xuống (như ảnh tham khảo của chủ dự án), lưới ô vuông. Không isometric.
- Phong cách cartoon mượt (nét vẽ mượt, độ phân giải cao hơn pixel art). Không dùng pixel art, nên Piskel không còn phù hợp.
- Chỉ lấy cảm hứng về bố cục và cảm giác. Toàn bộ hình ảnh, nhân vật, UI phải do chủ dự án vẽ; không sao chép asset của game gốc.

## 2. Công cụ (đề xuất, chưa cài, chủ dự án cần xác nhận)
- Krita: phần mềm vẽ raster miễn phí, có chế độ animation theo frame. Hợp với nhân vật và vật thể.
- Inkscape: phần mềm vector miễn phí, hợp với tile, cây, UI có hình khối đơn giản.
- Chọn một công cụ để bắt đầu. Tra tài liệu chính thức khi cài; không đoán thao tác theo phiên bản cũ.
- Giữ file gốc (.kra hoặc .svg) trong `art-source/`; xuất PNG sang `public/assets/`.

## 3. Kích thước (đề xuất)
Game hiển thị ở 960 × 540, một ô = 48 × 48 pixel hiển thị.
Vẽ ở gấp đôi (2x) để nét còn sắc khi màn hình lớn:

| Loại | Hiển thị trong game | Kích thước file nguồn (2x) |
|---|---|---|
| Ô nền | 48 × 48 | 96 × 96 |
| Nhân vật (khung) | 48 × 72 | 96 × 144 |
| Cây trồng | 48 × 72 (cao hơn ô) | 96 × 144 |
| Cây to, nhà | bội số của ô | bội số của 96 |

Điểm neo ở chân (giữa đáy khung). Vật cao hơn ô vẫn đặt chân ở ô của nó, để sắp xếp chiều sâu đúng.

## 4. Chiều sâu
- Vật thể nào có chân ở y lớn hơn thì vẽ đè lên. Mỗi sprite cần chân nằm sát đáy ảnh (không chừa khoảng trống trong suốt dưới chân).

## 5. Màu, nét và ánh sáng
- Ánh sáng từ trên-trái; bóng đổ nhẹ về dưới-phải.
- Viền: dùng màu tối cùng tông với vật (không dùng đen thuần), độ dày đồng nhất giữa các asset.
- Bảng màu chung cho cả bộ để các asset ăn khớp; ghi mã màu vào mục này khi chốt.
- Nền cỏ và đất cần lát được (hai mép đối diện khớp nhau).

## 6. Xuất file
- PNG, nền trong suốt, đúng kích thước nguồn ở mục 3.
- Tên file chữ thường, gạch ngang: `player-walk-down.png`, `plot-dry.png`.
- Animation: sprite sheet xếp frame đều nhau theo hàng, ghi rõ số frame và kích thước mỗi frame.

## 7. Nhân vật và animation (đề xuất để giảm khối lượng vẽ)
- 4 hướng: xuống, lên, trái, phải. Hướng phải có thể lật ngang từ hướng trái nếu thiết kế đối xứng.
- Đi bộ 4–6 frame mỗi hướng; thêm 1 frame đứng yên (idle).
- Thử trước một hướng, một chu kỳ đi bộ, đưa vào game kiểm tra rồi mới vẽ hàng loạt.

## 8. Thư mục
```text
art-source/environment/   file gốc tile, cây, vật thể
art-source/characters/    file gốc nhân vật
public/assets/tilesets/   PNG ô nền
art-source/               bộ pixel-art 4x do chủ dự án cung cấp (nguồn thật)
public/assets/game/       PNG dùng trong game, sinh bằng pnpm art (tools/import-art.mjs)
src/assets.gen.ts         danh sách khóa ảnh + bảng frame atlas môi trường (sinh tự động)
```

## 9. Checklist trước khi đưa asset vào game
- [ ] Đúng kích thước nguồn (2x) và tỷ lệ so với ô.
- [ ] Chân sát đáy ảnh, điểm neo ở chân.
- [ ] Nền trong suốt, PNG đã xuất.
- [ ] Ánh sáng từ trên-trái, viền và bảng màu nhất quán với bộ đã có.
- [ ] Đã xem ở kích thước thật trong game, cạnh nhân vật.
- [ ] Tile nền: lát 3×3 không lộ đường kẻ.

## 9b. Asset hiện có
- Nguồn: các gói pixel-art trong art-source/ (env_sprites_patched, farm_bc_sprites_4x, farm_hub_structures_split, farm_boy_chibi_split, farm_animals_dishes_split, farm_crops_icons_split, farm_fish_split, farm_hub_ui_items_split, farm_ui_split, farm_effects_split). `pnpm art` chọn ảnh dùng trong game, đặt tên khóa phẳng (vd. tree_orange, boy_walk_side_1, icon-carrot, ui_menu_button_normal) vào public/assets/game/.
- Quy ước vẽ: ô môi trường 128 px (atlas 'env', frame theo tên qua env('grass_a')) vẽ ở 0,25x = 32 px; vật thể cắt sát (cây, nhà, hàng rào) ở 0,5x; công trình khu chợ ở 0,3x; nhân vật/vật nuôi/cây trồng/icon (ô 128 px) hiển thị theo kích thước trong code (nhân vật 64 px). Hằng số ở src/art.ts; dựng bản đồ ở src/scenes/MapView.ts.
- Cây trồng có 4 giai đoạn (hạt, mầm, lớn, chín); nhân vật có animation đi bộ 3 hướng (ngang dùng chung, lật khi đi sang trái); lái buôn và vật nuôi có frame idle.

## 10. Việc còn mở
- Chọn và cài công cụ vẽ (Krita hoặc Inkscape), tìm hiểu cơ bản.
- Chốt kích thước ô, bảng màu và độ dày viền sau asset đầu tiên.
- Tile tạm 16×16 và tile thoi do script tạo trước đó (public/assets/tilesets, tools/gen-placeholder-tiles.mjs) không còn dùng; có thể xóa.
