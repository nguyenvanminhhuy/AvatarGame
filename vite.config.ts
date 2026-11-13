import { defineConfig } from 'vite'

// art-source/ chứa hàng nghìn ảnh gói asset bên thứ ba: không cần theo dõi thay đổi (làm dev server khởi động chậm và nặng máy).
export default defineConfig({
  server: { watch: { ignored: ['**/art-source/**', '**/docs/**', '**/tools/**', '**/tests/**'] } },
})
