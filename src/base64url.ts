/**
 * This function is useful in the OAuth Authorization Code with PKCE flow
 * when you need to hash the code_verifier into a code_challenge
 * const code_verifier = nanoid(43)
 * const code_challenge = await sha256andbase64url(code_verifier)
 */
export async function sha256andbase64url (str: string) {
  const arrayBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
  return base64ToBase64Url(btoa(String.fromCharCode(...new Uint8Array(arrayBuffer))))
}

export function base64ToBase64Url (base64str: string) {
  return base64str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function base64urlTobase64 (base64urlStr: string) {
  return base64urlStr.replace(/-/g, '+').replace(/_/g, '/')
}

export function base64urlEncode (str: string) {
  return base64ToBase64Url(btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16)))))
}

export function base64urlDecode (str: string) {
  const base64Encoded = base64urlTobase64(str)
  const padding = str.length % 4 === 0 ? '' : '='.repeat(4 - (str.length % 4))
  const base64WithPadding = base64Encoded + padding
  return decodeURIComponent(Array.prototype.map.call(atob(base64WithPadding), (c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''))
}
