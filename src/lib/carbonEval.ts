import { preprocessQuery } from './preprocessing';

interface LLMProvider {
  name: string;
  model: string;
  region: string;
  baseEnergy: number;  // kWh per 1000 tokens
  baseCO2: number;     // kg per 1000 tokens
  waterUsage: number;  // L per 1000 tokens
  available: boolean;
}

const providers: LLMProvider[] = [
  {
    name: "Claude",
    model: "claude-2.1",
    region: "france",
    baseEnergy: 0.3,
    baseCO2: 0.1,
    waterUsage: 0.8,
    available: true
  },
  {
    name: "OpenAI",
    model: "gpt-4",
    region: "usa-east",
    baseEnergy: 0.4,
    baseCO2: 0.2,
    waterUsage: 1.0,
    available: true
  },
  {
    name: "Anthropic",
    model: "claude-3-opus",
    region: "usa-west",
    baseEnergy: 0.35,
    baseCO2: 0.15,
    waterUsage: 0.9,
    available: true
  },
  {
    name: "Mistral",
    model: "mistral-large",
    region: "europe",
    baseEnergy: 0.25,
    baseCO2: 0.08,
    waterUsage: 0.7,
    available: true
  }
];

// Regional carbon intensity factors (kg CO2/kWh)
const regionCarbonIntensity: Record<string, number> = {
  'france': 0.085,      // Low due to nuclear power
  'usa-east': 0.385,    // Mixed grid
  'usa-west': 0.275,    // More renewables
  'europe': 0.231,      // EU average
};

export interface ResourceMetrics {
  provider: LLMProvider;
  energySaved: number;
  co2Saved: number;
  waterSaved: number;
  tokenCount: number;
}

function estimateTokenCount(query: string): number {
  // Rough estimation: ~4 chars per token
  return Math.ceil(query.length / 4);
}

function calculateWorstCaseMetrics(tokenCount: number): {
  energy: number;
  co2: number;
  water: number;
} {
  // Worst case scenario based on most inefficient setup
  return {
    energy: 0.5 * (tokenCount / 1000), // kWh per 1000 tokens
    co2: 0.25 * (tokenCount / 1000),   // kg per 1000 tokens
    water: 1.2 * (tokenCount / 1000)    // L per 1000 tokens
  };
}

export async function evaluateResourceEfficiency(
  query: string
): Promise<ResourceMetrics> {
  const { complexity, category } = await preprocessQuery(query);
  const tokenCount = estimateTokenCount(query);
  
  // Score each provider based on multiple factors
  const scoredProviders = providers
    .filter(p => p.available)
    .map(provider => {
      const regionFactor = regionCarbonIntensity[provider.region];
      const actualCO2 = provider.baseCO2 * regionFactor * (tokenCount / 1000);
      
      const efficiencyScore = 1 - (provider.baseEnergy / 0.5); // Compare to worst case
      const carbonScore = 1 - (actualCO2 / 0.25); // Compare to worst case
      const waterScore = 1 - (provider.waterUsage / 1.2); // Compare to worst case
      
      // Weight the scores based on query complexity and category
      const totalScore = (
        efficiencyScore * 0.4 +
        carbonScore * 0.4 +
        waterScore * 0.2
      ) * (1 + complexity * 0.2); // Complexity bonus
      
      return {
        provider,
        score: totalScore
      };
    });
  
  // Select the most efficient provider
  const bestProvider = scoredProviders.sort((a, b) => b.score - a.score)[0].provider;
  
  // Calculate actual resource usage
  const actualEnergy = bestProvider.baseEnergy * (tokenCount / 1000);
  const actualCO2 = bestProvider.baseCO2 * regionCarbonIntensity[bestProvider.region] * (tokenCount / 1000);
  const actualWater = bestProvider.waterUsage * (tokenCount / 1000);
  
  // Calculate savings compared to worst case
  const worstCase = calculateWorstCaseMetrics(tokenCount);
  
  return {
    provider: bestProvider,
    energySaved: worstCase.energy - actualEnergy,
    co2Saved: worstCase.co2 - actualCO2,
    waterSaved: worstCase.water - actualWater,
    tokenCount
  };
}