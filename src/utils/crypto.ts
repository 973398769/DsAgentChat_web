export async function sha256(message: string): Promise<string> {
  // 将字符串转换为 UTF-8 编码的字节数组
  const msgBuffer = new TextEncoder().encode(message)
  // 使用 SubtleCrypto API 计算哈希值
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  // 将哈希值转换为十六进制字符串
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
} 