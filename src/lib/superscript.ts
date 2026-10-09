/**
 * Utility untuk mengubah notasi perpangkatan dan LaTeX menjadi teks ramah baca (superscript unicode).
 * Mencegah bocornya sintaks KaTeX / LaTeX seperti `^`, `{}`, dan `\times` pada teks instruksi, judul, dan petunjuk.
 */

const SUPERSCRIPT_MAP: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '+': '⁺',
  '-': '⁻',
  '=': '⁼',
  '(': '⁽',
  ')': '⁾',
  'a': 'ᵃ',
  'b': 'ᵇ',
  'c': 'ᶜ',
  'd': 'ᵈ',
  'e': 'ᵉ',
  'f': 'ᶠ',
  'g': 'ᵍ',
  'h': 'ʰ',
  'i': 'ⁱ',
  'j': 'ʲ',
  'k': 'ᵏ',
  'l': 'ˡ',
  'm': 'ᵐ',
  'n': 'ⁿ',
  'o': 'ᵒ',
  'p': 'ᵖ',
  'r': 'ʳ',
  's': 'ˢ',
  't': 'ᵗ',
  'u': 'ᵘ',
  'v': 'ᵛ',
  'w': 'ʷ',
  'x': 'ˣ',
  'y': 'ʸ',
  'z': 'ᶻ',
};

/**
 * Mengubah string / angka biasa menjadi karakter superscript.
 * Contoh: "5" -> "⁵", "4+3" -> "⁴⁺³", "-2" -> "⁻²"
 */
export function toSuperscript(val: string | number): string {
  const str = String(val);
  return str
    .split('')
    .map((ch) => SUPERSCRIPT_MAP[ch] || ch)
    .join('');
}

/**
 * Menggabungkan basis dan pangkat menjadi bentuk teks superscript.
 * Contoh: powerText(5, 9) -> "5⁹"
 */
export function powerText(base: string | number, exponent: string | number): string {
  return `${base}${toSuperscript(exponent)}`;
}

/**
 * Memformat seluruh teks kalimat agar bersih dari simbol LaTeX/KaTeX:
 * - Mengubah a^{b} atau a^b menjadi aᵇ
 * - Mengubah (a/b)^{n} menjadi (a/b)ⁿ
 * - Mengubah \times menjadi ×
 * - Mengubah \cdot menjadi ·
 * - Mengubah \neq menjadi ≠
 * - Mengubah \frac{a}{b} menjadi a/b
 * - Membersihkan sisa karakter backslash (\) dan kurung kurawal ({})
 */
export function formatPowerText(text?: string | null): string {
  if (!text) return '';

  let formatted = text;

  // 1. Simbol matematika LaTeX umum
  formatted = formatted
    .replace(/\\times/g, '×')
    .replace(/\\cdot/g, '·')
    .replace(/\\div/g, '÷')
    .replace(/\\neq/g, '≠')
    .replace(/\\leq/g, '≤')
    .replace(/\\geq/g, '≥')
    .replace(/\\left\(/g, '(')
    .replace(/\\right\)/g, ')')
    .replace(/\\left\[/g, '[')
    .replace(/\\right\]/g, ']');

  // 2. Fraksi sederhana \frac{a}{b} -> a/b
  formatted = formatted.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1/$2)');

  // 3. Pangkat dengan kurung kurawal: misal 5^{9} atau (2a)^{3} -> 5⁹ atau (2a)³
  // Cocokkan basis di depan ^ diikuti {...}
  formatted = formatted.replace(/([a-zA-Z0-9)\]]+)\s*\^\s*\{([^}]+)\}/g, (_, base, exp) => {
    return `${base}${toSuperscript(exp)}`;
  });

  // 4. Pangkat tanpa kurung kurawal: misal 5^9, a^m, 2^-3, 2^(4+3)
  formatted = formatted.replace(/([a-zA-Z0-9)\]]+)\s*\^\s*\(([^)]+)\)/g, (_, base, exp) => {
    return `${base}${toSuperscript(`(${exp})`)}`;
  });

  formatted = formatted.replace(/([a-zA-Z0-9)\]]+)\s*\^\s*([0-9a-zA-Z+-]+)/g, (_, base, exp) => {
    return `${base}${toSuperscript(exp)}`;
  });

  // 5. Bersihkan sisa kurung kurawal LaTeX yang mungkin berdiri sendiri
  formatted = formatted.replace(/\{([^{}]+)\}/g, '$1');

  // 6. Bersihkan sisa backslash liar (\)
  formatted = formatted.replace(/\\([a-zA-Z]+)/g, '$1');
  formatted = formatted.replace(/\\/g, '');

  return formatted;
}
