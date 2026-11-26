// Hàm gọi HTTP dùng chung cho mọi API. Đổi địa chỉ BE bằng biến VITE_API_URL (mặc định /api, đã proxy sang cổng 8080).
const BASE = import.meta.env.VITE_API_URL || '/api'
const TOKEN_KEY = 'rc_token'

export const token = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (v) => (v ? localStorage.setItem(TOKEN_KEY, v) : localStorage.removeItem(TOKEN_KEY)),
}

/** Lỗi từ API: status (mã HTTP), code (mã lỗi BE trả về), message */
export class ApiError extends Error {
  constructor(status, code, message) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

// Ghép tham số truy vấn, bỏ qua giá trị rỗng. Mảng được nối bằng dấu phẩy.
const query = (params = {}) => {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length)) return
    q.set(k, Array.isArray(v) ? v.join(',') : v)
  })
  const s = q.toString()
  return s ? '?' + s : ''
}

async function request(method, path, { params, body } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const t = token.get()
  if (t) headers.Authorization = `Bearer ${t}`

  let res
  try {
    res = await fetch(BASE + path + query(params), { method, headers, body: body === undefined ? undefined : JSON.stringify(body) })
  } catch {
    throw new ApiError(0, 'NETWORK', 'Không kết nối được máy chủ')
  }

  if (res.status === 204) return null
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    if (res.status === 401) token.set(null)
    throw new ApiError(res.status, data?.code || 'HTTP_' + res.status, data?.message || res.statusText)
  }
  return data
}

export const http = {
  get: (path, params) => request('GET', path, { params }),
  post: (path, body) => request('POST', path, { body }),
  put: (path, body) => request('PUT', path, { body }),
  patch: (path, body) => request('PATCH', path, { body }),
  delete: (path) => request('DELETE', path),
}
