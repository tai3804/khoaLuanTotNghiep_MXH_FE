# Frontend Architecture & Component Directory

Tài liệu chi tiết về cấu trúc mã nguồn, cây Component, Context và Service của ứng dụng Frontend **KLTN Social** (React + Vite + TypeScript + Tailwind CSS).

---

## 📂 Cấu Trúc Thư Mục `src/` (Directory Breakdown)

```
src/
├── assets/                  # Tài nguyên tĩnh (Logo, hình ảnh mặc định)
├── context/                 # Quản lý State toàn cục bằng React Context
│   ├── AuthContext.tsx      # Quản lý Đăng nhập, JWT Token, Profile người dùng hiện tại
│   ├── NotificationContext.tsx # Quản lý Thông báo realtime, Cấu hình âm thanh & cài đặt thông báo
│   ├── ToastContext.tsx     # Quản lý hiển thị Toast alert (Thành công, Lỗi, Cảnh báo, Thông tin)
│   ├── ThemeContext.tsx     # Quản lý Chế độ Sáng / Tối (Light / Dark mode)
│   └── LanguageContext.tsx  # Quản lý Đa ngôn ngữ (Tiếng Việt / Tiếng Anh)
├── services/                # Tầng gọi API Backend & WebSocket
│   ├── axiosClient.ts       # Axios instance với interceptors đính kèm Bearer Token & refresh token
│   ├── authService.ts       # API Đăng nhập, Đăng ký, OTP, Đổi mật khẩu, MFA 2FA
│   ├── userService.ts        # API Profile, Kết bạn, Tìm kiếm người dùng, Follow
│   ├── postService.ts       # API Đăng bài, Lấy newsfeed, Thích bài viết, Bình luận
│   ├── mediaService.ts      # API Tải ảnh/video lên Cloud Storage S3, Quota dung lượng
│   ├── chatService.ts       # API Nhắn tin trực tiếp, Lịch sử trò chuyện
│   ├── notificationService.ts # API Đọc thông báo, Cập nhật cấu hình thông báo
│   ├── storyService.ts      # API Tạo & xem Story 24h
│   └── websocket.ts         # Khởi tạo & duy trì kết nối WebSocket STOMP realtime
├── types/                   # Định nghĩa TypeScript Interfaces & Data Models
│   └── index.ts             # User, UserProfile, Post, Comment, Notification, MediaFile, ChatUser, ChatMessage
├── pages/                   # Các trang ứng dụng (Page Views)
│   ├── AuthPage.tsx         # Trang Đăng nhập / Đăng ký / Quên mật khẩu / Xác thực OTP / MFA
│   ├── HomePage.tsx         # Trang chủ Newsfeed (Bài viết, Stories, Thanh lọc feed)
│   ├── ProfilePage.tsx      # Trang Cá nhân (Thông tin, Bài viết cá nhân, Bạn bè, Ảnh)
│   ├── FriendsPage.tsx      # Trang Quản lý Bạn bè (Danh sách bạn bè, Lời mời kết bạn)
│   └── SettingsPage.tsx     # Trang Cài đặt Hệ thống (Hồ sơ, Bảo mật, Thông báo, Quyền riêng tư, Giao diện)
└── components/              # Hệ thống Component giao diện (Modularized Components)
```

---

## 🧩 Danh Sách Component Chi Tiết (Component Registry)

### 1. **Layout Components (`src/components/layout/`)**
- [`Header.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/layout/Header.tsx) & thư mục `header-bar/`:
  - [`useHeaderData.ts`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/layout/header-bar/useHeaderData.ts): Custom hook xử lý tìm kiếm người dùng/bài viết, fetch tin nhắn Messenger, đếm lời mời kết bạn & quản lý ẩn/hiện menu.
  - [`HeaderBrandSearch.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/layout/header-bar/HeaderBrandSearch.tsx): Logo hệ thống, ô tìm kiếm & popover kết quả tìm kiếm trực tiếp.
  - [`HeaderNavigationTabs.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/layout/header-bar/HeaderNavigationTabs.tsx): Thanh tab điều hướng chính (Trang chủ, Watch, Marketplace, Bạn bè & nhóm, Gaming).
  - [`HeaderMessengerDropdown.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/layout/header-bar/HeaderMessengerDropdown.tsx): Nút Messenger & popover danh sách trò chuyện nhanh.
  - [`HeaderUserDropdown.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/layout/header-bar/HeaderUserDropdown.tsx): Avatar cá nhân & menu tùy chọn (Trang cá nhân, Cài đặt, Chuyển Dark/Light mode, Đổi ngôn ngữ, Đăng xuất).
  - [`HeaderRightControls.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/layout/header-bar/HeaderRightControls.tsx): Container tổ hợp nút Menu ứng dụng, Messenger, Thông báo & User menu.
- [`SidebarLeft.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/layout/SidebarLeft.tsx) & thư mục `sidebar-left-nav/`:
  - [`useSidebarLeftData.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/layout/sidebar-left-nav/useSidebarLeftData.tsx): Custom hook quản lý danh mục điều hướng trái, icon & trạng thái Xem thêm/Ẩn bớt.
  - [`SidebarLeftUserProfile.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/layout/sidebar-left-nav/SidebarLeftUserProfile.tsx): Widget thông tin nhanh cá nhân ở đầu cột trái.
  - [`SidebarLeftNavList.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/layout/sidebar-left-nav/SidebarLeftNavList.tsx): Danh sách mục menu (Bạn bè, Nhóm, Kỷ niệm, Đã lưu, Video, Marketplace, Thước phim, Cài đặt).
  - [`SidebarLeftShortcuts.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/layout/sidebar-left-nav/SidebarLeftShortcuts.tsx): Phần "Lối tắt của bạn" dẫn tới khám phá nhóm & cộng đồng.
- [`SidebarRight.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/layout/SidebarRight.tsx) & thư mục `sidebar-right-nav/`:
  - [`useSidebarRightData.ts`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/layout/sidebar-right-nav/useSidebarRightData.ts): Custom hook fetch danh sách bạn bè trực tuyến, danh sách lời mời kết bạn chờ duyệt & tìm kiếm người liên hệ.
  - [`PendingFriendRequestsSection.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/layout/sidebar-right-nav/PendingFriendRequestsSection.tsx): Khung danh sách lời mời kết bạn đang chờ với nút Xác nhận / Xóa.
  - [`ContactsSection.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/layout/sidebar-right-nav/ContactsSection.tsx): Khung danh sách người liên hệ / bạn bè kèm chấm xanh trực tuyến & tìm kiếm bạn bè.
  - [`GroupChatsSection.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/layout/sidebar-right-nav/GroupChatsSection.tsx): Khung "Cuộc trò chuyện nhóm" & nút Messenger thu nhỏ nhanh ở góc phải.

---

### 2. **Post Components (`src/components/post/`)**
- [`PostCard.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/post/PostCard.tsx) & thư mục `post-card/`:
  - [`usePostCardData.ts`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/post/post-card/usePostCardData.ts): Custom hook xử lý cảm xúc, thích bài viết, bình luận inline, chia sẻ, lưu bài và xóa bài viết.
  - [`PostCardHeader.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/post/post-card/PostCardHeader.tsx): Avatar tác giả, tên, thời gian, quyền riêng tư và menu tùy chọn.
  - [`PostCardContent.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/post/post-card/PostCardContent.tsx): Nội dung văn bản và lưới hiển thị ảnh/video.
  - [`PostCardStatsBar.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/post/post-card/PostCardStatsBar.tsx): Thanh thống kê lượt thích (badge cảm xúc), số bình luận và lượt chia sẻ.
  - [`PostCardActionsBar.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/post/post-card/PostCardActionsBar.tsx): Nút Thích (kèm menu thả thả cảm xúc), Nút Bình luận và Nút Chia sẻ.
  - [`PostCardCommentsPreview.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/post/post-card/PostCardCommentsPreview.tsx): Khung xem trước 2 bình luận mới nhất và form nhập bình luận nhanh.
- [`CreatePostBox.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/post/CreatePostBox.tsx) & thư mục `create-post/`:
  - [`useCreatePost.ts`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/post/create-post/useCreatePost.ts): Custom hook xử lý trạng thái tạo bài viết, tải ảnh/video và đăng bài.
  - [`QuickCreatePostTrigger.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/post/create-post/QuickCreatePostTrigger.tsx): Khung kích hoạt nhanh mở Modal đăng bài trên newsfeed.
  - [`CreatePostModalHeader.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/post/create-post/CreatePostModalHeader.tsx): Header modal đăng bài.
  - [`CreatePostForm.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/post/create-post/CreatePostForm.tsx): Form nhập nội dung, chọn quyền riêng tư, chọn cảm xúc, xem trước file đính kèm và nút đăng.
- [`CommentModal.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/post/CommentModal.tsx) & thư mục `comment-modal/`:
  - [`useCommentModalData.ts`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/post/comment-modal/useCommentModalData.ts): Custom hook quản lý danh sách bình luận, trả lời bình luận nhiều cấp và chia sẻ liên kết.
  - [`CommentModalHeader.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/post/comment-modal/CommentModalHeader.tsx): Header modal bình luận.
  - [`CommentAuthorSection.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/post/comment-modal/CommentAuthorSection.tsx): Thông tin tác giả và nội dung bài viết trong modal.
  - [`CommentStatsBar.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/post/comment-modal/CommentStatsBar.tsx): Thanh chỉ số lượt thích, bình luận và chia sẻ.
  - [`CommentActionsBar.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/post/comment-modal/CommentActionsBar.tsx): Thanh nút Thích (kèm menu cảm xúc), Bình luận, Chia sẻ.
  - [`CommentItem.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/post/comment-modal/CommentItem.tsx): Dòng bình luận đơn lẻ kèm danh sách bình luận phản lời lồng nhau.
  - [`CommentFormFooter.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/post/comment-modal/CommentFormFooter.tsx): Footer chứa form nhập bình luận và chỉ báo phản hồi.
- [`StoriesBar.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/post/StoriesBar.tsx) & thư mục `stories-bar/`:
  - [`useStoriesData.ts`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/post/stories-bar/useStoriesData.ts): Custom hook tải tin 24h, tải media story lên Cloud Storage và tạo story mới.
  - [`CreateStoryCard.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/post/stories-bar/CreateStoryCard.tsx): Thẻ "Tạo tin" ở đầu danh sách story.
  - [`CreateStoryModal.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/post/stories-bar/CreateStoryModal.tsx): Modal tạo và tải ảnh/video story 24h.
  - [`StoryViewerModal.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/post/stories-bar/StoryViewerModal.tsx): Lightbox xem chi tiết nội dung tin 24h.

---

### 3. **Profile Components (`src/components/profile/`)**

#### A. Container chính
- [`ProfileView.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/profile/ProfileView.tsx): Orchestrator quản lý và tổ hợp các sub-components của Trang cá nhân.

#### B. Thư mục `view/` (`src/components/profile/view/`)
- [`useProfileViewData.ts`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/profile/view/useProfileViewData.ts): Custom hook xử lý toàn bộ logic tải profile, bài viết cá nhân, danh sách bạn bè, trạng thái kết nối và các action (Thêm bạn, Hủy lời mời, Chấp nhận, Hủy kết bạn, Tải avatar/cover).
- [`ProfileHeaderBanner.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/profile/view/ProfileHeaderBanner.tsx): Banner ảnh bìa, avatar, tên người dùng, chỉ số bài viết/bạn bè, các nút thao tác kết bạn/nhắn tin và thanh Tab điều hướng (Bài viết, Giới thiệu, Bạn bè, Ảnh).
- [`ProfileIntroBox.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/profile/view/ProfileIntroBox.tsx): Widget tiểu sử (bio), trường học, nơi sống, email, ngày tham gia và sở thích.
- [`ProfilePhotosBox.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/profile/view/ProfilePhotosBox.tsx): Widget xem nhanh lưới 9 ảnh gần nhất ở cột trái.
- [`ProfileFriendsBox.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/profile/view/ProfileFriendsBox.tsx): Widget xem nhanh lưới 6 người bạn ở cột trái.
- [`ProfileAboutTab.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/profile/view/ProfileAboutTab.tsx): Nội dung chi tiết của Tab "Giới thiệu".
- [`ProfileFriendsTab.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/profile/view/ProfileFriendsTab.tsx): Nội dung danh sách bạn bè chi tiết của Tab "Bạn bè".
- [`ProfilePhotosTab.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/profile/view/ProfilePhotosTab.tsx): Nội dung toàn bộ thư viện ảnh của Tab "Ảnh".

#### C. Thư mục `edit-modal/` (`src/components/profile/edit-modal/`)
- [`EditProfileModal.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/profile/EditProfileModal.tsx): Modal chỉnh sửa hồ sơ cá nhân.
- [`useEditProfileForm.ts`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/profile/edit-modal/useEditProfileForm.ts): Custom hook xử lý form state và lưu thay đổi profile.
- [`EditAvatarSection.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/profile/edit-modal/EditAvatarSection.tsx): Phần chỉnh sửa ảnh đại diện.
- [`EditCoverSection.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/profile/edit-modal/EditCoverSection.tsx): Phần chỉnh sửa ảnh bìa.
- [`EditBioSection.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/profile/edit-modal/EditBioSection.tsx): Phần chỉnh sửa tiểu sử (bio).
- [`EditPersonalInfoSection.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/profile/edit-modal/EditPersonalInfoSection.tsx): Phần chỉnh sửa thông tin cá nhân (Họ tên, ngày sinh, giới tính, địa chỉ, website).
- [`EditHobbiesSection.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/profile/edit-modal/EditHobbiesSection.tsx): Phần chọn sở thích cá nhân.
- [`EditModalHeader.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/profile/edit-modal/EditModalHeader.tsx) & [`EditModalFooter.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/profile/edit-modal/EditModalFooter.tsx): Header & Footer nút Lưu/Hủy của Modal.

#### D. Thư mục `media-gallery/` (`src/components/profile/media-gallery/`)
- [`MediaGalleryModal.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/profile/MediaGalleryModal.tsx): Modal quản lý Thư viện Media & Quota lưu trữ Cloud.
- [`useMediaGallery.ts`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/profile/media-gallery/useMediaGallery.ts): Custom hook tải danh sách media, tính toán quota dung lượng đã dùng / tổng hạn mức và xóa media.
- [`MediaGalleryHeader.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/profile/media-gallery/MediaGalleryHeader.tsx): Header và bộ lọc media (Tất cả, Ảnh, Video).
- [`StorageQuotaBar.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/profile/media-gallery/StorageQuotaBar.tsx): Thanh tiến trình hiển thị phần trăm dung lượng lưu trữ Cloud đã sử dụng.
- [`MediaCard.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/profile/media-gallery/MediaCard.tsx): Thẻ item hiển thị ảnh/video kèm nút xem chi tiết và nút xóa.
- [`MediaLightboxModal.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/profile/media-gallery/MediaLightboxModal.tsx): Pop-up xem ảnh/video kích thước đầy đủ (Lightbox viewer).

---

### 4. **Settings Components (`src/components/settings/`)**
- [`SettingsView.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/settings/SettingsView.tsx): Orchestrator điều hướng các Tab cài đặt.
- [`SettingsSidebarNav.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/settings/SettingsSidebarNav.tsx): Menu bên trái chuyển đổi giữa các Tab Cài đặt.
- [`ProfileSettingsTab.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/settings/ProfileSettingsTab.tsx) & thư mục `profile-tab/`:
  - [`useProfileSettingsForm.ts`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/settings/profile-tab/useProfileSettingsForm.ts): Custom hook quản lý form state, tải/lưu profile và upload avatar/cover.
  - [`ProfileSettingsHeader.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/settings/profile-tab/ProfileSettingsHeader.tsx): Tiêu đề tab cài đặt hồ sơ & thông báo kết quả.
  - [`ProfileMediaBannerSection.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/settings/profile-tab/ProfileMediaBannerSection.tsx): Khung xem trước trực tiếp banner ảnh bìa, avatar & ô nhập URL trực tiếp.
  - [`PersonalDetailsSection.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/settings/profile-tab/PersonalDetailsSection.tsx): Form họ tên, ngày sinh (>= 13 tuổi) & giới tính.
  - [`BioContactSection.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/settings/profile-tab/BioContactSection.tsx): Form tiểu sử bio (500 ký tự), vị trí địa lý & website.
- [`SecuritySettingsTab.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/settings/SecuritySettingsTab.tsx) & thư mục `security-tab/`:
  - [`useSecuritySettingsData.ts`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/settings/security-tab/useSecuritySettingsData.ts): Custom hook quản lý thiết bị đăng nhập, thu hồi phiên làm việc từ xa & cấu hình 2FA MFA.
  - [`ActiveDevicesSection.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/settings/security-tab/ActiveDevicesSection.tsx): Danh sách thiết bị đang đăng nhập & nút đăng xuất từ xa.
  - [`MfaSecuritySection.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/settings/security-tab/MfaSecuritySection.tsx): Cấu hình xác thực 2 bước (Google Authenticator QR Code, mã bí mật, kích hoạt & tắt 2FA).
- [`NotificationSettingsTab.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/settings/NotificationSettingsTab.tsx) & thư mục `notification/`:
  - [`NotificationToggleItem.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/settings/notification/NotificationToggleItem.tsx): Component gạt bật/tắt chuẩn hóa.
  - [`SocialInteractionsSection.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/settings/notification/SocialInteractionsSection.tsx): Bật/tắt thông báo Thích, Bình luận, Chia sẻ.
  - [`FriendInteractionsSection.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/settings/notification/FriendInteractionsSection.tsx): Bật/tắt thông báo Lời mời kết bạn.
  - [`MessagesCallsSection.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/settings/notification/MessagesCallsSection.tsx): Bật/tắt thông báo Tin nhắn, Cuộc gọi.
  - [`SoundSystemSection.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/settings/notification/SoundSystemSection.tsx): Bật/tắt Âm thanh realtime, Thử âm thanh chime, Thông báo hệ thống.
- [`PrivacySettingsTab.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/settings/PrivacySettingsTab.tsx): Tab cài đặt quyền riêng tư bài viết & tìm kiếm.
- [`AppearanceSettingsTab.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/settings/AppearanceSettingsTab.tsx): Tab cài đặt giao diện Sáng / Tối và kích thước phông chữ.

---

### 5. **Chat Components (`src/components/chat/`)**
- [`ChatBox.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/chat/ChatBox.tsx) & thư mục `chat-box/`:
  - [`useChatBoxData.ts`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/chat/chat-box/useChatBoxData.ts): Custom hook xử lý hội thoại 1-1, đồng bộ WebSocket realtime, tải lịch sử tin nhắn & upload file media đính kèm lên S3.
  - [`ChatBoxHeader.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/chat/chat-box/ChatBoxHeader.tsx): Thanh header cửa sổ chat (Avatar, tên bạn bè, trạng thái online, nút gọi thoại, video, thu nhỏ & đóng).
  - [`ChatBoxMessagesList.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/chat/chat-box/ChatBoxMessagesList.tsx): Danh sách bong bóng tin nhắn (Văn bản, hình ảnh, video) & tự động cuộn xuống cuối.
  - [`ChatBoxInputFooter.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/chat/chat-box/ChatBoxInputFooter.tsx): Ô nhập tin nhắn, đính kèm file media & nút gửi.
  - [`ChatBoxMinimized.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/chat/chat-box/ChatBoxMinimized.tsx): Thanh chat thu nhỏ ở góc dưới màn hình.
- [`ChatListModal.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/chat/ChatListModal.tsx): Modal danh sách các cuộc hội thoại tin nhắn gần đây.
- [`CallModal.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/chat/CallModal.tsx): Modal cuộc gọi thoại / video trực tiếp (WebRTC integration).

---

### 6. **Notification Components (`src/components/notification/`)**
- [`NotificationDropdown.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/notification/NotificationDropdown.tsx) & thư mục `notification-dropdown/`:
  - [`useNotificationDropdownData.ts`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/notification/notification-dropdown/useNotificationDropdownData.ts): Custom hook quản lý danh sách thông báo, bộ lọc Tất cả / Chưa đọc, fetch profile người tương tác & hành động kết bạn.
  - [`NotificationDropdownHeader.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/notification/notification-dropdown/NotificationDropdownHeader.tsx): Tiêu đề, badge số lượng thông báo chưa đọc & menu 3 chấm mở tùy chọn cài đặt.
  - [`NotificationFilterTabs.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/notification/notification-dropdown/NotificationFilterTabs.tsx): Thanh nút chuyển tab bộ lọc (Tất cả / Chưa đọc) & nút Đánh dấu tất cả đã đọc.
  - [`NotificationItemCard.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/notification/notification-dropdown/NotificationItemCard.tsx): Thẻ thông báo chi tiết (Avatar kèm badge loại tương tác, nội dung trích dẫn, nút chấp nhận/xóa lời mời kết bạn, thời gian & menu tùy chọn item).
  - [`NotificationListContent.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/notification/notification-dropdown/NotificationListContent.tsx): Khung danh sách chứa trạng thái đang tải (Loading spinner), trạng thái trống (Empty state) và danh sách thẻ thông báo.
  - [`NotificationDropdownFooter.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/notification/notification-dropdown/NotificationDropdownFooter.tsx): Nút liên kết chuyển nhanh sang trang Cài đặt thông báo.

---

### 7. **Friends Components (`src/components/friends/`)**
- [`FriendsView.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/friends/FriendsView.tsx) & thư mục `friends-center/`:
  - [`useFriendsData.ts`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/friends/friends-center/useFriendsData.ts): Custom hook quản lý dữ liệu trung tâm Bạn bè (Lời mời kết bạn, gợi ý bạn bè, danh sách bạn bè, người theo dõi).
  - [`FacebookFriendCard.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/friends/friends-center/FacebookFriendCard.tsx): Thẻ avatar tỉ lệ 1:1 chuẩn Facebook kèm các nút hành động (Xác nhận, Xóa, Thêm bạn, Nhắn tin, Hủy kết bạn).
  - [`FriendsSidebarNav.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/friends/friends-center/FriendsSidebarNav.tsx): Thanh điều hướng tab trên mobile & menu sidebar bên trái trên máy tính.
  - [`FriendsOverviewTab.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/friends/friends-center/FriendsOverviewTab.tsx): Tab Trang chủ trung tâm Bạn bè (Tổng hợp lời mời & gợi ý kết bạn).
  - [`FriendsRequestsTab.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/friends/friends-center/FriendsRequestsTab.tsx): Tab quản lý toàn bộ Lời mời kết bạn đang chờ duyệt.
  - [`FriendsSuggestionsTab.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/friends/friends-center/FriendsSuggestionsTab.tsx): Tab khám phá Những người bạn có thể biết.
  - [`FriendsAllTab.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/friends/friends-center/FriendsAllTab.tsx): Tab danh sách Tất cả bạn bè kèm ô tìm kiếm bạn bè.
  - [`FriendsFollowersTab.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/friends/friends-center/FriendsFollowersTab.tsx): Tab xem Người theo dõi & Đang theo dõi.

---

### 8. **Common Components (`src/components/common/`)**
- [`UserAvatar.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/common/UserAvatar.tsx) & thư mục `user-avatar/`:
  - [`useUserAvatar.ts`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/common/user-avatar/useUserAvatar.ts): Custom hook tự động xử lý hình ảnh mặc định fallback và lỗi đường dẫn ảnh.
- [`Logo.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/common/Logo.tsx) & thư mục `logo-brand/`:
  - [`LogoIconSvg.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/common/logo-brand/LogoIconSvg.tsx): Component biểu trưng SVG hiệu ứng quỹ đạo và hạt màu phát sáng.
  - [`LogoText.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/common/logo-brand/LogoText.tsx): Component chữ thương hiệu KLTN Social chuẩn gradient.
- [`ConfirmModal.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/common/ConfirmModal.tsx) & thư mục `confirm-modal/`:
  - [`ConfirmModalIcon.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/common/confirm-modal/ConfirmModalIcon.tsx): Biểu tượng cảnh báo danger / warning / info.
  - [`ConfirmModalActions.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/common/confirm-modal/ConfirmModalActions.tsx): Thanh nút bấm Hủy bỏ & Xác nhận thao tác.
- [`OtpModal.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/common/OtpModal.tsx) & thư mục `otp-modal/`:
  - [`OtpModalIcon.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/common/otp-modal/OtpModalIcon.tsx): Khung icon chìa khóa OTP.
  - [`OtpInputBox.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/common/otp-modal/OtpInputBox.tsx): Ô nhập mã 6 số font mono tracking rộng kèm thông báo lỗi.
  - [`OtpModalActions.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/common/otp-modal/OtpModalActions.tsx): Thanh nút bấm Hủy bỏ & Xác nhận OTP.
- [`LoginModal.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/common/LoginModal.tsx) & thư mục `login-modal/`:
  - [`useLoginForm.ts`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/common/login-modal/useLoginForm.ts): Custom hook quản lý form state Đăng nhập & Đăng ký tài khoản đa bước (Multi-step register).
  - [`LoginModalHeader.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/common/login-modal/LoginModalHeader.tsx): Header modal & thanh tiến trình Stepper 3 bước khi đăng ký.
  - [`LoginForm.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/common/login-modal/LoginForm.tsx): Form đăng nhập Email & Mật khẩu.
  - [`RegisterStep1Email.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/common/login-modal/RegisterStep1Email.tsx): Bước 1 Đăng ký - Nhập Email nhận mã OTP.
  - [`RegisterStep2Otp.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/common/login-modal/RegisterStep2Otp.tsx): Bước 2 Đăng ký - Nhập mã OTP 6 chữ số xác thực Email.
  - [`RegisterStep3Profile.tsx`](file:///e:/KhoaLuan/khoaLuanTotNghiep_MXH_FE/src/components/common/login-modal/RegisterStep3Profile.tsx): Bước 3 Đăng ký - Mật khẩu & thông tin cá nhân (Họ tên, ngày sinh, giới tính).
