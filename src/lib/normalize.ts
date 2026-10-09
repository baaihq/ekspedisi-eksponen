/**
 * Unicode superscript mapping to standard exponent format
 */
const SUPERSCRIPT_MAP: Record<string, string> = {
  '⁰': '0',
  '¹': '1',
  '²': '2',
  '³': '3',
  '⁴': '4',
  '⁵': '5',
  '⁶': '6',
  '⁷': '7',
  '⁸': '8',
  '⁹': '9',
  '⁻': '-',
  '⁺': '+',
};

/**
 * Converts Unicode superscript characters to standard ^ exponent format
 * e.g., "10⁷" -> "10^7", "4,5·10⁷" -> "4,5·10^7"
 */
export function convertSuperscripts(text: string): string {
  if (!text) return '';
  let result = '';
  let inSuperscript = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (SUPERSCRIPT_MAP[char] !== undefined) {
      if (!inSuperscript) {
        result += '^' + SUPERSCRIPT_MAP[char];
        inSuperscript = true;
      } else {
        result += SUPERSCRIPT_MAP[char];
      }
    } else {
      inSuperscript = false;
      result += char;
    }
  }

  return result;
}

/**
 * Normalizes user input math expression into a canonical representation
 */
export function normalizeMathAnswer(input: string): string {
  if (!input) return '';

  let normalized = input.trim().toLowerCase();

  // 1. Convert Unicode superscripts: e.g. 2⁵ -> 2^5, 3² -> 3^2
  normalized = convertSuperscripts(normalized);

  // 2. Normalize multiplication symbols: '×', 'x', '*', '·' to '*'
  // Be careful: if x is a variable, but in grade 7 exponents it's multiplication
  // Convert any '×' or '*' or '·' to '*'
  normalized = normalized.replace(/[×·]/g, '*');
  // Convert 'x' preceded and followed by digits/parentheses/whitespace or standalone to '*'
  normalized = normalized.replace(/(\d|\))\s*x\s*(\d|\()/gi, '$1*$2');
  normalized = normalized.replace(/\s+x\s+/gi, '*');

  // 3. Remove unnecessary whitespace around operators
  normalized = normalized.replace(/\s+/g, '');

  // 4. Remove outer brackets if full wrapper: e.g. (2^5) -> 2^5
  if (normalized.startsWith('(') && normalized.endsWith(')')) {
    // Only strip if balanced
    const inner = normalized.slice(1, -1);
    if (!inner.includes('(') && !inner.includes(')')) {
      normalized = inner;
    }
  }

  return normalized;
}

// -----------------------------------------------------------------------------
// Safe Math Expression Evaluator (NO eval, NO Function)
// -----------------------------------------------------------------------------

type TokenType = 'NUMBER' | 'SQRT' | 'OP' | 'LPAREN' | 'RPAREN';

interface Token {
  type: TokenType;
  value: string;
  num?: number;
}

function tokenizeMath(expr: string): Token[] | null {
  const tokens: Token[] = [];
  let i = 0;
  const n = expr.length;

  while (i < n) {
    const ch = expr[i];

    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    if (ch === '√') {
      tokens.push({ type: 'SQRT', value: '√' });
      i++;
      continue;
    }

    if (ch === '(') {
      tokens.push({ type: 'LPAREN', value: '(' });
      i++;
      continue;
    }

    if (ch === ')') {
      tokens.push({ type: 'RPAREN', value: ')' });
      i++;
      continue;
    }

    if (ch === '+' || ch === '-' || ch === '*' || ch === '/' || ch === '^') {
      tokens.push({ type: 'OP', value: ch });
      i++;
      continue;
    }

    // Number matching: standard digits and decimal point, optional scientific 'e' notation
    // Example: 123, 123.45, .45, 1.2e5, 1.2e-5, 1.2e+5
    if (/\d|\./.test(ch)) {
      let numStr = '';
      while (i < n && /[\d.]/.test(expr[i])) {
        numStr += expr[i];
        i++;
      }
      // Check for scientific notation 'e' or 'E'
      if (i < n && (expr[i] === 'e' || expr[i] === 'E')) {
        const nextChar = expr[i + 1];
        if (
          /[\d]/.test(nextChar) ||
          ((nextChar === '+' || nextChar === '-') && /[\d]/.test(expr[i + 2]))
        ) {
          numStr += expr[i]; // 'e'
          i++;
          if (expr[i] === '+' || expr[i] === '-') {
            numStr += expr[i];
            i++;
          }
          while (i < n && /\d/.test(expr[i])) {
            numStr += expr[i];
            i++;
          }
        }
      }

      const val = Number(numStr);
      if (isNaN(val)) return null;
      tokens.push({ type: 'NUMBER', value: numStr, num: val });
      continue;
    }

    // Unknown character
    return null;
  }

  // Insert implicit multiplications:
  // NUMBER followed by SQRT or LPAREN: 5√2 -> 5 * √2, 2(3) -> 2 * (3)
  // RPAREN followed by NUMBER, SQRT, or LPAREN: (2)(3) -> (2)*(3), (2)√3 -> (2)*√3
  const inserted: Token[] = [];
  for (let j = 0; j < tokens.length; j++) {
    const cur = tokens[j];
    inserted.push(cur);

    if (j < tokens.length - 1) {
      const next = tokens[j + 1];
      const curCanMultiply = cur.type === 'NUMBER' || cur.type === 'RPAREN';
      const nextCanBeMultiplied =
        next.type === 'SQRT' || next.type === 'LPAREN' || next.type === 'NUMBER';

      if (curCanMultiply && nextCanBeMultiplied) {
        inserted.push({ type: 'OP', value: '*' });
      }
    }
  }

  return inserted;
}

class ExpressionParser {
  private tokens: Token[];
  private pos = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): number | null {
    try {
      const val = this.parseExpression();
      if (this.pos < this.tokens.length) {
        return null; // extra unparsed tokens
      }
      return val;
    } catch {
      return null;
    }
  }

  private peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  private consume(): Token {
    return this.tokens[this.pos++];
  }

  // expr = term ( ('+' | '-') term )*
  private parseExpression(): number {
    let left = this.parseTerm();
    while (this.pos < this.tokens.length) {
      const token = this.peek();
      if (token && token.type === 'OP' && (token.value === '+' || token.value === '-')) {
        this.consume();
        const right = this.parseTerm();
        left = token.value === '+' ? left + right : left - right;
      } else {
        break;
      }
    }
    return left;
  }

  // term = power ( ('*' | '/') power )*
  private parseTerm(): number {
    let left = this.parsePower();
    while (this.pos < this.tokens.length) {
      const token = this.peek();
      if (token && token.type === 'OP' && (token.value === '*' || token.value === '/')) {
        this.consume();
        const right = this.parsePower();
        if (token.value === '*') {
          left = left * right;
        } else {
          if (right === 0) throw new Error('Division by zero');
          left = left / right;
        }
      } else {
        break;
      }
    }
    return left;
  }

  // power = unary ( '^' unary )* (Right-associative / standard exponentiation)
  private parsePower(): number {
    const left = this.parseUnary();
    const token = this.peek();
    if (token && token.type === 'OP' && token.value === '^') {
      this.consume();
      const right = this.parsePower(); // right-associative: a^b^c = a^(b^c)
      return Math.pow(left, right);
    }
    return left;
  }

  // unary = ('+' | '-') unary | '√' unary | primary
  private parseUnary(): number {
    const token = this.peek();
    if (token && token.type === 'OP' && (token.value === '+' || token.value === '-')) {
      this.consume();
      const val = this.parseUnary();
      return token.value === '-' ? -val : val;
    }
    if (token && token.type === 'SQRT') {
      this.consume();
      const val = this.parseUnary();
      if (val < 0) throw new Error('Negative square root');
      return Math.sqrt(val);
    }
    return this.parsePrimary();
  }

  // primary = NUMBER | '(' expr ')'
  private parsePrimary(): number {
    const token = this.peek();
    if (!token) throw new Error('Unexpected end of input');

    if (token.type === 'NUMBER') {
      this.consume();
      return token.num!;
    }

    if (token.type === 'LPAREN') {
      this.consume();
      const val = this.parseExpression();
      const closing = this.peek();
      if (!closing || closing.type !== 'RPAREN') {
        throw new Error('Mismatched parenthesis');
      }
      this.consume(); // eat RPAREN
      return val;
    }

    throw new Error(`Unexpected token: ${token.value}`);
  }
}

function evaluateStandardMath(expr: string): number | null {
  try {
    const tokens = tokenizeMath(expr);
    if (!tokens || tokens.length === 0) return null;
    const parser = new ExpressionParser(tokens);
    const val = parser.parse();
    if (val === null || isNaN(val) || !isFinite(val)) return null;
    return val;
  } catch {
    return null;
  }
}

/**
 * Parses user numeric expression into a list of candidate numbers.
 * Supports Indonesian formatting (thousands separators, comma decimals),
 * scientific notation, powers, fractions, and square roots.
 * Max length 200 characters. Never throws errors.
 */
export function parseNumericCandidates(input: string): number[] {
  if (!input || typeof input !== 'string') return [];
  if (input.length > 200) return [];

  try {
    let clean = input.trim();
    if (!clean) return [];

    // Strip curly braces from exponents like 2^{5} -> 2^(5) or 2^5
    clean = clean.replace(/\^{([^}]+)}/g, '^($1)');

    // Convert Unicode superscripts: e.g. 10⁷ -> 10^7
    clean = convertSuperscripts(clean);

    // Normalize multiplication signs: ×, ·, and 'x' (when used as multiply)
    clean = clean.replace(/[×·]/g, '*');
    // Replace 'x' or 'X' surrounded by digits/brackets or spaces as multiplication
    clean = clean.replace(/(\d|\))\s*[xX]\s*(\d|\(|√)/g, '$1*$2');
    clean = clean.replace(/\s+[xX]\s+/g, '*');

    // Generate candidate strings by interpreting dots and commas
    const candidateStrings: string[] = [];

    // Check if input has dots or commas
    const hasDot = clean.includes('.');
    const hasComma = clean.includes(',');

    if (hasDot && hasComma) {
      // Both dot and comma present.
      // Case A: Dot is thousand separator, Comma is decimal (Indonesian: 45.000,5 -> 45000.5)
      candidateStrings.push(clean.replace(/\./g, '').replace(/,/g, '.'));
      // Case B: Comma is thousand separator, Dot is decimal (US: 45,000.5 -> 45000.5)
      candidateStrings.push(clean.replace(/,/g, '').replace(/\./g, '.'));
    } else if (hasDot && !hasComma) {
      // Only dot present.
      // Case A: Standard decimal (e.g. 4.5, 4.5e7)
      candidateStrings.push(clean);
      // Case B: Indonesian thousand separator (e.g. 45.000.000 -> 45000000, 45.000 -> 45000)
      candidateStrings.push(clean.replace(/\./g, ''));
    } else if (hasComma && !hasDot) {
      // Only comma present.
      // Case A: Indonesian decimal separator (e.g. 4,5 -> 4.5, 4,5 * 10^7 -> 4.5 * 10^7)
      candidateStrings.push(clean.replace(/,/g, '.'));
      // Case B: US thousand separator (e.g. 45,000 -> 45000)
      candidateStrings.push(clean.replace(/,/g, ''));
    } else {
      // Neither dot nor comma
      candidateStrings.push(clean);
    }

    const uniqueCandidates = Array.from(new Set(candidateStrings));
    const results: number[] = [];

    for (const candStr of uniqueCandidates) {
      const val = evaluateStandardMath(candStr);
      if (val !== null && isFinite(val) && !isNaN(val)) {
        if (!results.some((r) => Math.abs(r - val) < 1e-12)) {
          results.push(val);
        }
      }
    }

    return results;
  } catch {
    return [];
  }
}

/**
 * Checks if two numbers are approximately equal within relative tolerance 1e-9.
 */
function isNumClose(a: number, b: number): boolean {
  if (Math.abs(a - b) <= 1e-9) return true;
  const maxAbs = Math.max(Math.abs(a), Math.abs(b));
  if (maxAbs === 0) return true;
  return Math.abs(a - b) / maxAbs <= 1e-9;
}

/**
 * Checks if user answer matches any of the acceptable answers
 */
export function verifyAnswer(
  userAnswer: string,
  acceptableAnswers: string[],
  expectedNumericValue?: number | string
): { isCorrect: boolean; matchedForm?: string } {
  // 1. Direct text matching as currently implemented (JANGAN DIUBAH)
  const normalizedUser = normalizeMathAnswer(userAnswer);
  if (!normalizedUser) {
    return { isCorrect: false };
  }

  for (const acceptable of acceptableAnswers) {
    const normalizedAcceptable = normalizeMathAnswer(acceptable);
    if (normalizedUser === normalizedAcceptable) {
      return { isCorrect: true, matchedForm: acceptable };
    }
  }

  // Also check existing permutation check for repeated multiplication e.g. 2*2*2 vs 2*2*2
  for (const acceptable of acceptableAnswers) {
    const normA = normalizeMathAnswer(acceptable);
    if (normA.includes('*') && normalizedUser.includes('*')) {
      const factorsA = normA.split('*').sort().join('*');
      const factorsUser = normalizedUser.split('*').sort().join('*');
      if (factorsA === factorsUser) {
        return { isCorrect: true, matchedForm: acceptable };
      }
    }
  }

  // 2. If expectedNumericValue is present, compare user numeric candidates with expected value
  const userCandidates = parseNumericCandidates(userAnswer);

  if (expectedNumericValue !== undefined && expectedNumericValue !== null && expectedNumericValue !== '') {
    let expectedCandidates: number[] = [];
    if (typeof expectedNumericValue === 'number') {
      if (!isNaN(expectedNumericValue)) {
        expectedCandidates.push(expectedNumericValue);
      }
    } else {
      expectedCandidates = parseNumericCandidates(String(expectedNumericValue));
      if (expectedCandidates.length === 0) {
        const parsed = parseFloat(String(expectedNumericValue).replace(/,/g, ''));
        if (!isNaN(parsed)) expectedCandidates.push(parsed);
      }
    }

    for (const uVal of userCandidates) {
      for (const eVal of expectedCandidates) {
        if (isNumClose(uVal, eVal)) {
          return { isCorrect: true, matchedForm: String(expectedNumericValue) };
        }
      }
    }
  }

  // 3. If both sides can be parsed into numbers, compare user numeric candidates with each acceptableAnswer
  if (userCandidates.length > 0) {
    for (const acceptable of acceptableAnswers) {
      const acceptableCandidates = parseNumericCandidates(acceptable);
      for (const uVal of userCandidates) {
        for (const aVal of acceptableCandidates) {
          if (isNumClose(uVal, aVal)) {
            return { isCorrect: true, matchedForm: acceptable };
          }
        }
      }
    }
  }

  return { isCorrect: false };
}
