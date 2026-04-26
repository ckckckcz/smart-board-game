export type ShortAnswerGrade = 'correct' | 'almost' | 'wrong';

function normalizeAnswerText(input: string): string {
  return input
    .toLowerCase()
    .trim()
    // keep letters/numbers/spaces only
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeToken(token: string): string {
  let t = token.toLowerCase().trim();

  // very light Indonesian stemming (heuristic)
  t = t
    .replace(/^(di|ke|se|ter|ber|me|mem|men|meng|pen|pem|per)/, '')
    .replace(/(lah|kah|nya|pun|ku|mu|kan|an|i|in)$/i, '');

  // common synonyms for "meaning" matching in this app domain
  const synonyms: Record<string, string> = {
    kestabilan: 'stabilitas',
    stabil: 'stabilitas',
    menjaga: 'jaga',
    mengedarkan: 'edar',
    peredaran: 'edar',
    mencetak: 'cetak',
    tunggal: 'satu',
    utama: 'pokok',
    maksud: 'arti',
  };

  if (synonyms[t]) t = synonyms[t];
  return t;
}

function tokenizeMeaning(input: string): string[] {
  const normalized = normalizeAnswerText(input);
  if (!normalized) return [];

  const stop = new Set([
    'yang', 'dan', 'atau', 'adalah', 'ialah', 'itu', 'ini', 'di', 'ke', 'dari', 'dengan', 'untuk',
    'pada', 'dalam', 'sebagai', 'agar', 'supaya', 'karena', 'maka', 'the', 'a', 'an',
  ]);

  return normalized
    .split(' ')
    .map(normalizeToken)
    .filter((t) => t.length >= 2 && !stop.has(t));
}

function jaccardSimilarity(tokensA: string[], tokensB: string[]): number {
  if (tokensA.length === 0 && tokensB.length === 0) return 1;
  if (tokensA.length === 0 || tokensB.length === 0) return 0;

  const setA = new Set(tokensA);
  const setB = new Set(tokensB);

  let intersection = 0;
  for (const t of setA) {
    if (setB.has(t)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 1 : intersection / union;
}

function tokenRecall(studentTokens: string[], correctTokens: string[]): number {
  if (correctTokens.length === 0) return studentTokens.length === 0 ? 1 : 0;
  if (studentTokens.length === 0) return 0;

  const studentSet = new Set(studentTokens);
  const correctSet = new Set(correctTokens);

  let intersection = 0;
  for (const t of correctSet) {
    if (studentSet.has(t)) intersection++;
  }

  return correctSet.size === 0 ? 1 : intersection / correctSet.size;
}

function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;

  const aLen = a.length;
  const bLen = b.length;

  const prev = new Array<number>(bLen + 1);
  const curr = new Array<number>(bLen + 1);

  for (let j = 0; j <= bLen; j++) prev[j] = j;

  for (let i = 1; i <= aLen; i++) {
    curr[0] = i;
    const aChar = a.charCodeAt(i - 1);

    for (let j = 1; j <= bLen; j++) {
      const cost = aChar === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1, // deletion
        curr[j - 1] + 1, // insertion
        prev[j - 1] + cost // substitution
      );
    }

    for (let j = 0; j <= bLen; j++) prev[j] = curr[j];
  }

  return prev[bLen];
}

export function stringSimilarityRatio(rawA: string, rawB: string): number {
  const a = normalizeAnswerText(rawA);
  const b = normalizeAnswerText(rawB);

  if (!a && !b) return 1;
  if (!a || !b) return 0;

  const dist = levenshteinDistance(a, b);
  const denom = Math.max(a.length, b.length);
  if (denom === 0) return 1;

  const ratio = 1 - dist / denom;
  return Math.max(0, Math.min(1, ratio));
}

function meaningSimilarityRatio(studentAnswer: string, correctAnswer: string): number {
  const aTokens = tokenizeMeaning(studentAnswer);
  const bTokens = tokenizeMeaning(correctAnswer);

  const tokenScore = jaccardSimilarity(aTokens, bTokens);
  const recallScore = tokenRecall(aTokens, bTokens);
  const editScore = stringSimilarityRatio(studentAnswer, correctAnswer);

  // Pick the best signal. Token score is better for paraphrases;
  // edit score is better for short/near-exact strings.
  return Math.max(tokenScore, recallScore, editScore);
}

function splitAcceptableAnswers(correctAnswer: string): string[] {
  return correctAnswer
    .split(/\r?\n|\|/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function gradeShortAnswer(studentAnswer: string, correctAnswer: string): {
  similarity: number;
  grade: ShortAnswerGrade;
} {
  const candidates = splitAcceptableAnswers(correctAnswer);
  const similarity = candidates.length
    ? Math.max(...candidates.map((c) => meaningSimilarityRatio(studentAnswer, c)))
    : meaningSimilarityRatio(studentAnswer, correctAnswer);

  // Spec:
  // >85% benar, 60-84% hampir benar, <60% salah
  if (similarity >= 0.85) return { similarity, grade: 'correct' };
  if (similarity >= 0.6) return { similarity, grade: 'almost' };
  return { similarity, grade: 'wrong' };
}
