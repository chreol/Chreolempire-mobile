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

// Standard tier amounts shared by PSN, Steam, Razer Gold, Roblox (€), Nintendo
const STANDARD_AMOUNTS = [
  { label: "10€",  price: 7500 },
  { label: "20€",  price: 14500 },
  { label: "50€",  price: 34000 },
  { label: "100€", price: 67000 },
  { label: "150€", price: 99000 },
  { label: "200€", price: 132000 },
  { label: "300€", price: 196000 },
  { label: "500€", price: 340000 },
];

export const GIFT_CARDS = [
  {
    id: "psn",
    name: "PSN PlayStation",
    localImage: "psn" as const,
    color: "#003791",
    tier: "standard" as const,
    amounts: STANDARD_AMOUNTS,
  },
  {
    id: "steam",
    name: "Steam",
    localImage: "psn" as const,
    color: "#1B2838",
    tier: "standard" as const,
    amounts: STANDARD_AMOUNTS,
  },
  {
    id: "razer",
    name: "Razer Gold",
    localImage: "psn" as const,
    color: "#44D62C",
    tier: "standard" as const,
    amounts: STANDARD_AMOUNTS,
  },
  {
    id: "roblox-eur",
    name: "Roblox (€)",
    localImage: "roblox" as const,
    color: "#E8232A",
    tier: "standard" as const,
    amounts: STANDARD_AMOUNTS,
  },
  {
    id: "nintendo",
    name: "Nintendo eShop",
    localImage: "psn" as const,
    color: "#E70012",
    tier: "standard" as const,
    amounts: STANDARD_AMOUNTS,
  },
  {
    id: "itunes",
    name: "iTunes / Google Play",
    localImage: "itunes" as const,
    color: "#0A84FF",
    tier: "itunes" as const,
    amounts: [
      { label: "5€",   price: 4000 },
      { label: "10€",  price: 7500 },
      { label: "15€",  price: 11000 },
      { label: "25€",  price: 18000 },
      { label: "50€",  price: 35000 },
      { label: "100€", price: 68500 },
    ],
  },
  {
    id: "robux",
    name: "Robux",
    localImage: "roblox" as const,
    color: "#E8232A",
    tier: "robux" as const,
    amounts: [
      { label: "100 Robux",  price: 2500 },
      { label: "400 Robux",  price: 6500 },
      { label: "800 Robux",  price: 12000 },
      { label: "1000 Robux", price: 14000 },
      { label: "2000 Robux", price: 23500 },
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
