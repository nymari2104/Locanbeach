"use client";

import { use, useState, useEffect, Suspense } from "react";
import styles from "./page.module.css";
import Stack from "../../../../components/ui/Stack";
import Link from "next/link";
import { apiGet, apiPost, getErrorMessage } from "@/lib/api";
import { 
  AccommodationCategoryDTO,
  HoldRoomResponse, 
  ConfirmBookingResponse 
} from "@/types/api";
import { useSearchParams, useRouter, notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

const FALLBACK_ROOMS: Record<string, any> = {
  "ocean-view-suite": {
    name: "Ocean View Premium Suite",
    price: "3,500,000₫",
    rawPrice: 3500000,
    size: "45 m²",
    view: "Trực diện biển",
    bed: "1 Giường King",
    capacity: "2 Người lớn",
    description: "Trải nghiệm sự xa xỉ thầm lặng trong không gian 45m2 được thiết kế tỉ mỉ. Ocean View Premium Suite sở hữu ban công riêng tư vươn ra biển, đón trọn ánh bình minh đầu ngày. Nội thất được tinh tuyển từ những vật liệu tự nhiên, tạo nên một bản hòa ca giữa kiến trúc đương đại và hơi thở của đại dương.",
    images: {
      hero: "https://lh3.googleusercontent.com/aida-public/AB6AXuB1mg4OswY0mG__ASh9d8RMLOIUduZk2hd1SatuMC66hoL7OKnQcHA2p-PXeoNcnA3FcFYUtIJ6pJEh2WC7hDiat17vr2LaUlJEGqTZeHP2P30wjOidUJ5lg4GW2sExUgWrNP1ZcNg9xF0Gb69B-krmFQi_05aOJqy-qOkr7ytJ0pqbbzbV_oXmD1LJhg_ptVRViedWLb5_6zd0dc_R51bICysPEe52OFtTTQMnBuBj9OZ9Ng_tws2r",
      decor: "https://lh3.googleusercontent.com/aida-public/AB6AXuCQdeO8CmC3o6pj8hCJjfad4P3XIXXQ0VS8ssJh4r0nVSDmfpBbjUqJQFK6tOwSBsQJphoQWFFvj_dUP4WGk9K095mGpJI3rCtQuHVrwVr9SESjvDqib0iKvg7PUpXx4vvDV9j6kjmLRdeHzMG7UE1jpklnPWb4UEMUxr70Ym3udhFcIANujEtN22mvakYnTcLtQiHzrTDHJ67xTHaglyjEFh6bdmfP7B6dJm-OYgLu_ss9nPFHlLz1",
      bathroom: "https://lh3.googleusercontent.com/aida-public/AB6AXuCvuUsuSytN-DAQyY9QuUQHpncVrvpFXiRt59jlYjblUX3RJoySHY2dvkCOvDnhFw2y4BrVgSURb3Iw1D7MncydBFKLikDUGKNpIVeIKACKY70x71tOSAi8brky1409biNw6DGsUOVlIekoQe7jJNtyQSLjs9nNLnQz73z_W-_aKfa7vcxzznY-iNZaGwKXbg-DbiB-NQEpayBEeEEPcdi_0O9O1lvTHoftIbJIgPB2H8ZhfUgs2LyF",
      balcony: "https://lh3.googleusercontent.com/aida-public/AB6AXuB9AEBgji5ikCjFDfDBxXpL36010fCJyQMm6qk_vKHhmJEAVIplt3IbZAWtbci9mkHpCr7fsiFz99Mm8w_ezVVQPuP2y7-_3MMLjAcSxTHta3CmiNNASeVFm45tx-72vpiYtdPvjl2HpsATreSt6cipUajVOxm3YgN88vzwraNyCilcjBVoPxLBxc8dFtMGFAchAlYEP6IGJSgnRaIPh4MIpOOvhrHcbugoa0-QytJI0diT-zJVbMd-",
      amenity: "https://lh3.googleusercontent.com/aida-public/AB6AXuBgV55IyQpbVDewS7UemfG5jcGZNlX6ktrInchdxNoWf5dVYDO7URr0ozP58zJGpKwf_URWU8h_IiuGJJglWNk0gv7PaosphmyaOFAjR3OBg7LsBHHf_y6yU-8ENydDC59Flbl2rX3fyuh-yu3SiT9oJGA5R5K4mGeE-eoehHNvS9WVS1ia2lNI4lksV1B3SP0F-1sH044hjbXln9mHfjXrMDAHUD0HMBQ701ZZgXlYki9Z0xr1tifW"
    }
  },
  "garden-deluxe": {
    name: "Garden Deluxe Double",
    price: "1,800,000₫",
    rawPrice: 1800000,
    size: "30 m²",
    view: "Hướng vườn nhiệt đới",
    bed: "1 Giường Double",
    capacity: "2 Người lớn",
    description: "Thư giãn hoàn toàn trong không gian Garden Deluxe được bao quanh bởi khu vườn nhiệt đới xanh mát. Phòng được thiết kế tối giản, tận dụng ánh sáng tự nhiên với khung cửa kính lớn mở rộng tầm nhìn, mang lại cảm giác bình yên và thư thái tuyệt đối.",
    images: {
      hero: "https://lh3.googleusercontent.com/aida-public/AB6AXuAjI6ayn79y9xDAAc3zNNj5KRPktLrQCQBlQHRNqvfVQsC_uwPhL6MmtIxnY8Y8bUAQiHSq0P1MPJQWYTv-Jp5FZ6SHsK9vsfY82WzDcf1gBBTOVWOI45pTI7-XPpgpHC32dQFLPwwWsTC9xD1y-0MBjAU7kRt8we9bjinrreFxGbUAPHcPcDeS97cEscQR2TceR1KKmXS3r8hzRsxFrrINjXqZJzj299zhocLgVB1WHjt8Aei9bciT",
      decor: "https://lh3.googleusercontent.com/aida-public/AB6AXuCQdeO8CmC3o6pj8hCJjfad4P3XIXXQ0VS8ssJh4r0nVSDmfpBbjUqJQFK6tOwSBsQJphoQWFFvj_dUP4WGk9K095mGpJI3rCtQuHVrwVr9SESjvDqib0iKvg7PUpXx4vvDV9j6kjmLRdeHzMG7UE1jpklnPWb4UEMUxr70Ym3udhFcIANujEtN22mvakYnTcLtQiHzrTDHJ67xTHaglyjEFh6bdmfP7B6dJm-OYgLu_ss9nPFHlLz1",
      bathroom: "https://lh3.googleusercontent.com/aida-public/AB6AXuCvuUsuSytN-DAQyY9QuUQHpncVrvpFXiRt59jlYjblUX3RJoySHY2dvkCOvDnhFw2y4BrVgSURb3Iw1D7MncydBFKLikDUGKNpIVeIKACKY70x71tOSAi8brky1409biNw6DGsUOVlIekoQe7jJNtyQSLjs9nNLnQz73z_W-_aKfa7vcxzznY-iNZaGwKXbg-DbiB-NQEpayBEeEEPcdi_0O9O1lvTHoftIbJIgPB2H8ZhfUgs2LyF",
      balcony: "https://lh3.googleusercontent.com/aida-public/AB6AXuB9AEBgji5ikCjFDfDBxXpL36010fCJyQMm6qk_vKHhmJEAVIplt3IbZAWtbci9mkHpCr7fsiFz99Mm8w_ezVVQPuP2y7-_3MMLjAcSxTHta3CmiNNASeVFm45tx-72vpiYtdPvjl2HpsATreSt6cipUajVOxm3YgN88vzwraNyCilcjBVoPxLBxc8dFtMGFAchAlYEP6IGJSgnRaIPh4MIpOOvhrHcbugoa0-QytJI0diT-zJVbMd-",
      amenity: "https://lh3.googleusercontent.com/aida-public/AB6AXuBgV55IyQpbVDewS7UemfG5jcGZNlX6ktrInchdxNoWf5dVYDO7URr0ozP58zJGpKwf_URWU8h_IiuGJJglWNk0gv7PaosphmyaOFAjR3OBg7LsBHHf_y6yU-8ENydDC59Flbl2rX3fyuh-yu3SiT9oJGA5R5K4mGeE-eoehHNvS9WVS1ia2lNI4lksV1B3SP0F-1sH044hjbXln9mHfjXrMDAHUD0HMBQ701ZZgXlYki9Z0xr1tifW"
    }
  },
  "family-connecting": {
    name: "Family Connecting Room",
    price: "4,200,000₫",
    rawPrice: 4200000,
    size: "55 m²",
    view: "Hướng vườn & hồ bơi",
    bed: "1 Giường King & 1 Giường Đơn",
    capacity: "4 Khách",
    description: "Không gian lý tưởng dành cho gia đình hoặc nhóm bạn thân. Thiết kế kết nối tinh tế giữa các phòng ngủ tạo không gian chung đầm ấm nhưng vẫn giữ được sự riêng tư cần thiết cho mỗi thành viên.",
    images: {
      hero: "https://lh3.googleusercontent.com/aida-public/AB6AXuC3D6xJlqpl53PO955reRpGJUg0QxAsFfH0MKavseLdbJgcwei0aQ09XO3ov-vLytTeTzrq6agNJwsxPQ47qptDCHhCVuhwTqpfp_aGt_CdWQZkw7tdv_nBSLmGyxcD1LZrro1gx99cg1nHlczteeCxSGiwMDgQYeSgR5AFxLa04rG3ugmuEDxrjBjj3o24z2FvatiNoOdVDZBN2VnTk0QZDz7yXnIBy9FhI3FeyjuEvIggl_gym-u7",
      decor: "https://lh3.googleusercontent.com/aida-public/AB6AXuCQdeO8CmC3o6pj8hCJjfad4P3XIXXQ0VS8ssJh4r0nVSDmfpBbjUqJQFK6tOwSBsQJphoQWFFvj_dUP4WGk9K095mGpJI3rCtQuHVrwVr9SESjvDqib0iKvg7PUpXx4vvDV9j6kjmLRdeHzMG7UE1jpklnPWb4UEMUxr70Ym3udhFcIANujEtN22mvakYnTcLtQiHzrTDHJ67xTHaglyjEFh6bdmfP7B6dJm-OYgLu_ss9nPFHlLz1",
      bathroom: "https://lh3.googleusercontent.com/aida-public/AB6AXuCvuUsuSytN-DAQyY9QuUQHpncVrvpFXiRt59jlYjblUX3RJoySHY2dvkCOvDnhFw2y4BrVgSURb3Iw1D7MncydBFKLikDUGKNpIVeIKACKY70x71tOSAi8brky1409biNw6DGsUOVlIekoQe7jJNtyQSLjs9nNLnQz73z_W-_aKfa7vcxzznY-iNZaGwKXbg-DbiB-NQEpayBEeEEPcdi_0O9O1lvTHoftIbJIgPB2H8ZhfUgs2LyF",
      balcony: "https://lh3.googleusercontent.com/aida-public/AB6AXuB9AEBgji5ikCjFDfDBxXpL36010fCJyQMm6qk_vKHhmJEAVIplt3IbZAWtbci9mkHpCr7fsiFz99Mm8w_ezVVQPuP2y7-_3MMLjAcSxTHta3CmiNNASeVFm45tx-72vpiYtdPvjl2HpsATreSt6cipUajVOxm3YgN88vzwraNyCilcjBVoPxLBxc8dFtMGFAchAlYEP6IGJSgnRaIPh4MIpOOvhrHcbugoa0-QytJI0diT-zJVbMd-",
      amenity: "https://lh3.googleusercontent.com/aida-public/AB6AXuBgV55IyQpbVDewS7UemfG5jcGZNlX6ktrInchdxNoWf5dVYDO7URr0ozP58zJGpKwf_URWU8h_IiuGJJglWNk0gv7PaosphmyaOFAjR3OBg7LsBHHf_y6yU-8ENydDC59Flbl2rX3fyuh-yu3SiT9oJGA5R5K4mGeE-eoehHNvS9WVS1ia2lNI4lksV1B3SP0F-1sH044hjbXln9mHfjXrMDAHUD0HMBQ701ZZgXlYki9Z0xr1tifW"
    }
  }
};

function RoomDetailContent({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read URL query params
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [guests, setGuests] = useState("2");

  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    // Set query params if they exist, otherwise default
    const qCheckin = searchParams.get("checkin");
    const qCheckout = searchParams.get("checkout");
    const qGuests = searchParams.get("guests");

    if (qCheckin) {
      setCheckin(qCheckin);
    } else {
      const today = new Date();
      setCheckin(today.toISOString().split("T")[0]);
    }
    
    if (qCheckout) {
      setCheckout(qCheckout);
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setCheckout(tomorrow.toISOString().split("T")[0]);
    }
    
    if (qGuests) setGuests(qGuests);

    async function loadData() {
      try {
        const cat = await apiGet<AccommodationCategoryDTO>(`/categories/${id}`);
        const imagesList = cat.images && cat.images.length > 0
          ? cat.images.map(img => img.url)
          : [
              "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=500&auto=format"
            ];

        setRoom({
          name: cat.name,
          price: `${cat.basePrice.toLocaleString("vi-VN")}₫`,
          rawPrice: cat.basePrice,
          size: `${cat.areaSqm} m²`,
          view: cat.description ? cat.description.substring(0, 30) : "Hướng đại dương",
          bed: "1 Giường King",
          capacity: `${cat.maxGuests} khách`,
          description: cat.description || "Hạng phòng nghỉ dưỡng cao cấp tại The House.",
          images: {
            hero: imagesList[0],
            decor: imagesList[1] || imagesList[0],
            bathroom: imagesList[2] || imagesList[0],
            balcony: imagesList[3] || imagesList[0],
            amenity: imagesList[4] || imagesList[0],
          }
        });
      } catch (err) {
        if (FALLBACK_ROOMS[id]) {
          setRoom(FALLBACK_ROOMS[id]);
        } else {
          setIsNotFound(true);
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, searchParams]);

  const handleRedirectToCheckout = () => {
    router.push(`/checkout?categoryId=${id}&checkin=${checkin}&checkout=${checkout}&guests=${guests}`);
  };

  if (isNotFound) {
    notFound();
  }

  if (loading || !room) {
    return (
      <div className={styles.skeletonWrapper}>
        {/* Left Side: Category detail skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className={styles.skeletonShimmer} style={{ height: '350px', borderRadius: '24px', width: '100%' }}></div>
          <div className={styles.skeletonShimmer} style={{ height: '36px', width: '50%', borderRadius: '4px' }}></div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className={styles.skeletonShimmer} style={{ height: '20px', width: '80px', borderRadius: '4px' }}></div>
            <div className={styles.skeletonShimmer} style={{ height: '20px', width: '80px', borderRadius: '4px' }}></div>
            <div className={styles.skeletonShimmer} style={{ height: '20px', width: '80px', borderRadius: '4px' }}></div>
          </div>
          <div className={styles.skeletonShimmer} style={{ height: '100px', width: '100%', borderRadius: '8px' }}></div>
        </div>

        {/* Right Side: Booking Card skeleton */}
        <div className={styles.skeletonShimmer} style={{ height: '400px', borderRadius: '24px', width: '100%' }}></div>
      </div>
    );
  }

  // format visual dates
  const checkinVisual = checkin ? checkin.split("-").reverse().join("/") : "Hôm nay";
  const checkoutVisual = checkout ? checkout.split("-").reverse().join("/") : "Ngày mai";

  return (
    <div>
      {/* Hero Section (Asymmetric) */}
      <section className={styles.heroSection}>
        <div className={styles.heroText}>
          <h1 className={styles.title}>
            Chạm vào{" "}
            <span className={styles.inlineImage}>
              <img
                alt="Biển"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxYzbpcLHoXOys1OvJLiaPNr4VjTDnI4K084nHj-kxn2yY5cn1srh36yeWWDqhxikwoHE8dHQbyb3kc2uTGt0Jd2XxjaBvXyoc5LMv-w1V_hnvaxN849pGyi5q9Jq_3k7DQH2zDP3QMXwSg8XXLmJxEXIaAz7QqRuDYkddGAWz91TBRVRBKy4JIQEfnPa7hu0EdJ0iNAOhrQq9yAyNEMQArgCaW7wx3S7UMdgWtmfzyZ9Ut4YylZ-s"
              />
            </span>{" "}
            sự bình yên.
          </h1>
          <p className={styles.heroDesc}>
            {room.name} mang đến không gian mở kết nối trực tiếp với thiên nhiên, nơi mọi chi tiết thiết kế đều tôn vinh vẻ đẹp nguyên sơ của biển Lộc An.
          </p>
        </div>
        <div className={styles.heroImageWrapper}>
          <Stack
            randomRotation={false}
            sensitivity={140}
            sendToBackOnClick={true}
            autoplay={true}
            autoplayDelay={5000}
            cards={[
              room.images.hero,
              room.images.decor,
              room.images.bathroom,
              room.images.balcony,
              room.images.amenity
            ].map((src, i) => (
              <img 
                key={i} 
                src={src} 
                alt={`${room.name} - ${i + 1}`} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            ))}
          />
        </div>
      </section>

      {/* Content Structure */}
      <div className={`${styles.container} ${styles.contentWrapper}`}>
        {/* Left Column: Details */}
        <div className={styles.leftColumn}>
          {/* Overview */}
          <section>
            <h2 className={styles.roomTitle}>{room.name}</h2>
            <div className={`mono-text ${styles.specsGrid}`}>
              <div>
                <span className={styles.specLabel}>Diện tích</span>
                <span className={styles.specValue}>{room.size}</span>
              </div>
              <div>
                <span className={styles.specLabel}>Tầm nhìn</span>
                <span className={styles.specValue}>{room.view}</span>
              </div>
              <div>
                <span className={styles.specLabel}>Giường</span>
                <span className={styles.specValue}>{room.bed}</span>
              </div>
              <div>
                <span className={styles.specLabel}>Sức chứa</span>
                <span className={styles.specValue}>{room.capacity}</span>
              </div>
            </div>
            <div className={styles.description}>
              <p>{room.description}</p>
            </div>
          </section>

          {/* Amenities Grid */}
          <section>
            <h3 className="headline-lg" style={{ marginBottom: "2rem" }}>Tiện ích đặc quyền</h3>
            <div className={styles.amenitiesGrid}>
              <div className={styles.amenityCard}>
                <span className={`material-symbols-outlined ${styles.amenityIcon}`}>balcony</span>
                <div>
                  <h4 className={styles.amenityName}>Ban công riêng tư</h4>
                  <p className={styles.amenityDesc}>Tầm nhìn toàn cảnh biển Lộc An</p>
                </div>
              </div>
              <div className={styles.amenityCard}>
                <span className={`material-symbols-outlined ${styles.amenityIcon}`}>bathtub</span>
                <div>
                  <h4 className={styles.amenityName}>Bồn tắm thư giãn</h4>
                  <p className={styles.amenityDesc}>Bồn tắm đứng độc lập sang trọng</p>
                </div>
              </div>
              <div className={styles.amenityCard}>
                <span className={`material-symbols-outlined ${styles.amenityIcon}`}>wifi</span>
                <div>
                  <h4 className={styles.amenityName}>Wi-Fi tốc độ cao</h4>
                  <p className={styles.amenityDesc}>Kết nối liên tục không giới hạn</p>
                </div>
              </div>
              <div className={styles.amenityCard}>
                <span className={`material-symbols-outlined ${styles.amenityIcon}`}>kitchen</span>
                <div>
                  <h4 className={styles.amenityName}>Mini bar miễn phí</h4>
                  <p className={styles.amenityDesc}>Đồ uống và thức ăn nhẹ mỗi ngày</p>
                </div>
              </div>
            </div>
          </section>

          {/* Gallery (Asymmetric Bento) */}
          <section>
            <h3 className="headline-lg" style={{ marginBottom: "2rem" }}>Không gian</h3>
            <div className={styles.galleryLayout}>
              <div className={styles.bentoRow1}>
                <div className={styles.galleryImgWrapper}>
                  <img
                    className={styles.galleryImage}
                    alt="Decor Detail"
                    src={room.images.decor}
                  />
                </div>
                <div className={styles.galleryImgWrapper}>
                  <img
                    className={styles.galleryImage}
                    alt="Bathroom"
                    src={room.images.bathroom}
                  />
                </div>
              </div>
              <div className={styles.bentoRow2}>
                <div className={styles.galleryImgWrapper}>
                  <img
                    className={styles.galleryImage}
                    alt="Balcony View"
                    src={room.images.balcony}
                  />
                </div>
                <div className={styles.galleryImgWrapper}>
                  <img
                    className={styles.galleryImage}
                    alt="Amenities"
                    src={room.images.amenity}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Sticky Booking Card */}
        <div className={styles.rightColumn}>
          <div className={styles.stickyCard}>
            <div className={styles.priceWrapper}>
              <span className={styles.price}>{room.price}</span>
              <span className={styles.priceLabelNight}>/ đêm</span>
            </div>
            <div className={styles.formFields}>
              <div className={styles.field}>
                <div>
                  <span className={`mono-text ${styles.fieldLabel}`}>Nhận phòng</span>
                  <span className={`mono-text ${styles.fieldValue}`}>{checkinVisual}</span>
                </div>
                <span className={`material-symbols-outlined ${styles.fieldIcon}`}>calendar_today</span>
              </div>
              <div className={styles.field}>
                <div>
                  <span className={`mono-text ${styles.fieldLabel}`}>Trả phòng</span>
                  <span className={`mono-text ${styles.fieldValue}`}>{checkoutVisual}</span>
                </div>
                <span className={`material-symbols-outlined ${styles.fieldIcon}`}>calendar_today</span>
              </div>
              <div className={styles.field}>
                <div>
                  <span className={`mono-text ${styles.fieldLabel}`}>Khách</span>
                  <span className={`mono-text ${styles.fieldValue}`}>{guests} Khách</span>
                </div>
                <span className={`material-symbols-outlined ${styles.fieldIcon}`}>person</span>
              </div>
            </div>
            
            <button className={`mono-text ${styles.bookButton}`} style={{ width: "100%" }} onClick={handleRedirectToCheckout}>Đặt ngay</button>
            
            <p className={`mono-text ${styles.cancelPolicy}`}>Không thu phí hủy phòng trước 7 ngày.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RoomDetail({ params }: PageProps) {
  const { id } = use(params);
  return (
    <Suspense fallback={
      <div style={{ display: "flex", justifyContent: "center", padding: "10rem 0" }}>
        <div className="spinner" style={{ border: "4px solid rgba(0,0,0,0.1)", width: "48px", height: "48px", borderRadius: "50%", borderLeftColor: "var(--color-primary)", animation: "spin 1s linear infinite" }} />
      </div>
    }>
      <RoomDetailContent id={id} />
    </Suspense>
  );
}
