export interface TopicFactsResult {
  topic: string;
  source: 'curated' | 'wikipedia_hi' | 'wikipedia_en' | 'structured';
  scenes: string[];
}

const CURATED_FACT_PACKS: Array<{ keywords: string[]; facts: string[] }> = [
  {
    keywords: ['ब्लैक होल', 'black hole', 'अंतरिक्ष', 'space', 'universe'],
    facts: [
      'अंतरिक्ष का सबसे बड़ा रहस्य ब्लैक होल है, जहाँ गुरुत्वाकर्षण इतना शक्तिशाली होता है कि प्रकाश भी बाहर नहीं निकल सकता।',
      'जब कोई विशाल तारा अपने जीवन के अंत में अपने ही भार से सिमट जाता है, तो सुपरनोवा विस्फोट के बाद ब्लैक होल बनता है।',
      'ब्लैक होल की बाहरी सीमा को इवेंट होराइज़न कहते हैं; इसके अंदर जाने वाली कोई भी चीज़ वापस नहीं लौट सकती।',
      'वैज्ञानिकों ने 2019 में इवेंट होराइज़न टेलीस्कोप की मदद से एम-87 आकाशगंगा के ब्लैक होल की पहली वास्तविक तस्वीर ली थी।',
      'हमारी मिल्की वे आकाशगंगा के केंद्र में भी सैजिटेरियस ए-स्टार नाम का एक विशाल सुपरमैसिव ब्लैक होल मौजूद है।',
      'ब्लैक होल के पास समय की गति सामान्य अंतरिक्ष की तुलना में बहुत धीमी हो जाती है, जिसे आइंस्टीन के सापेक्षता सिद्धांत से समझा जाता है।',
      'हॉकिंग रेडिएशन सिद्धांत के अनुसार, ब्लैक होल बेहद धीमी गति से ऊर्जा खोते हैं और अरबों वर्षों में वाष्पित हो सकते हैं।',
      'ब्रह्मांड के इन रहस्यों की खोज हमें अंतरिक्ष और समय के मूल नियमों को समझने में मदद करती है।',
    ],
  },
  {
    keywords: ['चंद्रयान', 'chandrayaan', 'चांद', 'moon', 'isro'],
    facts: [
      'भारत के इसरो द्वारा भेजा गया चंद्रयान-3 मिशन 23 अगस्त 2023 को चांद के दक्षिणी ध्रुव पर सफलतापूर्वक उतरा।',
      'इस ऐतिहासिक लैंडिंग के साथ भारत चांद के दक्षिणी ध्रुव के पास पहुंचने वाला दुनिया का पहला देश बन गया।',
      'मिशन के विक्रम लैंडर और प्रज्ञान रोवर ने चांद की सतह पर सल्फर, एल्यूमिनियम और ऑक्सीजन जैसे महत्वपूर्ण तत्वों की पुष्टि की।',
      'चंद्रयान-3 का कुल बजट लगभग 615 करोड़ रुपये था, जो हॉलीवुड की कई अंतरिक्ष फिल्मों से भी कम था।',
      'चांद के दक्षिणी ध्रुव पर हमेशा छाया रहने वाले गड्ढों में पानी की बर्फ मिलने की प्रबल संभावना है।',
      'प्रज्ञान रोवर ने 14 दिनों तक चांद की सतह पर चलकर भूकंपीय गतिविधियों और तापमान से जुड़ा अहम डेटा पृथ्वी पर भेजा।',
      'लैंडिंग स्थल को भारत सरकार ने शिव शक्ति पॉइंट नाम दिया और 23 अगस्त को राष्ट्रीय अंतरिक्ष दिवस घोषित किया गया।',
      'चंद्रयान की सफलता ने भारत को वैश्विक अंतरिक्ष महाशक्तियों की अग्रिम पंक्ति में खड़ा कर दिया है।',
    ],
  },
  {
    keywords: ['ai', 'artificial intelligence', 'एआई', 'मशीन लर्निंग', 'chatgpt'],
    facts: [
      'आर्टिफिशियल इंटेलिजेंस यानी एआई कंप्यूटर सिस्टम को इंसानों की तरह सीखने, समझने और निर्णय लेने की क्षमता देता है।',
      'एआई मॉडल करोड़ों डेटा उदाहरणों का विश्लेषण करके पैटर्न पहचानते हैं और उसी आधार पर सटीक उत्तर या तस्वीर बनाते हैं।',
      'मशीन लर्निंग और डीप लर्निंग में न्यूरल नेटवर्क का उपयोग होता है, जो मानव मस्तिष्क की संरचना से प्रेरित होते हैं।',
      'आज एआई का इस्तेमाल चिकित्सा में बीमारी पहचानने, खेती में मौसम अनुमान और शिक्षा में व्यक्तिगत ट्यूटर के रूप में हो रहा है।',
      'भारत में भी भाषिनी और स्थानीय भाषा मॉडलों के ज़रिए हिंदी व क्षेत्रीय भाषाओं में एआई सेवाएं तेजी से बढ़ रही हैं।',
      'सही प्रॉम्प्ट और सत्यापित जानकारी के साथ एआई आपकी उत्पादकता को कई गुना बढ़ा सकता है।',
      'विशेषज्ञों का मानना है कि भविष्य में एआई और मानवीय रचनात्मकता मिलकर नए रोजगार और अवसर पैदा करेंगे।',
      'तकनीक को सुरक्षित और उपयोगी बनाए रखने के लिए एआई का नैतिक उपयोग बेहद ज़रूरी है।',
    ],
  },
  {
    keywords: ['upi', 'डिजिटल', 'digital', 'भारत की डिजिटल', 'economy', 'अर्थव्यवस्था'],
    facts: [
      'यूनिफाइड पेमेंट्स इंटरफेस यानी यूपीआई ने भारत के डिजिटल भुगतान क्षेत्र में पूरी दुनिया के सामने एक मिसाल कायम की है।',
      'एनपीसीआई द्वारा 2016 में शुरू किया गया यूपीआई आज हर महीने अरबों रीयल-टाइम लेनदेन बिना किसी शुल्क के पूरा करता है।',
      'छोटे चाय विक्रेता से लेकर बड़े शोरूम तक, क्यूआर कोड स्कैन ने नकदी पर निर्भरता को तेजी से कम किया है।',
      'दुनिया के कुल रीयल-टाइम डिजिटल लेनदेन में भारत की हिस्सेदारी सबसे बड़े देशों में शीर्ष पर पहुंच चुकी है।',
      'सिंगापुर, यूएई, फ्रांस, मॉरीशस और श्रीलंका जैसे कई देशों में अब भारतीय यूपीआई से सीधा भुगतान संभव है।',
      'आधार, जन धन और मोबाइल की त्रिमूर्ति ने करोड़ों नागरिकों को औपचारिक बैंकिंग प्रणाली से जोड़ा है।',
      'डिजिटल पब्लिक इंफ्रास्ट्रक्चर ने स्टार्टअप और छोटे व्यापारियों के लिए नए डिजिटल बाजार खोल दिए हैं।',
      'भारत की यह डिजिटल क्रांति समावेशी विकास और आत्मनिर्भर तकनीक का मजबूत आधार बन चुकी है।',
    ],
  },
  {
    keywords: ['सुबह', 'morning', 'फायदे', 'स्वास्थ्य', 'health', 'उठने'],
    facts: [
      'सुबह जल्दी उठने से शरीर की जैविक घड़ी यानी सर्कैडियन रिदम संतुलित रहती है, जिससे दिन भर ऊर्जा बनी रहती है।',
      'सूर्योदय के समय की हल्की धूप शरीर में विटामिन-डी बनाती है और हड्डियों व रोग प्रतिरोधक क्षमता को मजबूत करती है।',
      'सुबह का शांत वातावरण मानसिक तनाव और कोर्टिसोल हार्मोन को कम करता है, जिससे एकाग्रता बेहतर होती है।',
      'प्रातःकाल 20 से 30 मिनट की तेज़ सैर या योग हृदय स्वास्थ्य और रक्त संचार को दुरुस्त रखता है।',
      'जल्दी उठने वाले लोगों को दिन की योजना बनाने और महत्वपूर्ण कार्य समय पर पूरा करने का अतिरिक्त समय मिलता है।',
      'सुबह समय पर पौष्टिक नाश्ता करने से मेटाबॉलिज्म सक्रिय होता है और पाचन तंत्र स्वस्थ रहता है।',
      'अच्छी नींद के लिए रात को सोने का समय तय रखना सुबह जल्दी जागने की सबसे प्रभावी आदत है।',
      'छोटी-छोटी नियमित सुबह की आदतें लंबे समय में स्वास्थ्य और सफलता दोनों में बड़ा बदलाव लाती हैं।',
    ],
  },
  {
    keywords: ['ताजमहल', 'taj mahal', 'आगरा', 'मुमताज'],
    facts: [
      'आगरा में यमुना नदी के किनारे स्थित ताजमहल दुनिया के सात अजूबों में से एक और भारत की विश्व धरोहर है।',
      'इसका निर्माण मुगल सम्राट शाहजहाँ ने 1632 ईस्वी में अपनी पत्नी मुमताज महल की याद में शुरू करवाया था।',
      'ताजमहल को बनाने में लगभग 22 वर्ष लगे और 20,000 से अधिक कुशल कारीगरों ने दिन-रात मेहनत की।',
      'इसकी मीनारों को बाहर की ओर हल्का झुकाकर बनाया गया है ताकि भूकंप आने पर वे मुख्य गुंबद पर न गिरें।',
      'सूर्योदय के समय ताजमहल गुलाबी, दोपहर में सफेद और चांदनी रात में सुनहरा दिखाई देता है।',
      'इसमें प्रयुक्त सफेद संगमरमर राजस्थान के मकराना से लाया गया था और पिएत्रा ड्यूरा तकनीक से नक्काशी की गई।',
      '1983 में यूनेस्को ने ताजमहल को विश्व धरोहर स्थल घोषित किया और हर साल करोड़ों पर्यटक इसे देखने आते हैं।',
      'ताजमहल भारतीय वास्तुकला, कला और ऐतिहासिक विरासत का एक अद्भुत उदाहरण है।',
    ],
  },
];

function cleanExtractSentences(rawText: string): string[] {
  return rawText
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\s+/g, ' ')
    .split(/(?<=[।.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 24 && s.length <= 220);
}

async function fetchWikipediaFacts(
  lang: 'hi' | 'en',
  topic: string
): Promise<string[]> {
  try {
    const searchUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      topic
    )}&srlimit=2&format=json`;
    const searchRes = await fetch(searchUrl, {
      headers: { 'User-Agent': 'HindiVideoStudio/1.0' },
    });
    if (!searchRes.ok) return [];
    const searchJson = (await searchRes.json()) as {
      query?: { search?: Array<{ title: string }> };
    };
    const firstTitle = searchJson?.query?.search?.[0]?.title;
    if (!firstTitle) return [];

    const extractUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
      firstTitle
    )}&prop=extracts&explaintext=1&exsectionformat=plain&format=json`;
    const extractRes = await fetch(extractUrl, {
      headers: { 'User-Agent': 'HindiVideoStudio/1.0' },
    });
    if (!extractRes.ok) return [];
    const extractJson = (await extractRes.json()) as {
      query?: { pages?: Record<string, { extract?: string }> };
    };
    const pages = Object.values(extractJson?.query?.pages || {});
    const fullText = pages[0]?.extract || '';
    if (!fullText) return [];

    return cleanExtractSentences(fullText).slice(0, 10);
  } catch {
    return [];
  }
}

function fitToSceneCount(facts: string[], sceneCount: number, topic: string): string[] {
  const result: string[] = [];
  for (let i = 0; i < sceneCount; i++) {
    if (i < facts.length) {
      result.push(facts[i]);
    } else if (i === sceneCount - 1) {
      result.push(
        `${topic} से जुड़ी यह महत्वपूर्ण जानकारी आपको कैसी लगी? वीडियो को लाइक और शेयर जरूर करें।`
      );
    } else {
      result.push(
        `${topic} का मुख्य तथ्य ${i + 1}: इस विषय से जुड़े वैज्ञानिक और व्यावहारिक पहलू बेहद रोचक हैं।`
      );
    }
  }
  return result;
}

export async function generateTopicFacts(
  topic: string,
  sceneCount: number,
  style: string
): Promise<TopicFactsResult> {
  const cleanTopic = topic.trim();
  const count = Math.min(8, Math.max(3, sceneCount || 5));
  const lower = cleanTopic.toLowerCase();

  // 1. Check curated rich Hindi fact packs first for instant zero-latency accuracy
  const matchedPack = CURATED_FACT_PACKS.find((pack) =>
    pack.keywords.some((kw) => lower.includes(kw.toLowerCase()))
  );
  if (matchedPack) {
    return {
      topic: cleanTopic,
      source: 'curated',
      scenes: fitToSceneCount(matchedPack.facts, count, cleanTopic),
    };
  }

  // 2. Query Hindi Wikipedia for real factual extracts
  const hiFacts = await fetchWikipediaFacts('hi', cleanTopic);
  if (hiFacts.length >= 2) {
    return {
      topic: cleanTopic,
      source: 'wikipedia_hi',
      scenes: fitToSceneCount(hiFacts, count, cleanTopic),
    };
  }

  // 3. Query English Wikipedia fallback
  const enFacts = await fetchWikipediaFacts('en', cleanTopic);
  if (enFacts.length >= 2) {
    return {
      topic: cleanTopic,
      source: 'wikipedia_en',
      scenes: fitToSceneCount(enFacts, count, cleanTopic),
    };
  }

  // 4. Structured bilingual fallback when no Wikipedia article matches
  const structured = [
    `${cleanTopic}: आइए आज इस महत्वपूर्ण विषय के बारे में विस्तार से जानते हैं।`,
    `मुख्य तथ्य 1: ${cleanTopic} का इतिहास और इसकी शुरुआत कैसे हुई, यह समझना बेहद जरूरी है।`,
    `मुख्य तथ्य 2: ${cleanTopic} से जुड़े प्रमुख कारण और वर्तमान समय में इसका प्रभाव बहुत बड़ा है।`,
    `मुख्य तथ्य 3: ${style} दृष्टिकोण से ${cleanTopic} के व्यावहारिक उदाहरण हमें नई सीख देते हैं।`,
    `मुख्य तथ्य 4: विशेषज्ञों के अनुसार आने वाले समय में ${cleanTopic} का महत्व और अधिक बढ़ेगा।`,
    `निष्कर्ष: ${cleanTopic} से जुड़ी यह जानकारी पसंद आई हो तो वीडियो को लाइक और सब्सक्राइब करें।`,
  ];

  return {
    topic: cleanTopic,
    source: 'structured',
    scenes: fitToSceneCount(structured, count, cleanTopic),
  };
}
