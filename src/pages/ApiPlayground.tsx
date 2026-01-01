import React, { useState } from 'react';
import { 
  Play, 
  Copy, 
  Download, 
  Code, 
  Book, 
  Zap, 
  Search, 
  Target,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';

const ApiPlayground = () => {
  const [activeTab, setActiveTab] = useState('unified');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  // Get Supabase credentials from environment
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kyeusjkivowioqxzwgpn.supabase.co';
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

  // Sample requests for each API
  const sampleRequests = {
    unified: {
      url: `${supabaseUrl}/functions/v1/genesis-unified-api`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey
      },
      body: {
        business: "AI-powered project management platform",
        niche: "productivity software, team collaboration tools",
        target_audience: "small business owners, remote teams, project managers",
        goals: ["increase organic traffic", "improve conversion rates"],
        competitors: ["asana.com", "monday.com", "trello.com"]
      }
    },
    agent1: {
      url: `${supabaseUrl}/functions/v1/agent-1-keyword-generator`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey
      },
      body: {
        business: "AI-powered project management platform",
        niche: "productivity software",
        target_audience: "small business owners",
        goals: ["increase organic traffic"],
        competitors: ["asana.com", "monday.com"]
      }
    },
    agent2: {
      url: `${supabaseUrl}/functions/v1/agent-2-seo-validator`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey
      },
      body: {
        keywords: [
          {
            keyword: "project management software",
            type: "seed",
            source: "user_input",
            category: "software",
            commercial_intent: "high"
          },
          {
            keyword: "team collaboration tools",
            type: "lsi",
            source: "competitor_analysis",
            category: "tools",
            commercial_intent: "medium"
          }
        ]
      }
    }
  };

  const [currentRequest, setCurrentRequest] = useState<typeof sampleRequests[keyof typeof sampleRequests]>(sampleRequests.unified);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentRequest(sampleRequests[tab as keyof typeof sampleRequests] as typeof sampleRequests[keyof typeof sampleRequests]);
    setResponse(null);
    setError(null);
  };

  const handleTestApi = async () => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Add Authorization header
      const headers = {
        ...currentRequest.headers,
        'Authorization': `Bearer ${currentRequest.headers.apikey}`
      };

      const response = await fetch(currentRequest.url, {
        method: currentRequest.method,
        headers: headers,
        body: JSON.stringify(currentRequest.body)
      });

      const data = await response.json();
      
      if (response.ok) {
        setResponse(data);
      } else {
        setError(data);
      }
    } catch (err: any) {
      setError({ message: err.message, type: 'network_error' });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const apiTabs = [
    { id: 'unified', label: 'Unified API', icon: Zap, description: 'Complete pipeline (Agent 1 + Agent 2)' },
    { id: 'agent1', label: 'Agent 1', icon: Search, description: 'Keyword generation' },
    { id: 'agent2', label: 'Agent 2', icon: Target, description: 'SEO validation & analysis' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Code className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">API Playground</h1>
              <p className="text-gray-600">Test and explore Genesis Keywords APIs with live documentation</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column - API Testing */}
          <div className="space-y-6">
            
            {/* API Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="border-b border-gray-200">
                <div className="flex space-x-1 p-1">
                  {apiTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                          activeTab === tab.id
                            ? 'bg-blue-50 text-blue-700 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <Icon size={16} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {apiTabs.find(t => t.id === activeTab)?.label}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {apiTabs.find(t => t.id === activeTab)?.description}
                  </p>
                </div>

                {/* Request Configuration */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Endpoint</label>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                        {currentRequest.method}
                      </span>
                      <code className="flex-1 px-3 py-2 bg-gray-100 rounded text-sm font-mono">
                        {currentRequest.url}
                      </code>
                      <button
                        onClick={() => copyToClipboard(currentRequest.url)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Request Body</label>
                    <div className="relative">
                      <textarea
                        value={JSON.stringify(currentRequest.body, null, 2)}
                        onChange={(e) => {
                          try {
                            const parsed = JSON.parse(e.target.value);
                            setCurrentRequest({...currentRequest, body: parsed});
                          } catch (err) {
                            // Invalid JSON, but keep typing
                          }
                        }}
                        className="w-full h-48 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm resize-none"
                        placeholder="Enter JSON request body..."
                      />
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(currentRequest.body, null, 2))}
                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleTestApi}
                      disabled={isLoading}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isLoading ? <Loader className="animate-spin" size={16} /> : <Play size={16} />}
                      <span>{isLoading ? 'Testing...' : 'Test API'}</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setCurrentRequest(sampleRequests[activeTab as keyof typeof sampleRequests]);
                        setResponse(null);
                        setError(null);
                      }}
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                    >
                      <Download size={16} />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Response */}
            {(response || error) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="border-b border-gray-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {error ? (
                        <>
                          <AlertCircle className="text-red-500" size={20} />
                          <h3 className="font-semibold text-red-700">Error Response</h3>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="text-green-500" size={20} />
                          <h3 className="font-semibold text-green-700">Success Response</h3>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(response || error, null, 2))}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <pre className="bg-gray-50 rounded-lg p-4 text-sm font-mono overflow-auto max-h-96">
                    {JSON.stringify(response || error, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Documentation */}
          <div className="space-y-6">
            
            {/* Quick Start */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center space-x-2">
                  <Book size={20} className="text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Quick Start</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">1. Authentication</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      All API requests require a Supabase API key in the headers:
                    </p>
                    <code className="block bg-gray-100 p-3 rounded text-sm">
                      {`{
  "apikey": "YOUR_SUPABASE_ANON_KEY",
  "Authorization": "Bearer YOUR_SUPABASE_ANON_KEY",
  "Content-Type": "application/json"
}`}
                    </code>
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Find your API key in the Supabase dashboard under Project Settings → API
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">2. Rate Limits</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Unified API: ~45-60 seconds per request</li>
                      <li>• Agent 1: ~15-20 seconds per request</li>
                      <li>• Agent 2: ~30-40 seconds per request</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">3. Cost Structure</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Agent 1: ~$0.02-0.05 per request</li>
                      <li>• Agent 2: ~$0.05-0.15 per request</li>
                      <li>• Unified: ~$0.07-0.20 per request</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* API Endpoints */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 className="font-semibold text-gray-900">API Endpoints</h3>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  
                  {/* Unified API */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Zap size={16} className="text-purple-600" />
                      <h4 className="font-medium text-gray-900">Unified API</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Complete keyword analysis pipeline (Agent 1 + Agent 2)
                    </p>
                    <div className="bg-gray-50 p-3 rounded text-xs font-mono">
                      POST /functions/v1/genesis-unified-api
                    </div>
                    <div className="mt-2">
                      <details className="text-sm">
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                          View response structure
                        </summary>
                        <pre className="bg-gray-50 p-3 rounded mt-2 text-xs overflow-auto">
{`{
  "success": true,
  "pipeline_id": "gen_123_abc",
  "runtime_ms": 45000,
  "agent1_results": {
    "keywords_found": 150,
    "categories": [...],
    "keywords": [...]
  },
  "agent2_results": {
    "validated_keywords": 89,
    "priority_distribution": {...},
    "validated_keywords_data": [...]
  },
  "executive_summary": {
    "top_opportunities": [...],
    "volume_insights": [...],
    "trend_insights": [...],
    "competition_insights": [...]
  },
  "cost_breakdown": {
    "total_cost": 0.134
  }
}`}
                        </pre>
                      </details>
                    </div>
                  </div>

                  {/* Agent 1 */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Search size={16} className="text-blue-600" />
                      <h4 className="font-medium text-gray-900">Agent 1 - Keyword Generator</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Generate keywords from business description and competitor analysis
                    </p>
                    <div className="bg-gray-50 p-3 rounded text-xs font-mono">
                      POST /functions/v1/agent-1-keyword-generator
                    </div>
                  </div>

                  {/* Agent 2 */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Target size={16} className="text-green-600" />
                      <h4 className="font-medium text-gray-900">Agent 2 - SEO Validator</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Advanced keyword validation with volume estimation, trend analysis, and content gaps
                    </p>
                    <div className="bg-gray-50 p-3 rounded text-xs font-mono">
                      POST /functions/v1/agent-2-seo-validator
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Codes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 className="font-semibold text-gray-900">Error Codes</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <code className="text-red-600">400</code>
                    <span className="text-gray-600">Bad Request - Invalid input parameters</span>
                  </div>
                  <div className="flex justify-between">
                    <code className="text-red-600">401</code>
                    <span className="text-gray-600">Unauthorized - Invalid API key</span>
                  </div>
                  <div className="flex justify-between">
                    <code className="text-red-600">429</code>
                    <span className="text-gray-600">Rate Limited - Too many requests</span>
                  </div>
                  <div className="flex justify-between">
                    <code className="text-red-600">500</code>
                    <span className="text-gray-600">Server Error - Internal processing error</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiPlayground;