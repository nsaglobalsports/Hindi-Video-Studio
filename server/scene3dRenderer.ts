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

type SceneVisualSubject =
  | 'chandrayaan'
  | 'rocket'
  | 'moon'
  | 'tajmahal'
  | 'fort'
  | 'temple'
  | 'ai_chip'
  | 'robot'
  | 'smartphone'
  | 'upi'
  | 'dna'
  | 'brain'
  | 'atom'
  | 'medical'
  | 'river'
  | 'forest'
  | 'mountain'
  | 'ocean'
  | 'solar'
  | 'bank'
  | 'stock'
  | 'currency'
  | 'farm'
  | 'education'
  | 'sports'
  | 'generic';

function detectSceneTheme(combinedText: string): SceneVisualTheme {
  const t = combinedText.toLowerCase().replace(/\s+/g, ' ').trim();

  const hasHindi = (...words: string[]) =>
    words.some((word) => t.includes(word));

  const hasEnglish = (...words: string[]) =>
    words.some((word) => {
      const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(
        `(^|[^a-z0-9])${escaped}(?=$|[^a-z0-9])`,
        'i'
      );
      return pattern.test(t);
    });

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

  if (
    hasHindi(
      'सुबह', 'स्वास्थ्य', 'योग', 'धूप',
      'जल', 'नदी', 'पर्वत', 'हिमालय',
      'जंगल', 'पेड़', 'प्रकृति', 'पर्यावरण',
      'जलवायु', 'पृथ्वी', 'किसान', 'खेती', 'कृषि', 'फसल', 'खेत', 'ट्रैक्टर'
    ) ||
    hasEnglish(
      'morning', 'health', 'yoga', 'nature',
      'sunlight', 'water', 'river', 'mountain',
      'forest', 'tree', 'climate', 'earth',
      'environment', 'wildlife', 'ocean', 'farmer', 'farming', 'agriculture', 'crop', 'tractor'
    )
  ) {
    return 'nature';
  }

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

/**
 * अधिक विशिष्ट विषय पहचान।
 * सामान्य थीम से पहले विशिष्ट विषय चेक किए जाते हैं।
 */
function detectSceneSubject(combinedText: string): SceneVisualSubject {
  const t = combinedText.toLowerCase().replace(/\s+/g, ' ').trim();

  const hasHindi = (...words: string[]) =>
    words.some((word) => t.includes(word));

  const hasEnglish = (...words: string[]) =>
    words.some((word) => {
      const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(
        `(^|[^a-z0-9])${escaped}(?=$|[^a-z0-9])`,
        'i'
      ).test(t);
    });

  // SPACE: Specific subjects first
  if (
    hasHindi('चंद्रयान', 'चंद्र मिशन', 'चंद्रयान-3', 'चंद्रयान 3') ||
    hasEnglish('chandrayaan', 'lunar mission')
  ) return 'chandrayaan';

  if (
    hasHindi('रॉकेट', 'प्रक्षेपण यान', 'लॉन्च व्हीकल') ||
    hasEnglish('rocket', 'launch vehicle')
  ) return 'rocket';

  if (
    hasHindi('चांद', 'चंद्रमा', 'चन्द्रमा') ||
    hasEnglish('moon', 'lunar surface')
  ) return 'moon';

  // MONUMENT
  if (
    hasHindi('ताजमहल') ||
    hasEnglish('taj mahal')
  ) return 'tajmahal';

  if (
    hasHindi('किला', 'लाल किला', 'आगरा किला', 'दुर्ग') ||
    hasEnglish('fort', 'red fort')
  ) return 'fort';

  if (
    hasHindi('मंदिर', 'मस्जिद', 'गुरुद्वारा') ||
    hasEnglish('temple', 'mosque', 'gurudwara')
  ) return 'temple';

  // TECHNOLOGY
  if (
    hasHindi('एआई चिप', 'आर्टिफिशियल इंटेलिजेंस चिप', 'सेमीकंडक्टर') ||
    hasEnglish('ai chip', 'semiconductor', 'microchip')
  ) return 'ai_chip';

  if (
    hasHindi('रोबोट', 'रोबोटिक्स', 'मानव रोबोट') ||
    hasEnglish('robot', 'robotics', 'android robot')
  ) return 'robot';

  if (
    hasHindi('स्मार्टफोन', 'मोबाइल फोन', 'मोबाइल') ||
    hasEnglish('smartphone', 'mobile phone', 'iphone')
  ) return 'smartphone';

  if (
    hasHindi('यूपीआई', 'डिजिटल भुगतान', 'क्यूआर कोड', 'ऑनलाइन पेमेंट') ||
    hasEnglish('upi', 'digital payment', 'qr code', 'online payment')
  ) return 'upi';

  // SCIENCE
  if (
    hasHindi('डीएनए', 'जीन', 'आनुवंशिक') ||
    hasEnglish('dna', 'genetics', 'gene')
  ) return 'dna';

  if (
    hasHindi('मस्तिष्क', 'दिमाग', 'दिमागी') ||
    hasEnglish('brain', 'neuron', 'neurons')
  ) return 'brain';

  if (
    hasHindi('परमाणु', 'नाभिक', 'इलेक्ट्रॉन') ||
    hasEnglish('atom', 'atomic', 'electron', 'nucleus')
  ) return 'atom';

  if (
    hasHindi('अस्पताल', 'डॉक्टर', 'चिकित्सा', 'दवा', 'स्वास्थ्य सेवा') ||
    hasEnglish('hospital', 'doctor', 'medical treatment', 'medicine')
  ) return 'medical';

  // NATURE
  if (
    hasHindi('किसान', 'खेती', 'कृषि', 'फसल', 'खेत', 'ट्रैक्टर') ||
    hasEnglish('farmer', 'farming', 'agriculture', 'crop', 'tractor')
  ) return 'farm';

  if (
    hasHindi('नदी', 'गंगा', 'यमुना', 'नर्मदा', 'ब्रह्मपुत्र') ||
    hasEnglish('river', 'waterfall', 'ganges', 'yamuna')
  ) return 'river';

  if (
    hasHindi('जंगल', 'वन', 'वर्षावन', 'पेड़-पौधे') ||
    hasEnglish('forest', 'rainforest', 'jungle', 'woodland')
  ) return 'forest';

  if (
    hasHindi('पर्वत', 'पहाड़', 'हिमालय', 'पर्वत श्रृंखला') ||
    hasEnglish('mountain', 'himalaya', 'mountain range')
  ) return 'mountain';

  if (
    hasHindi('समुद्र', 'महासागर', 'समुद्री जीवन') ||
    hasEnglish('ocean', 'sea', 'marine life')
  ) return 'ocean';

  if (
    hasHindi('सौर ऊर्जा', 'सोलर पैनल', 'सूर्य ऊर्जा') ||
    hasEnglish('solar energy', 'solar panel', 'solar power')
  ) return 'solar';

  if (
    hasHindi('परीक्षा', 'छात्र', 'विद्यार्थी', 'स्कूल', 'कॉलेज', 'पढ़ाई', 'किताब') ||
    hasEnglish('exam', 'student', 'school', 'college', 'education', 'textbook')
  ) return 'education';

  if (
    hasHindi('खेल', 'खिलाड़ी', 'क्रिकेट', 'फुटबॉल', 'बैडमिंटन', 'बास्केटबॉल') ||
    hasEnglish('sports', 'athlete', 'cricket', 'football', 'badminton', 'basketball')
  ) return 'sports';

  // ECONOMY
  if (
    hasHindi('बैंक', 'बैंकिंग', 'बैंक खाता') ||
    hasEnglish('bank', 'banking', 'bank account')
  ) return 'bank';

  if (
    hasHindi('शेयर बाजार', 'शेयर मार्केट', 'स्टॉक मार्केट', 'सेंसेक्स', 'निफ्टी') ||
    hasEnglish('stock market', 'share market', 'sensex', 'nifty', 'stocks')
  ) return 'stock';

  if (
    hasHindi('रुपया', 'रुपये', 'मुद्रा', 'करेंसी', 'डॉलर') ||
    hasEnglish('currency', 'rupee', 'dollar', 'euro', 'foreign exchange')
  ) return 'currency';

  return 'generic';
}

function build3DSpaceLayer(
  w: number,
  h: number,
  sceneNumber: number
): string {
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

    <ellipse
      cx="${cx}" cy="${cy}"
      rx="${Math.round(r * 2.1)}"
      ry="${Math.round(r * 0.55)}"
      fill="#3B82F6" fill-opacity="0.24"
      filter="url(#softBlur)"
    />

    <circle cx="${cx}" cy="${cy}" r="${Math.round(r * 1.38)}" fill="url(#atmosphereBloom)"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#planetSphere)"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#specGloss)"/>

    <ellipse
      cx="${cx - Math.round(r * 0.28)}"
      cy="${cy - Math.round(r * 0.14)}"
      rx="${Math.round(r * 0.16)}"
      ry="${Math.round(r * 0.11)}"
      fill="#1E293B"
      fill-opacity="0.45"
      stroke="#E2E8F0"
      stroke-opacity="0.22"
      stroke-width="1.5"
    />

    <ellipse
      cx="${cx + Math.round(r * 0.18)}"
      cy="${cy + Math.round(r * 0.18)}"
      rx="${Math.round(r * 0.12)}"
      ry="${Math.round(r * 0.085)}"
      fill="#0F172A"
      fill-opacity="0.55"
      stroke="#94A3B8"
      stroke-opacity="0.2"
      stroke-width="1"
    />

    <ellipse
      cx="${cx}" cy="${cy}"
      rx="${Math.round(r * 1.62)}"
      ry="${Math.round(r * 0.38)}"
      transform="rotate(-14 ${cx} ${cy})"
      fill="none"
      stroke="#F97316"
      stroke-width="3.5"
      stroke-opacity="0.78"
    />

    <ellipse
      cx="${cx}" cy="${cy}"
      rx="${Math.round(r * 1.78)}"
      ry="${Math.round(r * 0.44)}"
      transform="rotate(-14 ${cx} ${cy})"
      fill="none"
      stroke="#60A5FA"
      stroke-width="1.8"
      stroke-opacity="0.42"
    />

    <circle cx="${satX}" cy="${satY}" r="${Math.round(r * 0.14)}" fill="url(#satSphere)"/>
  `;
}

function build3DMonumentLayer(
  w: number,
  h: number,
  sceneNumber: number
): string {
  const cx = Math.round(w * 0.5);
  const baseY = Math.round(h * 0.58);
  const domeR = Math.round(Math.min(w, h) * 0.15);
  const towerH = Math.round(domeR * 1.6);
  const sunShift =
    (sceneNumber % 2 === 0 ? 1 : -1) * Math.round(w * 0.14);

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

    <circle
      cx="${cx + sunShift}"
      cy="${baseY - towerH}"
      r="${Math.round(domeR * 1.9)}"
      fill="#F59E0B"
      fill-opacity="0.34"
      filter="url(#goldBlur)"
    />

    <rect
      x="${cx - Math.round(domeR * 2.2)}"
      y="${baseY - Math.round(towerH * 0.82)}"
      width="22"
      height="${Math.round(towerH * 0.82)}"
      rx="4"
      fill="url(#marbleWall)"
    />

    <rect
      x="${cx + Math.round(domeR * 2.2) - 22}"
      y="${baseY - Math.round(towerH * 0.82)}"
      width="22"
      height="${Math.round(towerH * 0.82)}"
      rx="4"
      fill="url(#marbleWall)"
    />

    <circle
      cx="${cx}"
      cy="${baseY - Math.round(domeR * 1.18)}"
      r="${domeR}"
      fill="url(#marbleDome)"
    />

    <polygon
      points="${cx - 5},${baseY - Math.round(domeR * 2.15)}
      ${cx + 5},${baseY - Math.round(domeR * 2.15)}
      ${cx},${baseY - Math.round(domeR * 2.52)}"
      fill="#FBBF24"
    />

    <rect
      x="${cx - Math.round(domeR * 1.45)}"
      y="${baseY - Math.round(domeR * 1.15)}"
      width="${Math.round(domeR * 2.9)}"
      height="${Math.round(domeR * 1.15)}"
      rx="6"
      fill="url(#marbleWall)"
    />

    <path
      d="M ${cx - Math.round(domeR * 0.45)} ${baseY}
      L ${cx - Math.round(domeR * 0.45)} ${baseY - Math.round(domeR * 0.65)}
      Q ${cx} ${baseY - Math.round(domeR * 1.05)}
      ${cx + Math.round(domeR * 0.45)} ${baseY - Math.round(domeR * 0.65)}
      L ${cx + Math.round(domeR * 0.45)} ${baseY} Z"
      fill="#0F172A"
    />

    <rect x="0" y="${baseY}" width="${w}" height="${h - baseY}" fill="url(#waterReflect)"/>

    <ellipse
      cx="${cx}"
      cy="${baseY + 46}"
      rx="${Math.round(domeR * 1.3)}"
      ry="26"
      fill="#FDE68A"
      fill-opacity="0.2"
      filter="url(#goldBlur)"
    />

    <line
      x1="0" y1="${baseY}"
      x2="${w}" y2="${baseY}"
      stroke="#FBBF24"
      stroke-opacity="0.45"
      stroke-width="2"
    />
  `;
}

function build3DTechLayer(
  w: number,
  h: number,
  sceneNumber: number
): string {
  const cx = Math.round(w * 0.5);
  const cy = Math.round(h * 0.4);
  const s = Math.round(Math.min(w, h) * 0.15);
  const horizonY = Math.round(h * 0.56);

  const gridLines = Array.from({ length: 12 }, (_, idx) => {
    const xBottom = Math.round((w / 11) * idx);

    return `<line
      x1="${cx}" y1="${horizonY}"
      x2="${xBottom}" y2="${h}"
      stroke="#2563EB"
      stroke-opacity="0.3"
      stroke-width="1.5"
    />`;
  }).join('');

  const hGrid = Array.from({ length: 7 }, (_, idx) => {
    const yPos = horizonY + Math.round(((h - horizonY) / 7) * idx);

    return `<line
      x1="0" y1="${yPos}"
      x2="${w}" y2="${yPos}"
      stroke="#3B82F6"
      stroke-opacity="0.22"
      stroke-width="1.5"
    />`;
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

    <circle
      cx="${cx + offset}"
      cy="${cy}"
      r="${Math.round(s * 1.9)}"
      fill="#3B82F6"
      fill-opacity="0.24"
      filter="url(#techBlur)"
    />

    <polygon
      points="${cx + offset},${cy - s}
      ${cx + offset + s},${cy - Math.round(s * 0.45)}
      ${cx + offset},${cy + Math.round(s * 0.1)}
      ${cx + offset - s},${cy - Math.round(s * 0.45)}"
      fill="url(#cubeTop)"
      stroke="#BFDBFE"
      stroke-width="2"
    />

    <polygon
      points="${cx + offset - s},${cy - Math.round(s * 0.45)}
      ${cx + offset},${cy + Math.round(s * 0.1)}
      ${cx + offset},${cy + Math.round(s * 1.15)}
      ${cx + offset - s},${cy + Math.round(s * 0.6)}"
      fill="url(#cubeLeft)"
      stroke="#3B82F6"
      stroke-width="2"
    />

    <polygon
      points="${cx + offset + s},${cy - Math.round(s * 0.45)}
      ${cx + offset},${cy + Math.round(s * 0.1)}
      ${cx + offset},${cy + Math.round(s * 1.15)}
      ${cx + offset + s},${cy + Math.round(s * 0.6)}"
      fill="url(#cubeRight)"
      stroke="#FDBA74"
      stroke-width="2"
    />

    <circle cx="${cx - Math.round(s * 1.8)}" cy="${cy - 30}" r="14" fill="#38BDF8"/>
    <circle cx="${cx + Math.round(s * 1.8)}" cy="${cy + 20}" r="16" fill="#F97316"/>

    <line
      x1="${cx - Math.round(s * 1.8)}" y1="${cy - 30}"
      x2="${cx + offset}" y2="${cy}"
      stroke="#60A5FA"
      stroke-opacity="0.55"
      stroke-width="2"
    />

    <line
      x1="${cx + Math.round(s * 1.8)}" y1="${cy + 20}"
      x2="${cx + offset}" y2="${cy}"
      stroke="#F97316"
      stroke-opacity="0.55"
      stroke-width="2"
    />
  `;
}

function build3DScienceLayer(
  w: number,
  h: number,
  sceneNumber: number
): string {
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

    <circle
      cx="${cx}" cy="${cy}"
      r="${Math.round(r * 1.6)}"
      fill="#10B981"
      fill-opacity="0.22"
      filter="url(#sciBlur)"
    />

    <ellipse
      cx="${cx}" cy="${cy}"
      rx="${Math.round(r * 1.55)}"
      ry="${Math.round(r * 0.48)}"
      transform="rotate(${rotOffset} ${cx} ${cy})"
      fill="none"
      stroke="#34D399"
      stroke-width="3"
      stroke-opacity="0.72"
    />

    <ellipse
      cx="${cx}" cy="${cy}"
      rx="${Math.round(r * 1.55)}"
      ry="${Math.round(r * 0.48)}"
      transform="rotate(${rotOffset + 60} ${cx} ${cy})"
      fill="none"
      stroke="#38BDF8"
      stroke-width="3"
      stroke-opacity="0.72"
    />

    <ellipse
      cx="${cx}" cy="${cy}"
      rx="${Math.round(r * 1.55)}"
      ry="${Math.round(r * 0.48)}"
      transform="rotate(${rotOffset + 120} ${cx} ${cy})"
      fill="none"
      stroke="#F97316"
      stroke-width="2.5"
      stroke-opacity="0.68"
    />

    <circle
      cx="${cx}" cy="${cy}"
      r="${Math.round(r * 0.48)}"
      fill="url(#nucleusSphere)"
    />
  `;
}

function build3DNatureLayer(
  w: number,
  h: number,
  sceneNumber: number
): string {
  const sunX = Math.round(
    w * (0.5 + (sceneNumber % 2 === 0 ? 0.08 : -0.06))
  );

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

    <circle
      cx="${sunX}" cy="${sunY}"
      r="${Math.round(sunR * 2.2)}"
      fill="#F97316"
      fill-opacity="0.4"
      filter="url(#sunBlur)"
    />

    <circle cx="${sunX}" cy="${sunY}" r="${sunR}" fill="url(#sunSphere)"/>

    <polygon
      points="0,${Math.round(h * 0.58)}
      ${Math.round(w * 0.28)},${Math.round(h * 0.44)}
      ${Math.round(w * 0.55)},${Math.round(h * 0.54)}
      ${Math.round(w * 0.82)},${Math.round(h * 0.42)}
      ${w},${Math.round(h * 0.56)}
      ${w},${h} 0,${h}"
      fill="#1E293B"
      fill-opacity="0.88"
    />

    <polygon
      points="0,${Math.round(h * 0.66)}
      ${Math.round(w * 0.22)},${Math.round(h * 0.54)}
      ${Math.round(w * 0.48)},${Math.round(h * 0.62)}
      ${Math.round(w * 0.76)},${Math.round(h * 0.5)}
      ${w},${Math.round(h * 0.64)}
      ${w},${h} 0,${h}"
      fill="#0F172A"
    />

    <polygon
      points="0,${Math.round(h * 0.75)}
      ${Math.round(w * 0.35)},${Math.round(h * 0.66)}
      ${Math.round(w * 0.68)},${Math.round(h * 0.72)}
      ${w},${Math.round(h * 0.64)}
      ${w},${h} 0,${h}"
      fill="#060913"
    />
  `;
}

function build3DEconomyLayer(
  w: number,
  h: number,
  sceneNumber: number
): string {
  const baseY = Math.round(h * 0.62);
  const barW = Math.round(w * 0.085);
  const startX = Math.round(w * 0.16);

  const heights = [105, 160, 215, 280, 345].map((bh) =>
    Math.round(
      bh * (h > w ? 0.95 : 0.7) +
      (sceneNumber % 3) * 14
    )
  );

  const pillars = heights.map((bh, idx) => {
    const x = startX + idx * Math.round(barW * 1.45);
    const y = baseY - bh;
    const isLast = idx === heights.length - 1;

    const frontFill = isLast ? '#F97316' : '#2563EB';
    const sideFill = isLast ? '#9A3412' : '#1E3A8A';
    const topFill = isLast ? '#FDBA74' : '#60A5FA';
    const d = 20;

    return `
      <polygon
        points="${x},${y}
        ${x + d},${y - d}
        ${x + barW + d},${y - d}
        ${x + barW},${y}"
        fill="${topFill}"
      />

      <rect
        x="${x}" y="${y}"
        width="${barW}" height="${bh}"
        fill="${frontFill}"
      />

      <polygon
        points="${x + barW},${y}
        ${x + barW + d},${y - d}
        ${x + barW + d},${y + bh - d}
        ${x + barW},${y + bh}"
        fill="${sideFill}"
      />
    `;
  }).join('');

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

    <circle
      cx="${Math.round(w * 0.65)}"
      cy="${Math.round(h * 0.34)}"
      r="200"
      fill="#2563EB"
      fill-opacity="0.22"
      filter="url(#econGlow)"
    />

    <rect
      x="0"
      y="${baseY}"
      width="${w}"
      height="${h - baseY}"
      fill="#091124"
    />

    <line
      x1="0" y1="${baseY}"
      x2="${w}" y2="${baseY}"
      stroke="#3B82F6"
      stroke-opacity="0.45"
      stroke-width="2"
    />

    ${pillars}
  `;
}

function build3DStudioLayer(
  w: number,
  h: number,
  sceneNumber: number
): string {
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

    <circle
      cx="${cx}" cy="${cy}"
      r="${Math.round(r * 1.55)}"
      fill="url(#studioHalo)"
    />

    <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#glassSphere)"/>

    <ellipse
      cx="${cx}" cy="${cy}"
      rx="${Math.round(r * 1.48)}"
      ry="${Math.round(r * 0.42)}"
      transform="rotate(${rot} ${cx} ${cy})"
      fill="none"
      stroke="#F97316"
      stroke-width="4"
      stroke-opacity="0.78"
    />

    <ellipse
      cx="${cx}" cy="${cy}"
      rx="${Math.round(r * 1.32)}"
      ry="${Math.round(r * 0.34)}"
      transform="rotate(${-rot} ${cx} ${cy})"
      fill="none"
      stroke="#60A5FA"
      stroke-width="2.5"
      stroke-opacity="0.58"
    />
  `;
}

function build25DParallaxAccent(
  w: number,
  h: number,
  sceneNumber: number
): string {
  const shift = (sceneNumber % 2 === 0 ? 1 : -1) * 32;
  const cardW = Math.round(w * 0.24);
  const cardH = Math.round(h * 0.14);

  return `
    <polygon
      points="0,${Math.round(h * 0.62)}
      ${w},${Math.round(h * 0.56)}
      ${w},${h} 0,${h}"
      fill="#0B132B"
      fill-opacity="0.52"
    />

    <rect
      x="${Math.round(w * 0.08) + shift}"
      y="${Math.round(h * 0.22)}"
      width="${cardW}"
      height="${cardH}"
      rx="18"
      transform="rotate(-8 ${Math.round(w * 0.16)} ${Math.round(h * 0.28)})"
      fill="#3B82F6"
      fill-opacity="0.16"
      stroke="#93C5FD"
      stroke-opacity="0.45"
      stroke-width="2"
    />

    <rect
      x="${Math.round(w * 0.66) - shift}"
      y="${Math.round(h * 0.48)}"
      width="${cardW}"
      height="${cardH}"
      rx="18"
      transform="rotate(7 ${Math.round(w * 0.74)} ${Math.round(h * 0.54)})"
      fill="#F97316"
      fill-opacity="0.18"
      stroke="#FDBA74"
      stroke-opacity="0.5"
      stroke-width="2"
    />

    <line
      x1="0"
      y1="${Math.round(h * 0.62)}"
      x2="${w}"
      y2="${Math.round(h * 0.56)}"
      stroke="#60A5FA"
      stroke-opacity="0.4"
      stroke-width="2"
    />
  `;
}

/**
 * विषय के हिसाब से अलग-अलग SVG विजुअल।
 * यह बैकग्राउंड के ऊपर मुख्य विषय का विजुअल जोड़ता है।
 */
function buildSubjectVisualLayer(
  w: number,
  h: number,
  subject: SceneVisualSubject,
  sceneNumber: number,
  cartoon = false
): string {
  const cx = Math.round(w * 0.5);
  const cy = Math.round(h * 0.39);
  const s = Math.round(Math.min(w, h) * 0.14);
  const stroke = cartoon ? '#0F172A' : '#BFDBFE';
  const strokeWidth = cartoon ? 7 : 3;
  const accent = sceneNumber % 2 === 0 ? '#F97316' : '#38BDF8';

  let visual = '';

  switch (subject) {
    case 'chandrayaan':
    case 'rocket':
      visual = `
        <g transform="translate(${cx},${cy}) rotate(-18)">
          <ellipse cx="0" cy="0" rx="${s * 0.85}" ry="${s * 1.65}"
            fill="#CBD5E1" stroke="${stroke}" stroke-width="${strokeWidth}"/>
          <path d="M 0 ${-s * 2.1}
            Q ${s * 0.7} ${-s * 1.4} ${s * 0.55} ${-s * 0.65}
            L ${s * 0.55} ${s * 0.8}
            L ${-s * 0.55} ${s * 0.8}
            L ${-s * 0.55} ${-s * 0.65}
            Q ${-s * 0.7} ${-s * 1.4} 0 ${-s * 2.1} Z"
            fill="#E2E8F0" stroke="${stroke}" stroke-width="${strokeWidth}"/>
          <path d="M ${-s * 0.55} ${s * 0.45}
            L ${-s * 1.15} ${s * 1.25}
            L ${-s * 0.48} ${s * 1.05} Z"
            fill="#F97316" stroke="${stroke}" stroke-width="${strokeWidth}"/>
          <path d="M ${s * 0.55} ${s * 0.45}
            L ${s * 1.15} ${s * 1.25}
            L ${s * 0.48} ${s * 1.05} Z"
            fill="#F97316" stroke="${stroke}" stroke-width="${strokeWidth}"/>
          <path d="M ${-s * 0.3} ${s * 0.85}
            Q 0 ${s * 2.0} ${s * 0.3} ${s * 0.85}
            Q 0 ${s * 2.8} ${-s * 0.3} ${s * 0.85}"
            fill="#F59E0B" opacity="0.9"/>
          <circle cx="0" cy="${-s * 0.35}" r="${s * 0.19}"
            fill="#38BDF8" stroke="${stroke}" stroke-width="3"/>
        </g>
      `;
      break;

    case 'moon':
      visual = `
        <circle cx="${cx}" cy="${cy}" r="${s * 1.2}"
          fill="#E2E8F0" stroke="${stroke}" stroke-width="${strokeWidth}"/>
        <circle cx="${cx - s * 0.35}" cy="${cy - s * 0.25}" r="${s * 0.2}" fill="#94A3B8"/>
        <circle cx="${cx + s * 0.4}" cy="${cy + s * 0.25}" r="${s * 0.15}" fill="#64748B"/>
        <circle cx="${cx - s * 0.15}" cy="${cy + s * 0.5}" r="${s * 0.12}" fill="#94A3B8"/>
      `;
      break;

    case 'tajmahal':
      visual = `
        <g transform="translate(${cx},${cy})">
          <rect x="${-s * 1.5}" y="${-s * 0.1}" width="${s * 3}" height="${s * 1.15}"
            fill="#F8FAFC" stroke="${stroke}" stroke-width="${strokeWidth}"/>
          <path d="M ${-s * 0.75} ${-s * 0.1}
            Q 0 ${-s * 1.75} ${s * 0.75} ${-s * 0.1} Z"
            fill="#FDE68A" stroke="${stroke}" stroke-width="${strokeWidth}"/>
          <rect x="${-s * 0.18}" y="${s * 0.35}" width="${s * 0.36}" height="${s * 0.7}" fill="#1E3A8A"/>
          <rect x="${-s * 1.8}" y="${-s * 0.55}" width="${s * 0.24}" height="${s * 1.6}" fill="#CBD5E1"/>
          <rect x="${s * 1.56}" y="${-s * 0.55}" width="${s * 0.24}" height="${s * 1.6}" fill="#CBD5E1"/>
          <path d="M ${-s * 1.95} ${-s * 0.55} Q ${-s * 1.68} ${-s * 1.05} ${-s * 1.41} ${-s * 0.55}"
            fill="#F8FAFC"/>
          <path d="M ${s * 1.41} ${-s * 0.55} Q ${s * 1.68} ${-s * 1.05} ${s * 1.95} ${-s * 0.55}"
            fill="#F8FAFC"/>
        </g>
      `;
      break;

    case 'fort':
      visual = `
        <g transform="translate(${cx},${cy})">
          <rect x="${-s * 1.5}" y="${-s * 0.4}" width="${s * 3}" height="${s * 1.5}"
            fill="#B45309" stroke="${stroke}" stroke-width="${strokeWidth}"/>
          <path d="M ${-s * 1.5} ${-s * 0.4}
            L ${-s * 1.5} ${-s * 0.8}
            L ${-s * 1.1} ${-s * 0.8}
            L ${-s * 1.1} ${-s * 0.4}
            L ${-s * 0.6} ${-s * 0.4}
            L ${-s * 0.6} ${-s * 0.8}
            L ${-s * 0.2} ${-s * 0.8}
            L ${-s * 0.2} ${-s * 0.4}
            L ${s * 0.2} ${-s * 0.4}
            L ${s * 0.2} ${-s * 0.8}
            L ${s * 0.6} ${-s * 0.8}
            L ${s * 0.6} ${-s * 0.4}
            L ${s * 1.1} ${-s * 0.4}
            L ${s * 1.1} ${-s * 0.8}
            L ${s * 1.5} ${-s * 0.8}
            L ${s * 1.5} ${-s * 0.4} Z"
            fill="#D97706" stroke="${stroke}" stroke-width="${strokeWidth}"/>
          <path d="M ${-s * 0.35} ${s * 1.1} L ${-s * 0.35} ${s * 0.3}
            Q 0 ${-s * 0.1} ${s * 0.35} ${s * 0.3}
            L ${s * 0.35} ${s * 1.1} Z" fill="#0F172A"/>
        </g>
      `;
      break;

    case 'temple':
      visual = `
        <g transform="translate(${cx},${cy})">
          <rect x="${-s}" y="${-s * 0.1}" width="${s * 2}" height="${s * 1.1}"
            fill="#F59E0B" stroke="${stroke}" stroke-width="${strokeWidth}"/>
          <path d="M ${-s * 0.75} ${-s * 0.1}
            L ${-s * 0.5} ${-s * 0.75}
            L ${-s * 0.25} ${-s * 0.1}
            L 0 ${-s * 1.2}
            L ${s * 0.25} ${-s * 0.1}
            L ${s * 0.5} ${-s * 0.75}
            L ${s * 0.75} ${-s * 0.1} Z"
            fill="#FBBF24" stroke="${stroke}" stroke-width="${strokeWidth}"/>
          <rect x="${-s * 0.2}" y="${s * 0.35}" width="${s * 0.4}" height="${s * 0.65}" fill="#7C2D12"/>
        </g>
      `;
      break;

    case 'ai_chip':
      visual = `
        <g transform="translate(${cx},${cy})">
          <rect x="${-s}" y="${-s}" width="${s * 2}" height="${s * 2}" rx="${s * 0.2}"
            fill="#1D4ED8" stroke="${stroke}" stroke-width="${strokeWidth}"/>
          ${Array.from({ length: 5 }, (_, i) => `
            <line x1="${-s * 0.75 + i * s * 0.38}" y1="${-s * 1.35}"
              x2="${-s * 0.75 + i * s * 0.38}" y2="${-s}"
              stroke="#93C5FD" stroke-width="5"/>
            <line x1="${-s * 0.75 + i * s * 0.38}" y1="${s}"
              x2="${-s * 0.75 + i * s * 0.38}" y2="${s * 1.35}"
              stroke="#93C5FD" stroke-width="5"/>
          `).join('')}
          <text x="0" y="${s * 0.2}" text-anchor="middle"
            font-size="${s * 0.65}" font-weight="bold" fill="#FFFFFF">AI</text>
        </g>
      `;
      break;

    case 'robot':
      visual = `
        <g transform="translate(${cx},${cy})">
          <rect x="${-s}" y="${-s * 0.85}" width="${s * 2}" height="${s * 1.55}"
            rx="${s * 0.25}" fill="#94A3B8" stroke="${stroke}" stroke-width="${strokeWidth}"/>
          <rect x="${-s * 0.65}" y="${-s * 0.5}" width="${s * 1.3}" height="${s * 0.65}"
            rx="10" fill="#0F172A"/>
          <circle cx="${-s * 0.3}" cy="${-s * 0.18}" r="${s * 0.12}" fill="#38BDF8"/>
          <circle cx="${s * 0.3}" cy="${-s * 0.18}" r="${s * 0.12}" fill="#38BDF8"/>
          <path d="M ${-s * 0.3} ${s * 0.35} Q 0 ${s * 0.55} ${s * 0.3} ${s * 0.35}"
            fill="none" stroke="#0F172A" stroke-width="5"/>
          <line x1="0" y1="${-s * 0.85}" x2="0" y2="${-s * 1.25}" stroke="${stroke}" stroke-width="6"/>
          <circle cx="0" cy="${-s * 1.35}" r="${s * 0.12}" fill="#F97316"/>
        </g>
      `;
      break;

    case 'smartphone':
      visual = `
        <g transform="translate(${cx},${cy})">
          <rect x="${-s * 0.65}" y="${-s * 1.35}" width="${s * 1.3}" height="${s * 2.7}"
            rx="${s * 0.2}" fill="#111827" stroke="${stroke}" stroke-width="${strokeWidth}"/>
          <rect x="${-s * 0.52}" y="${-s * 1.12}" width="${s * 1.04}" height="${s * 2.25}"
            rx="8" fill="#2563EB"/>
          <circle cx="0" cy="${s * 1.2}" r="${s * 0.09}" fill="#CBD5E1"/>
          <rect x="${-s * 0.25}" y="${-s * 0.45}" width="${s * 0.5}" height="${s * 0.5}"
            rx="8" fill="#FFFFFF" fill-opacity="0.85"/>
        </g>
      `;
      break;

    case 'upi':
      visual = `
        <g transform="translate(${cx},${cy})">
          <rect x="${-s * 1.2}" y="${-s * 0.8}" width="${s * 2.4}" height="${s * 1.6}"
            rx="${s * 0.2}" fill="#0F766E" stroke="${stroke}" stroke-width="${strokeWidth}"/>
          <path d="M ${-s * 0.15} ${-s * 0.55}
            L ${s * 0.35} ${-s * 0.05}
            L ${s * 0.05} ${-s * 0.05}
            L ${s * 0.25} ${s * 0.5}
            L ${-s * 0.4} ${-s * 0.15}
            L ${-s * 0.1} ${-s * 0.15} Z"
            fill="#FDE047"/>
          <rect x="${-s * 0.85}" y="${s * 0.35}" width="${s * 0.55}" height="6" fill="#FFFFFF"/>
        </g>
      `;
      break;

    case 'dna':
      visual = `
        <g transform="translate(${cx},${cy})">
          <path d="M ${-s * 0.55} ${-s * 1.2}
            C ${s * 1.1} ${-s * 0.6}, ${-s * 1.1} ${s * 0.6}, ${s * 0.55} ${s * 1.2}"
            fill="none" stroke="#38BDF8" stroke-width="12"/>
          <path d="M ${s * 0.55} ${-s * 1.2}
            C ${-s * 1.1} ${-s * 0.6}, ${s * 1.1} ${s * 0.6}, ${-s * 0.55} ${s * 1.2}"
            fill="none" stroke="#F97316" stroke-width="12"/>
          ${Array.from({ length: 7 }, (_, i) => {
            const y = -s * 0.95 + i * s * 0.31;
            const x1 = Math.sin(i * 0.8) * s * 0.45;
            const x2 = -x1;
            return `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}"
              stroke="#E2E8F0" stroke-width="5"/>`;
          }).join('')}
        </g>
      `;
      break;

    case 'brain':
      visual = `
        <g transform="translate(${cx},${cy})">
          <path d="M 0 ${-s * 1.1}
            C ${-s * 1.2} ${-s * 1.4}, ${-s * 1.4} ${-s * 0.4}, ${-s * 0.85} 0
            C ${-s * 1.4} ${s * 0.8}, ${-s * 0.4} ${s * 1.25}, 0 ${s * 0.85}
            C ${s * 0.4} ${s * 1.25}, ${s * 1.4} ${s * 0.8}, ${s * 0.85} 0
            C ${s * 1.4} ${-s * 0.4}, ${s * 1.2} ${-s * 1.4}, 0 ${-s * 1.1} Z"
            fill="#F9A8D4" stroke="${stroke}" stroke-width="${strokeWidth}"/>
          <path d="M 0 ${-s * 0.95} L 0 ${s * 0.8}
            M ${-s * 0.65} ${-s * 0.45} Q 0 ${-s * 0.2} ${-s * 0.6} ${s * 0.25}
            M ${s * 0.65} ${-s * 0.45} Q 0 ${-s * 0.2} ${s * 0.6} ${s * 0.25}"
            fill="none" stroke="#BE185D" stroke-width="5"/>
        </g>
      `;
      break;

    case 'atom':
      visual = `
        <g transform="translate(${cx},${cy})">
          <ellipse rx="${s * 1.45}" ry="${s * 0.55}" fill="none" stroke="#38BDF8" stroke-width="7"/>
          <ellipse rx="${s * 1.45}" ry="${s * 0.55}" transform="rotate(60)" fill="none" stroke="#F97316" stroke-width="7"/>
          <ellipse rx="${s * 1.45}" ry="${s * 0.55}" transform="rotate(120)" fill="none" stroke="#34D399" stroke-width="7"/>
          <circle r="${s * 0.22}" fill="#FDE047"/>
        </g>
      `;
      break;

    case 'medical':
      visual = `
        <g transform="translate(${cx},${cy})">
          <rect x="${-s * 0.35}" y="${-s * 1.1}" width="${s * 0.7}" height="${s * 2.2}"
            rx="10" fill="#F8FAFC" stroke="${stroke}" stroke-width="${strokeWidth}"/>
          <rect x="${-s * 1.1}" y="${-s * 0.35}" width="${s * 2.2}" height="${s * 0.7}"
            rx="10" fill="#F8FAFC" stroke="${stroke}" stroke-width="${strokeWidth}"/>
          <circle r="${s * 1.25}" fill="none" stroke="#10B981" stroke-width="8"/>
        </g>
      `;
      break;

    case 'river':
      visual = `
        <path d="M ${cx - s * 1.8} ${cy - s * 1.1}
          Q ${cx + s * 0.3} ${cy - s * 0.6} ${cx - s * 0.4} ${cy}
          Q ${cx - s * 1.1} ${cy + s * 0.6} ${cx + s * 1.8} ${cy + s * 1.1}
          L ${cx + s * 1.8} ${cy + s * 1.6}
          Q ${cx - s * 1.2} ${cy + s * 1.1} ${cx - s * 0.3} ${cy}
          Q ${cx + s * 0.4} ${cy - s * 0.6} ${cx - s * 1.8} ${cy - s * 0.6} Z"
          fill="#38BDF8" stroke="${stroke}" stroke-width="${strokeWidth}"/>
      `;
      break;

    case 'forest':
      visual = `
        ${[-1.1, -0.35, 0.4, 1.1].map((x, i) => `
          <rect x="${cx + x * s - 7}" y="${cy + s * 0.25}" width="14" height="${s * 1.0}" fill="#78350F"/>
          <polygon points="
            ${cx + x * s},${cy - s * (1.3 + (i % 2) * 0.2)}
            ${cx + x * s - s * 0.65},${cy + s * 0.35}
            ${cx + x * s + s * 0.65},${cy + s * 0.35}"
            fill="${i % 2 === 0 ? '#16A34A' : '#15803D'}"
            stroke="${stroke}" stroke-width="${strokeWidth}"/>
        `).join('')}
      `;
      break;

    case 'mountain':
      visual = `
        <polygon points="
          ${cx - s * 1.8},${cy + s * 1.1}
          ${cx - s * 0.55},${cy - s * 1.35}
          ${cx + s * 0.1},${cy + s * 1.1}"
          fill="#64748B" stroke="${stroke}" stroke-width="${strokeWidth}"/>
        <polygon points="
          ${cx - s * 0.3},${cy + s * 1.1}
          ${cx + s * 0.75},${cy - s * 1.65}
          ${cx + s * 1.9},${cy + s * 1.1}"
          fill="#475569" stroke="${stroke}" stroke-width="${strokeWidth}"/>
        <path d="M ${cx - s * 0.8} ${cy - s * 0.85}
          L ${cx - s * 0.55} ${cy - s * 1.35}
          L ${cx - s * 0.25} ${cy - s * 0.8}
          M ${cx + s * 0.4} ${cy - s * 0.8}
          L ${cx + s * 0.75} ${cy - s * 1.65}
          L ${cx + s * 1.1} ${cy - s * 0.8}"
          fill="#FFFFFF" stroke="#FFFFFF" stroke-width="5"/>
      `;
      break;

    case 'ocean':
      visual = `
        <path d="M ${cx - s * 1.8} ${cy - s * 0.4}
          Q ${cx - s * 0.9} ${cy - s * 1.1} ${cx} ${cy - s * 0.4}
          T ${cx + s * 1.8} ${cy - s * 0.4}
          L ${cx + s * 1.8} ${cy + s * 1.2}
          L ${cx - s * 1.8} ${cy + s * 1.2} Z"
          fill="#0284C7" stroke="${stroke}" stroke-width="${strokeWidth}"/>
        <path d="M ${cx - s * 1.5} ${cy + s * 0.15}
          Q ${cx - s * 0.8} ${cy - s * 0.25} ${cx} ${cy + s * 0.15}
          T ${cx + s * 1.5} ${cy + s * 0.15}"
          fill="none" stroke="#E0F2FE" stroke-width="8"/>
      `;
      break;

    case 'solar':
      visual = `
        <circle cx="${cx}" cy="${cy - s * 0.55}" r="${s * 0.65}" fill="#FBBF24"/>
        ${Array.from({ length: 8 }, (_, i) => {
          const a = (Math.PI * 2 * i) / 8;
          const x1 = cx + Math.cos(a) * s * 0.85;
          const y1 = cy - s * 0.55 + Math.sin(a) * s * 0.85;
          const x2 = cx + Math.cos(a) * s * 1.15;
          const y2 = cy - s * 0.55 + Math.sin(a) * s * 1.15;
          return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#FDE68A" stroke-width="7"/>`;
        }).join('')}
        <polygon points="
          ${cx - s * 1.4},${cy + s * 0.4}
          ${cx + s * 1.4},${cy + s * 0.4}
          ${cx + s * 1.1},${cy + s * 1.25}
          ${cx - s * 1.1},${cy + s * 1.25}"
          fill="#1D4ED8" stroke="${stroke}" stroke-width="${strokeWidth}"/>
        <line x1="${cx}" y1="${cy + s * 0.4}" x2="${cx}" y2="${cy + s * 1.25}" stroke="#93C5FD" stroke-width="5"/>
      `;
      break;

    case 'bank':
      visual = `
        <g transform="translate(${cx},${cy})">
          <polygon points="${-s * 1.5},${-s * 0.45} 0,${-s * 1.3} ${s * 1.5},${-s * 0.45}"
            fill="#FDE68A" stroke="${stroke}" stroke-width="${strokeWidth}"/>
          <rect x="${-s * 1.5}" y="${-s * 0.45}" width="${s * 3}" height="${s * 0.18}" fill="#F59E0B"/>
          ${[-1, -0.33, 0.33, 1].map((x) => `
            <rect x="${x * s - 7}" y="${-s * 0.25}" width="14" height="${s * 1.25}" fill="#E2E8F0"/>
          `).join('')}
          <rect x="${-s * 1.65}" y="${s}" width="${s * 3.3}" height="${s * 0.2}" fill="#F59E0B"/>
        </g>
      `;
      break;

    case 'stock':
      visual = `
        <g>
          <polyline
            points="${cx - s * 1.7},${cy + s * 0.65}
            ${cx - s * 1.0},${cy + s * 0.2}
            ${cx - s * 0.45},${cy + s * 0.45}
            ${cx + s * 0.25},${cy - s * 0.45}
            ${cx + s * 0.75},${cy - s * 0.15}
            ${cx + s * 1.6},${cy - s * 1.0}"
            fill="none" stroke="#34D399" stroke-width="12"
            stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M ${cx + s * 0.95} ${cy - s * 1.0}
            L ${cx + s * 1.6} ${cy - s * 1.0}
            L ${cx + s * 1.6} ${cy - s * 0.35}"
            fill="none" stroke="#34D399" stroke-width="12"/>
        </g>
      `;
      break;

    case 'currency':
      visual = `
        <g transform="translate(${cx},${cy})">
          <circle r="${s * 1.2}" fill="#FBBF24" stroke="${stroke}" stroke-width="${strokeWidth}"/>
          <text x="0" y="${s * 0.42}" text-anchor="middle"
            font-size="${s * 1.25}" font-weight="bold" fill="#78350F">₹</text>
        </g>
      `;
      break;

    case 'farm':
      visual = `
        <g>
          <circle cx="${cx + s * 1.25}" cy="${cy - s * 1.1}" r="${s * 0.42}" fill="#FBBF24"/>
          <path d="M ${cx - s * 2.2} ${cy + s * 1.05} Q ${cx} ${cy + s * 0.1} ${cx + s * 2.2} ${cy + s * 1.05} L ${cx + s * 2.2} ${cy + s * 1.8} L ${cx - s * 2.2} ${cy + s * 1.8} Z" fill="#15803D"/>
          <path d="M ${cx - s * 1.7} ${cy + s * 1.7} Q ${cx} ${cy + s * 0.65} ${cx + s * 1.7} ${cy + s * 1.7}" fill="none" stroke="#86EFAC" stroke-width="10"/>
          <g transform="translate(${cx},${cy + s * 0.15})">
            <circle cx="${-s * 0.85}" cy="${s * 0.95}" r="${s * 0.38}" fill="#0F172A" stroke="#CBD5E1" stroke-width="5"/>
            <circle cx="${s * 0.75}" cy="${s * 0.95}" r="${s * 0.27}" fill="#0F172A" stroke="#CBD5E1" stroke-width="5"/>
            <rect x="${-s * 1.05}" y="${s * 0.1}" width="${s * 1.8}" height="${s * 0.55}" rx="10" fill="#F97316" stroke="${stroke}" stroke-width="5"/>
            <rect x="${-s * 0.35}" y="${-s * 0.55}" width="${s * 0.85}" height="${s * 0.7}" rx="8" fill="#38BDF8" stroke="${stroke}" stroke-width="5"/>
          </g>
        </g>
      `;
      break;

    case 'education':
      visual = `
        <g transform="translate(${cx},${cy})">
          <path d="M ${-s * 1.9} ${-s * 0.65} L 0 ${-s * 1.45} L ${s * 1.9} ${-s * 0.65} L 0 ${s * 0.15} Z" fill="#FBBF24" stroke="${stroke}" stroke-width="${strokeWidth}"/>
          <path d="M ${-s * 1.25} ${-s * 0.35} V ${s * 1.15} Q 0 ${s * 1.8} ${s * 1.25} ${s * 1.15} V ${-s * 0.35}" fill="#2563EB" stroke="${stroke}" stroke-width="${strokeWidth}"/>
          <path d="M ${s * 1.9} ${-s * 0.65} V ${s * 0.65}" stroke="#F97316" stroke-width="8"/>
          <circle cx="${s * 1.9}" cy="${s * 0.78}" r="10" fill="#F97316"/>
        </g>
      `;
      break;

    case 'sports':
      visual = `
        <g transform="translate(${cx},${cy})">
          <circle r="${s * 1.25}" fill="#F8FAFC" stroke="${stroke}" stroke-width="${strokeWidth}"/>
          <path d="M 0 ${-s * 0.48} L ${s * 0.46} ${-s * 0.15} L ${s * 0.28} ${s * 0.4} L ${-s * 0.28} ${s * 0.4} L ${-s * 0.46} ${-s * 0.15} Z" fill="#1E293B"/>
          <path d="M 0 ${-s * 0.48} L 0 ${-s * 1.2} M ${s * 0.46} ${-s * 0.15} L ${s * 1.18} ${-s * 0.38} M ${s * 0.28} ${s * 0.4} L ${s * 0.72} ${s * 1.02} M ${-s * 0.28} ${s * 0.4} L ${-s * 0.72} ${s * 1.02} M ${-s * 0.46} ${-s * 0.15} L ${-s * 1.18} ${-s * 0.38}" fill="none" stroke="#1E293B" stroke-width="7"/>
        </g>
      `;
      break;

    default:
      visual = `
        <circle cx="${cx}" cy="${cy}" r="${s}" fill="${accent}" fill-opacity="0.7"
          stroke="${stroke}" stroke-width="${strokeWidth}"/>
        <circle cx="${cx}" cy="${cy}" r="${s * 0.45}" fill="#FFFFFF" fill-opacity="0.5"/>
      `;
      break;
  }

  return `
    <g>
      <circle
        cx="${cx}" cy="${cy}"
        r="${s * 2.1}"
        fill="${accent}"
        fill-opacity="${cartoon ? '0.12' : '0.10'}"
      />
      ${visual}
    </g>
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
      <circle cx="${cx}" cy="${cy}" r="${r}"
        fill="#FDE047" stroke="#0F172A" stroke-width="6"/>
      <circle cx="${cx - Math.round(r * 0.28)}"
        cy="${cy - Math.round(r * 0.18)}"
        r="${Math.round(r * 0.18)}"
        fill="#FACC15" stroke="#0F172A" stroke-width="4"/>
      <ellipse cx="${cx}" cy="${cy}"
        rx="${Math.round(r * 1.55)}"
        ry="${Math.round(r * 0.35)}"
        transform="rotate(-14 ${cx} ${cy})"
        fill="none" stroke="#FB923C" stroke-width="9"/>
    `;
  } else if (theme === 'monument') {
    accentObject = `
      <circle cx="${cx}" cy="${cy - 30}"
        r="${Math.round(r * 0.75)}"
        fill="#FEF08A" stroke="#0F172A" stroke-width="6"/>
      <rect x="${cx - r}" y="${cy - 20}"
        width="${r * 2}" height="${Math.round(r * 0.9)}"
        rx="14" fill="#FFFFFF"
        stroke="#0F172A" stroke-width="6"/>
      <path
        d="M ${cx - 42} ${cy + Math.round(r * 0.7)}
        L ${cx - 42} ${cy + 15}
        Q ${cx} ${cy - 30} ${cx + 42} ${cy + 15}
        L ${cx + 42} ${cy + Math.round(r * 0.7)} Z"
        fill="#1E3A8A" stroke="#0F172A" stroke-width="5"
      />
    `;
  } else if (theme === 'tech' || theme === 'science') {
    accentObject = `
      <rect x="${cx - r}" y="${cy - r}"
        width="${r * 2}" height="${r * 2}"
        rx="34" fill="#38BDF8"
        stroke="#0F172A" stroke-width="6"/>
      <circle cx="${cx - Math.round(r * 0.38)}"
        cy="${cy - Math.round(r * 0.2)}"
        r="20" fill="#FFFFFF" stroke="#0F172A" stroke-width="5"/>
      <circle cx="${cx + Math.round(r * 0.38)}"
        cy="${cy - Math.round(r * 0.2)}"
        r="20" fill="#FFFFFF" stroke="#0F172A" stroke-width="5"/>
      <path d="M ${cx - 45} ${cy + 35}
        Q ${cx} ${cy + 72} ${cx + 45} ${cy + 35}"
        fill="none" stroke="#0F172A"
        stroke-width="7" stroke-linecap="round"/>
    `;
  } else {
    accentObject = `
      <circle cx="${cx}" cy="${cy - 25}"
        r="${Math.round(r * 0.85)}"
        fill="#FB923C" stroke="#0F172A" stroke-width="6"/>
      <ellipse cx="${Math.round(w * 0.24)}"
        cy="${Math.round(h * 0.26)}"
        rx="68" ry="34"
        fill="#FFFFFF" stroke="#0F172A" stroke-width="5"/>
      <ellipse cx="${Math.round(w * 0.76)}"
        cy="${Math.round(h * 0.3)}"
        rx="74" ry="36"
        fill="#FFFFFF" stroke="#0F172A" stroke-width="5"/>
      <path
        d="M 0 ${Math.round(h * 0.62)}
        Q ${Math.round(w * 0.28)} ${Math.round(h * 0.48)}
        ${Math.round(w * 0.56)} ${Math.round(h * 0.6)}
        T ${w} ${Math.round(h * 0.55)}
        L ${w} ${h} L 0 ${h} Z"
        fill="#22C55E" stroke="#0F172A" stroke-width="6"
      />
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

    <circle
      cx="${Math.round(w * 0.16) + starOffset}"
      cy="${Math.round(h * 0.2)}"
      r="12"
      fill="#FDE047"
      stroke="#0F172A"
      stroke-width="3"
    />

    <circle
      cx="${Math.round(w * 0.82) - starOffset}"
      cy="${Math.round(h * 0.24)}"
      r="15"
      fill="#FDE047"
      stroke="#0F172A"
      stroke-width="3"
    />

    ${accentObject}
  `;
}

function buildInfographicLayer(
  w: number,
  h: number,
  sceneNumber: number
): string {
  const cx = Math.round(w * 0.5);
  const cy = Math.round(h * 0.4);
  const r = Math.round(Math.min(w, h) * 0.22);

  const bars = [120, 210, 175, 290, 250].map((bh, idx) => {
    const x = Math.round(w * 0.18) + idx * Math.round(w * 0.14);
    const y = Math.round(h * 0.58) - Math.round(bh * (h > w ? 0.9 : 0.62));
    const fill = idx % 2 === 0 ? '#38BDF8' : '#F97316';

    return `<rect
      x="${x}" y="${y}"
      width="${Math.round(w * 0.08)}"
      height="${Math.round(h * 0.58) - y}"
      rx="8"
      fill="${fill}"
      fill-opacity="0.88"
    />`;
  }).join('');

  return `
    <defs>
      <linearGradient id="infoBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#020617"/>
        <stop offset="100%" stop-color="#0F172A"/>
      </linearGradient>
    </defs>

    <rect width="${w}" height="${h}" fill="url(#infoBg)"/>

    <circle
      cx="${cx}" cy="${cy}" r="${r}"
      fill="none" stroke="#1E3A8A" stroke-width="18"
    />

    <circle
      cx="${cx}" cy="${cy}" r="${r}"
      fill="none" stroke="#38BDF8" stroke-width="10"
      stroke-dasharray="${180 + sceneNumber * 28} 400"
    />

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
  const {
    width,
    height,
    visualPrompt,
    voiceScript,
    style,
    videoType = '3d_realistic',
    sceneNumber
  } = params;

  const primaryDetect = detectSceneTheme(visualPrompt);

  const combinedText = `${visualPrompt} ${voiceScript} ${style}`;

  const theme =
    primaryDetect !== 'studio'
      ? primaryDetect
      : detectSceneTheme(`${voiceScript} ${style}`);

  const subject = detectSceneSubject(combinedText);

  if (videoType === 'cartoon_2d') {
    const cartoonBackground = buildCartoonSceneLayer(
      width,
      height,
      theme,
      sceneNumber
    );

    const subjectVisual = buildSubjectVisualLayer(
      width,
      height,
      subject,
      sceneNumber,
      true
    );

    return `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="${width}"
        height="${height}"
        viewBox="0 0 ${width} ${height}"
      >
        ${cartoonBackground}
        ${subjectVisual}
      </svg>
    `;
  }

  if (videoType === 'cinematic_infographic') {
    const infographicBackground = buildInfographicLayer(
      width,
      height,
      sceneNumber
    );

    const subjectVisual = buildSubjectVisualLayer(
      width,
      height,
      subject,
      sceneNumber
    );

    return `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="${width}"
        height="${height}"
        viewBox="0 0 ${width} ${height}"
      >
        ${infographicBackground}
        ${subjectVisual}
      </svg>
    `;
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

  // Specific subject visual overlay
  inner += buildSubjectVisualLayer(
    width,
    height,
    subject,
    sceneNumber
  );

  if (videoType === '2_5d_parallax') {
    inner += build25DParallaxAccent(
      width,
      height,
      sceneNumber
    );
  }

  return `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="${width}"
      height="${height}"
      viewBox="0 0 ${width} ${height}"
    >
      ${inner}
    </svg>
  `;
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

function splitAnimatedChunks(
  displayText: string,
  maxCharsPerLine: number
): string[][] {
  const explicitLines = displayText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const allLines: string[] = [];

  for (const seg of explicitLines) {
    const words = seg.split(/\s+/).filter(Boolean);
    let current = '';

    for (const w of words) {
      const next = current ? `${current} ${w}` : w;

      if (next.length <= maxCharsPerLine) {
        current = next;
      } else {
        if (current) {
          allLines.push(current);
        }

        current =
          w.length > maxCharsPerLine
            ? w.slice(0, maxCharsPerLine)
            : w;
      }
    }

    if (current) {
      allLines.push(current);
    }
  }

  const chunks: string[][] = [];

  for (let i = 0; i < allLines.length; i += 3) {
    chunks.push(allLines.slice(i, i + 3));
  }

  return chunks;
}

/**
 * टेक्स्ट और वॉइस के शब्दों को सामान्यीकृत करता है।
 * इससे punctuation के कारण matching fail नहीं होती।
 */
function normalizeTimingWord(word: string): string {
  return word
    .toLocaleLowerCase()
    .replace(/[.,!?;:"'“”‘’()[\]{}<>।॥\-—_]/g, '')
    .trim();
}

function getTextWords(text: string): string[] {
  return text
    .replace(/\r?\n/g, ' ')
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean);
}

/**
 * स्क्रीन टेक्स्ट के शब्दों को वास्तविक voice timings से मिलाता है।
 * यदि दोनों के शब्द समान हैं तो वास्तविक offset और duration उपयोग होते हैं।
 */
function matchScreenWordsToVoiceTimings(
  screenWords: string[],
  voiceScript: string,
  wordTimings: VoiceWordTiming[]
): Array<VoiceWordTiming | null> {
  if (!screenWords.length || !wordTimings.length) {
    return screenWords.map(() => null);
  }

  const voiceWords = getTextWords(voiceScript);

  const normalizedScreen = screenWords.map(normalizeTimingWord);
  const normalizedVoice = voiceWords.map(normalizeTimingWord);
  const normalizedTiming = wordTimings.map((item) =>
    normalizeTimingWord(item.text)
  );

  // पहले जांचें कि स्क्रीन टेक्स्ट और वॉइस स्क्रिप्ट के शब्द समान क्रम में हैं।
  const sameWords =
    normalizedScreen.length === normalizedVoice.length &&
    normalizedScreen.every(
      (word, index) => word === normalizedVoice[index]
    );

  if (sameWords && wordTimings.length === screenWords.length) {
    const exactMatch = normalizedScreen.every(
      (word, index) => word === normalizedTiming[index]
    );

    if (exactMatch) {
      return screenWords.map((_, index) => wordTimings[index]);
    }
  }

  // स्क्रीन टेक्स्ट अलग है तो शब्दों को वास्तविक voice text में क्रम से खोजें।
  const matched: Array<VoiceWordTiming | null> = [];
  let timingCursor = 0;

  for (const screenWord of normalizedScreen) {
    let foundIndex = -1;

    for (
      let i = timingCursor;
      i < normalizedTiming.length;
      i++
    ) {
      if (
        screenWord &&
        normalizedTiming[i] &&
        screenWord === normalizedTiming[i]
      ) {
        foundIndex = i;
        break;
      }
    }

    if (foundIndex >= 0) {
      matched.push(wordTimings[foundIndex]);
      timingCursor = foundIndex + 1;
    } else {
      matched.push(null);
    }
  }

  return matched;
}

export function buildCaptionOverlaySvg(params: {
  width: number;
  height: number;
  isVertical: boolean;
  screenText: string;
  voiceScript: string;
}): string {
  const {
    width,
    height,
    isVertical,
    screenText,
    voiceScript
  } = params;

  const cleanText = screenText.trim();

  if (!cleanText) {
    return `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="${width}"
        height="${height}"
        viewBox="0 0 ${width} ${height}"
      ></svg>
    `;
  }

  const paddingX = isVertical ? 34 : 64;
  const maxChars = isVertical ? 26 : 46;
  const chunks = splitAnimatedChunks(cleanText, maxChars);

  const maxLinesShown = Math.min(
    3,
    Math.max(1, ...chunks.map((c) => c.length))
  );

  const fontSize = isVertical ? 36 : 40;
  const lineHeight = Math.round(fontSize * 1.42);
  const cardWidth = width - paddingX * 2;

  const cardHeight = Math.max(
    isVertical ? 148 : 128,
    maxLinesShown * lineHeight + 54
  );

  const bottomReserved = isVertical ? 154 : 34;
  const cardY = height - cardHeight - bottomReserved;

  return `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="${width}"
      height="${height}"
      viewBox="0 0 ${width} ${height}"
    >
      <rect
        x="${paddingX}"
        y="${cardY}"
        width="${cardWidth}"
        height="${cardHeight}"
        rx="20"
        fill="#060913"
        fill-opacity="0.76"
        stroke="#3B82F6"
        stroke-opacity="0.48"
        stroke-width="1.8"
      />
    </svg>
  `;
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
  const {
    width,
    height,
    isVertical,
    screenText,
    voiceScript,
    sceneDurationSec,
    wordTimings
  } = params;

  const cleanText = screenText.trim();

  if (!cleanText) return null;

  const sceneMs = Math.max(
    1000,
    Math.round(sceneDurationSec * 1000)
  );

  const maxChars = isVertical ? 26 : 46;
  const chunks = splitAnimatedChunks(cleanText, maxChars);

  if (chunks.length === 0) return null;

  const fontSize = isVertical ? 40 : 44;

  const maxLinesShown = Math.min(
    3,
    Math.max(1, ...chunks.map((c) => c.length))
  );

  const lineHeight = Math.round(fontSize * 1.38);

  const cardHeight = Math.max(
    isVertical ? 148 : 128,
    maxLinesShown * lineHeight + 54
  );

  const bottomReserved = isVertical ? 154 : 34;

  const cardCenterY =
    height -
    bottomReserved -
    Math.round(cardHeight / 2);

  const centerX = Math.round(width / 2);

  // Actual speech boundaries
  const validTimings = wordTimings
    .filter(
      (item) =>
        Number.isFinite(item.offsetMs) &&
        Number.isFinite(item.durationMs) &&
        item.durationMs > 0
    )
    .slice()
    .sort((a, b) => a.offsetMs - b.offsetMs);

  const speechStartMs =
    validTimings.length > 0
      ? Math.max(40, validTimings[0].offsetMs)
      : 120;

  const lastWord =
    validTimings[validTimings.length - 1];

  const speechEndMs = lastWord
    ? Math.min(
        sceneMs - 80,
        lastWord.offsetMs +
          Math.max(100, lastWord.durationMs) +
          120
      )
    : Math.max(800, sceneMs - 250);

  const totalSpeechSpanMs = Math.max(
    600,
    speechEndMs - speechStartMs
  );

  // Flatten displayed words and align them to voice timing.
  const allScreenWords = chunks.flatMap((lines) =>
    lines.flatMap((line) => line.split(/\s+/).filter(Boolean))
  );

  const matchedTimings = matchScreenWordsToVoiceTimings(
    allScreenWords,
    voiceScript,
    validTimings
  );

  const hasAnyRealMatch = matchedTimings.some(
    (item) => item !== null
  );

  const totalWeight = allScreenWords.reduce(
    (sum, word) => sum + Math.max(1, word.length),
    0
  );

  const fallbackWordTimings: VoiceWordTiming[] = [];

  let fallbackCursor = speechStartMs;

  allScreenWords.forEach((word) => {
    const duration = Math.max(
      80,
      Math.round(
        (Math.max(1, word.length) / Math.max(1, totalWeight)) *
          totalSpeechSpanMs
      )
    );

    fallbackWordTimings.push({
      offsetMs: fallbackCursor,
      durationMs: duration,
      text: word
    });

    fallbackCursor += duration;
  });

  // जिन शब्दों का exact match नहीं मिला, उनके लिए अनुमानित timing।
  const resolvedTimings = matchedTimings.map(
    (timing, index) =>
      timing || fallbackWordTimings[index]
  );

  const dialogueEvents: string[] = [];
  let globalWordIndex = 0;

  chunks.forEach((lines, chunkIndex) => {
    const chunkWords = lines.flatMap((line) =>
      line.split(/\s+/).filter(Boolean)
    );

    const chunkTimingStartIndex = globalWordIndex;
    const chunkTimings = resolvedTimings.slice(
      chunkTimingStartIndex,
      chunkTimingStartIndex + chunkWords.length
    );

    globalWordIndex += chunkWords.length;

    if (!chunkWords.length) return;

    const chunkStartMs = Math.max(
      0,
      chunkTimings[0]?.offsetMs ?? speechStartMs
    );

    const lastChunkTiming =
      chunkTimings[chunkTimings.length - 1];

    const chunkEndMs = Math.min(
      sceneMs - 40,
      lastChunkTiming
        ? lastChunkTiming.offsetMs +
            Math.max(100, lastChunkTiming.durationMs) +
            180
        : sceneMs - 40
    );

    const startMs = Math.min(
      sceneMs - 100,
      Math.max(0, chunkStartMs)
    );

    const endMs = Math.max(
      startMs + 300,
      chunkEndMs
    );

    // Actual word timing based karaoke.
    let localWordIndex = 0;

    const animatedLines = lines.map((line) => {
      const words = line.split(/\s+/).filter(Boolean);

      const animatedWords = words.map((word) => {
        const currentTiming =
          chunkTimings[localWordIndex];

        const nextTiming =
          chunkTimings[localWordIndex + 1];

        localWordIndex++;

        const currentStart =
          currentTiming?.offsetMs ?? startMs;

        const currentDuration = Math.max(
          60,
          currentTiming?.durationMs ?? 120
        );

        // वास्तविक pause को पिछले karaoke word में जोड़ें।
        const nextStart = nextTiming?.offsetMs;

        let karaokeDuration = currentDuration;

        if (
          typeof nextStart === 'number' &&
          nextStart > currentStart + currentDuration
        ) {
          karaokeDuration +=
            nextStart - (currentStart + currentDuration);
        }

        // ASS karaoke duration centiseconds में होता है।
        const cs = Math.max(
          6,
          Math.round(karaokeDuration / 10)
        );

        const safeWord = escapeAssText(word);

        return `{\\kf${cs}}${safeWord}`;
      });

      return animatedWords.join(' ');
    });

    const animTag =
      `{\\an5\\pos(${centerX},${cardCenterY})` +
      `\\fad(150,90)\\fscx90\\fscy90` +
      `\\t(0,210,\\fscx100\\fscy100)}`;

    const textBody =
      `${animTag}${animatedLines.join('\\N')}`;

    dialogueEvents.push(
      `Dialogue: 0,${formatAssTime(startMs)},${formatAssTime(endMs)},KineticCaption,,0,0,0,,${textBody}`
    );
  });

  if (!dialogueEvents.length) return null;

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
