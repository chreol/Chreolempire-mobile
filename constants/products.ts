export type Category = "gaming" | "streaming" | "crypto" | "shopping";

export interface Product {
  id: string;
  name: string;
  category: Category;
  emoji: string;
  color: string;
  colorSecondary: string;
  amounts: { value: number; label: string; currency: string }[];
  description: string;
  deliveryTime: string;
  inStock: boolean;
  popular?: boolean;
}

export const CATEGORIES = [
  { id: "all", label: "Tout", emoji: "⚡" },
  { id: "gaming", label: "Gaming", emoji: "🎮" },
  { id: "streaming", label: "Streaming", emoji: "📺" },
  { id: "crypto", label: "Crypto", emoji: "₿" },
  { id: "shopping", label: "Shopping", emoji: "🛍️" },
] as const;

export const PRODUCTS: Product[] = [
  {
    id: "robux-400",
    name: "Robux",
    category: "gaming",
    emoji: "🟢",
    color: "#10B981",
    colorSecondary: "#059669",
    amounts: [
      { value: 2500, label: "400 Robux", currency: "FCFA" },
      { value: 5000, label: "800 Robux", currency: "FCFA" },
      { value: 10000, label: "1700 Robux", currency: "FCFA" },
      { value: 19000, label: "4500 Robux", currency: "FCFA" },
    ],
    description: "Monnaie virtuelle officielle de Roblox. Achetez des accessoires, des avatars et des passes de jeu.",
    deliveryTime: "Instantané",
    inStock: true,
    popular: true,
  },
  {
    id: "psn-eu",
    name: "PlayStation (PSN)",
    category: "gaming",
    emoji: "🎮",
    color: "#2563EB",
    colorSecondary: "#1D4ED8",
    amounts: [
      { value: 6500, label: "10€", currency: "FCFA" },
      { value: 13000, label: "20€", currency: "FCFA" },
      { value: 32000, label: "50€", currency: "FCFA" },
      { value: 65000, label: "100€", currency: "FCFA" },
    ],
    description: "Cartes PSN Store Europe. Achetez des jeux PS5/PS4, du contenu DLC et des abonnements PS Plus.",
    deliveryTime: "< 5 minutes",
    inStock: true,
    popular: true,
  },
  {
    id: "steam",
    name: "Steam Wallet",
    category: "gaming",
    emoji: "🖥️",
    color: "#475569",
    colorSecondary: "#334155",
    amounts: [
      { value: 6000, label: "10€", currency: "FCFA" },
      { value: 15000, label: "25€", currency: "FCFA" },
      { value: 30000, label: "50€", currency: "FCFA" },
    ],
    description: "Rechargez votre portefeuille Steam et achetez n'importe quel jeu PC en un clic.",
    deliveryTime: "< 5 minutes",
    inStock: true,
  },
  {
    id: "xbox",
    name: "Xbox / Game Pass",
    category: "gaming",
    emoji: "🟢",
    color: "#107C10",
    colorSecondary: "#0a5a0a",
    amounts: [
      { value: 6500, label: "10€", currency: "FCFA" },
      { value: 13000, label: "20€", currency: "FCFA" },
      { value: 32000, label: "50€", currency: "FCFA" },
    ],
    description: "Cartes cadeaux Xbox pour le Microsoft Store et Xbox Game Pass.",
    deliveryTime: "< 5 minutes",
    inStock: true,
  },
  {
    id: "netflix",
    name: "Netflix",
    category: "streaming",
    emoji: "🎬",
    color: "#E50914",
    colorSecondary: "#B20710",
    amounts: [
      { value: 9000, label: "1 mois Standard", currency: "FCFA" },
      { value: 13000, label: "1 mois Premium", currency: "FCFA" },
    ],
    description: "Abonnement Netflix 4K Ultra HD. Films, séries et documentaires en illimité.",
    deliveryTime: "< 30 minutes",
    inStock: true,
    popular: true,
  },
  {
    id: "spotify",
    name: "Spotify Premium",
    category: "streaming",
    emoji: "🎵",
    color: "#1DB954",
    colorSecondary: "#158f3f",
    amounts: [
      { value: 6000, label: "1 mois", currency: "FCFA" },
      { value: 17000, label: "3 mois", currency: "FCFA" },
    ],
    description: "Musique sans pub, téléchargements offline et qualité audio HD.",
    deliveryTime: "< 30 minutes",
    inStock: true,
  },
  {
    id: "usdt",
    name: "USDT (Tether)",
    category: "crypto",
    emoji: "💵",
    color: "#26A17B",
    colorSecondary: "#1a7a5c",
    amounts: [
      { value: 5800, label: "10 USDT", currency: "FCFA" },
      { value: 29000, label: "50 USDT", currency: "FCFA" },
      { value: 58000, label: "100 USDT", currency: "FCFA" },
    ],
    description: "Stablecoin adossé au dollar américain. Idéal pour les transferts internationaux.",
    deliveryTime: "< 15 minutes",
    inStock: true,
  },
  {
    id: "amazon",
    name: "Amazon",
    category: "shopping",
    emoji: "📦",
    color: "#FF9900",
    colorSecondary: "#cc7a00",
    amounts: [
      { value: 13000, label: "20€", currency: "FCFA" },
      { value: 32000, label: "50€", currency: "FCFA" },
      { value: 65000, label: "100€", currency: "FCFA" },
    ],
    description: "Cartes cadeaux Amazon valables sur amazon.fr, .de, .it et .es.",
    deliveryTime: "< 5 minutes",
    inStock: true,
  },
];
