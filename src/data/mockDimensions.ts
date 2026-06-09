import type { DimensionMeta } from "@/types";

export const dimensionMeta: DimensionMeta[] = [
  {
    key: "Government",
    label: "Policy and governance",
    description:
      "Measures public governance, regulation, institutional readiness and the policy environment for AI development.",
    indicators: [
      "Regulatory framework",
      "Public sector readiness",
      "Digital government capacity",
      "Institutional quality",
    ],
    weight: 0.2,
    color: "#b9108f",
  },
  {
    key: "Infrastructure",
    label: "Infrastructure",
    description:
      "Measures the availability and quality of digital and connectivity infrastructure needed to support AI deployment.",
    indicators: [
      "Broadband traffic",
      "Internet infrastructure",
      "Connectivity capacity",
      "Digital access infrastructure",
    ],
    weight: 0.2,
    color: "#06b812",
  },
  {
    key: "Society",
    label: "Digital inclusion",
    description:
      "Measures digital adoption, internet usage and the ability of the population to participate in digital systems.",
    indicators: [
      "Individuals using the internet",
      "Digital inclusion",
      "Public digital adoption",
    ],
    weight: 0.2,
    color: "#f59e0b",
  },
  {
    key: "Market",
    label: "Ecosystem",
    description:
      "Measures affordability, market conditions and the wider ecosystem that affects technology adoption.",
    indicators: [
      "Mobile broadband affordability",
      "Digital service affordability",
      "Consumer market accessibility",
    ],
    weight: 0.2,
    color: "#ef4444",
  },
  {
    key: "Skills & Capacity Building",
    label: "Human capital development",
    description:
      "Measures the human capital base needed to build, adopt and manage AI systems.",
    indicators: [
      "STEM graduates",
      "Technical education capacity",
      "Workforce capability",
    ],
    weight: 0.2,
    color: "#6366f1",
  },
];

export const dimensionMetaMap = new Map(
  dimensionMeta.map((dimension) => [dimension.key, dimension])
);
