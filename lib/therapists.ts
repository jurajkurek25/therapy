// Real therapist data scraped from partner platforms (May 2026)
// Ksebe: 150+ experts, sessions 50 min, prices €30–95
// Mojra: 80 psychologists, sessions from €35.40
// Hedepy: 700+ specialists, sessions from €34, via questionnaire matching

export type Therapist = {
  name: string;
  credentials: string;
  platform: 'ksebe' | 'mojra' | 'hedepy';
  url: string;
  price: string;
  experience?: string;
  topics: string[];
};

export const THERAPISTS: Therapist[] = [
  // ── KSEBE ──────────────────────────────────────────────────────────────────
  {
    name: 'Mgr. Lucia Žiaková',
    credentials: 'Mgr.',
    platform: 'ksebe',
    url: 'https://ksebe.sk/experts',
    price: '€50 / 50 min',
    experience: '20 rokov',
    topics: ['úzkosť', 'depresia', 'stres', 'vzťahy', 'rodina', 'práca'],
  },
  {
    name: 'PhDr. Iveta Jonášová, PhD.',
    credentials: 'PhDr., PhD.',
    platform: 'ksebe',
    url: 'https://ksebe.sk/experts',
    price: '€80 / 50 min',
    experience: '19 rokov',
    topics: ['trauma', 'depresia', 'úzkosť', 'kríza', 'identita'],
  },
  {
    name: 'Mgr. Martina Verešová',
    credentials: 'Mgr.',
    platform: 'ksebe',
    url: 'https://ksebe.sk/experts',
    price: '€40 / 50 min',
    experience: '7 rokov',
    topics: ['úzkosť', 'vzťahy', 'sebarozvoj', 'emócie'],
  },
  {
    name: 'Mgr. Lucia Dodeková',
    credentials: 'Mgr.',
    platform: 'ksebe',
    url: 'https://ksebe.sk/experts',
    price: '€45 / 50 min',
    experience: '10 rokov',
    topics: ['rodina', 'deti', 'rodičovstvo', 'vzťahy', 'emócie'],
  },
  {
    name: 'Mgr. Lenka Varadyová',
    credentials: 'Mgr.',
    platform: 'ksebe',
    url: 'https://ksebe.sk/experts',
    price: '€60 / 50 min',
    experience: '5 rokov',
    topics: ['práca', 'vyhorenie', 'kariéra', 'sebarozvoj', 'koučing'],
  },
  {
    name: 'Mgr. Tomáš Pavúk',
    credentials: 'Mgr.',
    platform: 'ksebe',
    url: 'https://ksebe.sk/experts',
    price: '€55 / 50 min',
    experience: '9 rokov',
    topics: ['vzťahy', 'muži', 'sebavedomie', 'depresia', 'úzkosť'],
  },
  {
    name: 'Mgr. Zuzana Sapietová',
    credentials: 'Mgr.',
    platform: 'ksebe',
    url: 'https://ksebe.sk/experts',
    price: '€50 / 50 min',
    experience: '15 rokov',
    topics: ['závislosť', 'trauma', 'depresia', 'rodina', 'kríza'],
  },
  {
    name: 'Mgr. Katarína Kajanová',
    credentials: 'Mgr.',
    platform: 'ksebe',
    url: 'https://ksebe.sk/experts',
    price: '€50 / 50 min',
    experience: '5 rokov',
    topics: ['úzkosť', 'fóbie', 'panická porucha', 'OCD', 'stres'],
  },

  // ── MOJRA ──────────────────────────────────────────────────────────────────
  {
    name: 'Mgr. Adriana Rožová',
    credentials: 'Mgr.',
    platform: 'mojra',
    url: 'https://mojra.sk/psychologicka-poradna/psycholog-adriana-rozova',
    price: 'od €35.40',
    topics: ['vzťahy', 'deti', 'úzkosť', 'depresia', 'rodina', 'rodičovstvo', 'práca', 'závislosť', 'materstvo'],
  },
  {
    name: 'PhDr. Gabriela Šamajová, PhD.',
    credentials: 'PhDr., PhD.',
    platform: 'mojra',
    url: 'https://mojra.sk/psychologicka-poradna/psycholog-gabriela-samajova',
    price: 'od €35.40',
    topics: ['vzťahy', 'deti', 'úzkosť', 'depresia', 'rodina', 'rodičovstvo', 'závislosť', 'materstvo'],
  },
  {
    name: 'Mgr. Lenka Maturová',
    credentials: 'Mgr.',
    platform: 'mojra',
    url: 'https://mojra.sk/psychologicka-poradna/psycholog-lenka-maturova',
    price: 'od €35.40',
    topics: ['vzťahy', 'deti', 'úzkosť', 'depresia', 'rodina', 'rodičovstvo', 'práca', 'materstvo'],
  },
  {
    name: 'Mgr. Simona Wenhardtová',
    credentials: 'Mgr.',
    platform: 'mojra',
    url: 'https://mojra.sk/psychologicka-poradna/psycholog-simona-wenhardtova',
    price: 'od €35.40',
    topics: ['vzťahy', 'úzkosť', 'depresia', 'rodina', 'práca', 'závislosť', 'materstvo', 'koučing'],
  },
  {
    name: 'Mgr. Stanislava Piljanová',
    credentials: 'Mgr.',
    platform: 'mojra',
    url: 'https://mojra.sk/psychologicka-poradna/psycholog-stanislava-piljanova',
    price: 'od €35.40',
    topics: ['vzťahy', 'úzkosť', 'depresia', 'rodina', 'rodičovstvo', 'práca', 'závislosť', 'materstvo', 'koučing'],
  },
  {
    name: 'Mgr. Eduard Kurdiovský',
    credentials: 'Mgr.',
    platform: 'mojra',
    url: 'https://mojra.sk/psychologicka-poradna/psycholog-eduard-kurdiovsky',
    price: 'od €35.40',
    topics: ['vzťahy', 'deti', 'úzkosť', 'depresia', 'rodina', 'rodičovstvo'],
  },
  {
    name: 'Mgr. Martin Ondria',
    credentials: 'Mgr.',
    platform: 'mojra',
    url: 'https://mojra.sk/psychologicka-poradna/psycholog-martin-ondria',
    price: 'od €35.40',
    topics: ['vzťahy', 'úzkosť', 'depresia', 'rodina', 'rodičovstvo', 'práca', 'závislosť', 'koučing'],
  },
  {
    name: 'PhDr. Veronika Skorunková',
    credentials: 'PhDr.',
    platform: 'mojra',
    url: 'https://mojra.sk/psychologicka-poradna/psycholog-veronika-skorunkova',
    price: 'od €35.40',
    topics: ['vzťahy', 'deti', 'úzkosť', 'depresia', 'rodina', 'rodičovstvo', 'práca', 'závislosť', 'materstvo', 'koučing'],
  },
  {
    name: 'Mgr. Michaela Parma',
    credentials: 'Mgr.',
    platform: 'mojra',
    url: 'https://mojra.sk/psychologicka-poradna/psycholog-michaela-parma',
    price: 'od €35.40',
    topics: ['vzťahy', 'úzkosť', 'depresia', 'rodina', 'rodičovstvo', 'práca', 'závislosť', 'koučing'],
  },
  {
    name: 'Mgr. Ingrid Molnárová',
    credentials: 'Mgr.',
    platform: 'mojra',
    url: 'https://mojra.sk/psychologicka-poradna/psycholog-ingrid-molnarova',
    price: 'od €35.40',
    topics: ['vzťahy', 'deti', 'úzkosť', 'depresia', 'rodina', 'rodičovstvo', 'práca', 'koučing'],
  },
  {
    name: 'Mgr. Katarína Podobová',
    credentials: 'Mgr.',
    platform: 'mojra',
    url: 'https://mojra.sk/psychologicka-poradna/psycholog-katarina-podobova',
    price: 'od €35.40',
    topics: ['deti', 'úzkosť', 'depresia', 'rodina', 'rodičovstvo', 'práca'],
  },
  {
    name: 'Mgr. Věra Kudličková Dušková',
    credentials: 'Mgr.',
    platform: 'mojra',
    url: 'https://mojra.sk/psychologicka-poradna/psycholog-vera-kudlickova-duskova',
    price: 'od €35.40',
    topics: ['vzťahy', 'deti', 'úzkosť', 'depresia', 'rodina', 'rodičovstvo', 'práca', 'závislosť', 'materstvo', 'koučing'],
  },
  {
    name: 'Mgr. Viera Škopová',
    credentials: 'Mgr.',
    platform: 'mojra',
    url: 'https://mojra.sk/psychologicka-poradna/psycholog-viera-skopova',
    price: 'od €35.40',
    topics: ['vzťahy', 'deti', 'úzkosť', 'depresia', 'rodina', 'rodičovstvo', 'práca', 'závislosť', 'materstvo', 'koučing'],
  },
];

export function buildTherapistContext(): string {
  const byPlatform = {
    ksebe: THERAPISTS.filter(t => t.platform === 'ksebe'),
    mojra: THERAPISTS.filter(t => t.platform === 'mojra'),
  };

  const fmt = (t: Therapist) =>
    `  • ${t.name} (${t.credentials})${t.experience ? `, ${t.experience} praxe` : ''} — ${t.price} — témы: ${t.topics.join(', ')} — ${t.url}`;

  return `
PARTNERI A TERAPEUTI:

1. KSEBE.SK (https://ksebe.sk/experts)
Platforma s 150+ odborníkmi. Online aj osobne. Sedenie 50 min.
${byPlatform.ksebe.map(fmt).join('\n')}

2. MOJRA.SK (https://mojra.sk/nasi-psychologovia)
80 psychológov. Online sedenia. Termíny často do hodiny.
${byPlatform.mojra.map(fmt).join('\n')}

3. HEDEPY.SK (https://hedepy.sk/diagnosis)
700+ špecialistov, od €34/sedenie. Nepoužíva zoznam — namiesto toho klientovi vyplní krátky dotazník na /diagnosis a systém odporučí vhodného terapeuta algoritmicky. Odporúčaj Hedepy ak klient nevie čo hľadá alebo chce najlacnejšiu variantu.
`.trim();
}
