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
 * Normalizes user input math expression into a canonical representation
 */
export function normalizeMathAnswer(input: string): string {
  if (!input) return '';

  let normalized = input.trim().toLowerCase();

  // 1. Convert Unicode superscripts: e.g. 2⁵ -> 2^5, 3² -> 3^2
  let withSuperscriptConverted = '';
  let inSuperscriptSequence = false;

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    if (SUPERSCRIPT_MAP[char] !== undefined) {
      if (!inSuperscriptSequence) {
        withSuperscriptConverted += '^' + SUPERSCRIPT_MAP[char];
        inSuperscriptSequence = true;
      } else {
        withSuperscriptConverted += SUPERSCRIPT_MAP[char];
      }
    } else {
      inSuperscriptSequence = false;
      withSuperscriptConverted += char;
    }
  }

  normalized = withSuperscriptConverted;

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

/**
 * Checks if user answer matches any of the acceptable answers
 */
export function verifyAnswer(
  userAnswer: string,
  acceptableAnswers: string[],
  expectedNumericValue?: number | string
): { isCorrect: boolean; matchedForm?: string } {
  const normalizedUser = normalizeMathAnswer(userAnswer);
  if (!normalizedUser) {
    return { isCorrect: false };
  }

  // 1. Direct match with normalized acceptable answers
  for (const acceptable of acceptableAnswers) {
    const normalizedAcceptable = normalizeMathAnswer(acceptable);
    if (normalizedUser === normalizedAcceptable) {
      return { isCorrect: true, matchedForm: acceptable };
    }
  }

  // 2. Numeric evaluation check (if answer is requested or allowed as numeric)
  if (expectedNumericValue !== undefined) {
    const expectedNum =
      typeof expectedNumericValue === 'number'
        ? expectedNumericValue
        : parseFloat(String(expectedNumericValue).replace(/,/g, ''));

    // Check if user answer evaluates directly to expected number
    const userClean = normalizedUser.replace(/,/g, '');
    const userNum = parseFloat(userClean);
    if (!isNaN(userNum) && !isNaN(expectedNum) && userNum === expectedNum) {
      return { isCorrect: true, matchedForm: String(expectedNum) };
    }

    // Check if user answer is written as exponent e.g. 2^5 which evaluates to 32
    if (userClean.includes('^')) {
      const parts = userClean.split('^');
      if (parts.length === 2) {
        const base = parseFloat(parts[0]);
        const exp = parseFloat(parts[1]);
        if (!isNaN(base) && !isNaN(exp)) {
          const evalVal = Math.pow(base, exp);
          if (evalVal === expectedNum) {
            return { isCorrect: true, matchedForm: `${base}^${exp}` };
          }
        }
      }
    }
  }

  // 3. Permutation check for repeated multiplication e.g. 2*2*2*2 vs 2*2*2*2
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

  return { isCorrect: false };
}
