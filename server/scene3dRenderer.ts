export type VideoTypeId =
  | '3d_realistic'
  | '2_5d_parallax'
  | 'cartoon_2d'
  | 'cinematic_infographic';

type SceneVisualTheme =
  | 'space'
  | 'monument'
  | 'tech'
  | 'science'
  | 'nature'
  | 'economy'
  | 'studio';

function detectSceneTheme(combinedText: string): SceneVisualTheme {
  const t = combinedText.toLowerCase().replace(/\s+/g, ' ').trim();

  // Hindi keywords: phrase matching
  const hasHindi = (...words: string[]) =>
    words.some((word) => t.includes(word));

  // English keywords: exact word matching
  // Example: "ai" will match AI, but not "training".
  const hasEnglish = (...words: string[]) =>
    words.some((word) => {
      const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(`(^|[^a-z0-9])${escaped}(?=$|[^a-z0-9])`, 'i');
      return pattern.test(t);
    });

  // SPACE
  if (
    hasHindi(
      'अंतरिक्ष', 'चांद', 'चंद्रयान', 'ब्लैक होल',
      'सौर', 'तारा', 'ब्रह्मांड', 'रॉकेट'
    ) ||
    hasEnglish(
      'space', 'moon', 'planet', 'rocket',
      'black hole', 'isro', 'star', 'galaxy', 'mars'
    )
  ) {
    return 'space';
  }

  // MONUMENT & HISTORY
  if (
    hasHindi(
      'ताजमहल', 'किला', 'मंदिर', 'इतिहास',
      'मुगल', 'आगरा', 'दिल्ली', 'स्मारक', 'विरासत'
    ) ||
    hasEnglish(
      'taj mahal', 'monument', 'history', 'heritage',
      'fort', 'temple', 'palace'
    )
  ) {
    return 'monument';
  }

  // TECHNOLOGY
  if (
    hasHindi(
      'एआई', 'तकनीक', 'डिजिटल', 'यूपीआई',
      'न्यूरल', 'रोबोट', 'इंटरनेट', 'मोबाइल',
      'साइबर', 'चिप', 'कंप्यूटर'
    ) ||
    hasEnglish(
      'ai', 'artificial intelligence', 'tech',
      'technology', 'digital', 'upi', 'computer',
      'neural', 'robot', 'cyber', 'chip', 'internet',
      'mobile', 'software', 'hardware'
    )
  ) {
    return 'tech';
  }

  // SCIENCE
  if (
    hasHindi(
      'विज्ञान', 'डीएनए', 'चिकित्सा', 'परमाणु',
      'भौतिक', 'रसायन', 'कोशिका', 'मस्तिष्क',
      'प्रयोगशाला'
    ) ||
    hasEnglish(
      'science', 'dna', 'medical', 'medicine',
      'physics', 'chemistry', 'cell', 'brain',
      'doctor', 'laboratory', 'lab', 'research'
    )
  ) {
    return 'science';
  }

  // NATURE & ENVIRONMENT
  if (
    hasHindi(
      'सुबह', 'स्वास्थ्य', 'योग', 'धूप',
      'जल', 'नदी', 'पर्वत', 'हिमालय',
      'जंगल', 'पेड़', 'प्रकृति', 'पर्यावरण',
      'जलवायु', 'पृथ्वी'
    ) ||
    hasEnglish(
      'morning', 'health', 'yoga', 'nature',
      'sunlight', 'water', 'river', 'mountain',
      'forest', 'tree', 'climate', 'earth',
      'environment', 'wildlife', 'ocean'
    )
  ) {
    return 'nature';
  }

  // ECONOMY & FINANCE
  if (
    hasHindi(
      'अर्थव्यवस्था', 'बैंक', 'व्यापार',
      'बाज़ार', 'बाजार', 'रुपये', 'बजट',
      'पैसा', 'वित्त', 'महंगाई', 'शेयर बाजार'
    ) ||
    hasEnglish(
      'economy', 'bank', 'business', 'market',
      'money', 'budget', 'finance', 'financial',
      'growth', 'investment', 'stock market',
      'inflation', 'currency'
    )
  ) {
    return 'economy';
  }

  return 'studio';
}
function build3DSpaceLayer(w: number, h: number, sceneNumber: number): string {
  const shiftX = ((sceneNumber % 3) - 1) * Math.round(w * 0.06);
  const cx = Math.round(w * 0.5) + shiftX;
  const cy = Math.round(h * 0.4);
  const r = Math.round(Math.min(w, h) * 0.22);
  const satX = cx + Math.round(r * (sceneNumber % 2 === 0 ? -1.45 : 1.42));
  const satY = cy - Math.round(r * 0.72);

  const stars = Array.from({ length: 56 }, (_, idx) => {
    const sx = ((idx * 173 + sceneNumber * 97) % (w - 40)) + 20;
    const sy = ((idx * 251 + sceneNumber * 61) % Math.round(h * 0.78)) + 20;
    const sr = idx % 7 === 0 ? 2.4 : (idx % 3) + 0.8;
    const op = (0.3 + (idx % 5) * 0.14).toFixed(2);
    return `<circle cx="${sx}" cy="${sy}" r="${sr}" fill="#E2E8F0" fill-opacity="${op}"/>`;
  }).join('');

  return `
    <defs>
      <radialGradient id="nebulaGlow" cx="50%" cy="38%" r="72%">
        <stop offset="0%" stop-color="#1E40AF" stop-opacity="0.58"/>
        <stop offset="45%" stop-color="#0B142C" stop-opacity="0.92"/>
        <stop offset="100%" stop-color="#020617"/>
      </radialGradient>
      <radialGradient id="atmosphereBloom" cx="50%" cy="50%" r="50%">
        <stop offset="55%" stop-color="#38BDF8" stop-opacity="0.42"/>
        <stop offset="80%" stop-color="#2563EB" stop-opacity="0.14"/>
        <stop offset="100%" stop-color="#020617" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="planetSphere" cx="30%" cy="26%" r="74%">
        <stop offset="0%" stop-color="#F8FAFC"/>
        <stop offset="22%" stop-color="#CBD5E1"/>
        <stop offset="52%" stop-color="#475569"/>
        <stop offset="78%" stop-color="#0F172A"/>
        <stop offset="100%" stop-color="#020617"/>
      </radialGradient>
      <radialGradient id="specGloss" cx="28%" cy="22%" r="45%">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.55"/>
        <stop offset="50%" stop-color="#93C5FD" stop-opacity="0.14"/>
        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="satSphere" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#FDBA74"/>
        <stop offset="55%" stop-color="#EA580C"/>
        <stop offset="100%" stop-color="#431407"/>
      </radialGradient>
      <filter id="softBlur"><feGaussianBlur stdDeviation="28"/></filter>
    </defs>
    <rect width="${w}" height="${h}" fill="#020617"/>
    <rect width="${w}" height="${h}" fill="url(#nebulaGlow)"/>
    ${stars}
    <ellipse cx="${cx}" cy="${cy}" rx="${Math.round(r * 2.1)}" ry="${Math.round(r * 0.55)}" fill="#3B82F6" fill-opacity="0.24" filter="url(#softBlur)"/>
    <circle cx="${cx}" cy="${cy}" r="${Math.round(r * 1.38)}" fill="url(#atmosphereBloom)"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#planetSphere)"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#specGloss)"/>
    <ellipse cx="${cx - Math.round(r * 0.28)}" cy="${cy - Math.round(r * 0.14)}" rx="${Math.round(r * 0.16)}" ry="${Math.round(r * 0.11)}" fill="#1E293B" fill-opacity="0.45" stroke="#E2E8F0" stroke-opacity="0.22" stroke-width="1.5"/>
    <ellipse cx="${cx + Math.round(r * 0.18)}" cy="${cy + Math.round(r * 0.18)}" rx="${Math.round(r * 0.12)}" ry="${Math.round(r * 0.085)}" fill="#0F172A" fill-opacity="0.55" stroke="#94A3B8" stroke-opacity="0.2" stroke-width="1"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${Math.round(r * 1.62)}" ry="${Math.round(r * 0.38)}" transform="rotate(-14 ${cx} ${cy})" fill="none" stroke="#F97316" stroke-width="3.5" stroke-opacity="0.78"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${Math.round(r * 1.78)}" ry="${Math.round(r * 0.44)}" transform="rotate(-14 ${cx} ${cy})" fill="none" stroke="#60A5FA" stroke-width="1.8" stroke-opacity="0.42"/>
    <circle cx="${satX}" cy="${satY}" r="${Math.round(r * 0.14)}" fill="url(#satSphere)"/>
  `;
}

function build3DMonumentLayer(w: number, h: number, sceneNumber: number): string {
  const cx = Math.round(w * 0.5);
  const baseY = Math.round(h * 0.58);
  const domeR = Math.round(Math.min(w, h) * 0.15);
  const towerH = Math.round(domeR * 1.6);
  const sunShift = (sceneNumber % 2 === 0 ? 1 : -1) * Math.round(w * 0.14);

  return `
    <defs>
      <linearGradient id="heritageSky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#040814"/>
        <stop offset="48%" stop-color="#1E3A8A"/>
        <stop offset="75%" stop-color="#D97706" stop-opacity="0.55"/>
        <stop offset="100%" stop-color="#050814"/>
      </linearGradient>
      <radialGradient id="marbleDome" cx="34%" cy="30%" r="72%">
        <stop offset="0%" stop-color="#FFFBEB"/>
        <stop offset="42%" stop-color="#FDE68A"/>
        <stop offset="78%" stop-color="#94A3B8"/>
        <stop offset="100%" stop-color="#1E293B"/>
      </radialGradient>
      <linearGradient id="marbleWall" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#F8FAFC"/>
        <stop offset="55%" stop-color="#CBD5E1"/>
        <stop offset="100%" stop-color="#475569"/>
      </linearGradient>
      <linearGradient id="waterReflect" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#1E3A8A" stop-opacity="0.72"/>
        <stop offset="100%" stop-color="#030712"/>
      </linearGradient>
      <filter id="goldBlur"><feGaussianBlur stdDeviation="30"/></filter>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#heritageSky)"/>
    <circle cx="${cx + sunShift}" cy="${baseY - towerH}" r="${Math.round(domeR * 1.9)}" fill="#F59E0B" fill-opacity="0.34" filter="url(#goldBlur)"/>
    <rect x="${cx - Math.round(domeR * 2.2)}" y="${baseY - Math.round(towerH * 0.82)}" width="22" height="${Math.round(towerH * 0.82)}" rx="4" fill="url(#marbleWall)"/>
    <rect x="${cx + Math.round(domeR * 2.2) - 22}" y="${baseY - Math.round(towerH * 0.82)}" width="22" height="${Math.round(towerH * 0.82)}" rx="4" fill="url(#marbleWall)"/>
    <circle cx="${cx}" cy="${baseY - Math.round(domeR * 1.18)}" r="${domeR}" fill="url(#marbleDome)"/>
    <polygon points="${cx - 5},${baseY - Math.round(domeR * 2.15)} ${cx + 5},${baseY - Math.round(domeR * 2.15)} ${cx},${baseY - Math.round(domeR * 2.52)}" fill="#FBBF24"/>
    <rect x="${cx - Math.round(domeR * 1.45)}" y="${baseY - Math.round(domeR * 1.15)}" width="${Math.round(domeR * 2.9)}" height="${Math.round(domeR * 1.15)}" rx="6" fill="url(#marbleWall)"/>
    <path d="M ${cx - Math.round(domeR * 0.45)} ${baseY} L ${cx - Math.round(domeR * 0.45)} ${baseY - Math.round(domeR * 0.65)} Q ${cx} ${baseY - Math.round(domeR * 1.05)} ${cx + Math.round(domeR * 0.45)} ${baseY - Math.round(domeR * 0.65)} L ${cx + Math.round(domeR * 0.45)} ${baseY} Z" fill="#0F172A"/>
    <rect x="0" y="${baseY}" width="${w}" height="${h - baseY}" fill="url(#waterReflect)"/>
    <ellipse cx="${cx}" cy="${baseY + 46}" rx="${Math.round(domeR * 1.3)}" ry="26" fill="#FDE68A" fill-opacity="0.2" filter="url(#goldBlur)"/>
    <line x1="0" y1="${baseY}" x2="${w}" y2="${baseY}" stroke="#FBBF24" stroke-opacity="0.45" stroke-width="2"/>
  `;
}

function build3DTechLayer(w: number, h: number, sceneNumber: number): string {
  const cx = Math.round(w * 0.5);
  const cy = Math.round(h * 0.4);
  const s = Math.round(Math.min(w, h) * 0.15);
  const horizonY = Math.round(h * 0.56);

  const gridLines = Array.from({ length: 12 }, (_, idx) => {
    const xBottom = Math.round((w / 11) * idx);
    return `<line x1="${cx}" y1="${horizonY}" x2="${xBottom}" y2="${h}" stroke="#2563EB" stroke-opacity="0.3" stroke-width="1.5"/>`;
  }).join('');

  const hGrid = Array.from({ length: 7 }, (_, idx) => {
    const yPos = horizonY + Math.round(((h - horizonY) / 7) * idx);
    return `<line x1="0" y1="${yPos}" x2="${w}" y2="${yPos}" stroke="#3B82F6" stroke-opacity="0.22" stroke-width="1.5"/>`;
  }).join('');

  const offset = sceneNumber % 2 === 0 ? 14 : -14;

  return `
    <defs>
      <linearGradient id="techSky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#020617"/>
        <stop offset="55%" stop-color="#0B1736"/>
        <stop offset="100%" stop-color="#040814"/>
      </linearGradient>
      <radialGradient id="coreGlow" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.58"/>
        <stop offset="55%" stop-color="#2563EB" stop-opacity="0.16"/>
        <stop offset="100%" stop-color="#020617" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="cubeTop" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#93C5FD"/>
        <stop offset="100%" stop-color="#2563EB"/>
      </linearGradient>
      <linearGradient id="cubeLeft" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#1D4ED8"/>
        <stop offset="100%" stop-color="#0F172A"/>
      </linearGradient>
      <linearGradient id="cubeRight" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#FB923C"/>
        <stop offset="100%" stop-color="#7C2D12"/>
      </linearGradient>
      <filter id="techBlur"><feGaussianBlur stdDeviation="26"/></filter>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#techSky)"/>
    <rect width="${w}" height="${h}" fill="url(#coreGlow)"/>
    ${gridLines}
    ${hGrid}
    <circle cx="${cx + offset}" cy="${cy}" r="${Math.round(s * 1.9)}" fill="#3B82F6" fill-opacity="0.24" filter="url(#techBlur)"/>
    <polygon points="${cx + offset},${cy - s} ${cx + offset + s},${cy - Math.round(s * 0.45)} ${cx + offset},${cy + Math.round(s * 0.1)} ${cx + offset - s},${cy - Math.round(s * 0.45)}" fill="url(#cubeTop)" stroke="#BFDBFE" stroke-width="2"/>
    <polygon points="${cx + offset - s},${cy - Math.round(s * 0.45)} ${cx + offset},${cy + Math.round(s * 0.1)} ${cx + offset},${cy + Math.round(s * 1.15)} ${cx + offset - s},${cy + Math.round(s * 0.6)}" fill="url(#cubeLeft)" stroke="#3B82F6" stroke-width="2"/>
    <polygon points="${cx + offset + s},${cy - Math.round(s * 0.45)} ${cx + offset},${cy + Math.round(s * 0.1)} ${cx + offset},${cy + Math.round(s * 1.15)} ${cx + offset + s},${cy + Math.round(s * 0.6)}" fill="url(#cubeRight)" stroke="#FDBA74" stroke-width="2"/>
    <circle cx="${cx - Math.round(s * 1.8)}" cy="${cy - 30}" r="14" fill="#38BDF8"/>
    <circle cx="${cx + Math.round(s * 1.8)}" cy="${cy + 20}" r="16" fill="#F97316"/>
    <line x1="${cx - Math.round(s * 1.8)}" y1="${cy - 30}" x2="${cx + offset}" y2="${cy}" stroke="#60A5FA" stroke-opacity="0.55" stroke-width="2"/>
    <line x1="${cx + Math.round(s * 1.8)}" y1="${cy + 20}" x2="${cx + offset}" y2="${cy}" stroke="#F97316" stroke-opacity="0.55" stroke-width="2"/>
  `;
}

function build3DScienceLayer(w: number, h: number, sceneNumber: number): string {
  const cx = Math.round(w * 0.5);
  const cy = Math.round(h * 0.4);
  const r = Math.round(Math.min(w, h) * 0.19);
  const rotOffset = sceneNumber * 25;

  return `
    <defs>
      <radialGradient id="sciBg" cx="50%" cy="40%" r="72%">
        <stop offset="0%" stop-color="#0F766E" stop-opacity="0.55"/>
        <stop offset="50%" stop-color="#0B1736"/>
        <stop offset="100%" stop-color="#030712"/>
      </radialGradient>
      <radialGradient id="nucleusSphere" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#A7F3D0"/>
        <stop offset="42%" stop-color="#10B981"/>
        <stop offset="100%" stop-color="#064E3B"/>
      </radialGradient>
      <filter id="sciBlur"><feGaussianBlur stdDeviation="24"/></filter>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#sciBg)"/>
    <circle cx="${cx}" cy="${cy}" r="${Math.round(r * 1.6)}" fill="#10B981" fill-opacity="0.22" filter="url(#sciBlur)"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${Math.round(r * 1.55)}" ry="${Math.round(r * 0.48)}" transform="rotate(${rotOffset} ${cx} ${cy})" fill="none" stroke="#34D399" stroke-width="3" stroke-opacity="0.72"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${Math.round(r * 1.55)}" ry="${Math.round(r * 0.48)}" transform="rotate(${rotOffset + 60} ${cx} ${cy})" fill="none" stroke="#38BDF8" stroke-width="3" stroke-opacity="0.72"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${Math.round(r * 1.55)}" ry="${Math.round(r * 0.48)}" transform="rotate(${rotOffset + 120} ${cx} ${cy})" fill="none" stroke="#F97316" stroke-width="2.5" stroke-opacity="0.68"/>
    <circle cx="${cx}" cy="${cy}" r="${Math.round(r * 0.48)}" fill="url(#nucleusSphere)"/>
  `;
}

function build3DNatureLayer(w: number, h: number, sceneNumber: number): string {
  const sunX = Math.round(w * (0.5 + (sceneNumber % 2 === 0 ? 0.08 : -0.06)));
  const sunY = Math.round(h * 0.4);
  const sunR = Math.round(Math.min(w, h) * 0.15);

  return `
    <defs>
      <linearGradient id="dawnSky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#091128"/>
        <stop offset="45%" stop-color="#1E3A8A"/>
        <stop offset="72%" stop-color="#EA580C"/>
        <stop offset="100%" stop-color="#060913"/>
      </linearGradient>
      <radialGradient id="sunSphere" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#FEF3C7"/>
        <stop offset="45%" stop-color="#FBBF24"/>
        <stop offset="100%" stop-color="#F97316"/>
      </radialGradient>
      <filter id="sunBlur"><feGaussianBlur stdDeviation="32"/></filter>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#dawnSky)"/>
    <circle cx="${sunX}" cy="${sunY}" r="${Math.round(sunR * 2.2)}" fill="#F97316" fill-opacity="0.4" filter="url(#sunBlur)"/>
    <circle cx="${sunX}" cy="${sunY}" r="${sunR}" fill="url(#sunSphere)"/>
    <polygon points="0,${Math.round(h * 0.58)} ${Math.round(w * 0.28)},${Math.round(h * 0.44)} ${Math.round(w * 0.55)},${Math.round(h * 0.54)} ${Math.round(w * 0.82)},${Math.round(h * 0.42)} ${w},${Math.round(h * 0.56)} ${w},${h} 0,${h}" fill="#1E293B" fill-opacity="0.88"/>
    <polygon points="0,${Math.round(h * 0.66)} ${Math.round(w * 0.22)},${Math.round(h * 0.54)} ${Math.round(w * 0.48)},${Math.round(h * 0.62)} ${Math.round(w * 0.76)},${Math.round(h * 0.5)} ${w},${Math.round(h * 0.64)} ${w},${h} 0,${h}" fill="#0F172A"/>
    <polygon points="0,${Math.round(h * 0.75)} ${Math.round(w * 0.35)},${Math.round(h * 0.66)} ${Math.round(w * 0.68)},${Math.round(h * 0.72)} ${w},${Math.round(h * 0.64)} ${w},${h} 0,${h}" fill="#060913"/>
  `;
}

function build3DEconomyLayer(w: number, h: number, sceneNumber: number): string {
  const baseY = Math.round(h * 0.62);
  const barW = Math.round(w * 0.085);
  const startX = Math.round(w * 0.16);
  const heights = [105, 160, 215, 280, 345].map((bh) =>
    Math.round(bh * (h > w ? 0.95 : 0.7) + (sceneNumber % 3) * 14)
  );

  const pillars = heights
    .map((bh, idx) => {
      const x = startX + idx * Math.round(barW * 1.45);
      const y = baseY - bh;
      const isLast = idx === heights.length - 1;
      const frontFill = isLast ? '#F97316' : '#2563EB';
      const sideFill = isLast ? '#9A3412' : '#1E3A8A';
      const topFill = isLast ? '#FDBA74' : '#60A5FA';
      const d = 20;
      return `
        <polygon points="${x},${y} ${x + d},${y - d} ${x + barW + d},${y - d} ${x + barW},${y}" fill="${topFill}"/>
        <rect x="${x}" y="${y}" width="${barW}" height="${bh}" fill="${frontFill}"/>
        <polygon points="${x + barW},${y} ${x + barW + d},${y - d} ${x + barW + d},${y + bh - d} ${x + barW},${y + bh}" fill="${sideFill}"/>
      `;
    })
    .join('');

  return `
    <defs>
      <linearGradient id="econBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#050814"/>
        <stop offset="60%" stop-color="#0F1C3A"/>
        <stop offset="100%" stop-color="#060A17"/>
      </linearGradient>
      <filter id="econGlow"><feGaussianBlur stdDeviation="28"/></filter>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#econBg)"/>
    <circle cx="${Math.round(w * 0.65)}" cy="${Math.round(h * 0.34)}" r="200" fill="#2563EB" fill-opacity="0.22" filter="url(#econGlow)"/>
    <rect x="0" y="${baseY}" width="${w}" height="${h - baseY}" fill="#091124"/>
    <line x1="0" y1="${baseY}" x2="${w}" y2="${baseY}" stroke="#3B82F6" stroke-opacity="0.45" stroke-width="2"/>
    ${pillars}
  `;
}

function build3DStudioLayer(w: number, h: number, sceneNumber: number): string {
  const cx = Math.round(w * 0.5);
  const cy = Math.round(h * 0.4);
  const r = Math.round(Math.min(w, h) * 0.21);
  const rot = sceneNumber * 18;

  return `
    <defs>
      <radialGradient id="studioBg" cx="50%" cy="40%" r="72%">
        <stop offset="0%" stop-color="#1E3A8A" stop-opacity="0.72"/>
        <stop offset="55%" stop-color="#0A1228"/>
        <stop offset="100%" stop-color="#040712"/>
      </radialGradient>
      <radialGradient id="glassSphere" cx="32%" cy="28%" r="72%">
        <stop offset="0%" stop-color="#BFDBFE"/>
        <stop offset="38%" stop-color="#2563EB"/>
        <stop offset="82%" stop-color="#0F172A"/>
        <stop offset="100%" stop-color="#020617"/>
      </radialGradient>
      <radialGradient id="studioHalo" cx="50%" cy="50%" r="50%">
        <stop offset="52%" stop-color="#60A5FA" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#040712" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#studioBg)"/>
    <circle cx="${cx}" cy="${cy}" r="${Math.round(r * 1.55)}" fill="url(#studioHalo)"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#glassSphere)"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${Math.round(r * 1.48)}" ry="${Math.round(r * 0.42)}" transform="rotate(${rot} ${cx} ${cy})" fill="none" stroke="#F97316" stroke-width="4" stroke-opacity="0.78"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${Math.round(r * 1.32)}" ry="${Math.round(r * 0.34)}" transform="rotate(${-rot} ${cx} ${cy})" fill="none" stroke="#60A5FA" stroke-width="2.5" stroke-opacity="0.58"/>
  `;
}

function build25DParallaxAccent(w: number, h: number, sceneNumber: number): string {
  const shift = (sceneNumber % 2 === 0 ? 1 : -1) * 32;
  const cardW = Math.round(w * 0.24);
  const cardH = Math.round(h * 0.14);
  return `
    <!-- 2.5D Multi-Plane Depth Floating Shards & Parallax Glass Planes -->
    <polygon points="0,${Math.round(h * 0.62)} ${w},${Math.round(h * 0.56)} ${w},${h} 0,${h}" fill="#0B132B" fill-opacity="0.52"/>
    <rect x="${Math.round(w * 0.08) + shift}" y="${Math.round(h * 0.22)}" width="${cardW}" height="${cardH}" rx="18" transform="rotate(-8 ${Math.round(w * 0.16)} ${Math.round(h * 0.28)})" fill="#3B82F6" fill-opacity="0.16" stroke="#93C5FD" stroke-opacity="0.45" stroke-width="2"/>
    <rect x="${Math.round(w * 0.66) - shift}" y="${Math.round(h * 0.48)}" width="${cardW}" height="${cardH}" rx="18" transform="rotate(7 ${Math.round(w * 0.74)} ${Math.round(h * 0.54)})" fill="#F97316" fill-opacity="0.18" stroke="#FDBA74" stroke-opacity="0.5" stroke-width="2"/>
    <line x1="0" y1="${Math.round(h * 0.62)}" x2="${w}" y2="${Math.round(h * 0.56)}" stroke="#60A5FA" stroke-opacity="0.4" stroke-width="2"/>
  `;
}

function buildCartoonSceneLayer(
  w: number,
  h: number,
  theme: SceneVisualTheme,
  sceneNumber: number
): string {
  const cx = Math.round(w * 0.5);
  const cy = Math.round(h * 0.4);
  const r = Math.round(Math.min(w, h) * 0.2);

  let accentObject = '';
  if (theme === 'space') {
    accentObject = `
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="#FDE047" stroke="#0F172A" stroke-width="6"/>
      <circle cx="${cx - Math.round(r * 0.28)}" cy="${cy - Math.round(r * 0.18)}" r="${Math.round(r * 0.18)}" fill="#FACC15" stroke="#0F172A" stroke-width="4"/>
      <ellipse cx="${cx}" cy="${cy}" rx="${Math.round(r * 1.55)}" ry="${Math.round(r * 0.35)}" transform="rotate(-14 ${cx} ${cy})" fill="none" stroke="#FB923C" stroke-width="9"/>
      <ellipse cx="${cx}" cy="${cy}" rx="${Math.round(r * 1.55)}" ry="${Math.round(r * 0.35)}" transform="rotate(-14 ${cx} ${cy})" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-dasharray="14 10"/>
    `;
  } else if (theme === 'monument') {
    accentObject = `
      <circle cx="${cx}" cy="${cy - 30}" r="${Math.round(r * 0.75)}" fill="#FEF08A" stroke="#0F172A" stroke-width="6"/>
      <rect x="${cx - r}" y="${cy - 20}" width="${r * 2}" height="${Math.round(r * 0.9)}" rx="14" fill="#FFFFFF" stroke="#0F172A" stroke-width="6"/>
      <path d="M ${cx - 42} ${cy + Math.round(r * 0.7)} L ${cx - 42} ${cy + 15} Q ${cx} ${cy - 30} ${cx + 42} ${cy + 15} L ${cx + 42} ${cy + Math.round(r * 0.7)} Z" fill="#1E3A8A" stroke="#0F172A" stroke-width="5"/>
    `;
  } else if (theme === 'tech' || theme === 'science') {
    accentObject = `
      <rect x="${cx - r}" y="${cy - r}" width="${r * 2}" height="${r * 2}" rx="34" fill="#38BDF8" stroke="#0F172A" stroke-width="6"/>
      <circle cx="${cx - Math.round(r * 0.38)}" cy="${cy - Math.round(r * 0.2)}" r="20" fill="#FFFFFF" stroke="#0F172A" stroke-width="5"/>
      <circle cx="${cx + Math.round(r * 0.38)}" cy="${cy - Math.round(r * 0.2)}" r="20" fill="#FFFFFF" stroke="#0F172A" stroke-width="5"/>
      <circle cx="${cx - Math.round(r * 0.38)}" cy="${cy - Math.round(r * 0.2)}" r="8" fill="#0F172A"/>
      <circle cx="${cx + Math.round(r * 0.38)}" cy="${cy - Math.round(r * 0.2)}" r="8" fill="#0F172A"/>
      <path d="M ${cx - 45} ${cy + 35} Q ${cx} ${cy + 72} ${cx + 45} ${cy + 35}" fill="none" stroke="#0F172A" stroke-width="7" stroke-linecap="round"/>
    `;
  } else {
    accentObject = `
      <circle cx="${cx}" cy="${cy - 25}" r="${Math.round(r * 0.85)}" fill="#FB923C" stroke="#0F172A" stroke-width="6"/>
      <ellipse cx="${Math.round(w * 0.24)}" cy="${Math.round(h * 0.26)}" rx="68" ry="34" fill="#FFFFFF" stroke="#0F172A" stroke-width="5"/>
      <ellipse cx="${Math.round(w * 0.76)}" cy="${Math.round(h * 0.3)}" rx="74" ry="36" fill="#FFFFFF" stroke="#0F172A" stroke-width="5"/>
      <path d="M 0 ${Math.round(h * 0.62)} Q ${Math.round(w * 0.28)} ${Math.round(h * 0.48)} ${Math.round(w * 0.56)} ${Math.round(h * 0.6)} T ${w} ${Math.round(h * 0.55)} L ${w} ${h} L 0 ${h} Z" fill="#22C55E" stroke="#0F172A" stroke-width="6"/>
    `;
  }

  const starOffset = (sceneNumber % 3) * 30;

  return `
    <defs>
      <linearGradient id="cartoonSky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#1D4ED8"/>
        <stop offset="60%" stop-color="#38BDF8"/>
        <stop offset="100%" stop-color="#0EA5E9"/>
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#cartoonSky)"/>
    <circle cx="${Math.round(w * 0.16) + starOffset}" cy="${Math.round(h * 0.2)}" r="12" fill="#FDE047" stroke="#0F172A" stroke-width="3"/>
    <circle cx="${Math.round(w * 0.82) - starOffset}" cy="${Math.round(h * 0.24)}" r="15" fill="#FDE047" stroke="#0F172A" stroke-width="3"/>
    ${accentObject}
  `;
}

function buildInfographicLayer(w: number, h: number, sceneNumber: number): string {
  const cx = Math.round(w * 0.5);
  const cy = Math.round(h * 0.4);
  const r = Math.round(Math.min(w, h) * 0.22);
  const bars = [120, 210, 175, 290, 250].map((bh, idx) => {
    const x = Math.round(w * 0.18) + idx * Math.round(w * 0.14);
    const y = Math.round(h * 0.58) - Math.round(bh * (h > w ? 0.9 : 0.62));
    const fill = idx % 2 === 0 ? '#38BDF8' : '#F97316';
    return `<rect x="${x}" y="${y}" width="${Math.round(w * 0.08)}" height="${Math.round(h * 0.58) - y}" rx="8" fill="${fill}" fill-opacity="0.88"/>`;
  }).join('');

  return `
    <defs>
      <linearGradient id="infoBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#020617"/>
        <stop offset="100%" stop-color="#0F172A"/>
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#infoBg)"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#1E3A8A" stroke-width="18"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#38BDF8" stroke-width="10" stroke-dasharray="${180 + sceneNumber * 28} 400"/>
    ${bars}
  `;
}

export function build3DSceneBackgroundSvg(params: {
  width: number;
  height: number;
  visualPrompt: string;
  voiceScript: string;
  style: string;
  videoType?: string;
  sceneNumber: number;
}): string {
  const { width, height, visualPrompt, voiceScript, style, videoType = '3d_realistic', sceneNumber } = params;
  const primaryDetect = detectSceneTheme(visualPrompt);
  const theme = primaryDetect !== 'studio' ? primaryDetect : detectSceneTheme(`${voiceScript} ${style}`);

  if (videoType === 'cartoon_2d') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${buildCartoonSceneLayer(width, height, theme, sceneNumber)}</svg>`;
  }

  if (videoType === 'cinematic_infographic') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${buildInfographicLayer(width, height, sceneNumber)}</svg>`;
  }

  let inner = '';
  switch (theme) {
    case 'space':
      inner = build3DSpaceLayer(width, height, sceneNumber);
      break;
    case 'monument':
      inner = build3DMonumentLayer(width, height, sceneNumber);
      break;
    case 'tech':
      inner = build3DTechLayer(width, height, sceneNumber);
      break;
    case 'science':
      inner = build3DScienceLayer(width, height, sceneNumber);
      break;
    case 'nature':
      inner = build3DNatureLayer(width, height, sceneNumber);
      break;
    case 'economy':
      inner = build3DEconomyLayer(width, height, sceneNumber);
      break;
    default:
      inner = build3DStudioLayer(width, height, sceneNumber);
      break;
  }

  if (videoType === '2_5d_parallax') {
    inner += build25DParallaxAccent(width, height, sceneNumber);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${inner}</svg>`;
}

export interface VoiceWordTiming {
  offsetMs: number;
  durationMs: number;
  text: string;
}

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

function splitAnimatedChunks(displayText: string, maxCharsPerLine: number): string[][] {
  const explicitLines = displayText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // Build wrapped lines while respecting explicit user line breaks
  const allLines: string[] = [];
  for (const seg of explicitLines) {
    const words = seg.split(/\s+/).filter(Boolean);
    let current = '';
    for (const w of words) {
      const next = current ? `${current} ${w}` : w;
      if (next.length <= maxCharsPerLine) {
        current = next;
      } else {
        if (current) allLines.push(current);
        current = w.length > maxCharsPerLine ? w.slice(0, maxCharsPerLine) : w;
      }
    }
    if (current) allLines.push(current);
  }

  // Group into beats of up to 3 lines per animated card
  const chunks: string[][] = [];
  for (let i = 0; i < allLines.length; i += 3) {
    chunks.push(allLines.slice(i, i + 3));
  }
  return chunks;
}

export function buildCaptionOverlaySvg(params: {
  width: number;
  height: number;
  isVertical: boolean;
  screenText: string;
  voiceScript: string;
}): string {
  const { width, height, isVertical, screenText, voiceScript } = params;
  const cleanText = (screenText || voiceScript).trim();

  if (!cleanText) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"></svg>`;
  }

  const paddingX = isVertical ? 34 : 64;
  const maxChars = isVertical ? 26 : 46;
  const chunks = splitAnimatedChunks(cleanText, maxChars);
  const maxLinesShown = Math.min(3, Math.max(1, ...chunks.map((c) => c.length)));
  const fontSize = isVertical ? 36 : 40;
  const lineHeight = Math.round(fontSize * 1.42);
  const cardWidth = width - paddingX * 2;
  const cardHeight = Math.max(isVertical ? 148 : 128, maxLinesShown * lineHeight + 54);
  const bottomReserved = isVertical ? 154 : 34;
  const cardY = height - cardHeight - bottomReserved;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect x="${paddingX}" y="${cardY}" width="${cardWidth}" height="${cardHeight}" rx="20" fill="#060913" fill-opacity="0.76" stroke="#3B82F6" stroke-opacity="0.48" stroke-width="1.8"/>
</svg>`;
}

export function buildAnimatedScreenTextAss(params: {
  width: number;
  height: number;
  isVertical: boolean;
  screenText: string;
  voiceScript: string;
  sceneDurationSec: number;
  wordTimings: VoiceWordTiming[];
}): string | null {
  const { width, height, isVertical, screenText, voiceScript, sceneDurationSec, wordTimings } = params;
  const cleanText = (screenText || voiceScript).trim();
  if (!cleanText) return null;

  const maxChars = isVertical ? 26 : 46;
  const chunks = splitAnimatedChunks(cleanText, maxChars);
  if (chunks.length === 0) return null;

  const fontSize = isVertical ? 40 : 44;
  const maxLinesShown = Math.min(3, Math.max(1, ...chunks.map((c) => c.length)));
  const lineHeight = Math.round(fontSize * 1.38);
  const cardHeight = Math.max(isVertical ? 148 : 128, maxLinesShown * lineHeight + 54);
  const bottomReserved = isVertical ? 154 : 34;
  const cardCenterY = height - bottomReserved - Math.round(cardHeight / 2);
  const centerX = Math.round(width / 2);

  // Align text animation start/end strictly to actual spoken audio timestamps
  const sceneMs = Math.round(sceneDurationSec * 1000);
  const speechStartMs =
    wordTimings.length > 0 ? Math.max(40, wordTimings[0].offsetMs) : 120;
  const lastWord = wordTimings[wordTimings.length - 1];
  const speechEndMs =
    lastWord
      ? Math.min(sceneMs - 80, lastWord.offsetMs + Math.max(250, lastWord.durationMs) + 120)
      : Math.max(800, sceneMs - 250);
  const totalSpeechSpanMs = Math.max(600, speechEndMs - speechStartMs);

  const chunkWeights = chunks.map((lines) =>
    Math.max(1, lines.join(' ').replace(/\s+/g, '').length)
  );
  const totalWeight = chunkWeights.reduce((acc, w) => acc + w, 0);

  let cursorMs = speechStartMs;
  const dialogueEvents: string[] = [];

  chunks.forEach((lines, idx) => {
    const isLast = idx === chunks.length - 1;
    const chunkSpanMs = isLast
      ? Math.max(500, sceneMs - 60 - cursorMs)
      : Math.max(650, Math.round((chunkWeights[idx] / totalWeight) * totalSpeechSpanMs));
    const startMs = cursorMs;
    const endMs = isLast ? sceneMs - 40 : Math.min(sceneMs - 80, startMs + chunkSpanMs);

    // Reserve active highlight span inside this beat matching spoken duration
    const spokenInBeatMs = Math.max(
      400,
      Math.round(((chunkWeights[idx] / totalWeight) * totalSpeechSpanMs) * 0.94)
    );

    const animatedLines = lines.map((line) => {
      const words = line.split(/\s+/).filter(Boolean);
      const lineWordsWeight = words.reduce((s, w) => s + Math.max(1, w.length), 0);
      const totalChunkChars = Math.max(1, lines.join('').replace(/\s+/g, '').length);
      const lineBudgetMs = Math.round((lineWordsWeight / totalChunkChars) * spokenInBeatMs);

      return words
        .map((w, wIdx) => {
          const wRatio = Math.max(1, w.length) / Math.max(1, lineWordsWeight);
          const cs = Math.max(8, Math.round((lineBudgetMs * wRatio) / 10));
          const safeWord = escapeAssText(w);
          return `{\\kf${cs}}${safeWord}${wIdx < words.length - 1 ? ' ' : ''}`;
        })
        .join('');
    });

    const animTag = `{\\an5\\pos(${centerX},${cardCenterY})\\fad(150,90)\\fscx90\\fscy90\\t(0,210,\\fscx100\\fscy100)}`;
    const textBody = `${animTag}${animatedLines.join('\\N')}`;
    dialogueEvents.push(
      `Dialogue: 0,${formatAssTime(startMs)},${formatAssTime(endMs)},KineticCaption,,0,0,0,,${textBody}`
    );

    cursorMs = endMs;
  });

  return `[Script Info]
ScriptType: v4.00+
PlayResX: ${width}
PlayResY: ${height}
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: KineticCaption,Noto Sans Devanagari,${fontSize},&H0024BFFB,&H00FFFFFF,&H00140804,&HA0000000,-1,0,0,0,100,100,0,0,1,3.2,2,5,${isVertical ? 48 : 80},${isVertical ? 48 : 80},40,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
${dialogueEvents.join('\n')}
`;
}
