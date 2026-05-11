export const BASE_URL = "https://chreolempirev1.vercel.app/img";

export const CONTACT = {
  whatsapp: "+237697657734",
  whatsappDisplay: "+237 697 657 734",
  tel: "+237694360978",
  telDisplay: "(237) 694 360 978",
  email: "chreolempire00@gmail.com",
  address: "Vallée 3, Boutiques Deido, Douala, Cameroun",
  telegram: "https://t.me/chreolempireBot",
  website: "https://chreolempire.com",
  paypalEmail: "LARAMBAMBO@GMAIL.COM",
};

export const IMAGES = {
  logo: `${BASE_URL}/logo.jpg`,
  psn: `${BASE_URL}/Psn gift card.jpg`,
  itunes: `${BASE_URL}/Carte Cadeau Itunes.png`,
  roblox: `${BASE_URL}/Carte Cadeau Roblox.png`,
  robux: `${BASE_URL}/Carte cadeau Roblox Robux.png`,
  apple: `${BASE_URL}/apple-gift-card-front.png`,
  uba: `${BASE_URL}/uba_hero.png`,
  paypal: `${BASE_URL}/paypal_hero.png`,
  crypto: `${BASE_URL}/crypto_hero.png`,
  coupons: `${BASE_URL}/coupons_hero.png`,
};

export const SERVICES = [
  {
    id: "cartes-cadeaux",
    title: "CARTES CADEAUX",
    subtitle: "(PSN, ITUNES, ROBLOX, ETC.)",
    description: "Achat et activation de vos cartes",
    image: IMAGES.psn,
    route: "/services/cartes-cadeaux",
  },
  {
    id: "uba",
    title: "ACHAT ET RECHARGE",
    subtitle: "UBA CAMEROUN",
    description: "Vos opérations UBA en un clic",
    image: IMAGES.uba,
    route: "/services/uba",
  },
  {
    id: "coupons",
    title: "ÉCHANGE COUPONS",
    subtitle: "(TRANSCASH, PCS)",
    description: "Convertissez vos coupons",
    image: IMAGES.coupons,
    route: "/services/coupons",
  },
  {
    id: "crypto",
    title: "ÉCHANGE ET VENTE",
    subtitle: "CRYPTO/PAYPAL",
    description: "Achat, vente, et conversion",
    image: IMAGES.crypto,
    route: "/services/crypto",
  },
];

export const GIFT_CARDS = [
  {
    id: "psn",
    name: "PSN PlayStation",
    image: IMAGES.psn,
    color: "#003791",
    amounts: [
      { label: "10€", price: 6500 },
      { label: "20€", price: 13000 },
      { label: "50€", price: 32000 },
      { label: "100€", price: 65000 },
    ],
  },
  {
    id: "itunes",
    name: "iTunes / App Store",
    image: IMAGES.itunes,
    color: "#0A84FF",
    amounts: [
      { label: "10€", price: 7000 },
      { label: "25€", price: 17000 },
      { label: "50€", price: 33000 },
      { label: "100€", price: 65000 },
    ],
  },
  {
    id: "roblox",
    name: "Roblox / Robux",
    image: IMAGES.roblox,
    color: "#E8232A",
    amounts: [
      { label: "400 Robux", price: 2500 },
      { label: "800 Robux", price: 5000 },
      { label: "1700 Robux", price: 10000 },
      { label: "4500 Robux", price: 19000 },
    ],
  },
  {
    id: "xbox",
    name: "Xbox / Game Pass",
    image: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=400&h=300&fit=crop&q=80",
    color: "#107C10",
    amounts: [
      { label: "10€", price: 6500 },
      { label: "20€", price: 13000 },
      { label: "50€", price: 32000 },
    ],
  },
  {
    id: "nintendo",
    name: "Nintendo eShop",
    image: "https://images.unsplash.com/photo-1585620385456-4759f9b5c7d9?w=400&h=300&fit=crop&q=80",
    color: "#E70012",
    amounts: [
      { label: "10€", price: 6500 },
      { label: "25€", price: 16000 },
      { label: "50€", price: 32000 },
    ],
  },
  {
    id: "freefire",
    name: "Free Fire Diamonds",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop&q=80",
    color: "#FF6600",
    amounts: [
      { label: "100 Diamants", price: 3000 },
      { label: "310 Diamants", price: 7500 },
      { label: "520 Diamants", price: 13000 },
    ],
  },
];

export const UBA_RECHARGE_FEES = [
  { min: 1500, max: 20000, fee: 1500, type: "fixed" as const },
  { min: 20001, max: 50000, fee: 2000, type: "fixed" as const },
  { min: 50001, max: 100000, fee: 5, type: "percent" as const },
  { min: 100001, max: 350000, fee: 4, type: "percent" as const },
  { min: 350001, max: 500000, fee: 3, type: "percent" as const },
];

export const UBA_CARDS = [
  {
    segment: "I",
    price: 10500,
    limit: "2 500 000 FCFA/mois",
    features: ["Utilisation standard", "Validité 2-3 ans", "Paiements en ligne"],
  },
  {
    segment: "II",
    price: 17500,
    limit: "4 500 000 FCFA/mois",
    features: ["Assurance achats", "Activation express", "Support prioritaire"],
    popular: true,
  },
  {
    segment: "III",
    price: 25000,
    limit: "10 000 000 FCFA/mois",
    features: ["Tier Business", "Support VIP 24/7", "Limite maximale"],
  },
];

export const CRYPTO_RATES = [
  {
    id: "usdt",
    name: "USDT",
    fullName: "Tether (USDT)",
    icon: "💵",
    color: "#26A17B",
    buyRate: 580,
    sellRate: 700,
    unit: "1 USDT",
    min: 5000,
    max: 500000,
  },
  {
    id: "usdc",
    name: "USDC",
    fullName: "USD Coin (USDC)",
    icon: "🔵",
    color: "#2775CA",
    buyRate: 580,
    sellRate: 700,
    unit: "1 USDC",
    min: 5000,
    max: 500000,
  },
  {
    id: "btc",
    name: "BTC",
    fullName: "Bitcoin (BTC)",
    icon: "₿",
    color: "#F7931A",
    buyRate: 58000000,
    sellRate: 70000000,
    unit: "1 BTC",
    min: 10000,
    max: 500000,
  },
  {
    id: "trx",
    name: "TRX",
    fullName: "Tron (TRX)",
    icon: "🔴",
    color: "#EB0029",
    buyRate: 151,
    sellRate: 182,
    unit: "1 TRX",
    min: 2000,
    max: 500000,
  },
];

export const COUPON_RATES = {
  pcs: { rate: 440, commission: 7, formula: "(montant − 7%) × 440" },
  transcash: { rate: 440, commission: 0, formula: "montant × 440" },
};

export const PAYPAL_LIMITS = {
  sell: { min: 20, max: 500, currency: "€", label: "Vente (retrait)" },
  buy: { min: 10000, max: 500000, currency: "FCFA", label: "Achat (recharge)" },
};
