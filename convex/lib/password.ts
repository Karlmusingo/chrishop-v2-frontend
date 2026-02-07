"use node";
import { createHash } from "crypto";

interface ISaltedHash {
  hash: string;
  salt: string;
}

export function generatePasswordHash(password: string, salt: string): string {
  const hash = createHash("sha512");
  hash.update(salt);
  hash.update(password);
  return hash.digest("hex");
}

export function generateSaltedHash(password: string): ISaltedHash {
  const salt = crypto.randomUUID();
  return {
    hash: generatePasswordHash(password, salt),
    salt,
  };
}

export function generateRandomPassword(): string {
  const length = 8;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomPassword = "";
  for (let i = 0; i < length; i += 1) {
    randomPassword += charset.charAt(
      Math.floor(Math.random() * charset.length),
    );
  }
  return randomPassword;
}
