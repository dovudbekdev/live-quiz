export function generateCode() {
  // 0..9999 oralig'ida butun son, so'ng 4 xonali stringga formatlaymiz
  const num = Math.floor(Math.random() * 10000);
  return String(num).padStart(4, '0'); // 0000 - 9999
}

