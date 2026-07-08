const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export interface ApiResponse<T> {
  code: string;
  data: T;
  message: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  let json: any;
  try {
    json = text ? JSON.parse(text) : {};
  } catch (e) {
    throw new Error('Không thể phân tích dữ liệu phản hồi từ máy chủ.');
  }

  if (!response.ok) {
    const errorMessage = json.message || response.statusText || 'Đã xảy ra lỗi hệ thống';
    throw new Error(errorMessage);
  }

  // Standard API structure: { code, data, message }
  if (json && typeof json === 'object' && 'code' in json) {
    if (json.code !== 'SUCCESS') {
      throw new Error(json.message || 'Yêu cầu không thành công');
    }
    return json.data as T;
  }

  return json as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse<T>(response);
}

export async function apiPost<T>(path: string, body: any): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(response);
}

export async function apiPut<T>(path: string, body: any): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(response);
}

export async function apiPatch<T>(path: string, body: any): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(response);
}

export async function apiDelete<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
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

  const response = await fetch(`${BASE_URL}/images/upload`, {
    method: 'POST',
    body: formData,
  });
  return handleResponse<T>(response);
}
