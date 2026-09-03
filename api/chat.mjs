import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config({ quiet: true });

const PORT = Number(process.env.CHAT_SERVER_PORT ?? 8787);
const MODEL = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
const ROOT_DIR = process.cwd();
const GENERATED_DATA_FILE = path.join(
  ROOT_DIR,
  "src",
  "data",
  "generated",
  "countryProfiles.ts"
);

const AI_PILLARS = [
  "Government",
  "Infrastructure",
  "Digital Skills",
];

const ENABLER_LABELS = {
  Government: "Policy and governance",
  Infrastructure: "Infrastructure",
  "Digital Skills": "Digital skills",
};

const READINESS_BANDS = [
  "Mature",
  "Developing",
  "Adopting",
  "Early adopting",
  "Insufficient data",
];

const LEGACY_CLASSIFICATION_LABELS = {
  Excellent: "Mature",
  Good: "Developing",
  Developing: "Developing",
  "Requires some improvement": "Early adopting",
  Mature: "Mature",
  Adopting: "Adopting",
  "Early adopting": "Early adopting",
  "Insufficient data": "Insufficient data",
};

function normalizeText(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

function tokenize(value) {
  return normalizeText(value)
    .split(/[^a-z0-9]+/i)
    .map((token) => token.trim())
    .filter(Boolean);
}

function getEnablerLabel(enabler) {
  return ENABLER_LABELS[enabler] ?? enabler;
}


function getBandFromScore100(value, hasData = true) {
  if (!hasData || value === null || value === undefined) {
    return "Insufficient data";
  }

  if (value >= 70) return "Mature";
  if (value >= 55) return "Developing";
  if (value >= 40) return "Adopting";
  return "Early adopting";
}

function getBandFromGrade01(value, hasData = true) {
  if (!hasData || value === null || value === undefined) {
    return "Insufficient data";
  }

  if (value >= 0.7) return "Mature";
  if (value >= 0.55) return "Developing";
  if (value >= 0.4) return "Adopting";
  return "Early adopting";
}

function createOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "Missing OPENAI_API_KEY. Create a .env file from .env.example and restart the chat server."
    );
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

function loadCountryProfiles() {
  if (!fs.existsSync(GENERATED_DATA_FILE)) {
    throw new Error(
      `Generated data file not found: ${path.relative(
        ROOT_DIR,
        GENERATED_DATA_FILE
      )}. Run npm run generate:data first.`
    );
  }

  const fileContent = fs.readFileSync(GENERATED_DATA_FILE, "utf8");
  const startMarker = "export const generatedCountryProfiles";
  const startIndex = fileContent.indexOf(startMarker);

  if (startIndex === -1) {
    throw new Error("Could not find generatedCountryProfiles export.");
  }

  const equalsIndex = fileContent.indexOf("=", startIndex);
  const endIndex = fileContent.lastIndexOf(";");

  if (equalsIndex === -1 || endIndex === -1 || endIndex <= equalsIndex) {
    throw new Error("Could not parse generatedCountryProfiles data.");
  }

  const jsonText = fileContent.slice(equalsIndex + 1, endIndex).trim();

  try {
    return JSON.parse(jsonText);
  } catch (error) {
    throw new Error(
      `Could not parse generated country profiles as JSON. ${
        error instanceof Error ? error.message : "Unknown parse error."
      }`
    );
  }
}

function countryHasData(country) {
  return Number(country.dataCoverage ?? 0) > 0;
}

function pillarHasData(country, pillar) {
  const pillarData = country.pillars?.[pillar];

  return Number(pillarData?.availableIndicators ?? 0) > 0;
}

function findMentionedCountries(question, profiles) {
  const normalizedQuestion = normalizeText(question);
  const questionTokens = new Set(tokenize(question));

  return profiles.filter((country) => {
    const normalizedName = normalizeText(country.name);
    const normalizedCode = normalizeText(country.code);

    return (
      normalizedQuestion.includes(normalizedName) ||
      questionTokens.has(normalizedCode)
    );
  });
}

function findMentionedContinent(question, profiles) {
  const normalizedQuestion = normalizeText(question);
  const continents = [...new Set(profiles.map((country) => country.region))];

  return (
    continents.find((continent) =>
      normalizedQuestion.includes(normalizeText(continent))
    ) ?? null
  );
}

function findMentionedClassification(question) {
  const normalizedQuestion = normalizeText(question);
  const classificationIntent =
    /\b(classified|classification|classify|category|band|countries|country list|show me|which countries|what countries)\b/.test(
      normalizedQuestion
    );

  if (!classificationIntent) {
    return null;
  }

  if (/\bmature\b|\bexcellent\b/.test(normalizedQuestion)) return "Mature";
  if (/\bdeveloping\b|\bgood\b/.test(normalizedQuestion)) return "Developing";
  if (/\badopting\b/.test(normalizedQuestion)) return "Adopting";

  if (
    /early adopting|requires some improvement|requires improvement|needs improvement|weak|lowest|lagging/.test(
      normalizedQuestion
    )
  ) {
    return "Early adopting";
  }

  if (/insufficient data|no data|missing data/.test(normalizedQuestion)) {
    return "Insufficient data";
  }

  return null;
}

function findMentionedPillars(question) {
  const normalizedQuestion = normalizeText(question);

  const aliases = {
    Government: ["government", "governance", "policy", "policy and governance", "regulation"],
    Infrastructure: [
      "infrastructure",
      "connectivity",
      "broadband",
      "internet",
      "network",
      "mobile",
      "traffic",
      "market",
      "ecosystem",
      "price",
      "affordability",
      "cost",
      "basket",
    ],
    "Digital Skills": [
      "digital skills",
      "society",
      "social",
      "digital inclusion",
      "population",
      "usage",
      "adoption",
      "skills",
      "human capital",
      "human capital development",
      "capacity",
      "capacity building",
      "stem",
      "education",
      "graduates",
      "talent",
    ],
  };

  return AI_PILLARS.filter((pillar) => {
    const pillarWords = [...tokenize(pillar), ...tokenize(getEnablerLabel(pillar))].filter((word) => word.length > 2);
    const aliasWords = aliases[pillar] ?? [];

    return (
      pillarWords.some((word) => normalizedQuestion.includes(word)) ||
      aliasWords.some((word) => normalizedQuestion.includes(word))
    );
  });
}

function getCountryClassification(country) {
  return getBandFromScore100(country.score, countryHasData(country));
}

function getPillarClassification(country, pillar) {
  const value = country.dimensions?.[pillar] ?? null;

  return getBandFromScore100(value, pillarHasData(country, pillar));
}

function getAllIndicators(country) {
  return AI_PILLARS.flatMap((pillar) => {
    const pillarData = country.pillars?.[pillar];

    if (!pillarData?.indicators) return [];

    return pillarData.indicators.map((indicator) => ({
      enabler: getEnablerLabel(pillar),
      indicator: indicator.indicator,
      source: indicator.source,
      year: indicator.year,
      grade: indicator.grade,
      classification: getBandFromGrade01(indicator.grade),
    }));
  });
}

function compactCountry(country, mentionedPillars = []) {
  const pillarsToInclude =
    mentionedPillars.length > 0 ? mentionedPillars : AI_PILLARS;

  const pillarProfile = pillarsToInclude.map((pillar) => {
    const pillarData = country.pillars?.[pillar];

    const indicators = (pillarData?.indicators ?? [])
      .slice()
      .sort((left, right) => right.grade - left.grade)
      .map((indicator) => ({
        name: indicator.indicator,
        source: indicator.source,
        year: indicator.year,
        classification: getBandFromGrade01(indicator.grade),
      }));

    return {
      enabler: getEnablerLabel(pillar),
      classification: getPillarClassification(country, pillar),
      dataCoverage: `${Math.round((pillarData?.coverage ?? 0) * 100)}%`,
      indicators,
    };
  });

  const allIndicators = getAllIndicators(country);

  const strongestIndicators = allIndicators
    .slice()
    .sort((left, right) => right.grade - left.grade)
    .slice(0, 8)
    .map((indicator) => ({
      enabler: indicator.enabler,
      name: indicator.indicator,
      classification: indicator.classification,
      year: indicator.year,
      source: indicator.source,
    }));

  const weakestIndicators = allIndicators
    .slice()
    .sort((left, right) => left.grade - right.grade)
    .slice(0, 8)
    .map((indicator) => ({
      enabler: indicator.enabler,
      name: indicator.indicator,
      classification: indicator.classification,
      year: indicator.year,
      source: indicator.source,
    }));

  return {
    code: country.code,
    name: country.name,
    continent: country.region,
    classification: getCountryClassification(country),
    dataCoverage: `${Math.round(country.dataCoverage ?? 0)}%`,
    enablers: pillarProfile,
    strongestIndicators,
    weakestIndicators,
  };
}

function buildDatasetContext(question, profiles) {
  const normalizedQuestion = normalizeText(question);
  const mentionedCountries = findMentionedCountries(question, profiles);
  const mentionedContinent = findMentionedContinent(question, profiles);
  const mentionedClassification = findMentionedClassification(question);
  const mentionedPillars = findMentionedPillars(question);

  let relevantCountries = mentionedCountries;

  if (relevantCountries.length === 0 && mentionedContinent) {
    relevantCountries = profiles.filter(
      (country) => country.region === mentionedContinent
    );
  }

  if (mentionedClassification) {
    relevantCountries = (
      relevantCountries.length > 0 ? relevantCountries : profiles
    ).filter(
      (country) => getCountryClassification(country) === mentionedClassification
    );
  }

  const questionLooksBroad =
    relevantCountries.length === 0 ||
    normalizedQuestion.includes("all countries") ||
    normalizedQuestion.includes("which countries") ||
    normalizedQuestion.includes("what countries") ||
    normalizedQuestion.includes("show me countries") ||
    normalizedQuestion.includes("country list") ||
    normalizedQuestion.includes("classification") ||
    normalizedQuestion.includes("classified");

  if (questionLooksBroad && relevantCountries.length === 0) {
    relevantCountries = profiles;
  }

  const compactCountries = relevantCountries
    .slice()
    .sort((left, right) => left.name.localeCompare(right.name))
    .slice(0, 80)
    .map((country) => compactCountry(country, mentionedPillars));

  const countryDirectory = profiles.map((country) => ({
    code: country.code,
    name: country.name,
    continent: country.region,
    classification: getCountryClassification(country),
    dataCoverage: `${Math.round(country.dataCoverage ?? 0)}%`,
  }));

  return {
    mentionedCountryCodes: mentionedCountries.map((country) => country.code),
    relevantCountryCodes: relevantCountries
      .slice(0, 20)
      .map((country) => country.code),
    datasetSummary: {
      countries: profiles.length,
      countryUniverse: "UN Member States only",
      enablers: AI_PILLARS.map(getEnablerLabel),
      continents: [...new Set(profiles.map((country) => country.region))],
      classifications: READINESS_BANDS,
      scoringVisibility:
        "Internal numeric scores, normalized grades, raw values and ranking positions are intentionally hidden from end users.",
    },
    filtersDetected: {
      continent: mentionedContinent,
      classification: mentionedClassification,
      enablers: mentionedPillars.map(getEnablerLabel),
    },
    countryDirectory:
      compactCountries.length > 0 && compactCountries.length <= 10
        ? countryDirectory
        : countryDirectory.slice(0, 240),
    relevantCountries: compactCountries,
    truncated:
      relevantCountries.length > compactCountries.length
        ? `Showing ${compactCountries.length} of ${relevantCountries.length} relevant countries in context.`
        : null,
  };
}

function getSystemInstructions() {
  return `
You are the AI Maturity Data Chat assistant.

You answer using only the dataset context provided by the local server.

The dataset uses three pillars:
- Policy and governance
- Infrastructure
- Digital skills

The dashboard intentionally hides internal numeric scores, normalized grades, raw VALUES and ranking positions from end users.

Rules:
1. Do not invent countries, indicators, years, classifications or sources.
2. Do not reveal internal numeric scores, normalized grades, raw VALUES, hidden thresholds or ranking positions.
3. Use qualitative bands only: Mature, Developing, Adopting, Early adopting, Insufficient data.
4. When discussing strengths or weaknesses, prefer indicator-level evidence when available.
5. If the available context is insufficient, say exactly what is missing.
6. Be direct, concise and useful.
7. If the user asks for a comparison, compare by pillar and indicator-level details.
8. Use markdown formatting.
9. Refer to continent, not income group.
10. If data coverage is low, explicitly mention that the answer may be less reliable.
11. If the user asks for exact scores, ranks, thresholds or raw values, refuse briefly and explain that the dashboard only exposes qualitative classifications and coverage.
`;
}

function buildHistoryText(history) {
  if (!Array.isArray(history)) return "";

  return history
    .slice(-8)
    .filter(
      (item) =>
        item &&
        ["user", "assistant"].includes(item.role) &&
        typeof item.content === "string"
    )
    .map((item) => `${item.role.toUpperCase()}: ${item.content.slice(0, 1500)}`)
    .join("\n\n");
}


function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

async function readRequestBody(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }

  const chunks = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const rawBody = Buffer.concat(chunks).toString("utf8").trim();

  if (!rawBody) return {};

  try {
    return JSON.parse(rawBody);
  } catch {
    return {};
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }

  if (req.method !== "POST") {
    return sendJson(res, 405, {
      error: "Method not allowed. Use POST.",
    });
  }

  try {
    const body = await readRequestBody(req);
    const question = String(body?.message ?? body?.question ?? "").trim();

    if (!question) {
      return sendJson(res, 400, {
        error: "Missing message.",
      });
    }

    const profiles = loadCountryProfiles();
    const datasetContext = buildDatasetContext(question, profiles);
    const historyText = buildHistoryText(body?.history);
    const client = createOpenAIClient();

    const userInput = `
User question:
${question}

Recent conversation:
${historyText || "No previous conversation provided."}

Dataset context:
${JSON.stringify(datasetContext, null, 2)}
`;

    const response = await client.responses.create({
      model: MODEL,
      instructions: getSystemInstructions(),
      input: userInput,
      temperature: 0.2,
      max_output_tokens: 900,
    });

    return sendJson(res, 200, {
      answer: response.output_text || "No answer returned by OpenAI.",
      countryCodes:
        datasetContext.mentionedCountryCodes.length > 0
          ? datasetContext.mentionedCountryCodes
          : datasetContext.relevantCountryCodes,
    });
  } catch (error) {
    console.error(error);

    return sendJson(res, 500, {
      error:
        error instanceof Error
          ? error.message
          : "Unknown error while calling OpenAI.",
    });
  }
}
