export const defaultContent = {
  hero_eyebrow: {
    fr: "UN PEU DE DESIGN. BEAUCOUP DE VOUS.",
    ar: "تصميم أنيق. على ذوقك.",
  },
  hero_headline: { fr: "Votre poids,", ar: "وزنك،" },
  hero_headline2: { fr: "votre style.", ar: "ستايلك." },
  hero_intro: {
    fr: "Choisissez une balance électronique PRIMA qui vous ressemble. Trois designs, un affichage numérique du poids, et la livraison incluse partout à Marrakech.",
    ar: "اختار ميزان إلكتروني PRIMA على ذوقك. ثلاثة تصاميم وعرض رقمي للوزن، والتوصيل علينا حتى لعندك فمراكش.",
  },
  collection_title: {
    fr: "Trois modèles. Votre signature.",
    ar: "ثلاثة موديلات. اختار اللي يناسبك.",
  },
  collection_intro: {
    fr: "Argenté ou noir, géométrique ou épuré : trouvez le design qui s’intègre à votre intérieur.",
    ar: "فضي ولا أسود، بخطوط ولا بسيط: اختار التصميم اللي يناسب دارك.",
  },
  seo_title: {
    fr: "Votre balance électronique à Marrakech, simplement.",
    ar: "ميزان إلكتروني فمراكش، بكل بساطة.",
  },
  seo_body: {
    fr: "Vous cherchez un pèse-personne à Marrakech pour suivre votre poids à la maison ? WZNI propose trois balances électroniques PRIMA : SILVER au décor géométrique, LED au design argenté avec une signature noire, et BLACK aux motifs blancs. Comparez les photos authentiques, choisissez le modèle qui vous plaît et renseignez votre adresse à Guéliz, Targa, Massira, la Médina ou un autre quartier de Marrakech. La livraison en ville est incluse ; votre commande et les modalités de paiement sont confirmées avec WZNI.",
    ar: "كتقلب على ميزان للوزن فمراكش باش تتابع الوزن ديالك فالدار؟ WZNI كيوفر ثلاثة موازين إلكترونية PRIMA: SILVER بخطوط هندسية، LED فضي بلمسة سوداء، وBLACK بزخارف بيضاء. قارن الصور الأصلية واختار الموديل اللي عجبك، وكتب العنوان ديالك فكليز، تاركة، المسيرة، المدينة ولا أي حي آخر فمراكش. التوصيل داخل المدينة مجاني، والطلب وطريقة الأداء كيتأكدو مع WZNI.",
  },
  usage_title: {
    fr: "Une routine simple, des repères utiles.",
    ar: "روتين بسيط ومعلومات مفيدة.",
  },
  usage_intro: {
    fr: "Une balance vous aide à noter votre poids dans le temps. Elle donne un repère, sans résumer à elle seule votre santé. Suivez la notice PRIMA pour les limites et l’entretien de votre modèle.",
    ar: "الميزان كيعاونك تسجل الوزن ديالك مع الوقت. كيعطيك مؤشر، ولكن ما كيختصرش صحتك كاملة. تبع دليل PRIMA باش تعرف حدود الاستعمال والعناية بالموديل ديالك.",
  },
  tip_floor: {
    fr: "Posez la balance sur un sol dur, plat et stable, plutôt que sur un tapis.",
    ar: "حط الميزان فوق أرضية صلبة ومستوية وثابتة، ماشي فوق الزربية.",
  },
  tip_routine: {
    fr: "Comparez des mesures prises au même moment de la journée, avec la même balance et des vêtements similaires.",
    ar: "قارن القياسات فنفس الوقت من النهار وبنفس الميزان وبلباس متشابه.",
  },
  tip_reading: {
    fr: "Répartissez votre poids sur les deux pieds et restez immobile jusqu’à ce que l’affichage se stabilise.",
    ar: "وزع الوزن على رجليك بجوج وبقا ثابت حتى يستقر الرقم فالشاشة.",
  },
  tip_wellbeing: {
    fr: "Prenez soin de votre bien-être avec des habitudes adaptées : une alimentation variée et une activité qui vous convient. Pour un objectif personnel ou une inquiétude sur votre poids, demandez conseil à un professionnel de santé.",
    ar: "اعتني براسك بعادات مناسبة: أكل متنوع ونشاط على قدك. إلا عندك هدف خاص ولا قلق على الوزن، طلب النصيحة من مختص فالصحة.",
  },
  closing_title: {
    fr: "Votre balance PRIMA vous attend.",
    ar: "الميزان ديالك كيتسناك!",
  },
  seo_meta_title: {
    fr: "WZNI | Balances électroniques PRIMA — Marrakech",
    ar: "وزني | موازين إلكترونية PRIMA في مراكش",
  },
  seo_meta_description: {
    fr: "Découvrez les trois balances PRIMA chez WZNI. Photos authentiques, commande simple et livraison incluse à Marrakech.",
    ar: "اكتشف ثلاثة موازين PRIMA عند WZNI. صور أصلية، طلب ساهل والتوصيل مجاني فمراكش.",
  },
} as const;
export type ContentKey = keyof typeof defaultContent;
export type ContentRow = { key: string; text_fr: string; text_ar: string };
