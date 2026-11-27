/**
 * Hindi (Devanagari) animated on-screen text for Hindi Video Studio.
 *
 * यह मॉड्यूल scene3dRenderer.ts के पुराने buildCaptionOverlaySvg /
 * buildAnimatedScreenTextAss का सुधरा हुआ, उसी signature वाला विकल्प है।
 * पुरानी फाइल को छुआ नहीं गया है; server.ts में सिर्फ़ import बदलना काफी है।
 *
 * मुख्य सुधार:
 *  1. Word wrap अब ग्राफीम-आधारित (मात्रा/संयुक्ताक्षर नहीं टूटते) और लंबा शब्द
 *     कटता नहीं (पहले slice() से शब्द का हिस्सा गिर जाता था)।
 *  2. Voice timing से मिलान LCS से होता है; जो शब्द न मिलें उन्हें दो मिले हुए
 *     शब्दों के बीच interpolate किया जाता है (पहले एक भी शब्द न मिलने पर
 *     पूरा timeline छोड़ दिया जाता था)।
 *  3. हर chunk का आख़िरी शब्द अब अपनी असली अवधि में highlight होता है
 *     (पहले वह पूरे scene के अंत तक धीरे-धीरे भरता था)।
 *  4. लगातार दो chunk के event अब आपस में overlap नहीं करते।
 *  5. Card की ऊंचाई और ASS फ़ॉन्ट साइज़ अब एक ही layout से निकलते हैं।
 *  6. फ़ॉन्ट फोल्डर (fontsdir) और दो एनिमेशन शैलियां: 'karaoke' (पहले जैसी)
 *     और 'reveal' (शब्द-दर-शब्द प्रकट)।
 */

import fs from 'node:fs';
import path from 'node:path';

export interface VoiceWordTiming {
  offsetMs: number;
  durationMs: number;
  text: string;
}

export type HindiTextAnimationStyle = 'karaoke' | 'reveal';

export const HINDI_FONT_FAMILY = 'Noto Sans Devanagari';

// ASS रंग: &HAABBGGRR  (पुराने style जैसे ही)
const ASS_PRIMARY = '&H0024BFFB'; // amber
const ASS_SECONDARY = '&H00FFFFFF'; // white
const ASS_OUTLINE = '&H00140804';
const ASS_BACK = '&HA0000000';
// \c टैग के लिए (&HBBGGRR&)
const TAG_AMBER = '&H24BFFB&';
const TAG_WHITE = '&HFFFFFF&';

const MAX_LINES_PER_CHUNK = 3;

/* ------------------------------------------------------------------ */
/* फ़ॉन्ट और FFmpeg filter                                              */
/* ------------------------------------------------------------------ */

let fontsDirCache: string | null | undefined;

/**
 * ऐसा फोल्डर खोजता है जिसमें .ttf/.otf हों (जैसे NotoSansDevanagari-Bold.ttf)।
 * क्रम: env HINDI_FONTS_DIR, public/fonts, server/fonts, fonts
 */
export function resolveHindiFontsDir(): string | null {
  if (fontsDirCache !== undefined) return fontsDirCache;

  const candidates = [
    process.env.HINDI_FONTS_DIR,
    path.join(process.cwd(), 'public', 'fonts'),
    path.join(process.cwd(), 'server', 'fonts'),
    path.join(process.cwd(), 'fonts'),
  ].filter((p): p is string => Boolean(p));

  for (const dir of candidates) {
    try {
      const files = fs.readdirSync(dir);
      if (files.some((f) => /\.(ttf|otf)$/i.test(f))) {
        fontsDirCache = dir;
        return dir;
      }
    } catch {
      // फोल्डर नहीं है; अगला उम्मीदवार देखें
    }
  }

  fontsDirCache = null;
  return null;
}

/**
 * FFmpeg में filter option के मान पर दो स्तर की escaping लगती है
 * (option स्तर: \ ' :   और filtergraph स्तर: \ ' , ; [ ])।
 * सामान्य पाथ (अक्षर, अंक, / . _ -) पर यह कुछ नहीं बदलता।
 */
function escapeFilterValue(value: string): string {
  return value
    .replace(/\\/g, '/')
    .replace(/[\\':]/g, '\\$&')
    .replace(/[\\',;[\]]/g, '\\$&');
}

/**
 * FFmpeg filter-graph का `ass=...` हिस्सा बनाता है।
 * server.ts में `,ass='${assPath}'` की जगह `,${buildAssFilter(assPath)}` रखें।
 */
export function buildAssFilter(
  assPath: string,
  fontsDir: string | null = resolveHindiFontsDir()
): string {
  const parts = [`ass=${escapeFilterValue(assPath)}`];
  if (fontsDir) parts.push(`fontsdir=${escapeFilterValue(fontsDir)}`);
  return parts.join(':');
}

/* ------------------------------------------------------------------ */
/* ग्राफीम और चौड़ाई का अनुमान                                          */
/* ------------------------------------------------------------------ */

type GraphemeSegmenter = {
  segment(input: string): Iterable<{ segment: string }>;
};

let graphemeSegmenter: GraphemeSegmenter | null = null;
try {
  graphemeSegmenter = new Intl.Segmenter('hi', { granularity: 'grapheme' });
} catch {
  graphemeSegmenter = null;
}

function splitGraphemes(text: string): string[] {
  if (graphemeSegmenter) {
    return Array.from(graphemeSegmenter.segment(text), (s) => s.segment);
  }
  return Array.from(text);
}

/**
 * देवनागरी व्यंजन/स्वर की औसत चौड़ाई (em में)। अनुमान जानबूझकर थोड़ा ज़्यादा है ताकि
 * टेक्स्ट कभी card से बाहर न जाए। अगर असली फ़ॉन्ट में पंक्तियां ज़रूरत से छोटी टूटती
 * दिखें तो इसे घटाएं (जैसे 0.50), और अगर टेक्स्ट किनारे छूने लगे तो बढ़ाएं।
 */
export const DEVANAGARI_BASE_EM = 0.55;

/** एक ग्राफीम की अनुमानित चौड़ाई (em में); जानबूझकर थोड़ी ज़्यादा रखी गई है। */
function estimateGraphemeEm(grapheme: string): number {
  let em = 0;

  for (const ch of grapheme) {
    const c = ch.codePointAt(0) ?? 0;

    if (c >= 0x0900 && c <= 0x097f) {
      if (
        (c >= 0x0904 && c <= 0x0939) ||
        (c >= 0x0958 && c <= 0x0961) ||
        (c >= 0x0972 && c <= 0x097f)
      ) {
        em += DEVANAGARI_BASE_EM; // व्यंजन / स्वतंत्र स्वर
      } else if (c >= 0x0966 && c <= 0x096f) {
        em += 0.62; // देवनागरी अंक
      } else if (c >= 0x093e && c <= 0x094c) {
        em += 0.18; // मात्राएं
      } else if (c === 0x0903) {
        em += 0.3; // विसर्ग
      }
      // हलंत, नुक़्ता, चंद्रबिंदु/अनुस्वार: लगभग शून्य चौड़ाई
    } else if (c === 0x20 || c === 0xa0) {
      em += 0.3;
    } else if (c >= 0x30 && c <= 0x39) {
      em += 0.62;
    } else if (c >= 0x41 && c <= 0x5a) {
      em += 0.7;
    } else if (c >= 0x61 && c <= 0x7a) {
      em += 0.6;
    } else if (c === 0x200b || c === 0x200c || c === 0x200d || c === 0xfeff) {
      // zero-width
    } else if (c < 0x80) {
      em += 0.38; // punctuation
    } else {
      em += 1.0; // अन्य (₹, emoji आदि)
    }
  }

  return em;
}

function estimateTextWidthPx(text: string, fontSize: number): number {
  let em = 0;
  for (const g of splitGraphemes(text)) em += estimateGraphemeEm(g);
  return em * fontSize * 1.06;
}

function wrapParagraph(
  paragraph: string,
  fontSize: number,
  maxWidthPx: number
): string[] {
  const words = paragraph.split(/\s+/).filter(Boolean);
  const spaceW = fontSize * 0.3;
  const lines: string[] = [];
  let current = '';
  let currentW = 0;

  for (const word of words) {
    const w = estimateTextWidthPx(word, fontSize);
    if (!current) {
      current = word;
      currentW = w;
    } else if (currentW + spaceW + w <= maxWidthPx) {
      current += ` ${word}`;
      currentW += spaceW + w;
    } else {
      lines.push(current);
      current = word;
      currentW = w;
    }
  }

  if (current) lines.push(current);
  return lines;
}

/** पंक्तियों की लंबाई बराबर के करीब रखता है (centered text बेहतर दिखता है)। */
function wrapBalanced(
  paragraph: string,
  fontSize: number,
  maxWidthPx: number
): string[] {
  const greedy = wrapParagraph(paragraph, fontSize, maxWidthPx);
  if (greedy.length < 2) return greedy;

  const total = estimateTextWidthPx(paragraph, fontSize);
  const longestWord = Math.max(
    ...paragraph
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => estimateTextWidthPx(w, fontSize))
  );
  const target = Math.max(
    longestWord,
    Math.min(maxWidthPx, (total / greedy.length) * 1.15)
  );
  const balanced = wrapParagraph(paragraph, fontSize, target);

  return balanced.length === greedy.length ? balanced : greedy;
}

/* ------------------------------------------------------------------ */
/* Layout (SVG card और ASS दोनों के लिए एक ही स्रोत)                    */
/* ------------------------------------------------------------------ */

export interface CaptionLayout {
  fontSize: number;
  lineHeight: number;
  /** chunk -> पंक्तियां (हर chunk में अधिकतम 3 पंक्तियां) */
  chunks: string[][];
  /** हर chunk के लिए फ़ॉन्ट साइज़ (बहुत लंबा शब्द हो तो घटाया हुआ) */
  chunkFontSizes: number[];
  cardX: number;
  cardY: number;
  cardW: number;
  cardH: number;
  centerX: number;
  centerY: number;
  textMaxWidthPx: number;
}

export interface CaptionLayoutParams {
  width: number;
  height: number;
  isVertical: boolean;
  screenText: string;
  /** card के नीचे छोड़ी जाने वाली जगह; डिफ़ॉल्ट: 9:16 = 228, बाकी = 34 */
  bottomReservedPx?: number;
  /** फ़ॉन्ट साइज़ का गुणक; डिफ़ॉल्ट 1 */
  fontScale?: number;
}

export function computeCaptionLayout(
  params: CaptionLayoutParams
): CaptionLayout | null {
  const { width, height, isVertical } = params;
  const cleanText = params.screenText.trim();
  if (!cleanText) return null;

  const fontScale = params.fontScale && params.fontScale > 0 ? params.fontScale : 1;
  const fontSize = Math.round((isVertical ? 40 : 44) * fontScale);
  const lineHeight = Math.round(fontSize * 1.38);

  const cardMarginX = isVertical ? 34 : 64;
  const cardW = width - cardMarginX * 2;
  const innerPadX = 44;
  const textMaxWidthPx = Math.min(cardW - innerPadX * 2, isVertical ? 99999 : 1500);

  const paragraphs = cleanText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const allLines: string[] = [];
  for (const p of paragraphs) {
    allLines.push(...wrapBalanced(p, fontSize, textMaxWidthPx));
  }
  if (allLines.length === 0) return null;

  const chunks: string[][] = [];
  for (let i = 0; i < allLines.length; i += MAX_LINES_PER_CHUNK) {
    chunks.push(allLines.slice(i, i + MAX_LINES_PER_CHUNK));
  }

  const chunkFontSizes = chunks.map((lines) => {
    const widest = Math.max(
      ...lines.map((l) => estimateTextWidthPx(l, fontSize))
    );
    if (widest <= textMaxWidthPx) return fontSize;
    return Math.max(
      Math.round(fontSize * 0.6),
      Math.floor((fontSize * textMaxWidthPx) / widest)
    );
  });

  const maxLinesShown = Math.min(
    MAX_LINES_PER_CHUNK,
    Math.max(1, ...chunks.map((c) => c.length))
  );
  const cardH = Math.max(
    isVertical ? 148 : 128,
    maxLinesShown * lineHeight + 54
  );

  const bottomReserved =
    params.bottomReservedPx ?? (isVertical ? 228 : 34);
  const cardY = height - cardH - bottomReserved;

  return {
    fontSize,
    lineHeight,
    chunks,
    chunkFontSizes,
    cardX: cardMarginX,
    cardY,
    cardW,
    cardH,
    centerX: Math.round(width / 2),
    centerY: cardY + Math.round(cardH / 2),
    textMaxWidthPx,
  };
}

/** Card की पारदर्शी SVG पट्टी; सिग्नेचर पुराने buildCaptionOverlaySvg जैसा ही है। */
export function buildCaptionOverlaySvg(params: {
  width: number;
  height: number;
  isVertical: boolean;
  screenText: string;
  voiceScript?: string;
  bottomReservedPx?: number;
  fontScale?: number;
}): string {
  const { width, height } = params;
  const layout = computeCaptionLayout(params);

  if (!layout) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"></svg>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect x="${layout.cardX}" y="${layout.cardY}" width="${layout.cardW}" height="${layout.cardH}" rx="20" fill="#060913" fill-opacity="0.76" stroke="#3B82F6" stroke-opacity="0.48" stroke-width="1.8" />
</svg>`;
}

/* ------------------------------------------------------------------ */
/* Voice timing से शब्दों का मिलान                                      */
/* ------------------------------------------------------------------ */

function normalizeTimingWord(word: string): string {
  return word
    .normalize('NFC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .toLowerCase()
    .replace(/[.,!?;:"'“”‘’()[\]{}<>।॥\-—–_/|%₹]/g, '')
    .trim();
}

/** दो शब्द-सूचियों का क्रमानुसार (monotonic) सबसे लंबा साझा मिलान (LCS)। */
function alignMonotonic(a: string[], b: string[]): Array<number | null> {
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array<number>(m + 1).fill(0)
  );

  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] =
        a[i] && a[i] === b[j]
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const result: Array<number | null> = new Array(n).fill(null);
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] && a[i] === b[j]) {
      result[i] = j;
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      i++;
    } else {
      j++;
    }
  }
  return result;
}

/**
 * LCS कभी-कभी "की", "है" जैसे आम शब्दों को बोली गई लाइन के बहुत आगे वाले शब्द से जोड़ देता है
 * (खासकर जब on-screen टेक्स्ट voice का छोटा रूप हो)। ऐसे anchor हटाए जाते हैं जिनमें
 * voice में स्क्रीन की तुलना में ज़रूरत से ज़्यादा शब्द छूट जाएं।
 */
const MAX_EXTRA_VOICE_SKIP = 3;

function pruneIncoherentAnchors(
  anchors: Array<number | null>
): Array<number | null> {
  let lastI = -1;
  let lastJ = -1;

  return anchors.map((j, i) => {
    if (j === null) return null;
    if (lastI >= 0 && j - lastJ > i - lastI + MAX_EXTRA_VOICE_SKIP) return null;
    lastI = i;
    lastJ = j;
    return j;
  });
}

function wordWeight(word: string): number {
  return Math.max(1, splitGraphemes(word).length);
}

/** words[from..to) को [startMs, endMs] में अक्षर-भार के अनुपात में बांटता है। */
function distributeWords(
  words: string[],
  from: number,
  to: number,
  startMs: number,
  endMs: number,
  out: VoiceWordTiming[]
): void {
  const count = to - from;
  if (count <= 0) return;

  const minSpan = count * 50;
  let start = startMs;
  let end = endMs;
  if (end - start < minSpan) {
    start = Math.max(0, end - minSpan);
    end = start + minSpan;
  }

  const weights = words.slice(from, to).map(wordWeight);
  const total = weights.reduce((a, b) => a + b, 0);
  const span = end - start;
  let acc = 0;

  for (let k = 0; k < count; k++) {
    const s = start + Math.floor((acc / total) * span);
    acc += weights[k];
    const e = start + Math.floor((acc / total) * span);
    out[from + k] = {
      offsetMs: s,
      durationMs: Math.max(40, e - s),
      text: words[from + k],
    };
  }
}

/**
 * स्क्रीन के हर शब्द के लिए (offset, duration) तय करता है।
 * - अगर आधे से ज़्यादा शब्द असली voice timing से मिलते हैं: मिले शब्द "anchor" बनते हैं
 *   और बाकी उनके बीच interpolate होते हैं।
 * - नहीं तो पूरे बोले हुए हिस्से में अक्षर-भार के हिसाब से बराबर बंटवारा।
 */
function resolveWordTimeline(
  screenWords: string[],
  wordTimings: VoiceWordTiming[],
  sceneMs: number
): VoiceWordTiming[] {
  const valid = wordTimings
    .filter(
      (t) =>
        Number.isFinite(t.offsetMs) &&
        Number.isFinite(t.durationMs) &&
        t.durationMs > 0
    )
    .slice()
    .sort((a, b) => a.offsetMs - b.offsetMs);

  const n = screenWords.length;
  const out: VoiceWordTiming[] = new Array(n);

  const speechStart = valid.length > 0 ? Math.max(40, valid[0].offsetMs) : 120;
  const lastTiming = valid[valid.length - 1];
  const speechEnd = lastTiming
    ? Math.min(
        sceneMs - 80,
        lastTiming.offsetMs + Math.max(100, lastTiming.durationMs) + 120
      )
    : Math.max(800, sceneMs - 250);
  const spanEnd = Math.max(speechEnd, speechStart + 600);

  let anchors: Array<number | null> = new Array(n).fill(null);
  let matchedCount = 0;

  if (valid.length > 0) {
    anchors = pruneIncoherentAnchors(
      alignMonotonic(
        screenWords.map(normalizeTimingWord),
        valid.map((t) => normalizeTimingWord(t.text))
      )
    );
    matchedCount = anchors.filter((a) => a !== null).length;
  }

  if (matchedCount === 0 || matchedCount / n < 0.5) {
    distributeWords(screenWords, 0, n, speechStart, spanEnd, out);
    return out;
  }

  for (let i = 0; i < n; i++) {
    const j = anchors[i];
    if (j !== null) {
      out[i] = {
        offsetMs: valid[j].offsetMs,
        durationMs: Math.max(60, valid[j].durationMs),
        text: screenWords[i],
      };
    }
  }

  // बोलने की सामान्य गति (प्रति शब्द ms): बिना anchor वाले शब्द इसी गति से रखे जाते हैं
  const sortedDur = valid.map((t) => t.durationMs).sort((a, b) => a - b);
  const medianDur = sortedDur[Math.floor(sortedDur.length / 2)] ?? 350;
  const pace = Math.min(700, Math.max(250, medianDur + 60));

  let i = 0;
  while (i < n) {
    if (out[i]) {
      i++;
      continue;
    }
    let k = i;
    while (k < n && !out[k]) k++;

    const count = k - i;
    const natural = count * pace;
    let gapStart: number;
    let gapEnd: number;

    if (i > 0 && k < n) {
      // दो anchor के बीच
      gapStart = out[i - 1].offsetMs + out[i - 1].durationMs;
      gapEnd = Math.max(out[k].offsetMs, gapStart);
    } else if (i > 0) {
      // आख़िरी anchor के बाद
      gapStart = out[i - 1].offsetMs + out[i - 1].durationMs;
      gapEnd = Math.min(sceneMs - 80, gapStart + natural);
    } else {
      // पहले anchor से पहले
      gapEnd = out[k].offsetMs;
      gapStart = Math.max(speechStart, gapEnd - natural);
    }

    distributeWords(screenWords, i, k, gapStart, gapEnd, out);
    i = k;
  }

  // offsets कभी पीछे न जाएं
  for (let q = 1; q < n; q++) {
    if (out[q].offsetMs < out[q - 1].offsetMs) {
      out[q] = { ...out[q], offsetMs: out[q - 1].offsetMs };
    }
  }

  return out;
}

/* ------------------------------------------------------------------ */
/* ASS                                                                 */
/* ------------------------------------------------------------------ */

function escapeAssText(input: string): string {
  return input
    .replace(/\\/g, '\\\\')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/\r?\n/g, ' ');
}

function formatAssTime(totalMs: number): string {
  const clamped = Math.max(0, Math.round(totalMs));
  const hours = Math.floor(clamped / 3600000);
  const mins = Math.floor((clamped % 3600000) / 60000);
  const secs = Math.floor((clamped % 60000) / 1000);
  const cs = Math.floor((clamped % 1000) / 10);
  return `${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

export function buildAnimatedScreenTextAss(params: {
  width: number;
  height: number;
  isVertical: boolean;
  screenText: string;
  /** पुराने signature के साथ संगत रखने के लिए; मिलान अब wordTimings के text से होता है */
  voiceScript?: string;
  sceneDurationSec: number;
  wordTimings: VoiceWordTiming[];
  /** 'karaoke' (डिफ़ॉल्ट, पहले जैसा) या 'reveal' (शब्द-दर-शब्द प्रकट) */
  animationStyle?: HindiTextAnimationStyle;
  fontName?: string;
  bottomReservedPx?: number;
  fontScale?: number;
  /** सभी शब्दों को आगे/पीछे खिसकाने के लिए (ms); डिफ़ॉल्ट 0 */
  syncOffsetMs?: number;
}): string | null {
  const {
    width,
    height,
    isVertical,
    sceneDurationSec,
    wordTimings,
    animationStyle = 'karaoke',
    fontName = HINDI_FONT_FAMILY,
    syncOffsetMs = 0,
  } = params;

  const layout = computeCaptionLayout(params);
  if (!layout) return null;

  const sceneMs = Math.max(1000, Math.round(sceneDurationSec * 1000));

  const chunkWords = layout.chunks.map((lines) =>
    lines.map((line) => line.split(/\s+/).filter(Boolean))
  );
  const allWords = chunkWords.flatMap((lines) => lines.flat());
  if (allWords.length === 0) return null;

  const timeline = resolveWordTimeline(allWords, wordTimings, sceneMs).map(
    (t) => ({ ...t, offsetMs: t.offsetMs + syncOffsetMs })
  );

  const events: string[] = [];
  let globalIdx = 0;

  layout.chunks.forEach((_, chunkIndex) => {
    const lines = chunkWords[chunkIndex];
    const flat = lines.flat();
    if (flat.length === 0) return;

    const firstIdx = globalIdx;
    const lastIdx = globalIdx + flat.length - 1;
    globalIdx += flat.length;

    const first = timeline[firstIdx];
    const last = timeline[lastIdx];
    const isLastChunk = chunkIndex === layout.chunks.length - 1;

    const startMs = Math.min(sceneMs - 150, Math.max(0, Math.round(first.offsetMs)));
    const naturalEnd = last.offsetMs + Math.max(120, last.durationMs);

    let endMs: number;
    if (isLastChunk) {
      endMs = sceneMs - 40;
    } else {
      const nextStart = timeline[lastIdx + 1].offsetMs;
      endMs = Math.min(nextStart, naturalEnd + 500);
    }
    endMs = Math.min(sceneMs, Math.max(startMs + 150, Math.round(endMs)));

    // हर शब्द की event-सापेक्ष शुरुआत/अंत
    let prevCs = 0;
    let wordCursor = firstIdx;

    const renderedLines = lines.map((words) => {
      const parts = words.map((word) => {
        const idx = wordCursor++;
        const t = timeline[idx];
        const isLastInChunk = idx === lastIdx;

        const relStart = Math.max(0, Math.round(t.offsetMs - startMs));
        const naturalWordEnd = t.offsetMs + Math.max(80, t.durationMs);
        const boundary = isLastInChunk
          ? naturalWordEnd
          : Math.max(timeline[idx + 1].offsetMs, t.offsetMs + 40);
        const relEnd = Math.max(relStart + 40, Math.round(boundary - startMs));

        const safeWord = escapeAssText(word);

        if (animationStyle === 'reveal') {
          const wordEnd = Math.max(relStart + 80, Math.round(naturalWordEnd - startMs));
          return (
            `{\\alpha&HFF&\\c${TAG_AMBER}` +
            `\\t(${relStart},${relStart + 110},\\alpha&H00&)` +
            `\\t(${wordEnd},${wordEnd + 240},\\c${TAG_WHITE})}${safeWord}`
          );
        }

        // karaoke: cumulative rounding से drift नहीं जमता
        const cumulativeCs = Math.max(prevCs + 4, Math.round(relEnd / 10));
        const cs = cumulativeCs - prevCs;
        prevCs = cumulativeCs;
        return `{\\kf${cs}}${safeWord}`;
      });

      return parts.join(' ');
    });

    const chunkFont = layout.chunkFontSizes[chunkIndex];
    const fsTag = chunkFont !== layout.fontSize ? `\\fs${chunkFont}` : '';

    const animTag =
      `{\\an5\\pos(${layout.centerX},${layout.centerY})${fsTag}` +
      `\\fad(120,70)\\blur0.5\\fscx88\\fscy88` +
      `\\t(0,150,\\fscx104\\fscy104)\\t(150,260,\\fscx100\\fscy100)}`;

    events.push(
      `Dialogue: 0,${formatAssTime(startMs)},${formatAssTime(endMs)},KineticCaption,,0,0,0,,${animTag}${renderedLines.join('\\N')}`
    );
  });

  if (events.length === 0) return null;

  const marginLR = isVertical ? 48 : 80;

  return `[Script Info]
ScriptType: v4.00+
PlayResX: ${width}
PlayResY: ${height}
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: KineticCaption,${fontName},${layout.fontSize},${ASS_PRIMARY},${ASS_SECONDARY},${ASS_OUTLINE},${ASS_BACK},-1,0,0,0,100,100,0,0,1,3.2,2,5,${marginLR},${marginLR},40,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
${events.join('\n')}
`;
}
