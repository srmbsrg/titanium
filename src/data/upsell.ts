/**
 * Titanium - In-job upsell tiers (agentic "digital salesman")
 *
 * On a job, the agent turns the diagnosis into a Good/Better/Best/Premium
 * ladder from the company catalog - image, plain-English difference,
 * warranty, price - so an untrained tech presents like a pro and one tap
 * becomes a quote in Manifold.
 *
 * AUTO-GENERATED. Product art is original vector; tiers/specs/warranties/
 * prices are representative examples (real values come from the live catalog).
 */

export type Tier = {
  key: string;
  ribbon: string;
  name: string;
  accent: string;
  desc: string;
  specs: [string, string][];
  warranty: string;
  price: number;
  svg: string;
  popular?: boolean;
};

export type UpsellJob = {
  site: string;
  location: string;
  diagnosis: string;
  category: string;
};

export const SAMPLE_JOB: UpsellJob = {
  site: 'Barton Office Park',
  location: '1st-floor restroom',
  diagnosis: 'Toilet beyond repair (cracked tank, seeping base)',
  category: 'Toilet replacement',
};

export const TAX_RATE = 0.0825;

export const TIERS: Tier[] = [
  {
    "key": "good",
    "ribbon": "Good",
    "name": "Essential Round-Front",
    "accent": "#64748B",
    "desc": "Dependable, budget-friendly standard toilet. Gets the customer working today.",
    "specs": [
      [
        "Bowl",
        "Round front, 2-piece"
      ],
      [
        "Height",
        "Standard (15 in)"
      ],
      [
        "Flush",
        "1.6 GPF single"
      ],
      [
        "Seat",
        "Standard (not included)"
      ]
    ],
    "warranty": "1-year limited parts",
    "price": 310,
    "svg": "<svg viewBox=\"0 0 320 200\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"0\" y=\"0\" width=\"320\" height=\"200\" fill=\"#eef4f8\"/><rect x=\"0\" y=\"168\" width=\"320\" height=\"32\" fill=\"#dbe6ee\"/><line x1=\"0\" y1=\"168\" x2=\"320\" y2=\"168\" stroke=\"#c3d3de\" stroke-width=\"2\"/><rect x=\"52\" y=\"70\" width=\"60\" height=\"66\" rx=\"6\" fill=\"#ffffff\" stroke=\"#c7d6e0\" stroke-width=\"2\"/><rect x=\"50\" y=\"64\" width=\"64\" height=\"12\" rx=\"4\" fill=\"#eaf1f6\" stroke=\"#c7d6e0\" stroke-width=\"2\"/><rect x=\"96\" y=\"60\" width=\"8\" height=\"8\" rx=\"2\" fill=\"#64748B\"/><path d=\"M112 116 q10 -18 42 -18 a34 30 0 1 1 0 60 q-32 0 -42 -18 Z\" fill=\"#ffffff\" stroke=\"#c7d6e0\" stroke-width=\"2\"/><ellipse cx=\"156\" cy=\"112\" rx=\"34\" ry=\"9\" fill=\"#eaf1f6\" stroke=\"#c7d6e0\" stroke-width=\"2\"/><path d=\"M120 138 l10 30 h44 l10 -30 Z\" fill=\"#eaf1f6\" stroke=\"#c7d6e0\" stroke-width=\"2\"/><path d=\"M126 150 q12 8 40 4\" fill=\"none\" stroke=\"#d3e0e8\" stroke-width=\"3\"/></svg>"
  },
  {
    "key": "better",
    "ribbon": "Better",
    "name": "Comfort-Height WaterSense",
    "accent": "#0EA5E9",
    "desc": "ADA comfort height and a WaterSense flush - easier to use, lower water bill.",
    "specs": [
      [
        "Bowl",
        "Elongated, 2-piece"
      ],
      [
        "Height",
        "Comfort / ADA (17 in)"
      ],
      [
        "Flush",
        "1.28 GPF WaterSense"
      ],
      [
        "Seat",
        "Standard included"
      ]
    ],
    "warranty": "5-year limited",
    "price": 465,
    "popular": true,
    "svg": "<svg viewBox=\"0 0 320 200\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"0\" y=\"0\" width=\"320\" height=\"200\" fill=\"#eef4f8\"/><rect x=\"0\" y=\"168\" width=\"320\" height=\"32\" fill=\"#dbe6ee\"/><line x1=\"0\" y1=\"168\" x2=\"320\" y2=\"168\" stroke=\"#c3d3de\" stroke-width=\"2\"/><rect x=\"48\" y=\"58\" width=\"62\" height=\"72\" rx=\"6\" fill=\"#ffffff\" stroke=\"#c7d6e0\" stroke-width=\"2\"/><rect x=\"46\" y=\"52\" width=\"66\" height=\"12\" rx=\"4\" fill=\"#eaf1f6\" stroke=\"#c7d6e0\" stroke-width=\"2\"/><rect x=\"94\" y=\"48\" width=\"8\" height=\"8\" rx=\"2\" fill=\"#0EA5E9\"/><path d=\"M110 112 q10 -20 52 -20 a40 30 0 1 1 0 60 q-42 0 -52 -18 Z\" fill=\"#ffffff\" stroke=\"#c7d6e0\" stroke-width=\"2\"/><ellipse cx=\"166\" cy=\"106\" rx=\"42\" ry=\"10\" fill=\"#eaf1f6\" stroke=\"#c7d6e0\" stroke-width=\"2\"/><path d=\"M118 132 l8 36 h60 l8 -36 Z\" fill=\"#eaf1f6\" stroke=\"#c7d6e0\" stroke-width=\"2\"/><rect x=\"150\" y=\"80\" width=\"30\" height=\"12\" rx=\"6\" fill=\"#0EA5E9\" opacity=\"0.14\"/></svg>"
  },
  {
    "key": "best",
    "ribbon": "Best",
    "name": "One-Piece Skirted Dual-Flush",
    "accent": "#0D9488",
    "desc": "Sleek skirted one-piece, easy to clean, dual-flush, soft-close seat included.",
    "specs": [
      [
        "Bowl",
        "Elongated, 1-piece skirted"
      ],
      [
        "Height",
        "Comfort / ADA (17 in)"
      ],
      [
        "Flush",
        "Dual 1.0 / 1.28 GPF"
      ],
      [
        "Seat",
        "Soft-close included"
      ]
    ],
    "warranty": "10-year limited",
    "price": 690,
    "svg": "<svg viewBox=\"0 0 320 200\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"0\" y=\"0\" width=\"320\" height=\"200\" fill=\"#eef4f8\"/><rect x=\"0\" y=\"168\" width=\"320\" height=\"32\" fill=\"#dbe6ee\"/><line x1=\"0\" y1=\"168\" x2=\"320\" y2=\"168\" stroke=\"#c3d3de\" stroke-width=\"2\"/><path d=\"M60 60 h56 q6 0 6 6 v14 q26 4 44 22 a40 30 0 1 1 -70 34 q-24 -2 -36 -14 V66 q0 -6 6 -6 Z\" fill=\"#ffffff\" stroke=\"#c7d6e0\" stroke-width=\"2\"/><rect x=\"58\" y=\"52\" width=\"66\" height=\"12\" rx=\"5\" fill=\"#eaf1f6\" stroke=\"#c7d6e0\" stroke-width=\"2\"/><ellipse cx=\"170\" cy=\"104\" rx=\"42\" ry=\"10\" fill=\"#eaf1f6\" stroke=\"#c7d6e0\" stroke-width=\"2\"/><path d=\"M118 150 q52 14 100 0 l-6 18 h-88 Z\" fill=\"#eaf1f6\" stroke=\"#c7d6e0\" stroke-width=\"2\"/><rect x=\"150\" y=\"86\" width=\"34\" height=\"8\" rx=\"4\" fill=\"#0D9488\" opacity=\"0.18\"/></svg>"
  },
  {
    "key": "premium",
    "ribbon": "Premium",
    "name": "Smart Bidet One-Piece",
    "accent": "#7C3AED",
    "desc": "Heated seat, warm-water bidet, auto flush, night light. The premium upgrade.",
    "specs": [
      [
        "Bowl",
        "Elongated, 1-piece skirted"
      ],
      [
        "Height",
        "Comfort / ADA (17 in)"
      ],
      [
        "Flush",
        "Auto dual-flush"
      ],
      [
        "Seat",
        "Heated bidet + night light"
      ]
    ],
    "warranty": "Lifetime ceramic / 3-yr electronics",
    "price": 1850,
    "svg": "<svg viewBox=\"0 0 320 200\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"0\" y=\"0\" width=\"320\" height=\"200\" fill=\"#eef4f8\"/><rect x=\"0\" y=\"168\" width=\"320\" height=\"32\" fill=\"#dbe6ee\"/><line x1=\"0\" y1=\"168\" x2=\"320\" y2=\"168\" stroke=\"#c3d3de\" stroke-width=\"2\"/><path d=\"M64 60 h52 q6 0 6 6 v16 q26 4 44 22 a40 30 0 1 1 -70 34 q-24 -2 -36 -14 V66 q0 -6 6 -6 Z\" fill=\"#ffffff\" stroke=\"#c7d6e0\" stroke-width=\"2\"/><ellipse cx=\"172\" cy=\"112\" rx=\"46\" ry=\"13\" fill=\"#f4fbff\" stroke=\"#c7d6e0\" stroke-width=\"2\"/><ellipse cx=\"172\" cy=\"120\" rx=\"42\" ry=\"7\" fill=\"#7C3AED\" opacity=\"0.20\"/><path d=\"M120 152 q54 14 104 0 l-6 16 h-92 Z\" fill=\"#eaf1f6\" stroke=\"#c7d6e0\" stroke-width=\"2\"/><rect x=\"118\" y=\"92\" width=\"16\" height=\"34\" rx=\"4\" fill=\"#ffffff\" stroke=\"#c7d6e0\" stroke-width=\"2\"/><circle cx=\"126\" cy=\"100\" r=\"2.4\" fill=\"#7C3AED\"/><circle cx=\"126\" cy=\"108\" r=\"2.4\" fill=\"#22c55e\"/><rect x=\"122\" y=\"114\" width=\"8\" height=\"3\" rx=\"1.5\" fill=\"#7C3AED\"/><rect x=\"122\" y=\"119\" width=\"8\" height=\"3\" rx=\"1.5\" fill=\"#cbd5e1\"/><rect x=\"58\" y=\"56\" width=\"62\" height=\"12\" rx=\"5\" fill=\"#eaf1f6\" stroke=\"#c7d6e0\" stroke-width=\"2\"/></svg>"
  }
];

export const money = (n: number) =>
  '$' + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
