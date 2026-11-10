import { createUser, getUsersByEmail } from './api';

const PASSWORD_ITERATIONS = 120000;

function getCrypto() {
  if (!window.crypto?.subtle || !window.crypto?.getRandomValues) {
    throw new Error('Trình duyệt không hỗ trợ mã hóa an toàn. Hãy dùng HTTPS hoặc localhost.');
  }
  return window.crypto;
}

function encodeBase64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

function decodeBase64(value) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

async function hashPassword(password, salt, iterations = PASSWORD_ITERATIONS) {
  const cryptoApi = getCrypto();
  const keyMaterial = await cryptoApi.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await cryptoApi.subtle.deriveBits({
    name: 'PBKDF2',
    salt: decodeBase64(salt),
    iterations,
    hash: 'SHA-256',
  }, keyMaterial, 256);
  return encodeBase64(new Uint8Array(bits));
}

function safeUser(user) {
  const { passwordHash, salt, passwordIterations, ...publicUser } = user;
  return publicUser;
}

function hashesMatch(first, second) {
  if (first.length !== second.length) return false;
  let difference = 0;
  for (let index = 0; index < first.length; index += 1) {
    difference |= first.charCodeAt(index) ^ second.charCodeAt(index);
  }
  return difference === 0;
}

export async function signIn(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const users = await getUsersByEmail(normalizedEmail);
  const user = users.find((account) => account.email.toLowerCase() === normalizedEmail);
  if (!user || !user.salt || !user.passwordHash) {
    throw new Error('Email hoặc mật khẩu không chính xác.');
  }

  const hash = await hashPassword(password, user.salt, user.passwordIterations || PASSWORD_ITERATIONS);
  if (!hashesMatch(hash, user.passwordHash)) {
    throw new Error('Email hoặc mật khẩu không chính xác.');
  }
  return safeUser(user);
}

export async function signUp({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUsers = await getUsersByEmail(normalizedEmail);
  if (existingUsers.some((user) => user.email.toLowerCase() === normalizedEmail)) {
    throw new Error('Email này đã được đăng ký.');
  }

  const cryptoApi = getCrypto();
  const saltBytes = cryptoApi.getRandomValues(new Uint8Array(16));
  const salt = encodeBase64(saltBytes);
  const passwordHash = await hashPassword(password, salt);
  const user = await createUser({
    name: name.trim(),
    email: normalizedEmail,
    role: 'customer',
    salt,
    passwordHash,
    passwordIterations: PASSWORD_ITERATIONS,
    createdAt: new Date().toISOString(),
  });
  return safeUser(user);
}
