/**
 * Passphrase → vault id + AES key, and authenticated encryption of the quiz library.
 *
 * One PBKDF2 derivation yields 512 bits: the first half becomes the public vault id
 * (the server's lookup key), the second half the AES-GCM key that never leaves the
 * browser. Payloads are gzipped before encryption so uploaded images stay small.
 *
 * Pure WebCrypto with no imports so it also runs (and is tested) under Node.
 */

export interface VaultKeys {
  id: string
  key: CryptoKey
}

/** OWASP-recommended work factor for PBKDF2-SHA256; ~1 s on a laptop, once per device. */
export const PBKDF2_ITERATIONS = 600_000
const SALT = 'quizclub-vault-v1'
const FORMAT = 'v1'

const enc = new TextEncoder()
const dec = new TextDecoder()
const subtle = () => globalThis.crypto.subtle

export async function deriveVaultKeys(passphrase: string): Promise<VaultKeys> {
  const base = await subtle().importKey('raw', enc.encode(passphrase.normalize('NFKC')), 'PBKDF2', false, ['deriveBits'])
  const bits = new Uint8Array(
    await subtle().deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(SALT), iterations: PBKDF2_ITERATIONS }, base, 512),
  )
  const id = toHex(bits.slice(0, 32))
  const key = await importAesKey(bits.slice(32))
  return { id, key }
}

export async function exportKey(key: CryptoKey): Promise<string> {
  return toBase64(new Uint8Array(await subtle().exportKey('raw', key)))
}

export async function importKey(raw: string): Promise<CryptoKey> {
  return importAesKey(fromBase64(raw))
}

type Bytes = Uint8Array<ArrayBuffer>

function importAesKey(raw: Bytes): Promise<CryptoKey> {
  return subtle().importKey('raw', raw, { name: 'AES-GCM' }, true, ['encrypt', 'decrypt'])
}

export async function encryptJson(keys: VaultKeys, value: unknown): Promise<string> {
  let plain: Bytes = enc.encode(JSON.stringify(value))
  if (typeof CompressionStream !== 'undefined') plain = await gzip(plain)
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12))
  const ct = await subtle().encrypt({ name: 'AES-GCM', iv, additionalData: enc.encode(keys.id) }, keys.key, plain)
  return `${FORMAT}.${toBase64(iv)}.${toBase64(new Uint8Array(ct))}`
}

export class VaultDecryptError extends Error {}

export async function decryptJson<T>(keys: VaultKeys, blob: string): Promise<T> {
  const [format, ivB64, ctB64] = blob.split('.')
  if (format !== FORMAT || !ivB64 || !ctB64) throw new VaultDecryptError('Unrecognised vault format')
  let plain: Bytes
  try {
    plain = new Uint8Array(
      await subtle().decrypt({ name: 'AES-GCM', iv: fromBase64(ivB64), additionalData: enc.encode(keys.id) }, keys.key, fromBase64(ctB64)),
    )
  } catch {
    throw new VaultDecryptError('This vault cannot be decrypted with the current passphrase')
  }
  const isGzip = plain[0] === 0x1f && plain[1] === 0x8b
  const bytes = isGzip ? await gunzip(plain) : plain
  return JSON.parse(dec.decode(bytes)) as T
}

async function gzip(bytes: Bytes): Promise<Bytes> {
  const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

async function gunzip(bytes: Bytes): Promise<Bytes> {
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

function toHex(bytes: Bytes): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

function toBase64(bytes: Bytes): string {
  let bin = ''
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(bin)
}

function fromBase64(b64: string): Bytes {
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}
