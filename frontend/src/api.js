const TOKEN_KEY = 'fm_token'
const USER_KEY = 'fm_user'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
  } catch {
    return null
  }
}

export function saveSession({ token, email, role }) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify({ email, role }))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

export async function api(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = getToken()
  if (auth && token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const text = await res.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      /* ответ не в JSON — оставляем null */
    }
  }

  if (!res.ok) {
    const message =
      data?.error ||
      data?.title ||
      (data?.errors && Object.values(data.errors).flat().join('; ')) ||
      `Ошибка ${res.status}`
    throw new ApiError(res.status, message)
  }
  return data
}

// Загрузка файла (multipart) — например, фото товара
export async function apiUpload(path, file) {
  const fd = new FormData()
  fd.append('photo', file)

  const headers = {}
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(path, { method: 'POST', headers, body: fd })
  const text = await res.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      /* ответ не в JSON — оставляем null */
    }
  }

  if (!res.ok) {
    const message = data?.error || data?.title || `Ошибка ${res.status}`
    throw new ApiError(res.status, message)
  }
  return data
}
