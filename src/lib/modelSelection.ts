interface ModelCriteria {
  query: string;
  complexity: number;
  carbonFootprint: number;
  location: string;
}

interface Provider {
  name: string;
  region: string;
  model: string;
  carbonFootprint: number;
  energyEfficiency: number;
  waterUsage: number;
  available: boolean;
}

const providers: Provider[] = [
  {
    name: "Claude",
    region: "france",
    model: "claude-2.1",
    carbonFootprint: 0.2,
    energyEfficiency: 0.85,
    waterUsage: 0.3,
    available: true
  },
  {
    name: "OpenAI",
    region: "usa-east",
    model: "gpt-3.5-turbo",
    carbonFootprint: 0.4,
    energyEfficiency: 0.75,
    waterUsage: 0.5,
    available: true
  },
  {
    name: "DeepSeek",
    region: "china",
    model: "deepseek-chat",
    carbonFootprint: 0.5,
    energyEfficiency: 0.7,
    waterUsage: 0.6,
    available: true
  }
];

export function selectOptimalProvider(criteria: ModelCriteria) {
  // Filter available providers
  const availableProviders = providers.filter(p => p.available);
  
  // Score each provider based on multiple factors
  const scoredProviders = availableProviders.map(provider => {
    const carbonScore = 1 - (provider.carbonFootprint / 1);
    const energyScore = provider.energyEfficiency;
    const waterScore = 1 - (provider.waterUsage / 1);
    
    // Calculate total sustainability score
    const sustainabilityScore = (
      carbonScore * 0.4 + 
      energyScore * 0.4 + 
      waterScore * 0.2
    );
    
    return {
      ...provider,
      score: sustainabilityScore
    };
  });
  
  // Sort by score and get the best provider
  const bestProvider = scoredProviders.sort((a, b) => b.score - a.score)[0];
  
  // Calculate savings compared to worst case
  const worstCase = {
    energy: 2.5, // kWh per request
    co2: 1.2    // kg per request
  };
  
  const savings = {
    energy: worstCase.energy * (1 - bestProvider.energyEfficiency),
    co2: worstCase.co2 * (1 - bestProvider.carbonFootprint)
  };
  
  return {
    provider: bestProvider.name,
    model: bestProvider.model,
    location: bestProvider.region,
    energySaved: savings.energy,
    co2Saved: savings.co2
  };
}