# Quy Chuẩn Lập Trình & Phát Triển Frontend (Frontend Development Guidelines)

Tài liệu hướng dẫn quy chuẩn lập trình, nguyên tắc thiết kế UI, quản lý State và cách viết code chuẩn cho ứng dụng **KLTN Social Frontend**.

---

## 🎯 1. Nguyên Tắc Thiết Kế Component & Tách File (Component Refactoring Rules)

Để giữ cho codebase dễ bảo trì, dễ mở rộng và đọc hiểu:

### ✅ Qui tắc Single Responsibility & Giới hạn kích thước file
1. **Không tạo file quá 250 dòng code**: Khi một component vượt quá 200 - 250 dòng code hoặc chứa nhiều hơn 2 trách nhiệm chính, **bắt buộc phải tách** thành các sub-components nhỏ trong thư mục con tương ứng.
2. **Cấu trúc thư mục sub-component tiêu chuẩn**:
   ```
   src/components/<feature-name>/
   ├── FeatureView.tsx              # Component Orchestrator chính (< 200 dòng)
   ├── sub-feature/                 # Thư mục chứa các sub-component
   │   ├── useFeatureData.ts        # Custom hook chứa toàn bộ logic, state & API fetch
   │   ├── SubComponentA.tsx        # Sub-component hiển thị A
   │   ├── SubComponentB.tsx        # Sub-component hiển thị B
   │   └── index.ts                 # Barrel export tập trung
   ```
3. **Sử dụng Barrel Exports (`index.ts`)**: Mỗi thư mục sub-components bắt buộc phải có file `index.ts` để gom các export, giúp việc import ngắn gọn và sạch sẽ:
   ```typescript
   // ❌ Tránh:
   import { SubComponentA } from './sub-feature/SubComponentA';
   import { SubComponentB } from './sub-feature/SubComponentB';
   
   // ✅ Nên dùng:
   import { SubComponentA, SubComponentB } from './sub-feature';
   ```

---

## 🎨 2. Quy Chuẩn Giao Diện & Thẩm Mỹ (UI/UX & Styling Guidelines)

Dự án áp dụng phong cách thiết kế **Modern Social Network (Sleek Dark Mode & Premium Light Mode)**.

### 🎨 Bảng màu & Dark Mode Standard
- **Light Mode Background**: `#f0f2f5` (Màu nền xám nhẹ của Facebook UI).
- **Dark Mode Background**: `#18191a` (Màu nền tối chuẩn Facebook Dark).
- **Dark Mode Card / Surface**: `#242526` (Nền thẻ card, modal, header).
- **Dark Mode Border**: `#393a3b` hoặc `#3a3b3c`.
- **Dark Mode Primary Text**: `#e4e6eb`.
- **Dark Mode Muted Text**: `#b0b3b8` hoặc `#8a8d91`.
- **Primary Brand Color**: `#1877f2` (Blue) / `#4599ff` (Dark mode hover blue).

### 📱 Responsive Design Breakpoints
- `sm`: `640px` (Màn hình điện thoại lớn / tablet nhỏ)
- `md`: `768px` (Máy tính bảng)
- `lg`: `1024px` (Laptop / Máy tính để bàn)
- `xl`: `1280px` (Màn hình rộng)

### 🖼️ Quy chuẩn hiển thị Media & Input File
- Các ô chọn file (`<input type="file" />`) phải để ẩn `className="hidden"` và kích hoạt thông qua nút bấm hoặc `<label htmlFor="...">`.
- Thay thế tất cả các nhãn từ ngữ AWS S3 / Cloud Technical bằng thuật ngữ chuẩn người dùng Tiếng Việt (ví dụ: *"Thư viện Media"*, *"Tải ảnh bìa mới"*, *"Bộ nhớ Cloud"*).

---

## ⚡ 3. Quản Lý State & Tầng Gọi API (State & API Guidelines)

### 🔑 Quản Lý Xử Lý Sự Kiện & State
- **Custom Hooks cho Logic Phức Tạp**: Không viết logic gọi API, xử lý mảng hay tính toán phức tạp trực tiếp bên trong JSX. Luôn đưa vào Custom Hook (ví dụ: `useProfileViewData`, `useEditProfileForm`, `useMediaGallery`).
- **Axios Interceptors**: Mọi lệnh gọi API phải qua instance `axiosClient` (`src/services/axiosClient.ts`). Token JWT sẽ được tự động gắn vào Header `Authorization: Bearer <token>`.
- **Bắt Lỗi & Thông Báo Toast**: Sử dụng `ToastContext` (`useToast()`) để phản hồi hành động của người dùng:
  ```typescript
  try {
    await userService.updateMyProfile(payload);
    toast.showSuccess('Cập nhật thông tin thành công!');
  } catch (err: any) {
    toast.showError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
  }
  ```

---

## 🛡️ 4. Quy Chuẩn TypeScript & Code Quality

1. **Strict Type Declarations**: Hạn chế tối đa việc sử dụng kiểu `any`. Định nghĩa cụ thể các `interface` hoặc `type` trong `src/types/index.ts`.
2. **Kiem Tra Null/Undefined Safety**: Sử dụng Optional Chaining (`?.`) và Nullish Coalescing (`??`) khi truy cập các trường dữ liệu lồng nhau:
   ```typescript
   const avatar = profile?.avatarUrl ?? currentUser?.avatar ?? '/default-avatar.png';
   ```
3. **Biên Dịch Không Lỗi (Zero Compiler Errors)**: Trước khi hoàn tất bất kỳ tính năng hay refactor nào, bắt buộc phải chạy lệnh kiểm tra TypeScript:
   ```powershell
   npx tsc --noEmit
   ```
   Lệnh phải trả về **Exit code 0** (0 lỗi).
