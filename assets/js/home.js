import { loadSection } from "./utils.js";
export async function initPage() {
  console.log("Hero section initialized");

  /* =============================================
   PHẦN 1: HERO SECTION (banner chính)
   ============================================== */

  let btnTour = document.querySelector(".btn-tour");
  btnTour.addEventListener("click", async () => {
    console.log("Đã click btn-tour");
    loadSection("content", "./pages/tour.html", "./tour.js");
  });

  /* =============================================
   PHẦN 2: FEATURE SECTION (điểm nổi bật)
   ============================================== */

  /* =============================================
   PHẦN 3: DESTINATIONS SECTION (điểm đến nổi bật)
   ============================================== */
  let btnDestinations = document.querySelector(".btn-destination");
  btnDestinations.addEventListener("click", async () => {
    console.log("Đã click btn-destination");
    loadSection("content", "./pages/tour.html", "./tour.js");
  });
  /* =============================================
   PHẦN 4: ABOUT SECTION (giới thiệu thương hiệu)
   ============================================== */
  let btnAbout = document.querySelector(".btn-about");
  btnAbout.addEventListener("click", async () => {
    console.log("Đã click btn-about");
    loadSection("content", "./pages/about.html", "./about.js");
  });
  /* =============================================
   PHẦN 5: RECOMMENDED TRIPS SECTION (gợi ý tour)
   ============================================== */
  let btnMore = document.querySelector(".btn-more");
  btnMore.addEventListener("click", async () => {
    console.log("Đã click btn-more");
    loadSection("content", "./pages/tour.html", "./tour.js");
  });
  /* =============================================
   PHẦN 6: WHY CHOOSE US SECTION (lý do chọn Travel VN)
   ============================================== */

  /* =============================================
   PHẦN 7: TESTIMONIALS SECTION (Đánh giá khách hàng)
============================================== */

  /* =============================================
   PHẦN 8: SPECIAL OFFER SECTION (Ưu đãi đặc biệt)
============================================== */

  /* =============================================
   PHẦN 9: TRIP SHOWCASE SECTION (Gợi ý hành trình)
============================================== */

  /* =============================================
   PHẦN 10: BLOG SECTION (bài viết & kinh nghiệm du lịch)
============================================== */

  /* =============================================
   PHẦN 11: NEWSLETTER SECTION (đăng ký nhận tin)
============================================== */
}
