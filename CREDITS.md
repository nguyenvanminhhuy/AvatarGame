# Ghi công asset bên thứ ba

Game dùng một số hình pixel-art từ các gói asset miễn phí dưới đây (tất cả thuộc về tác giả tương ứng). Các hình đã được cắt và phóng to
(xem `src/pixelart.ts`; các ảnh đã dùng nằm ở `public/assets/px/`). Gói gốc đầy đủ chỉ giữ cục bộ ở `art-source/third-party/` (đã đưa vào `.gitignore`,
KHÔNG commit và KHÔNG đưa vào bản phát hành vì giấy phép cấm phân phối lại gói gốc).

| Gói | Tác giả | Dùng cho | Điều kiện đã đọc được |
|---|---|---|---|
| Cute Fantasy (Free Version) | (tên tác giả không có trong file read_me) | cây sồi, nhà gỗ, hàng rào, đèn, đá, hoa, heo, ô đất/nước/cỏ/đường | Chỉ dự án phi thương mại; được sửa; cấm bán/phân phối lại gói |
| Farm RPG FREE 16x16 - Tiny Asset Pack | (chưa rõ; **gói không kèm file giấy phép**) | nhân vật, nhà bếp, nhà kho, bò, gà, gà con, trứng | **Chưa xác minh được giấy phép** |
| vectoraith — Farming Sim Essentials (48x48) | vectoraith | nhân vật, vật nuôi (bò, gà), nhà ở/nhà bếp/nhà kho, cây lớn, cây trồng, rơm, đèn, hàng rào, hoa, đất/cỏ/nước | **Giấy phép đã được chủ dự án xác nhận** (thư mục gói không kèm file giấy phép; ghi lại điều kiện cụ thể tại đây khi có) |
| Super Retro Ranch (Free Tier) | Gif | cây cà rốt, cà chua, icon cà rốt/cà chua | Chỉ phi thương mại; được sửa; không phân phối trực tiếp; mong được ghi công "Gif" và mã hóa asset khi đăng lên internet |
| Little Dreamyland (Free Pack) | Starmixu & Utaskuas | người bán hàng (thỏ) | Chỉ phi thương mại; được sửa; **bắt buộc ghi công**; cấm dùng cho NFT/huấn luyện AI |
| Sprout Lands (Basic pack) | Cup Nooble | icon sữa | Chỉ phi thương mại; được sửa; **bắt buộc ghi công**; cấm NFT/huấn luyện AI |

Ghi công mẫu: "Assets from Little Dreamyland by Starmixu & Utaskuas. Sprout Lands by Cup Nooble. Super Retro Ranch by Gif. Cute Fantasy Free."

**Hệ quả:** game này hiện chỉ được phát hành phi thương mại (miễn phí, không thu tiền) chừng nào còn dùng các gói trên. Muốn bán hoặc kiếm tiền
thì phải thay bằng hình tự vẽ hoặc mua giấy phép thương mại (mỗi hình đã dùng được nướng riêng trong `src/pixelart.ts` để dễ thay từng cái).

---
**Cập nhật 10/11/2026:** game hiện KHÔNG còn dùng hình của bên thứ ba nào. Toàn bộ hình trong `public/assets/sprites/` là SVG do script
`tools/gen-cartoon.mjs` và `tools/gen-art.mjs` tạo (hình tạm do AI viết script, của dự án). Các gói trong bảng trên chỉ còn nằm ở `art-source/` (không đưa vào bản build);
thử nghiệm pixel-art cũ lưu ở `art-source/pixel-experiment/`. Vì vậy các hạn chế "phi thương mại" ở trên không còn áp dụng cho bản game hiện tại.


---
**Cập nhật 11/11/2026:** game dùng bộ pixel-art trong `art-source/` do chủ dự án cung cấp (các thư mục `env_sprites_patched`, `farm_*`; đưa vào game qua `pnpm art` → `public/assets/game/`).
Chủ dự án chịu trách nhiệm về nguồn gốc và giấy phép của các ảnh này; cần ghi rõ tác giả/điều kiện vào bảng trên khi biết. Lưu ý: bộ ảnh này có bố cục và phong cách rất gần ảnh tham khảo (khu chợ, cổng FARM, bảng tin, cửa hàng, quầy trái cây),
nên cần chắc chắn chúng thuộc quyền dùng của chủ dự án trước khi phát hành. Các gói bên thứ ba cũ (bảng trên) không còn được game dùng.
