"use client";

import { use, useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./page.module.css";
import { apiGet, apiPost, getErrorMessage } from "@/lib/api";
import { AccommodationCategoryDTO, HoldRoomResponse, ConfirmBookingResponse } from "@/types/api";

const FALLBACK_ROOMS: Record<string, any> = {
  "ocean-view-suite": {
    name: "Ocean View Premium Suite",
    price: "3,500,000₫",
    rawPrice: 3500000,
    size: "45 m²",
    view: "Trực diện biển",
    bed: "1 Giường King",
    capacity: "2 Người lớn",
    description: "Trải nghiệm sự xa xỉ thầm lặng trong không gian 45m2 được thiết kế tỉ mỉ."
  },
  "garden-deluxe": {
    name: "Garden Deluxe Double",
    price: "1,800,000₫",
    rawPrice: 1800000,
    size: "30 m²",
    view: "Hướng vườn nhiệt đới",
    bed: "1 Giường Double",
    capacity: "2 Người lớn",
    description: "Thư giãn hoàn toàn trong không gian Garden Deluxe được bao quanh bởi khu vườn nhiệt đới xanh mát."
  },
  "family-connecting": {
    name: "Family Connecting Room",
    price: "4,200,000₫",
    rawPrice: 4200000,
    size: "55 m²",
    view: "Hướng vườn & hồ bơi",
    bed: "1 Giường King & 1 Giường Đơn",
    capacity: "4 Khách",
    description: "Không gian lý tưởng dành cho gia đình hoặc nhóm bạn thân."
  }
};

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Query parameters
  const categoryId = searchParams.get("categoryId") || "";
  const checkin = searchParams.get("checkin") || "";
  const checkout = searchParams.get("checkout") || "";
  const guests = searchParams.get("guests") || "2";

  // Data states
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Form states - Contact info
  const [contactTitle, setContactTitle] = useState("Ông");
  const [contactLastName, setContactLastName] = useState("");
  const [contactFirstName, setContactFirstName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactCountry, setContactCountry] = useState("Việt Nam");
  const [isStayingGuest, setIsStayingGuest] = useState(true);

  // Form states - Staying guest info
  const [stayingTitle, setStayingTitle] = useState("Ông");
  const [stayingLastName, setStayingLastName] = useState("");
  const [stayingFirstName, setStayingFirstName] = useState("");
  const [stayingEmail, setStayingEmail] = useState("");
  const [stayingPhone, setStayingPhone] = useState("");
  const [stayingCountry, setStayingCountry] = useState("Việt Nam");

  // Special requests
  const [reqHighFloor, setReqHighFloor] = useState(false);
  const [reqNonSmoking, setReqNonSmoking] = useState(false);
  const [reqDisabledSupport, setReqDisabledSupport] = useState(false);
  const [reqOther, setReqOther] = useState(false);
  const [customRequest, setCustomRequest] = useState("");

  // Payment method (mockup)
  const [paymentMethod, setPaymentMethod] = useState<"bank" | "momo" | "vnpay">("bank");

  // Booking process states
  const [bookingProgress, setBookingProgress] = useState<"idle" | "holding" | "confirming" | "success" | "error">("idle");
  const [bookingResult, setBookingResult] = useState<ConfirmBookingResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Mobile drawer state
  const [isMobileSummaryExpanded, setIsMobileSummaryExpanded] = useState(false);

  // Coupon states
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Load category details
  useEffect(() => {
    if (!categoryId) {
      setErrorStatus("MISSING_CATEGORY_ID");
      setLoading(false);
      return;
    }

    async function loadRoomDetails() {
      try {
        const cat = await apiGet<AccommodationCategoryDTO>(`/categories/${categoryId}`);
        setRoom({
          id: cat.id,
          name: cat.name,
          basePrice: cat.basePrice,
          maxGuests: cat.maxGuests,
          areaSqm: cat.areaSqm
        });
      } catch (err: any) {
        if (FALLBACK_ROOMS[categoryId]) {
          const fb = FALLBACK_ROOMS[categoryId];
          setRoom({
            id: categoryId,
            name: fb.name,
            basePrice: fb.rawPrice,
            maxGuests: 4,
            areaSqm: 45
          });
        } else {
          console.error(err);
          setErrorStatus("CATEGORY_NOT_FOUND");
        }
      } finally {
        setLoading(false);
      }
    }

    loadRoomDetails();
  }, [categoryId]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ display: "flex", justifyContent: "center", padding: "10rem 0" }}>
          <div className="spinner" style={{
            border: "4px solid rgba(0,0,0,0.1)",
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            borderLeftColor: "var(--color-primary)",
            animation: "spin 1s linear infinite"
          }} />
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (errorStatus || !room) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: "center", padding: "5rem 0" }}>
          <h2 style={{ fontFamily: "var(--font-playfair)", fontSize: "2rem", marginBottom: "1rem" }}>Không tìm thấy hạng phòng</h2>
          <p style={{ color: "var(--color-steel-secondary)", marginBottom: "2rem" }}>Yêu cầu đặt phòng của bạn không hợp lệ hoặc hạng phòng đã chọn không tồn tại.</p>
          <button className={styles.bannerBtn} onClick={() => router.push("/")}>Quay lại Trang chủ</button>
        </div>
      </div>
    );
  }

  // Calculate nights
  let numNights = 1;
  if (checkin && checkout) {
    const d1 = new Date(checkin);
    const d2 = new Date(checkout);
    const timeDiff = d2.getTime() - d1.getTime();
    if (timeDiff > 0) {
      numNights = Math.ceil(timeDiff / (1000 * 3600 * 24));
    }
  }

  const originalTotalPrice = room.basePrice * numNights;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const totalPrice = appliedCoupon ? appliedCoupon.finalAmount : originalTotalPrice;
  const depositPrice = totalPrice * 0.3;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    setCouponError("");
    try {
      const checkinDateStr = checkin ? `${checkin}T14:00:00` : undefined;
      const checkoutDateStr = checkout ? `${checkout}T12:00:00` : undefined;
      const res = await apiPost<any>("/coupons/validate", {
        code: couponCode.trim(),
        totalAmount: originalTotalPrice,
        checkinDate: checkinDateStr,
        checkoutDate: checkoutDateStr
      });
      setAppliedCoupon(res);
    } catch (err: any) {
      setAppliedCoupon(null);
      setCouponError(getErrorMessage(err));
    } finally {
      setValidatingCoupon(false);
    }
  };

  // Format dates for display
  const formatVisualDate = (dateStr: string) => {
    if (!dateStr) return "";
    return dateStr.split("-").reverse().join("/");
  };

  const checkinVisual = formatVisualDate(checkin);
  const checkoutVisual = formatVisualDate(checkout);

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkin || !checkout || !contactLastName || !contactFirstName || !contactPhone) return;

    try {
      setBookingProgress("holding");
      const checkinDateStr = `${checkin}T14:00:00`;
      const checkoutDateStr = `${checkout}T12:00:00`;

      // Step 1: Hold room physical availability
      const holdRes = await apiPost<HoldRoomResponse>("/bookings/hold", {
        categoryId,
        checkinDate: checkinDateStr,
        checkoutDate: checkoutDateStr
      });

      setBookingProgress("confirming");

      // Compile detailed notes (Contact vs Staying guest, special requests, payment method)
      let notesParts: string[] = [];

      notesParts.push(`[Phương thức thanh toán] ${paymentMethod === "bank" ? "Chuyển khoản Ngân hàng" : paymentMethod === "momo" ? "Ví MoMo" : "Cổng VNPay"}`);

      if (!isStayingGuest) {
        notesParts.push(`[Khách lưu trú] ${stayingTitle} ${stayingLastName} ${stayingFirstName}, SĐT: ${stayingPhone}, Email: ${stayingEmail}, Quốc tịch: ${stayingCountry}`);
      } else {
        notesParts.push("[Khách lưu trú] Tôi là khách lưu trú (Trùng người đặt chỗ)");
      }

      let specReqs: string[] = [];
      if (reqHighFloor) specReqs.push("Tầng cao");
      if (reqNonSmoking) specReqs.push("Không hút thuốc");
      if (reqDisabledSupport) specReqs.push("Hỗ trợ người khuyết tật");
      if (reqOther && customRequest) specReqs.push(`Khác: ${customRequest}`);

      if (specReqs.length > 0) {
        notesParts.push(`[Yêu cầu đặc biệt] ${specReqs.join(", ")}`);
      }

      const finalNotes = notesParts.join("\n");

      // Step 2: Confirm booking and generate bill
      const confirmRes = await apiPost<ConfirmBookingResponse>("/bookings/confirm", {
        holdId: holdRes.holdId,
        guestName: `${contactLastName} ${contactFirstName}`,
        guestPhone: contactPhone,
        guestEmail: contactEmail || undefined,
        guestsCount: parseInt(guests) || 2,
        notes: finalNotes,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined
      });

      setBookingResult(confirmRes);
      setBookingProgress("success");
      setIsMobileSummaryExpanded(false);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(getErrorMessage(err));
      setBookingProgress("error");
    }
  };

  // Success view
  if (bookingProgress === "success" && bookingResult) {
    return (
      <div className={styles.container}>
        <div className={styles.successWrapper}>
          <span className={`material-symbols-outlined ${styles.successIcon}`}>check_circle</span>
          <h1 className={styles.successTitle}>Đặt phòng thành công!</h1>
          <p style={{ color: "var(--color-steel-secondary)" }}>Cảm ơn quý khách đã tin tưởng và chọn lựa The House - Lộc An Beach.</p>

          <div className={styles.successCard}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--color-whisper-border)", paddingBottom: "0.5rem" }}>
              <span style={{ fontWeight: "bold" }}>Mã đơn đặt phòng:</span>
              <span style={{ fontFamily: "monospace", fontWeight: "bold", color: "var(--color-primary)" }}>{bookingResult.bookingId.substring(0, 8).toUpperCase()}</span>
            </div>
            <div>
              <strong>Hạng phòng:</strong> {bookingResult.categoryName} (Số phòng: <strong>{bookingResult.accommodationCode}</strong>)
            </div>
            <div>
              <strong>Thời gian nghỉ:</strong> {checkinVisual} đến {checkoutVisual} ({numNights} đêm)
            </div>
            <div>
              <strong>Khách hàng:</strong> {bookingResult.guestName} ({bookingResult.guestPhone})
            </div>
            <div style={{ borderTop: "1px solid var(--color-whisper-border)", paddingTop: "0.75rem", marginTop: "0.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem" }}>
                <span>Tổng chi phí:</span>
                <strong>{bookingResult.totalAmount.toLocaleString("vi-VN")}₫</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem", color: "#b45309", fontWeight: "bold", marginTop: "0.25rem" }}>
                <span>Đặt cọc cần thanh toán (30%):</span>
                <span>{bookingResult.depositAmount.toLocaleString("vi-VN")}₫</span>
              </div>
            </div>

            {paymentMethod === "bank" && (
              <div style={{ marginTop: "1rem", backgroundColor: "#fefcbf", border: "1px solid #fef08a", padding: "1rem", borderRadius: "12px", color: "#854d0e", fontSize: "0.875rem" }}>
                <p style={{ fontWeight: "bold", margin: "0 0 0.5rem 0" }}>Thông tin tài khoản chuyển khoản:</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <div>Ngân hàng: <strong>Vietcombank (VCB)</strong></div>
                  <div>Số tài khoản: <strong>123456789</strong></div>
                  <div>Chủ tài khoản: <strong>The House Resort Loc An</strong></div>
                  <div>Nội dung chuyển khoản: <strong style={{ color: "var(--color-primary)", fontSize: "0.95rem" }}>{bookingResult.bookingId.substring(0, 8).toUpperCase()} {bookingResult.guestPhone}</strong></div>
                </div>
              </div>
            )}

            {(paymentMethod === "momo" || paymentMethod === "vnpay") && (
              <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                <p style={{ fontWeight: "bold", margin: 0, fontSize: "0.9rem" }}>Quét mã QR để đặt cọc qua {paymentMethod === "momo" ? "Ví MoMo" : "VNPay"}</p>
                <div className={styles.qrContainer} style={{ width: "100%" }}>
                  <div className={styles.qrMockup}>
                    <div style={{ fontSize: "2rem", color: "var(--color-primary)" }}>QR CODE</div>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "var(--color-steel-secondary)" }}>Mã QR này chứa số tiền đặt cọc {bookingResult.depositAmount.toLocaleString("vi-VN")}₫</span>
                </div>
              </div>
            )}
          </div>

          <button className={styles.successBackBtn} onClick={() => router.push("/")}>Quay lại Trang chủ</button>
        </div>
      </div>
    );
  }

  const renderPaymentInstructions = () => {
    switch (paymentMethod) {
      case "bank":
        return (
          <div className={styles.paymentGuide}>
            <span className={styles.guideTitle}>Hướng dẫn chuyển khoản ngân hàng</span>
            <p className={styles.guideText}>
              Quý khách vui lòng chuyển khoản đặt cọc tối thiểu 30% giá trị đặt phòng ({depositPrice.toLocaleString("vi-VN")}₫) vào tài khoản chính thức dưới đây. Sau khi nhận được giao dịch, nhân viên The House sẽ liên hệ xác nhận đơn đặt phòng qua SĐT/Email của bạn.
            </p>
            <div className={styles.bankDetailsList}>
              <div className={styles.bankDetailItem}>
                <span>Ngân hàng</span>
                <strong>Vietcombank (VCB)</strong>
              </div>
              <div className={styles.bankDetailItem}>
                <span>Số tài khoản</span>
                <strong>123456789</strong>
              </div>
              <div className={styles.bankDetailItem}>
                <span>Chủ tài khoản</span>
                <strong>The House Resort Loc An</strong>
              </div>
              <div className={styles.bankDetailItem}>
                <span>Nội dung chuyển khoản mẫu</span>
                <strong style={{ color: "var(--color-primary)" }}>[Ma_Don_Dat_Phong] [SDT_Cua_Ban]</strong>
              </div>
            </div>
          </div>
        );
      case "momo":
        return (
          <div className={styles.paymentGuide}>
            <span className={styles.guideTitle}>Thanh toán đặt cọc qua Ví điện tử MoMo (Mockup)</span>
            <p className={styles.guideText}>
              Sau khi bấm "Đặt phòng ngay", hệ thống sẽ tạo đơn đặt phòng và hiển thị mã QR MoMo tương ứng. Quý khách chỉ cần mở ứng dụng MoMo, chọn quét mã và xác nhận thanh toán đặt cọc <strong>{depositPrice.toLocaleString("vi-VN")}₫</strong>.
            </p>
            <div className={styles.qrContainer}>
              <div className={styles.qrMockup}>
                <span className="material-symbols-outlined" style={{ fontSize: "2.5rem", color: "#c2185b" }}>qr_code_2</span>
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--color-steel-secondary)" }}>Quét mã QR demo MoMo để thực hiện thanh toán</span>
            </div>
          </div>
        );
      case "vnpay":
        return (
          <div className={styles.paymentGuide}>
            <span className={styles.guideTitle}>Thanh toán đặt cọc qua Cổng VNPay (Mockup)</span>
            <p className={styles.guideText}>
              Thanh toán an toàn, bảo mật qua ví VNPay hoặc ứng dụng Ngân hàng (Mobile Banking) hỗ trợ VNPay-QR. Quý khách quét mã QR được tạo sau khi đặt để thanh toán khoản cọc <strong>{depositPrice.toLocaleString("vi-VN")}₫</strong>.
            </p>
            <div className={styles.qrContainer}>
              <div className={styles.qrMockup}>
                <span className="material-symbols-outlined" style={{ fontSize: "2.5rem", color: "var(--color-primary)" }}>qr_code_scanner</span>
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--color-steel-secondary)" }}>Quét mã QR demo VNPay để thực hiện thanh toán</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderTripSummary = (isMobile: boolean = false) => {
    return (
      <div className={styles.summaryCard} style={isMobile ? { border: "none", padding: 0, boxShadow: "none" } : {}}>
        <h2 className={styles.summaryTitle}>Chuyến đi của bạn</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <span className={styles.summaryResort}>The House - Lộc An Beach</span>
          <span className={styles.summaryRoomType}>{room.name}</span>
        </div>

        <div className={styles.summaryDates}>
          <div className={styles.dateBlock}>
            <span>Nhận phòng (Check-in)</span>
            <span className={styles.dateVal}>{checkinVisual}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "center", margin: "0.25rem 0" }}>
            <span className={styles.nightsLabel}>{numNights} đêm nghỉ</span>
          </div>
          <div className={styles.dateBlock}>
            <span>Trả phòng (Check-out)</span>
            <span className={styles.dateVal}>{checkoutVisual}</span>
          </div>
        </div>

        {/* Coupon Input Block */}
        <div style={{ margin: "1rem 0", padding: "0.75rem", background: "#f8fafc", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
          <div style={{ fontSize: "0.85rem", fontWeight: "bold", marginBottom: "0.5rem", color: "#334155" }}>Mã giảm giá / Promo code</div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              type="text"
              placeholder="Nhập mã (e.g. WELCOME10)"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              style={{
                flex: 1,
                padding: "0.45rem 0.65rem",
                borderRadius: "8px",
                border: "1px solid #94a3b8",
                fontSize: "0.85rem",
                textTransform: "uppercase",
                fontWeight: "bold",
                outline: "none"
              }}
            />
            <button
              type="button"
              onClick={handleApplyCoupon}
              disabled={validatingCoupon || !couponCode.trim()}
              style={{
                padding: "0.45rem 0.85rem",
                borderRadius: "8px",
                backgroundColor: "var(--color-primary)",
                color: "#fff",
                border: "none",
                fontSize: "0.85rem",
                fontWeight: "bold",
                cursor: "pointer",
                opacity: validatingCoupon || !couponCode.trim() ? 0.6 : 1
              }}
            >
              {validatingCoupon ? "..." : "Áp dụng"}
            </button>
          </div>

          {couponError && (
            <div style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: "0.4rem", fontWeight: "500" }}>
              {couponError}
            </div>
          )}

          {appliedCoupon && (
            <div style={{ color: "#16a34a", fontSize: "0.75rem", marginTop: "0.4rem", fontWeight: "bold" }}>
              ✓ Đã áp dụng: {appliedCoupon.code} (-{appliedCoupon.discountAmount.toLocaleString("vi-VN")}₫)
            </div>
          )}
        </div>

        <div className={styles.priceBlock}>
          <div className={styles.priceRow}>
            <span>Số lượng khách</span>
            <span>{guests} Khách</span>
          </div>
          <div className={styles.priceRow}>
            <span>Đơn giá phòng / đêm</span>
            <span>{room.basePrice.toLocaleString("vi-VN")}₫</span>
          </div>
          {appliedCoupon && (
            <div className={styles.priceRow} style={{ color: "#16a34a", fontWeight: "bold" }}>
              <span>Ưu đãi giảm giá</span>
              <span>-{discountAmount.toLocaleString("vi-VN")}₫</span>
            </div>
          )}
          <div className={`${styles.priceRow} ${styles.priceRowTotal}`}>
            <span>Tổng cộng (gồm thuế)</span>
            <span>{totalPrice.toLocaleString("vi-VN")}₫</span>
          </div>
        </div>

        <div className={styles.depositRow}>
          <span>Đặt cọc trực tuyến (30%)</span>
          <span>{depositPrice.toLocaleString("vi-VN")}₫</span>
        </div>

        {!isMobile && (
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={bookingProgress === "holding" || bookingProgress === "confirming"}
          >
            {bookingProgress === "holding" || bookingProgress === "confirming" ? "Đang xử lý..." : "Thanh toán"}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {/* 3-Step Process Stepper */}
      <div className={styles.stepper}>
        <div className={`${styles.step} ${styles.stepActive}`}>
          <div className={`${styles.stepIcon} ${styles.stepIconDone}`}>check</div>
          <span>Chọn phòng</span>
        </div>
        <div className={styles.stepLine}></div>
        <div className={`${styles.step} ${styles.stepActive}`}>
          <div className={`${styles.stepIcon} ${styles.stepIconDone}`}>check</div>
          <span>Dịch vụ mua thêm</span>
        </div>
        <div className={styles.stepLine}></div>
        <div className={`${styles.step} ${styles.stepActive}`}>
          <div className={`${styles.stepIcon} ${styles.stepIconActive}`}>3</div>
          <span style={{ fontWeight: "bold", color: "var(--color-primary)" }}>Thanh toán</span>
        </div>
      </div>

      {bookingProgress === "error" && (
        <div style={{ backgroundColor: "#fee2e2", border: "1px solid #fecaca", padding: "1rem", borderRadius: "12px", color: "#991b1b", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", fontWeight: "bold", marginBottom: "0.25rem" }}>
            <span className="material-symbols-outlined">error</span>
            <span>Đặt phòng thất bại</span>
          </div>
          <p style={{ margin: 0, fontSize: "0.9rem" }}>{errorMessage}</p>
        </div>
      )}

      {/* Main Form Submit Wrapper */}
      <form onSubmit={handleSubmitBooking}>
        <div className={styles.layout}>
          
          {/* Left Column: Input Fields Form */}
          <div className={styles.leftCol}>
            
            {/* VinClub Membership Banner Mock */}
            <div className={styles.banner}>
              <h3 className={styles.bannerTitle}>Đăng nhập để nhận ưu đãi thành viên đặc quyền</h3>
              <p className={styles.bannerText}>
                Giảm thêm tới 10% giá phòng, tích lũy điểm giao dịch để nâng hạng thành viên và hưởng vô vàn dịch vụ VIP đi kèm tại The House.
              </p>
              <div className={styles.bannerAction}>
                <button type="button" className={styles.bannerBtn} onClick={() => router.push("/login")}>Đăng nhập</button>
                <span style={{ color: "var(--color-steel-secondary)", fontSize: "0.85rem" }}>hoặc</span>
                <span className={styles.bannerLink} style={{ cursor: "pointer" }} onClick={() => router.push("/register")}>Đăng ký</span>
              </div>
            </div>

            {/* Section 1: Contact Person Info */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Thông tin người đặt chỗ</h3>
              
              <div className={styles.formGroup}>
                <span className={styles.label}>Danh xưng<span className={styles.required}>*</span></span>
                <div className={styles.titleSelection}>
                  <label className={styles.radioLabel}>
                    <input type="radio" name="contactTitle" value="Ông" checked={contactTitle === "Ông"} onChange={() => setContactTitle("Ông")} />
                    Ông
                  </label>
                  <label className={styles.radioLabel}>
                    <input type="radio" name="contactTitle" value="Bà" checked={contactTitle === "Bà"} onChange={() => setContactTitle("Bà")} />
                    Bà
                  </label>
                  <label className={styles.radioLabel}>
                    <input type="radio" name="contactTitle" value="Khác" checked={contactTitle === "Khác"} onChange={() => setContactTitle("Khác")} />
                    Khác
                  </label>
                </div>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Họ<span className={styles.required}>*</span></label>
                  <input
                    className={styles.input}
                    placeholder="VD: Nguyễn"
                    value={contactLastName}
                    onChange={(e) => setContactLastName(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Tên đệm và tên<span className={styles.required}>*</span></label>
                  <input
                    className={styles.input}
                    placeholder="VD: Văn A"
                    value={contactFirstName}
                    onChange={(e) => setContactFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Email nhận thông tin đơn hàng<span className={styles.required}>*</span></label>
                  <input
                    className={styles.input}
                    type="email"
                    placeholder="VD: nguyenvana@gmail.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Điện thoại liên hệ<span className={styles.required}>*</span></label>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <select className={styles.select} style={{ width: "35%" }} value="+84">
                      <option value="+84">+84 (VN)</option>
                      <option value="+1">+1 (US)</option>
                      <option value="+44">+44 (UK)</option>
                      <option value="+61">+61 (AU)</option>
                    </select>
                    <input
                      className={styles.input}
                      style={{ width: "65%" }}
                      type="tel"
                      placeholder="VD: 0912345678"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.label}>Vùng quốc gia<span className={styles.required}>*</span></label>
                  <select className={styles.select} value={contactCountry} onChange={(e) => setContactCountry(e.target.value)}>
                    <option value="Việt Nam">Việt Nam</option>
                    <option value="Mỹ">Mỹ</option>
                    <option value="Hàn Quốc">Hàn Quốc</option>
                    <option value="Nhật Bản">Nhật Bản</option>
                    <option value="Úc">Úc</option>
                  </select>
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`} style={{ marginTop: "0.5rem" }}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      style={{ width: "1.1rem", height: "1.1rem", cursor: "pointer" }}
                      checked={isStayingGuest}
                      onChange={(e) => setIsStayingGuest(e.target.checked)}
                    />
                    Tôi là khách lưu trú (Sử dụng thông tin đặt chỗ để làm thủ tục nhận phòng)
                  </label>
                </div>
              </div>
            </div>

            {/* Section 2: Staying Guest Info (shown conditionally) */}
            {!isStayingGuest && (
              <div className={`${styles.card} ${styles.fadeIn}`} style={{ animation: "fadeIn 0.3s ease" }}>
                <h3 className={styles.cardTitle}>Thông tin người lưu trú</h3>
                
                <div className={styles.formGroup}>
                  <span className={styles.label}>Danh xưng<span className={styles.required}>*</span></span>
                  <div className={styles.titleSelection}>
                    <label className={styles.radioLabel}>
                      <input type="radio" name="stayingTitle" value="Ông" checked={stayingTitle === "Ông"} onChange={() => setStayingTitle("Ông")} />
                      Ông
                    </label>
                    <label className={styles.radioLabel}>
                      <input type="radio" name="stayingTitle" value="Bà" checked={stayingTitle === "Bà"} onChange={() => setStayingTitle("Bà")} />
                      Bà
                    </label>
                    <label className={styles.radioLabel}>
                      <input type="radio" name="stayingTitle" value="Khác" checked={stayingTitle === "Khác"} onChange={() => setStayingTitle("Khác")} />
                      Khác
                    </label>
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Họ<span className={styles.required}>*</span></label>
                    <input
                      className={styles.input}
                      placeholder="VD: Trần"
                      value={stayingLastName}
                      onChange={(e) => setStayingLastName(e.target.value)}
                      required={!isStayingGuest}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Tên đệm và tên<span className={styles.required}>*</span></label>
                    <input
                      className={styles.input}
                      placeholder="VD: Thị B"
                      value={stayingFirstName}
                      onChange={(e) => setStayingFirstName(e.target.value)}
                      required={!isStayingGuest}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Email nhận thông tin<span className={styles.required}>*</span></label>
                    <input
                      className={styles.input}
                      type="email"
                      placeholder="VD: tranthib@gmail.com"
                      value={stayingEmail}
                      onChange={(e) => setStayingEmail(e.target.value)}
                      required={!isStayingGuest}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Điện thoại liên hệ<span className={styles.required}>*</span></label>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <select className={styles.select} style={{ width: "35%" }} value="+84">
                        <option value="+84">+84 (VN)</option>
                        <option value="+1">+1 (US)</option>
                      </select>
                      <input
                        className={styles.input}
                        style={{ width: "65%" }}
                        type="tel"
                        placeholder="VD: 0987654321"
                        value={stayingPhone}
                        onChange={(e) => setStayingPhone(e.target.value)}
                        required={!isStayingGuest}
                      />
                    </div>
                  </div>
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Vùng quốc gia<span className={styles.required}>*</span></label>
                    <select className={styles.select} value={stayingCountry} onChange={(e) => setStayingCountry(e.target.value)}>
                      <option value="Việt Nam">Việt Nam</option>
                      <option value="Mỹ">Mỹ</option>
                      <option value="Hàn Quốc">Hàn Quốc</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Section 3: Special Requests */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Yêu cầu đặc biệt</h3>
              <p style={{ color: "var(--color-steel-secondary)", fontSize: "var(--font-size-sub)", margin: 0 }}>
                Các yêu cầu đặc biệt không đảm bảo được đáp ứng 100% tùy thuộc vào tình trạng phòng lúc nhận, tuy nhiên resort sẽ cố gắng hết sức để sắp xếp cho quý khách.
              </p>
              
              <div className={styles.requestsGrid}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" style={{ width: "1.1rem", height: "1.1rem" }} checked={reqHighFloor} onChange={(e) => setReqHighFloor(e.target.checked)} />
                  Tầng cao
                </label>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" style={{ width: "1.1rem", height: "1.1rem" }} checked={reqNonSmoking} onChange={(e) => setReqNonSmoking(e.target.checked)} />
                  Không hút thuốc
                </label>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" style={{ width: "1.1rem", height: "1.1rem" }} checked={reqDisabledSupport} onChange={(e) => setReqDisabledSupport(e.target.checked)} />
                  Hỗ trợ người khuyết tật
                </label>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" style={{ width: "1.1rem", height: "1.1rem" }} checked={reqOther} onChange={(e) => setReqOther(e.target.checked)} />
                  Yêu cầu khác
                </label>
              </div>

              {reqOther && (
                <div className={styles.formGroup} style={{ animation: "fadeIn 0.2s ease" }}>
                  <label className={styles.label}>Chi tiết yêu cầu của bạn</label>
                  <textarea
                    className={styles.textarea}
                    placeholder="Quý khách có cần nôi em bé, trang trí phòng trăng mật, hay có lưu ý gì thêm về dị ứng..."
                    value={customRequest}
                    onChange={(e) => setCustomRequest(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Section 4: Payment Methods Mockup */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Phương thức đặt cọc trực tuyến</h3>
              <p style={{ color: "var(--color-steel-secondary)", fontSize: "var(--font-size-sub)", margin: 0 }}>
                Để giữ phòng chắc chắn trên hệ thống, quý khách cần thực hiện thanh toán đặt cọc trước 30%. Vui lòng chọn một phương thức phù hợp.
              </p>

              <div className={styles.paymentGrid}>
                <div
                  className={`${styles.paymentOption} ${paymentMethod === "bank" ? styles.paymentOptionSelected : ""}`}
                  onClick={() => setPaymentMethod("bank")}
                >
                  <span className={`material-symbols-outlined ${styles.paymentIcon}`}>account_balance</span>
                  <span className={styles.paymentName}>Chuyển khoản Ngân hàng</span>
                </div>
                
                <div
                  className={`${styles.paymentOption} ${paymentMethod === "momo" ? styles.paymentOptionSelected : ""}`}
                  onClick={() => setPaymentMethod("momo")}
                >
                  <span className={`material-symbols-outlined ${styles.paymentIcon}`}>account_balance_wallet</span>
                  <span className={styles.paymentName}>Ví điện tử MoMo</span>
                </div>

                <div
                  className={`${styles.paymentOption} ${paymentMethod === "vnpay" ? styles.paymentOptionSelected : ""}`}
                  onClick={() => setPaymentMethod("vnpay")}
                >
                  <span className={`material-symbols-outlined ${styles.paymentIcon}`}>qr_code_2</span>
                  <span className={styles.paymentName}>Cổng VNPay</span>
                </div>
              </div>

              {/* Removed renderPaymentInstructions() to only show it after submit/confirm */}
            </div>

          </div>

          {/* Right Column: Sticky Summary Card (Desktop) */}
          <div className={styles.rightCol}>
            {renderTripSummary()}
          </div>

        </div>

        {/* Mobile Sticky Footer Payment Panel */}
        <div className={styles.mobileStickyBar}>
          <div className={styles.mobileTotalBlock} onClick={() => setIsMobileSummaryExpanded(true)}>
            <div className={styles.mobileTotalLabel}>
              Tổng đặt cọc (30%)
              <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>keyboard_arrow_up</span>
            </div>
            <div className={styles.mobileTotalVal}>
              {depositPrice.toLocaleString("vi-VN")}₫
            </div>
          </div>
          <button
            type="submit"
            className={styles.mobileSubmitBtn}
            disabled={bookingProgress === "holding" || bookingProgress === "confirming"}
          >
            {bookingProgress === "holding" || bookingProgress === "confirming" ? "Đang xử lý..." : "Thanh toán"}
          </button>
        </div>

        {/* Mobile Collapsible Panel Overlay Drawer */}
        {isMobileSummaryExpanded && (
          <>
            <div className={styles.drawerOverlay} onClick={() => setIsMobileSummaryExpanded(false)}></div>
            <div className={styles.mobileDrawer}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--color-whisper-border)", paddingBottom: "0.5rem" }}>
                <span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>Chi tiết đơn đặt phòng</span>
                <button
                  type="button"
                  style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}
                  onClick={() => setIsMobileSummaryExpanded(false)}
                >
                  <span className="material-symbols-outlined" style={{ color: "var(--color-steel-secondary)" }}>close</span>
                </button>
              </div>
              {renderTripSummary(true)}
            </div>
          </>
        )}

      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", justifyContent: "center", padding: "10rem 0" }}>
        <div className="spinner" style={{ border: "4px solid rgba(0,0,0,0.1)", width: "48px", height: "48px", borderRadius: "50%", borderLeftColor: "var(--color-primary)", animation: "spin 1s linear infinite" }} />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
