# Công cụ chọn đề tài – Học kỳ doanh nghiệp KhanhTravel

Luồng: Chào mừng → Chọn nhóm (1-3) → Chọn tổ (1-3) → Chọn đề tài (theo phòng) → Pop-up xác nhận → Khóa đề tài + ghi vào Google Sheet.
Tổ 1 = Lễ tân – Dịch vụ lẻ · Tổ 2 = Lữ hành · Tổ 3 = Vận chuyển. Giao diện tự cập nhật mỗi 3 giây.

## Bước 1 – Tạo Google Sheet lưu kết quả
1. Tạo Google Sheet mới (hoặc dùng file danh sách hiện có).
2. Tiện ích mở rộng → Apps Script → dán toàn bộ `apps-script/Code.gs`.
3. Project Settings → Script properties → thêm `SECRET` = một chuỗi bí mật bất kỳ.
4. Deploy → New deployment → Web app → Execute as: **Me**, Who has access: **Anyone** → copy URL `.../exec`.
   (Sheet `KET_QUA` sẽ tự tạo ở lần ghi đầu tiên.)

## Bước 2 – Đưa lên Vercel
1. Đẩy thư mục này lên GitHub rồi Import vào Vercel (hoặc chạy `npx vercel --prod` trong thư mục).
2. Settings → Environment Variables:
   - `APPS_SCRIPT_URL` = URL `.../exec` ở bước 1
   - `APPS_SCRIPT_SECRET` = đúng chuỗi `SECRET` đã đặt
3. Redeploy. Không đặt biến môi trường thì app chạy chế độ DEMO (lưu tạm, mất khi server khởi động lại).

## Cấu trúc
- `public/index.html` – giao diện; `public/data.json` – danh sách tổ + đề tài (từ file xlsx/docx)
- `api/state.js` – đọc trạng thái; `api/select.js` – xác nhận chọn (kiểm tra hợp lệ phía server)
- `lib/` – lưu trữ + dữ liệu; `apps-script/Code.gs` – ghi Sheet, dùng LockService chống 2 tổ chọn cùng lúc
