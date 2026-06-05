# Hướng dẫn Workflow modules (Ví dụ: Rice Box)

Để dựng một module mới từ UI đến Navigation, bạn cần thực hiện theo các bước sau, tương ứng với cấu trúc của dự án:

## 1. UI Sections (`src/sections/[module_name]`)
Tạo thư mục section chứa các thành phần giao diện chính.
- **Đường dẫn**: `src/sections/rice-box`
- **Cấu trúc**:
    - `view/`: Chứa các view chính (VD: `list.tsx`, `create-edit-form.tsx`).
    - `components/`: Chứa các component nhỏ (VD: `table-row`, `table-toolbar`).

Ví dụ: `src/sections/rice-box/view/list.tsx` là nơi hiển thị danh sách thùng chứa.

## 2. Page (`src/pages/dashboard/[module_name]`)
Tạo page để wrap các section view và thêm metadata (như title).
- **Đường dẫn**: `src/pages/dashboard/rice-box`
- **File**:
    - `index.tsx`: Component Page cho danh sách. Gọi `RiceBoxList` từ section view.
    - `create-edit.tsx`: Component Page cho tạo/sửa.

Ví dụ `src/pages/dashboard/rice-box/index.tsx`:
```tsx
import { useEffect } from "react";
import RiceBoxList from "src/sections/rice-box/view/list";

export default function RiceBoxPage() {
    useEffect(() => {
        document.title = "Thùng chứa";
    }, []);

    return <RiceBoxList />;
}
```

## 3. Route (`src/routes/sections/dashboard.tsx`)
Định nghĩa URL và map vào các Page đã tạo.
- **Đường dẫn**: `src/routes/sections/dashboard.tsx`
- **Thực hiện**:
    1. Lazy load Page component ở đầu file.
    2. Thêm object route vào mảng `children` của `dashboardRoutes`.

Ví dụ:
```tsx
// Lazy load
const RiceBoxPage = lazy(() => import('src/pages/dashboard/rice-box'));

// Định nghĩa route
{ path: 'thung-chua', element: <RiceBoxPage /> },
```

## 4. Navigation (`src/layouts/nav-config-dashboard.tsx`)
Thêm mục vào menu bên trái (Sidebar).
- **Đường dẫn**: `src/layouts/nav-config-dashboard.tsx`
- **Thực hiện**: Thêm object vào mảng `navData`.

Ví dụ:
```tsx
{ title: 'Thùng chứa', path: paths.dashboard.riceBox.root },
```

## Tổng kết Data Flow:
`Navigation` (Click) -> `Route` (URL change) -> `Page` (Render) -> `Section View` (UI Logic) -> `Component/API`
