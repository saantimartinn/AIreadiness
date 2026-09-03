import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import ExcelJS from "exceljs";
import isoCountries from "i18n-iso-countries";

const ROOT_DIR = process.cwd();
const RAW_DATA_DIR = path.join(ROOT_DIR, "data", "raw");
const OUTPUT_DIR = path.join(ROOT_DIR, "src", "data", "generated");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "countryProfiles.ts");

const EXPECTED_UN_MEMBER_COUNT = 193;

const PILLARS = [
  "Government",
  "Infrastructure",
  "Digital Skills",
];

const PILLAR_SOURCE_DIRECTORIES = {
  Government: ["Government"],
  Infrastructure: ["Infrastructure", "Market"],
  "Digital Skills": ["Society", "Skills & Capacity Building"],
};

const PILLAR_WEIGHTS = {
  Government: 1 / 3,
  Infrastructure: 1 / 3,
  "Digital Skills": 1 / 3,
};

const ALLOWED_COUNTRIES = {
  AFG: "Afghanistan",
  ALB: "Albania",
  DZA: "Algeria",
  AND: "Andorra",
  AGO: "Angola",
  ATG: "Antigua and Barbuda",
  ARG: "Argentina",
  ARM: "Armenia",
  AUS: "Australia",
  AUT: "Austria",
  AZE: "Azerbaijan",
  BHS: "Bahamas",
  BHR: "Bahrain",
  BGD: "Bangladesh",
  BRB: "Barbados",
  BLR: "Belarus",
  BEL: "Belgium",
  BLZ: "Belize",
  BEN: "Benin",
  BTN: "Bhutan",
  BOL: "Bolivia",
  BIH: "Bosnia and Herzegovina",
  BWA: "Botswana",
  BRA: "Brazil",
  BRN: "Brunei Darussalam",
  BGR: "Bulgaria",
  BFA: "Burkina Faso",
  BDI: "Burundi",
  CPV: "Cabo Verde",
  KHM: "Cambodia",
  CMR: "Cameroon",
  CAN: "Canada",
  CAF: "Central African Republic",
  TCD: "Chad",
  CHL: "Chile",
  CHN: "China",
  COL: "Colombia",
  COM: "Comoros",
  COG: "Congo",
  CRI: "Costa Rica",
  CIV: "Côte d'Ivoire",
  HRV: "Croatia",
  CUB: "Cuba",
  CYP: "Cyprus",
  CZE: "Czechia",
  PRK: "Democratic People's Republic of Korea",
  COD: "Democratic Republic of the Congo",
  DNK: "Denmark",
  DJI: "Djibouti",
  DMA: "Dominica",
  DOM: "Dominican Republic",
  ECU: "Ecuador",
  EGY: "Egypt",
  SLV: "El Salvador",
  GNQ: "Equatorial Guinea",
  ERI: "Eritrea",
  EST: "Estonia",
  SWZ: "Eswatini",
  ETH: "Ethiopia",
  FJI: "Fiji",
  FIN: "Finland",
  FRA: "France",
  GAB: "Gabon",
  GMB: "Gambia",
  GEO: "Georgia",
  DEU: "Germany",
  GHA: "Ghana",
  GRC: "Greece",
  GRD: "Grenada",
  GTM: "Guatemala",
  GIN: "Guinea",
  GNB: "Guinea-Bissau",
  GUY: "Guyana",
  HTI: "Haiti",
  HND: "Honduras",
  HUN: "Hungary",
  ISL: "Iceland",
  IND: "India",
  IDN: "Indonesia",
  IRN: "Iran",
  IRQ: "Iraq",
  IRL: "Ireland",
  ISR: "Israel",
  ITA: "Italy",
  JAM: "Jamaica",
  JPN: "Japan",
  JOR: "Jordan",
  KAZ: "Kazakhstan",
  KEN: "Kenya",
  KIR: "Kiribati",
  KWT: "Kuwait",
  KGZ: "Kyrgyzstan",
  LAO: "Lao People's Democratic Republic",
  LVA: "Latvia",
  LBN: "Lebanon",
  LSO: "Lesotho",
  LBR: "Liberia",
  LBY: "Libya",
  LIE: "Liechtenstein",
  LTU: "Lithuania",
  LUX: "Luxembourg",
  MDG: "Madagascar",
  MWI: "Malawi",
  MYS: "Malaysia",
  MDV: "Maldives",
  MLI: "Mali",
  MLT: "Malta",
  MHL: "Marshall Islands",
  MRT: "Mauritania",
  MUS: "Mauritius",
  MEX: "Mexico",
  FSM: "Micronesia",
  MCO: "Monaco",
  MNG: "Mongolia",
  MNE: "Montenegro",
  MAR: "Morocco",
  MOZ: "Mozambique",
  MMR: "Myanmar",
  NAM: "Namibia",
  NRU: "Nauru",
  NPL: "Nepal",
  NLD: "Netherlands",
  NZL: "New Zealand",
  NIC: "Nicaragua",
  NER: "Niger",
  NGA: "Nigeria",
  MKD: "North Macedonia",
  NOR: "Norway",
  OMN: "Oman",
  PAK: "Pakistan",
  PLW: "Palau",
  PAN: "Panama",
  PNG: "Papua New Guinea",
  PRY: "Paraguay",
  PER: "Peru",
  PHL: "Philippines",
  POL: "Poland",
  PRT: "Portugal",
  QAT: "Qatar",
  KOR: "Republic of Korea",
  MDA: "Republic of Moldova",
  ROU: "Romania",
  RUS: "Russian Federation",
  RWA: "Rwanda",
  KNA: "Saint Kitts and Nevis",
  LCA: "Saint Lucia",
  VCT: "Saint Vincent and the Grenadines",
  WSM: "Samoa",
  SMR: "San Marino",
  STP: "Sao Tome and Principe",
  SAU: "Saudi Arabia",
  SEN: "Senegal",
  SRB: "Serbia",
  SYC: "Seychelles",
  SLE: "Sierra Leone",
  SGP: "Singapore",
  SVK: "Slovak Republic",
  SVN: "Slovenia",
  SLB: "Solomon Islands",
  SOM: "Somalia",
  ZAF: "South Africa",
  SSD: "South Sudan",
  ESP: "Spain",
  LKA: "Sri Lanka",
  SDN: "Sudan",
  SUR: "Suriname",
  SWE: "Sweden",
  CHE: "Switzerland",
  SYR: "Syrian Arab Republic",
  TJK: "Tajikistan",
  THA: "Thailand",
  TLS: "Timor-Leste",
  TGO: "Togo",
  TON: "Tonga",
  TTO: "Trinidad and Tobago",
  TUN: "Tunisia",
  TUR: "Türkiye",
  TKM: "Turkmenistan",
  TUV: "Tuvalu",
  UGA: "Uganda",
  UKR: "Ukraine",
  ARE: "United Arab Emirates",
  GBR: "United Kingdom",
  TZA: "United Republic of Tanzania",
  USA: "United States",
  URY: "Uruguay",
  UZB: "Uzbekistan",
  VUT: "Vanuatu",
  VEN: "Venezuela",
  VNM: "Viet Nam",
  YEM: "Yemen",
  ZMB: "Zambia",
  ZWE: "Zimbabwe",
};

const ALLOWED_COUNTRY_CODES = new Set(Object.keys(ALLOWED_COUNTRIES));

if (ALLOWED_COUNTRY_CODES.size !== EXPECTED_UN_MEMBER_COUNT) {
  throw new Error(
    `Expected ${EXPECTED_UN_MEMBER_COUNT} UN Member States, but found ${ALLOWED_COUNTRY_CODES.size}.`
  );
}

const AGGREGATE_CODES = new Set([
  "AFE",
  "AFW",
  "ARB",
  "CEB",
  "CSS",
  "EAP",
  "EAR",
  "EAS",
  "ECA",
  "ECS",
  "EMU",
  "EUU",
  "FCS",
  "FTI",
  "HIC",
  "HPC",
  "IBD",
  "IBT",
  "IDA",
  "IDB",
  "IDX",
  "INX",
  "LAC",
  "LCN",
  "LDC",
  "LIC",
  "LMC",
  "LMY",
  "LNX",
  "LTE",
  "MEA",
  "MIC",
  "MNA",
  "NAC",
  "OED",
  "OSS",
  "PRE",
  "PSS",
  "PST",
  "SAS",
  "SSA",
  "SSF",
  "SST",
  "TEA",
  "TEC",
  "TLA",
  "TMN",
  "TSA",
  "TSS",
  "UMC",
  "WLD",
]);

const CONTINENT_GROUPS = {
  Africa: [
    "DZA",
    "AGO",
    "BEN",
    "BWA",
    "BFA",
    "BDI",
    "CPV",
    "CMR",
    "CAF",
    "TCD",
    "COM",
    "COG",
    "COD",
    "CIV",
    "DJI",
    "EGY",
    "GNQ",
    "ERI",
    "SWZ",
    "ETH",
    "GAB",
    "GMB",
    "GHA",
    "GIN",
    "GNB",
    "KEN",
    "LSO",
    "LBR",
    "LBY",
    "MDG",
    "MWI",
    "MLI",
    "MRT",
    "MUS",
    "MAR",
    "MOZ",
    "NAM",
    "NER",
    "NGA",
    "RWA",
    "STP",
    "SEN",
    "SYC",
    "SLE",
    "SOM",
    "ZAF",
    "SSD",
    "SDN",
    "TZA",
    "TGO",
    "TUN",
    "UGA",
    "ZMB",
    "ZWE",
  ],

  Asia: [
    "AFG",
    "ARM",
    "AZE",
    "BHR",
    "BGD",
    "BTN",
    "BRN",
    "KHM",
    "CHN",
    "CYP",
    "GEO",
    "IND",
    "IDN",
    "IRN",
    "IRQ",
    "ISR",
    "JPN",
    "JOR",
    "KAZ",
    "KWT",
    "KGZ",
    "LAO",
    "LBN",
    "MYS",
    "MDV",
    "MNG",
    "MMR",
    "NPL",
    "PRK",
    "OMN",
    "PAK",
    "PHL",
    "QAT",
    "SAU",
    "SGP",
    "KOR",
    "LKA",
    "SYR",
    "TJK",
    "THA",
    "TLS",
    "TUR",
    "TKM",
    "ARE",
    "UZB",
    "VNM",
    "YEM",
  ],

  Europe: [
    "ALB",
    "AND",
    "AUT",
    "BLR",
    "BEL",
    "BIH",
    "BGR",
    "HRV",
    "CZE",
    "DNK",
    "EST",
    "FIN",
    "FRA",
    "DEU",
    "GRC",
    "HUN",
    "ISL",
    "IRL",
    "ITA",
    "LVA",
    "LIE",
    "LTU",
    "LUX",
    "MLT",
    "MDA",
    "MCO",
    "MNE",
    "NLD",
    "MKD",
    "NOR",
    "POL",
    "PRT",
    "ROU",
    "RUS",
    "SMR",
    "SRB",
    "SVK",
    "SVN",
    "ESP",
    "SWE",
    "CHE",
    "UKR",
    "GBR",
  ],

  "North America": [
    "ATG",
    "BHS",
    "BRB",
    "BLZ",
    "CAN",
    "CRI",
    "CUB",
    "DMA",
    "DOM",
    "SLV",
    "GRD",
    "GTM",
    "HTI",
    "HND",
    "JAM",
    "MEX",
    "NIC",
    "PAN",
    "KNA",
    "LCA",
    "VCT",
    "TTO",
    "USA",
  ],

  "South America": [
    "ARG",
    "BOL",
    "BRA",
    "CHL",
    "COL",
    "ECU",
    "GUY",
    "PRY",
    "PER",
    "SUR",
    "URY",
    "VEN",
  ],

  Oceania: [
    "AUS",
    "FJI",
    "KIR",
    "MHL",
    "FSM",
    "NRU",
    "NZL",
    "PLW",
    "PNG",
    "WSM",
    "SLB",
    "TON",
    "TUV",
    "VUT",
  ],
};

const ISO3_TO_CONTINENT = Object.fromEntries(
  Object.entries(CONTINENT_GROUPS).flatMap(([continent, iso3Codes]) =>
    iso3Codes.map((iso3) => [iso3, continent])
  )
);

function normalizeKey(key) {
  return String(key ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function normalizeIso3(value) {
  return String(value ?? "").trim().toUpperCase();
}

function shouldExcludeIso3(iso3) {
  if (!iso3) return true;
  if (AGGREGATE_CODES.has(iso3)) return true;
  if (!ALLOWED_COUNTRY_CODES.has(iso3)) return true;

  return false;
}

function getColumnValue(row, possibleNames) {
  const normalizedRow = new Map();

  for (const [key, value] of Object.entries(row)) {
    normalizedRow.set(normalizeKey(key), value);
  }

  for (const name of possibleNames) {
    const normalizedName = normalizeKey(name);

    if (normalizedRow.has(normalizedName)) {
      return normalizedRow.get(normalizedName);
    }
  }

  return null;
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") return null;

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function round(value, decimals = 4) {
  if (value === null || value === undefined) return null;

  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function average(values) {
  const cleanValues = values.filter((value) => typeof value === "number");

  if (cleanValues.length === 0) return null;

  return cleanValues.reduce((sum, value) => sum + value, 0) / cleanValues.length;
}

function getClassification(score01) {
  if (score01 === null || score01 === undefined) return "Insufficient data";
  if (score01 >= 0.7) return "Mature";
  if (score01 >= 0.55) return "Developing";
  if (score01 >= 0.4) return "Adopting";
  return "Early adopting";
}

function getExcelFiles(dir) {
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".xlsx"))
    .filter((file) => !file.startsWith("~$"))
    .map((file) => path.join(dir, file));
}

function normalizeExcelCellValue(value) {
  if (value === undefined || value === null) return null;
  if (value instanceof Date) return value.toISOString();

  if (typeof value !== "object") {
    return value;
  }

  if ("result" in value) {
    return normalizeExcelCellValue(value.result);
  }

  if ("text" in value) {
    return value.text;
  }

  if ("richText" in value && Array.isArray(value.richText)) {
    return value.richText.map((item) => item.text ?? "").join("");
  }

  return String(value);
}

async function readGradesSheet(filePath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const sheet = workbook.getWorksheet("GRADES");

  if (!sheet) {
    const availableSheets = workbook.worksheets
      .map((worksheet) => worksheet.name)
      .join(", ");

    throw new Error(
      `${filePath} does not contain a sheet called GRADES. Available sheets: ${availableSheets || "none"}`
    );
  }

  const headerRow = sheet.getRow(1);
  const headers = [];

  for (let columnIndex = 1; columnIndex <= sheet.columnCount; columnIndex += 1) {
    const header = normalizeExcelCellValue(headerRow.getCell(columnIndex).value);
    headers[columnIndex] = String(header ?? `__EMPTY_${columnIndex}`).trim();
  }

  const rows = [];

  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;

    const rowObject = {};

    for (
      let columnIndex = 1;
      columnIndex <= sheet.columnCount;
      columnIndex += 1
    ) {
      const key = headers[columnIndex] || `__EMPTY_${columnIndex}`;
      rowObject[key] = normalizeExcelCellValue(row.getCell(columnIndex).value);
    }

    rows.push(rowObject);
  });

  return rows;
}

function getIndicatorName(filePath) {
  return path.basename(filePath, path.extname(filePath));
}

async function readIndicatorFile(filePath) {
  const rows = await readGradesSheet(filePath);
  const latestByCountry = new Map();
  const warnings = [];

  for (const row of rows) {
    const iso3Raw = getColumnValue(row, ["ISO3"]);
    const iso3 = normalizeIso3(iso3Raw);

    if (shouldExcludeIso3(iso3)) continue;

    const countryRaw = getColumnValue(row, [
      "COUNTRY",
      "entityName",
      "ENTITY_NAME",
    ]);
    const valueRaw = getColumnValue(row, [
      "VALUES",
      "dataValue",
      "DATA_VALUE",
    ]);
    const yearRaw = getColumnValue(row, ["YEAR"]);
    const gradeRaw = getColumnValue(row, ["GRADES"]);

    const country = String(countryRaw ?? iso3).trim();
    const year = toNumber(yearRaw);
    const grade = toNumber(gradeRaw);

    if (grade === null) {
      warnings.push(`Missing GRADES for ${iso3} in ${path.basename(filePath)}`);
      continue;
    }

    if (grade < 0 || grade > 1) {
      warnings.push(
        `Invalid GRADES=${grade} for ${iso3} in ${path.basename(filePath)}`
      );
      continue;
    }

    const candidate = {
      iso3,
      country,
      year,
      value: valueRaw,
      grade: round(grade, 6),
      source: path.basename(filePath),
      indicator: getIndicatorName(filePath),
    };

    const current = latestByCountry.get(iso3);

    if (!current) {
      latestByCountry.set(iso3, candidate);
      continue;
    }

    const currentYear = current.year ?? -Infinity;
    const candidateYear = candidate.year ?? -Infinity;

    if (candidateYear >= currentYear) {
      latestByCountry.set(iso3, candidate);
    }
  }

  return {
    rows: Array.from(latestByCountry.values()),
    warnings,
  };
}

function getFlagEmoji(iso3) {
  const iso2 = isoCountries.alpha3ToAlpha2(iso3);

  if (!iso2) {
    return "🌍";
  }

  return iso2
    .toUpperCase()
    .replace(/./g, (char) =>
      String.fromCodePoint(127397 + char.charCodeAt(0))
    );
}

function getCountryMeta(iso3) {
  return {
    region: ISO3_TO_CONTINENT[iso3] ?? "Other",
  };
}

function createEmptyCountryRecord(iso3, name) {
  const meta = getCountryMeta(iso3);

  return {
    code: iso3,
    name,
    flag: getFlagEmoji(iso3),
    region: meta.region,
    rawPillars: Object.fromEntries(
      PILLARS.map((pillarName) => [pillarName, []])
    ),
  };
}

function initialiseAllowedCountries() {
  const countries = new Map();

  for (const [iso3, name] of Object.entries(ALLOWED_COUNTRIES)) {
    countries.set(iso3, createEmptyCountryRecord(iso3, name));
  }

  return countries;
}

async function buildProfiles() {
  const countries = initialiseAllowedCountries();
  const pillarIndicatorCounts = {};
  const warnings = [];

  for (const pillar of PILLARS) {
    const sourceDirectories = PILLAR_SOURCE_DIRECTORIES[pillar] ?? [pillar];
    const files = sourceDirectories.flatMap((directory) =>
      getExcelFiles(path.join(RAW_DATA_DIR, directory))
    );

    pillarIndicatorCounts[pillar] = files.length;

    if (files.length === 0) {
      warnings.push(`No Excel files found for pillar: ${pillar}`);
      continue;
    }

    for (const filePath of files) {
      const result = await readIndicatorFile(filePath);
      warnings.push(...result.warnings);

      for (const row of result.rows) {
        const country = countries.get(row.iso3);

        if (!country) continue;

        country.rawPillars[pillar].push({
          source: row.source,
          indicator: row.indicator,
          year: row.year,
          value: row.value,
          grade: row.grade,
        });
      }
    }
  }

  const profiles = Array.from(countries.values()).map((country) => {
    const pillars = {};
    const dimensions = {};
    const rawWeightedScores = [];
    const availableWeights = [];
    const coverageValues = [];

    for (const pillar of PILLARS) {
      const indicators = country.rawPillars[pillar] ?? [];
      const indicatorGrades = indicators.map((indicator) => indicator.grade);
      const rawScore01 = average(indicatorGrades);

      const totalIndicators = pillarIndicatorCounts[pillar] ?? 0;
      const availableIndicators = indicators.length;
      const coverage =
        totalIndicators === 0 ? 0 : availableIndicators / totalIndicators;

      coverageValues.push(coverage);

      const coverageAdjustedPillarScore01 =
        rawScore01 === null ? null : rawScore01 * coverage;

      pillars[pillar] = {
        value:
          coverageAdjustedPillarScore01 === null
            ? null
            : round(coverageAdjustedPillarScore01, 6),
        classification: getClassification(coverageAdjustedPillarScore01),
        coverage: round(coverage, 4),
        availableIndicators,
        totalIndicators,
        indicators,
      };

      dimensions[pillar] =
        coverageAdjustedPillarScore01 === null
          ? 0
          : round(coverageAdjustedPillarScore01 * 100, 2);

      if (rawScore01 !== null) {
        rawWeightedScores.push(rawScore01 * PILLAR_WEIGHTS[pillar]);
        availableWeights.push(PILLAR_WEIGHTS[pillar]);
      }
    }

    const totalAvailableWeight = availableWeights.reduce(
      (sum, value) => sum + value,
      0
    );

    const rawCountryScore01 =
      totalAvailableWeight === 0
        ? null
        : rawWeightedScores.reduce((sum, value) => sum + value, 0) /
          totalAvailableWeight;

    const dataCoverage01 = average(coverageValues) ?? 0;
    const coverageAdjustedCountryScore01 =
      rawCountryScore01 === null ? null : rawCountryScore01 * dataCoverage01;

    const sortedDimensions = Object.entries(dimensions).sort(
      (left, right) => right[1] - left[1]
    );

    return {
      code: country.code,
      name: country.name,
      flag: country.flag,
      region: country.region,
      rank: 0,
      score:
        coverageAdjustedCountryScore01 === null
          ? 0
          : round(coverageAdjustedCountryScore01 * 100, 2),
      classification: getClassification(coverageAdjustedCountryScore01),
      yearlyChange: 0,
      dataCoverage: round(dataCoverage01 * 100, 1),
      dimensions,
      pillars,
      strengths: sortedDimensions.slice(0, 1).map(([pillar]) => pillar),
      weaknesses: sortedDimensions
        .slice(-1)
        .map(([pillar]) => pillar)
        .reverse(),
      trend3y: 0,
    };
  });

  profiles.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    return a.name.localeCompare(b.name);
  });

  profiles.forEach((profile, index) => {
    profile.rank = index + 1;
  });

  return {
    profiles,
    warnings,
    pillarIndicatorCounts,
  };
}

function writeOutput(profiles) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const content = `import type { CountryAIReadiness } from "@/types";

export const generatedCountryProfiles: CountryAIReadiness[] = ${JSON.stringify(
    profiles,
    null,
    2
  )};
`;

  fs.writeFileSync(OUTPUT_FILE, content, "utf8");
}

const { profiles, warnings, pillarIndicatorCounts } = await buildProfiles();

if (profiles.length !== EXPECTED_UN_MEMBER_COUNT) {
  throw new Error(
    `Expected to generate ${EXPECTED_UN_MEMBER_COUNT} UN Member State profiles, but generated ${profiles.length}.`
  );
}

writeOutput(profiles);

const regionCounts = profiles.reduce((counts, profile) => {
  counts[profile.region] = (counts[profile.region] ?? 0) + 1;
  return counts;
}, {});

const countriesWithoutData = profiles.filter(
  (profile) => profile.dataCoverage === 0
);

console.log("Allowed UN Member States:", ALLOWED_COUNTRY_CODES.size);
console.log("Generated country profiles:", profiles.length);
console.log("Output:", path.relative(ROOT_DIR, OUTPUT_FILE));
console.log("Pillar indicator counts:", pillarIndicatorCounts);
console.log("Continent counts:", regionCounts);

if (countriesWithoutData.length > 0) {
  console.log("");
  console.log("UN Member States with no available indicator data:");
  for (const country of countriesWithoutData) {
    console.log(`- ${country.name} (${country.code})`);
  }
}

if (warnings.length > 0) {
  console.log("");
  console.log("Warnings:");

  for (const warning of warnings.slice(0, 80)) {
    console.log("-", warning);
  }

  if (warnings.length > 80) {
    console.log(`...and ${warnings.length - 80} more warnings`);
  }
}
