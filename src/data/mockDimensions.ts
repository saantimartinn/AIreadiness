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
    weight: 1 / 3,
    color: "#b9108f",
  },
  {
    key: "Infrastructure",
    label: "Infrastructure",
    description:
      "Measures connectivity, digital infrastructure, affordability and market conditions needed to support AI deployment.",
    indicators: [
      "Broadband traffic",
      "Internet infrastructure",
      "Connectivity capacity",
      "Digital access infrastructure",
      "Mobile broadband affordability",
      "Digital service affordability",
      "Consumer market accessibility",
    ],
    weight: 1 / 3,
    color: "#06b812",
  },
  {
    key: "Digital Skills",
    label: "Digital skills",
    description:
      "Measures digital inclusion, internet adoption and the human capital needed to build, adopt and manage AI systems.",
    indicators: [
      "Individuals using the internet",
      "Digital inclusion",
      "Public digital adoption",
      "STEM graduates",
      "Technical education capacity",
      "Workforce capability",
    ],
    weight: 1 / 3,
    color: "#f59e0b",
  },
];

export const dimensionMetaMap = new Map(
  dimensionMeta.map((dimension) => [dimension.key, dimension])
);
