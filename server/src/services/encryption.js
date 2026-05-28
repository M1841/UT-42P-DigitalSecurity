import { randomBytes, createCipheriv, createDecipheriv } from "node:crypto";
import { env } from "node:process";

/**
 *
 * @param {string} plaintext
 * @returns {Promise<Buffer>}
 */
export async function encrypt(plaintext) {
  const iv = randomBytes(16);
  const cipher = createCipheriv(
    "aes-256-gcm",
    Buffer.from(env["OPAQUE_KEY"]),
    iv,
  );
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf-8"),
    cipher.final(),
  ]);
  return Buffer.concat([iv, encrypted, cipher.getAuthTag()]).toString("base64");
}

/**
 *
 * @param {Buffer} encrypted
 * @returns {Promise<string>}
 */
export async function decrypt(encrypted) {
  const buf = Buffer.from(encrypted, "base64");
  const iv = buf.subarray(0, 16);
  const authTag = buf.subarray(-16);
  const ciphertext = buf.subarray(16, -16);
  const decipher = createDecipheriv(
    "aes-256-gcm",
    Buffer.from(env["OPAQUE_KEY"]),
    iv,
  );
  decipher.setAuthTag(authTag);
  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString("utf-8");
}
