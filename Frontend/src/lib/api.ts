export interface ApiResponse<T> {
  code: string;
  data: T;
  message: string;
}

export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const savedUrl = localStorage.getItem('API_BASE_URL');
    if (savedUrl) return savedUrl;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
}

export class ApiError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'ApiError';
  }
}

export const ERROR_MESSAGES: Record<string, string> = {
  // Nhóm Xác Thực & Phân Quyền
  'INVALID_CREDENTIALS': 'Tên đăng nhập hoặc mật khẩu không chính xác.',
  'TOKEN_INVALID': 'Phiên làm việc đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.',
  'UNAUTHORIZED': 'Vui lòng đăng nhập để thực hiện chức năng này.',
  'USER_DISABLED': 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.',
  'ACCESS_DENIED': 'Bạn không có quyền thực hiện hành động này.',
  'USER_NOT_FOUND': 'Không tìm thấy thông tin tài khoản.',

  // Nhóm Đặt Phòng & Giữ Chỗ
  'INVALID_CHECKIN_STATUS': 'Ngày nhận phòng hoặc ngày trả phòng không hợp lệ.',
  'INVALID_CHECKOUT_STATUS': 'Phòng chưa được check-in nên không thể thực hiện check-out.',
  'HOLD_NOT_FOUND': 'Phiên giữ chỗ không hợp lệ hoặc đã bị hủy.',
  'BOOKING_NOT_FOUND': 'Không tìm thấy thông tin đơn đặt phòng này.',
  'NO_AVAILABLE_ROOM': 'Đã hết phòng trống cho loại phòng và thời gian bạn đã chọn.',
  'HOLD_EXPIRED': 'Phiên giữ phòng của bạn đã hết hạn (quá 10 phút). Vui lòng thử lại.',

  // Nhóm Danh Mục & Loại Phòng
  'CATEGORY_NOT_FOUND': 'Không tìm thấy loại phòng yêu cầu.',
  'ACCOMMODATION_NOT_FOUND': 'Không tìm thấy phòng vật lý yêu cầu.',
  'CATEGORY_CODE_ALREADY_EXISTS': 'Mã loại phòng này đã tồn tại trong hệ thống.',
  'ACCOMMODATION_CODE_ALREADY_EXISTS': 'Số phòng này đã tồn tại trong hệ thống.',

  // Nhóm Dịch Vụ, Combo & Tiện Ích
  'SERVICE_NOT_FOUND': 'Không tìm thấy dịch vụ yêu cầu.',
  'COMBO_NOT_FOUND': 'Gói combo ưu đãi không tồn tại hoặc đã hết hạn.',
  'AMENITY_NOT_FOUND': 'Không tìm thấy tiện ích phòng yêu cầu.',
  'SERVICE_NAME_ALREADY_EXISTS': 'Tên dịch vụ này đã tồn tại.',

  // Nhóm Hình Ảnh & Cloudinary
  'IMAGE_NOT_FOUND': 'Không tìm thấy hình ảnh yêu cầu.',
  'CLOUDINARY_UPLOAD_FAILED': 'Tải ảnh lên dịch vụ Cloudinary thất bại.',
  'CLOUDINARY_DELETE_FAILED': 'Xóa ảnh trên dịch vụ Cloudinary thất bại.',

  // Các Lỗi Hệ Thống Chung
  'INVALID_INPUT': 'Dữ liệu gửi lên không đúng định dạng. Vui lòng kiểm tra lại.',
  'VALIDATION_ERROR': 'Thông tin nhập vào không hợp lệ.',
  'DATA_INTEGRITY_VIOLATION': 'Thao tác thất bại do xung đột dữ liệu liên kết.',
  'INTERNAL_SERVER_ERROR': 'Hệ thống đang gặp sự cố. Vui lòng quay lại sau.',
  'UNCATEGORIZED_EXCEPTION': 'Đã xảy ra lỗi không xác định.',
};

export function getErrorMessage(error: any): string {
  if (error instanceof ApiError) {
    return ERROR_MESSAGES[error.code] || error.message || 'Đã xảy ra lỗi hệ thống.';
  }
  return error?.message || 'Đã xảy ra sự cố kết nối, vui lòng thử lại sau.';
}

function getHeaders(isMultipart = false): HeadersInit {
  const headers: Record<string, string> = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  let json: any;
  try {
    json = text ? JSON.parse(text) : {};
  } catch (e) {
    throw new ApiError('JSON_PARSE_ERROR', 'Không thể phân tích dữ liệu phản hồi từ máy chủ.');
  }

  if (!response.ok) {
    // Chỉ tự động logout & redirect khi KHÔNG ở trang login
    if (response.status === 401) {
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        window.location.href = '/';
      }
    }
    const errorCode = json && json.code ? json.code : `HTTP_${response.status}`;
    const errorMessage = json && json.message ? json.message : (response.statusText || 'Đã xảy ra lỗi hệ thống');
    throw new ApiError(errorCode, errorMessage);
  }

  // Standard API structure: { code, data, message }
  if (json && typeof json === 'object' && 'code' in json) {
    if (json.code !== 'SUCCESS') {
      if (json.code === 'TOKEN_INVALID' || json.code === 'UNAUTHORIZED') {
        // Chỉ tự động logout & redirect khi KHÔNG ở trang login
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userName');
          window.location.href = '/';
        }
      }
      throw new ApiError(json.code, json.message || 'Yêu cầu không thành công');
    }
    return json.data as T;
  }

  return json as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return handleResponse<T>(response);
}

export async function apiPost<T>(path: string, body: any): Promise<T> {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse<T>(response);
}

export async function apiPut<T>(path: string, body: any): Promise<T> {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse<T>(response);
}

export async function apiPatch<T>(path: string, body: any): Promise<T> {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse<T>(response);
}

export async function apiDelete<T>(path: string): Promise<T> {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse<T>(response);
}

export async function apiUploadImage<T>(
  file: File,
  targetType: 'CATEGORY' | 'SERVICE' | 'COMBO',
  targetId: string,
  isCover: boolean = false,
  sortOrder: number = 0
): Promise<T> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('targetType', targetType);
  formData.append('targetId', targetId);
  formData.append('isCover', String(isCover));
  formData.append('sortOrder', String(sortOrder));

  const response = await fetch(`${getBaseUrl()}/images/upload`, {
    method: 'POST',
    headers: getHeaders(true),
    body: formData,
  });
  return handleResponse<T>(response);
}

export function getMaterialIconName(iconName?: string, name?: string): string {
  const str = `${iconName || ''} ${name || ''}`.toLowerCase().trim();
  
  if (!str) return 'check_circle';
  if (str.includes('wifi')) return 'wifi';
  if (str.includes('pool') || str.includes('bể bơi')) return 'pool';
  if (str.includes('balcony') || str.includes('ban công')) return 'balcony';
  if (str.includes('bbq') || str.includes('bếp') || str.includes('nướng')) return 'outdoor_grill';
  if (str.includes('tv') || str.includes('truyền hình')) return 'tv';
  if (str.includes('ac') || str.includes('điều hòa') || str.includes('lạnh')) return 'ac_unit';
  if (str.includes('bath') || str.includes('tắm') || str.includes('bồn')) return 'bathtub';
  if (str.includes('bed') || str.includes('giường')) return 'bed';
  if (str.includes('coffee') || str.includes('cà phê')) return 'coffee';
  if (str.includes('drink') || str.includes('bar') || str.includes('nước')) return 'local_bar';
  if (str.includes('parking') || str.includes('đỗ xe')) return 'local_parking';
  if (str.includes('restaurant') || str.includes('ăn')) return 'restaurant';
  if (str.includes('ocean') || str.includes('biển')) return 'waves';
  if (str.includes('view') || str.includes('cảnh')) return 'visibility';

  if (iconName) {
    const sanitized = iconName.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');
    if (sanitized && !sanitized.includes('icon') && !sanitized.includes('-')) {
      return sanitized;
    }
  }

  return 'check_circle';
}

