"use client";

/**
 * Đăng xuất phía trình duyệt: xóa session cookie qua API rồi điều hướng cứng
 * để state client được dọn sạch.
 */
export async function performClientLogout(): Promise<void> {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {
    // Vẫn chuyển trang để người dùng thoát UI admin dù mạng lỗi.
  }
  window.location.href = "/";
}
