/**
 * Données géographiques et règles de validation (Pays, Départements, Villes, Indicatifs téléphoniques)
 * pour ECOGEST.
 */

export interface CountryGeoConfig {
  name: string;
  code: string;
  dialCode: string;
  phoneDigits: number[]; // ex: [8, 10] pour le Bénin
  phonePlaceholder: string;
  departments: {
    name: string;
    cities: string[];
  }[];
}

export const COUNTRIES_GEO_DATA: Record<string, CountryGeoConfig> = {
  Bénin: {
    name: "Bénin",
    code: "BJ",
    dialCode: "+229",
    phoneDigits: [8, 10],
    phonePlaceholder: "+229 01 97 00 11 22 ou +229 97 00 11 22",
    departments: [
      {
        name: "Littoral",
        cities: ["Cotonou"],
      },
      {
        name: "Atlantique",
        cities: [
          "Abomey-Calavi",
          "Allada",
          "Ouidah",
          "Tori-Bossito",
          "Zè",
          "Kpomassè",
          "Toffo",
          "Sô-Ava",
        ],
      },
      {
        name: "Ouémé",
        cities: [
          "Porto-Novo",
          "Sèmè-Kpodji",
          "Akpro-Missérété",
          "Adjarra",
          "Adjohoun",
          "Avrankou",
          "Bonou",
          "Dangbo",
        ],
      },
      {
        name: "Borgou",
        cities: [
          "Parakou",
          "Bembèrèkè",
          "N'Dali",
          "Nikki",
          "Sinendé",
          "Tchaourou",
          "Kalalé",
          "Pèrèrè",
        ],
      },
      {
        name: "Zou",
        cities: [
          "Abomey",
          "Bohicon",
          "Covè",
          "Djidja",
          "Za-Kpota",
          "Zagnanado",
          "Zogbodomey",
          "Ouinhi",
        ],
      },
      {
        name: "Alibori",
        cities: [
          "Kandi",
          "Banikoara",
          "Malanville",
          "Karimama",
          "Gogounou",
          "Segbana",
        ],
      },
      {
        name: "Atacora",
        cities: [
          "Natitingou",
          "Tanguiéta",
          "Kouandé",
          "Cobly",
          "Kérou",
          "Matéri",
          "Pehunco",
          "Toucountouna",
        ],
      },
      {
        name: "Collines",
        cities: [
          "Dassa-Zoumè",
          "Savalou",
          "Savè",
          "Glazoué",
          "Bantè",
          "Ouèssè",
        ],
      },
      {
        name: "Couffo",
        cities: [
          "Aplahoué",
          "Dogbo",
          "Djakotomey",
          "Klouékanmè",
          "Lalo",
          "Toviklin",
        ],
      },
      {
        name: "Donga",
        cities: ["Djougou", "Bassila", "Copargo", "Ouaké"],
      },
      {
        name: "Mono",
        cities: [
          "Lokossa",
          "Grand-Popo",
          "Comè",
          "Athiémé",
          "Bopa",
          "Houéyogbé",
        ],
      },
      {
        name: "Plateau",
        cities: ["Pobè", "Sakété", "Kétou", "Ifangni", "Adja-Ouèrè"],
      },
    ],
  },
  Togo: {
    name: "Togo",
    code: "TG",
    dialCode: "+228",
    phoneDigits: [8],
    phonePlaceholder: "+228 90 12 34 56",
    departments: [
      {
        name: "Maritime",
        cities: ["Lomé", "Tsévié", "Aného", "Vogan", "Tabligbo"],
      },
      {
        name: "Plateaux",
        cities: ["Atakpamé", "Kpalimé", "Badou", "Notsé", "Amlamé"],
      },
      {
        name: "Centrale",
        cities: ["Sokodé", "Tchamba", "Sotouboua", "Blitta"],
      },
      {
        name: "Kara",
        cities: ["Kara", "Bafilo", "Bassar", "Niamtougou", "Pagouda"],
      },
      {
        name: "Savanes",
        cities: ["Dapaong", "Mango", "Mandouri", "Cinkassé"],
      },
    ],
  },
  "Côte d'Ivoire": {
    name: "Côte d'Ivoire",
    code: "CI",
    dialCode: "+225",
    phoneDigits: [10],
    phonePlaceholder: "+225 07 12 34 56 78",
    departments: [
      {
        name: "Abidjan (District)",
        cities: ["Abidjan", "Cocody", "Yopougon", "Plateau", "Treichville", "Marcory", "Abobo"],
      },
      {
        name: "Yamoussoukro (District)",
        cities: ["Yamoussoukro", "Attégouakro"],
      },
      {
        name: "Gbêkê",
        cities: ["Bouaké", "Béoumi", "Sakassou", "Botro"],
      },
      {
        name: "San-Pédro",
        cities: ["San-Pédro", "Sassandra", "Tabou"],
      },
      {
        name: "Poro",
        cities: ["Korhogo", "Sinématiali", "Dikodougou"],
      },
      {
        name: "Haut-Sassandra",
        cities: ["Daloa", "Issia", "Vavoua"],
      },
    ],
  },
  Sénégal: {
    name: "Sénégal",
    code: "SN",
    dialCode: "+221",
    phoneDigits: [9],
    phonePlaceholder: "+221 77 123 45 67",
    departments: [
      {
        name: "Dakar",
        cities: ["Dakar", "Pikine", "Guédiawaye", "Rufisque"],
      },
      {
        name: "Thiès",
        cities: ["Thiès", "Mbour", "Tivaouane"],
      },
      {
        name: "Saint-Louis",
        cities: ["Saint-Louis", "Dagana", "Podor"],
      },
      {
        name: "Diourbel",
        cities: ["Diourbel", "Touba", "Mbacké", "Bambey"],
      },
      {
        name: "Ziguinchor",
        cities: ["Ziguinchor", "Bignona", "Oussouye"],
      },
    ],
  },
  "Burkina Faso": {
    name: "Burkina Faso",
    code: "BF",
    dialCode: "+226",
    phoneDigits: [8],
    phonePlaceholder: "+226 70 12 34 56",
    departments: [
      {
        name: "Centre",
        cities: ["Ouagadougou"],
      },
      {
        name: "Hauts-Bassins",
        cities: ["Bobo-Dioulasso", "Orodara", "Houndé"],
      },
      {
        name: "Nord",
        cities: ["Ouahigouya", "Gourcy", "Yako"],
      },
      {
        name: "Centre-Ouest",
        cities: ["Koudougou", "Réo", "Léo"],
      },
    ],
  },
  Niger: {
    name: "Niger",
    code: "NE",
    dialCode: "+227",
    phoneDigits: [8],
    phonePlaceholder: "+227 90 12 34 56",
    departments: [
      {
        name: "Niamey",
        cities: ["Niamey"],
      },
      {
        name: "Maradi",
        cities: ["Maradi", "Tessaoua", "Dakoro"],
      },
      {
        name: "Zinder",
        cities: ["Zinder", "Mirriah", "Magaria"],
      },
      {
        name: "Tahoua",
        cities: ["Tahoua", "Madaoua", "Illela"],
      },
    ],
  },
};

export const SUPPORTED_COUNTRIES = Object.keys(COUNTRIES_GEO_DATA);

export function getCountryConfig(countryName: string): CountryGeoConfig {
  return COUNTRIES_GEO_DATA[countryName] || COUNTRIES_GEO_DATA["Bénin"];
}

export function getDepartments(countryName: string): string[] {
  const cfg = getCountryConfig(countryName);
  return cfg.departments.map((d) => d.name);
}

export function getCities(countryName: string, departmentName: string): string[] {
  const cfg = getCountryConfig(countryName);
  const foundDept = cfg.departments.find(
    (d) => d.name.toLowerCase() === (departmentName || "").toLowerCase()
  );
  return foundDept ? foundDept.cities : [];
}

/**
 * Normalise et formate un numéro de téléphone pour un pays donné.
 */
export function formatPhoneNumber(rawPhone: string, countryName: string): string {
  const cfg = getCountryConfig(countryName);
  const raw = (rawPhone || "").trim();

  // Extraction uniquement des chiffres
  let digits = raw.replace(/\D/g, "");

  // Si le numéro commence par l'indicatif sans le +, l'enlever pour normaliser
  const dialDigits = cfg.dialCode.replace(/\D/g, "");
  if (digits.startsWith(dialDigits)) {
    digits = digits.slice(dialDigits.length);
  } else if (digits.startsWith("00" + dialDigits)) {
    digits = digits.slice(("00" + dialDigits).length);
  }

  // Formatage aéré
  if (digits.length === 8) {
    // XX XX XX XX
    return `${cfg.dialCode} ${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 8)}`;
  } else if (digits.length === 9) {
    // XX XXX XX XX
    return `${cfg.dialCode} ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`;
  } else if (digits.length === 10) {
    // XX XX XX XX XX
    return `${cfg.dialCode} ${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`;
  }

  // Par défaut
  return digits ? `${cfg.dialCode} ${digits}` : cfg.dialCode;
}

/**
 * Valide la cohérence complète entre pays, département, ville et numéro de téléphone.
 */
export function validateGeoCoherence(
  country: string,
  department: string,
  city: string,
  phone: string
): { valid: boolean; error?: string; formattedPhone?: string } {
  // 1. Pays
  if (!country || !COUNTRIES_GEO_DATA[country]) {
    return {
      valid: false,
      error: "Veuillez sélectionner un pays valide dans la liste.",
    };
  }

  const cfg = COUNTRIES_GEO_DATA[country];

  // 2. Département (avec détection automatique si non renseigné ou si la ville se trouve dans un autre département)
  let deptObj = cfg.departments.find(
    (d) => d.name.toLowerCase() === (department || "").trim().toLowerCase()
  );

  if ((!deptObj || !department) && city) {
    const matchedDept = cfg.departments.find((d) =>
      d.cities.some((c) => c.toLowerCase() === city.trim().toLowerCase())
    );
    if (matchedDept) {
      deptObj = matchedDept;
    }
  }

  if (!deptObj && cfg.departments.length > 0) {
    deptObj = cfg.departments[0];
  }

  if (!deptObj) {
    return {
      valid: false,
      error: `Veuillez sélectionner un département valide pour ${country}.`,
    };
  }

  // 3. Ville
  if (!city || !city.trim()) {
    return {
      valid: false,
      error: `La ville de l'établissement est obligatoire.`,
    };
  }

  // 4. Téléphone
  const rawPhone = (phone || "").trim();
  if (!rawPhone) {
    return {
      valid: false,
      error: "Le numéro de téléphone officiel est obligatoire.",
    };
  }

  // Extraire les chiffres
  let digits = rawPhone.replace(/\D/g, "");
  const dialDigits = cfg.dialCode.replace(/\D/g, "");

  // Si l'indicatif est présent au début
  if (digits.startsWith("00" + dialDigits)) {
    digits = digits.slice(("00" + dialDigits).length);
  } else if (digits.startsWith(dialDigits)) {
    digits = digits.slice(dialDigits.length);
  }

  if (!cfg.phoneDigits.includes(digits.length)) {
    const expected = cfg.phoneDigits.join(" ou ");
    return {
      valid: false,
      error: `Le numéro de téléphone pour ${country} doit comporter ${expected} chiffres après l'indicatif ${cfg.dialCode} (Actuellement : ${digits.length} chiffres).`,
    };
  }

  const formattedPhone = formatPhoneNumber(digits, country);

  return {
    valid: true,
    formattedPhone,
  };
}
