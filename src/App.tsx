import React, { useState } from 'react';
import OpenAI from "openai";
import treeImage from './tree.png'; // Import the image file
import { 
  LucideGlobe2, 
  LucideMessageSquare, 
  LucideSend,
  LucideSearch,
  LucideZap,
  LucideDroplets,
  LucideLeaf,
  LucideCircuitBoard
} from 'lucide-react';
import { evaluateResourceEfficiency } from './lib/carbonEval';

interface ProcessingStage {
  id: string;
  label: string;
  icon: React.ReactNode;
  complete: boolean;
}

function App() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [stages, setStages] = useState<ProcessingStage[]>([
    { 
      id: 'analyze', 
      label: 'Analyzing query complexity...', 
      icon: <LucideSearch className="h-5 w-5" />,
      complete: false 
    },
    { 
      id: 'region', 
      label: 'Finding optimal region...', 
      icon: <LucideGlobe2 className="h-5 w-5" />,
      complete: false 
    },
    { 
      id: 'model', 
      label: 'Selecting efficient model...', 
      icon: <LucideCircuitBoard className="h-5 w-5" />,
      complete: false 
    }
  ]);
  const [sustainabilityInfo, setSustainabilityInfo] = useState<{
    model: string;
    provider: string;
    location: string;
    energySaved: number;
    co2Saved: number;
    waterSaved: number;
    tokenCount: number;
  } | null>(null);

  const simulateStages = async () => {
    for (let i = 0; i < stages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStages(prev => prev.map((stage, index) => ({
        ...stage,
        complete: index <= i
      })));
    }
  };

  const openai = new OpenAI({
    baseURL: "https://api.deepseek.com",
    apiKey: "sk-7aa30308d1d34d8692d986de0d30da91",
    dangerouslyAllowBrowser: true
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
  
    setLoading(true);
    setResponse('');
    setSustainabilityInfo(null);
  
    try {
      // Process stages while evaluating efficiency
      await simulateStages();
      const metrics = await evaluateResourceEfficiency(query);
  
      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are a helpful AI assistant." },
          { role: "user", content: query }
        ],
      });
  
      const theResponse = completion.choices[0].message.content;
  
      // Set response from OpenAI
      setResponse(theResponse || '');
  
      // Set actual sustainability metrics
      setSustainabilityInfo({
        model: metrics.provider.model,
        provider: metrics.provider.name,
        location: metrics.provider.region,
        energySaved: metrics.energySaved,
        co2Saved: metrics.co2Saved,
        waterSaved: metrics.waterSaved,
        tokenCount: metrics.tokenCount
      });
    } catch (error) {
      console.error('Error:', error);
      setResponse('Sorry, there was an error processing your request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center gap-3">
            <LucideGlobe2 className="h-8 w-8 text-green-400" />
            <h1 className="text-2xl font-semibold text-gray-100">
              WillowAI
            </h1>
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700">
          <div className="p-6">
            <form onSubmit={handleSubmit} className="mb-6">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 rounded-lg bg-gray-700 border border-gray-600 px-4 py-3 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                  <LucideSend className="h-5 w-5" />
                  {loading ? 'Processing...' : 'Send'}
                </button>
              </div>
            </form>

            {loading && (
              <div className="space-y-4 mb-6 p-4 bg-gray-750 rounded-lg border border-gray-600">
                <h3 className="text-lg font-medium text-gray-300">Processing Request</h3>
                <div className="space-y-3">
                  {stages.map((stage) => (
                    <div 
                      key={stage.id}
                      className={`processing-stage flex items-center gap-3 ${
                        stage.complete ? 'stage-complete' : 'text-gray-400'
                      }`}
                    >
                      {stage.icon}
                      <span>{stage.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {response && (
              <div className="space-y-4">
                <div className="chat-message flex items-start gap-3 bg-gray-750 p-6 rounded-lg border border-gray-600">
                  <LucideMessageSquare className="h-6 w-6 text-green-400 mt-1" />
                  <p className="text-gray-300 leading-relaxed">{response}</p>
                </div>
                
                {sustainabilityInfo && (
                  <div className="metrics-card bg-gray-750 p-6 rounded-lg border border-gray-600">
                    <h3 className="font-medium text-green-400 mb-4">Sustainability Impact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3 bg-gray-700/50 p-4 rounded-lg">
                        <LucideZap className="h-5 w-5 text-yellow-400" />
                        <div>
                          <p className="text-sm text-gray-400">Energy Saved</p>
                          <p className="text-lg font-medium">{sustainabilityInfo.energySaved.toFixed(3)} kWh</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-gray-700/50 p-4 rounded-lg">
                        <LucideLeaf className="h-5 w-5 text-green-400" />
                        <div>
                          <p className="text-sm text-gray-400">CO₂ Prevented</p>
                          <p className="text-lg font-medium">{sustainabilityInfo.co2Saved.toFixed(3)} kg</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-gray-700/50 p-4 rounded-lg">
                        <LucideDroplets className="h-5 w-5 text-blue-400" />
                        <div>
                          <p className="text-sm text-gray-400">Water Saved</p>
                          <p className="text-lg font-medium">{sustainabilityInfo.waterSaved.toFixed(3)} L</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-400 space-y-1">
                      <p>
                        Used {sustainabilityInfo.model} via {sustainabilityInfo.provider} in {sustainabilityInfo.location}
                      </p>
                      <p>
                        Query length: {sustainabilityInfo.tokenCount} tokens
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;