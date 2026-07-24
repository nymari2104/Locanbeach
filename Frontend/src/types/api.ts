export interface ImageDTO {
  id: string;
  url: string;
  isCover: boolean;
  sortOrder: number;
}

export interface AmenityDTO {
  id?: string;
  name: string;
  icon: string;
}

export type AccommodationType = 'ROOM' | 'CAMPING' | 'GLAMPING';

export interface AccommodationCategoryDTO {
  id?: string;
  name: string;
  code: string;
  type: AccommodationType;
  description: string;
  basePrice: number;
  maxGuests: number;
  areaSqm: number;
  images?: ImageDTO[];
  amenityIds?: string[];
  amenities?: AmenityDTO[];
}

export type AccommodationStatus = 'ACTIVE' | 'INACTIVE';
export type OperationalStatus = 'VACANT' | 'OCCUPIED' | 'CLEANING' | 'MAINTENANCE' | 'DIRTY';

export interface AccommodationDTO {
  id?: string;
  categoryId: string;
  categoryName?: string;
  code: string;
  status: AccommodationStatus;
  operationalStatus: OperationalStatus;
  metadata?: string;
  lastCleanedById?: string;
  lastCleanedByName?: string;
}

export type ServiceGroup = 'SPA' | 'RESTAURANT' | 'ENTERTAINMENT' | 'UTILITY';
export type ServiceStatus = 'ACTIVE' | 'INACTIVE';

export interface ServiceDTO {
  id?: string;
  name: string;
  group: ServiceGroup;
  description: string;
  price: number;
  operatingHours: string;
  status: ServiceStatus;
  images?: ImageDTO[];
}

export type ComboEventType = 'COMBO' | 'EVENT';

export interface ComboEventDTO {
  id?: string;
  name: string;
  type: ComboEventType;
  description: string;
  price: number;
  startDate: string; // ISO date YYYY-MM-DD
  endDate: string; // ISO date YYYY-MM-DD
  status: ServiceStatus;
  images?: ImageDTO[];
}

export interface SearchCategoryResultResponse {
  categoryId: string;
  categoryName: string;
  categoryCode: string;
  description: string;
  basePrice: number;
  maxGuests: number;
  areaSqm: number;
  availableRoomsCount: number;
  images?: ImageDTO[];
  amenities?: AmenityDTO[];
}

export interface HoldRoomRequest {
  categoryId: string;
  checkinDate: string; // ISO DateTime
  checkoutDate: string; // ISO DateTime
}

export interface HoldRoomResponse {
  holdId: string;
  expiresAt: string; // ISO DateTime
}

export type CouponDiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface CouponDTO {
  id?: string;
  code: string;
  description: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minBookingAmount?: number;
  maxDiscountAmount?: number;
  minLengthOfStay: number;
  startDate: string;
  endDate: string;
  maxUsage?: number;
  currentUsage: number;
  isActive: boolean;
}

export interface ValidateCouponRequest {
  code: string;
  totalAmount: number;
  checkinDate?: string;
  checkoutDate?: string;
}

export interface ValidateCouponResponse {
  id: string;
  code: string;
  description: string;
  discountType: CouponDiscountType;
  discountValue: number;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  minBookingAmount?: number;
  maxDiscountAmount?: number;
}

export interface ConfirmBookingRequest {
  holdId: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  guestsCount: number;
  couponCode?: string;
  notes?: string;
}

export interface ConfirmBookingResponse {
  bookingId: string;
  accommodationId: string;
  accommodationCode: string;
  categoryId: string;
  categoryName: string;
  guestName: string;
  guestPhone: string;
  checkinDate: string;
  checkoutDate: string;
  guestsCount: number;
  originalPrice?: number;
  discountAmount?: number;
  totalAmount: number;
  depositAmount: number;
  couponCode?: string;
  status: string;
}

export type BookingStatus = 'PENDING_DEPOSIT' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'COMPLETED' | 'CANCELLED';

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number;
}

export type UserRole = 'ADMIN' | 'STAFF' | 'GUEST';

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  userId: string;
  username: string;
  fullName: string;
  role: UserRole;
}
