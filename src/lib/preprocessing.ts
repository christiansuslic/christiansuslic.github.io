interface PreProcessingResult {
  complexity: number;
  category: string;
  sustainabilityImpact: number;
}

export async function preprocessQuery(query: string): Promise<PreProcessingResult> {
  // Analyze query complexity and category
  const complexity = analyzeComplexity(query);
  const category = categorizeQuery(query);
  
  // Calculate potential sustainability impact
  const sustainabilityImpact = calculateSustainabilityImpact(complexity, category);
  
  return {
    complexity,
    category,
    sustainabilityImpact
  };
}

function analyzeComplexity(query: string): number {
  // Analyze based on multiple factors
  const length = query.length;
  const words = query.split(' ').length;
  const specialChars = (query.match(/[^a-zA-Z0-9\s]/g) || []).length;
  const technicalTerms = countTechnicalTerms(query);
  
  // Weighted scoring
  const lengthScore = Math.min(length / 200, 1) * 0.3;
  const wordScore = Math.min(words / 50, 1) * 0.3;
  const specialScore = Math.min(specialChars / 10, 1) * 0.2;
  const technicalScore = Math.min(technicalTerms / 5, 1) * 0.2;
  
  return lengthScore + wordScore + specialScore + technicalScore;
}

function categorizeQuery(query: string): string {
  const lowercaseQuery = query.toLowerCase();
  
  // Simple categorization based on keywords
  if (lowercaseQuery.match(/math|calculate|compute|solve|equation/)) {
    return 'mathematical';
  } else if (lowercaseQuery.match(/code|program|function|algorithm/)) {
    return 'programming';
  } else if (lowercaseQuery.match(/explain|what|how|why/)) {
    return 'explanatory';
  } else if (lowercaseQuery.match(/analyze|compare|evaluate/)) {
    return 'analytical';
  }
  
  return 'general';
}

function countTechnicalTerms(query: string): number {
  const technicalTerms = [
    'algorithm',
    'function',
    'database',
    'api',
    'server',
    'quantum',
    'neural',
    'blockchain',
    'compiler',
    'framework'
  ];
  
  return technicalTerms.filter(term => 
    query.toLowerCase().includes(term)
  ).length;
}

function calculateSustainabilityImpact(complexity: number, category: string): number {
  // Higher impact means more resources needed
  const categoryMultipliers: Record<string, number> = {
    'mathematical': 1.2,
    'programming': 1.1,
    'analytical': 1.0,
    'explanatory': 0.8,
    'general': 0.7
  };
  
  return complexity * (categoryMultipliers[category] || 1);
}