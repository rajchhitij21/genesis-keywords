import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Play, Target, TrendingUp, Shield, Lightbulb, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ValidatedKeyword {
  keyword: string;
  type: string;
  source: string;
  estimated_volume: number;
  volume_confidence: string;
  competition_score: number;
  competition_difficulty: string;
  priority_score: number;
  priority_tier: 'urgent' | 'high' | 'medium' | 'low';
  priority_reasons: string[];
  content_gaps: {
    missing_topics: string[];
    unanswered_questions: string[];
    opportunity_score: number;
    content_suggestions: string[];
  };
  top_domains: string[];
  related_searches: string[];
}

interface Agent2Result {
  success: boolean;
  validated_keywords: ValidatedKeyword[];
  metadata: {
    input_count: number;
    validated_count: number;
    urgent_count: number;
    high_count: number;
    medium_count: number;
    low_count: number;
    serper_calls: number;
    serper_cost: number;
    runtime_ms: number;
  };
  clusters: any[];
}

export default function TestAgent2() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Agent2Result | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const mockKeywords = [
    { keyword: 'AI automation tools 2025', type: 'trend', source: 'google_trends', category: 'ai_automation' },
    { keyword: 'ChatGPT vs Claude comparison', type: 'trend', source: 'google_trends', category: 'tool_comparisons' },
    { keyword: 'make money with AI online', type: 'social', source: 'twitter', category: 'builder_stories' },
    { keyword: 'voice AI agents', type: 'autocomplete', source: 'autocomplete', category: 'ai_automation' },
    { keyword: 'programmatic SEO 2025', type: 'autocomplete', source: 'autocomplete', category: 'pseo_innovation' },
  ];

  const runAgent2 = async () => {
    setLoading(true);
    setLogs([]);
    setResult(null);
    
    addLog('🎯 Starting Agent 2 (SEO Validator)...');
    addLog(`📤 Sending ${mockKeywords.length} mock keywords...`);
    
    try {
      console.log('Calling agent-2-seo-validator with:', mockKeywords);
      
      const { data, error } = await supabase.functions.invoke('agent-2-seo-validator', {
        body: { keywords: mockKeywords }
      });

      console.log('Response:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
      }
      
      if (!data) {
        throw new Error('No data returned from Agent 2');
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Agent 2 failed');
      }

      addLog('✅ Agent 2 completed successfully!');
      addLog(`📊 Validated ${data.metadata.validated_count} keywords`);
      addLog(`⏱️ Runtime: ${(data.metadata.runtime_ms / 1000).toFixed(2)}s`);
      addLog(`💰 Serper Cost: $${data.metadata.serper_cost.toFixed(4)}`);

      setResult(data);
      toast.success(`Agent 2 Complete! ${data.metadata.validated_count} keywords validated`);

    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
      toast.error(`Agent 2 Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
  };

  const getPriorityColor = (tier: string) => {
    switch (tier) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'very_easy': return 'text-green-600';
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-600';
      case 'hard': return 'text-orange-600';
      case 'very_hard': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-500 bg-clip-text text-transparent">
            Agent 2 Test
          </h1>
          <p className="text-muted-foreground mt-2">
            SEO Validator with Multi-Factor Analysis
          </p>
        </div>
        
        <Button 
          onClick={runAgent2}
          disabled={loading}
          size="lg"
          className="bg-gradient-to-r from-orange-600 to-red-500"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="mr-2 h-5 w-5" />
              Run Agent 2
            </>
          )}
        </Button>
      </div>

      {/* Priority Tier Cards */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-red-200 dark:border-red-900">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Target className="h-5 w-5 text-red-500" />
                <Badge variant="destructive">{result.metadata.urgent_count}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">Urgent</div>
              <div className="text-xs text-muted-foreground">High ROI Keywords</div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 dark:border-orange-900">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <TrendingUp className="h-5 w-5 text-orange-500" />
                <Badge className="bg-orange-500">{result.metadata.high_count}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">High Priority</div>
              <div className="text-xs text-muted-foreground">Strong Opportunities</div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 dark:border-yellow-900">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Shield className="h-5 w-5 text-yellow-600" />
                <Badge className="bg-yellow-600">{result.metadata.medium_count}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">Medium Priority</div>
              <div className="text-xs text-muted-foreground">Worth Pursuing</div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 dark:border-blue-900">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Lightbulb className="h-5 w-5 text-blue-500" />
                <Badge className="bg-blue-500">{result.metadata.low_count}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">Low Priority</div>
              <div className="text-xs text-muted-foreground">Nice to Have</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Logs</CardTitle>
            <CardDescription>Real-time execution logs</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              {logs.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  Click "Run Agent 2" to start
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.map((log, idx) => (
                    <div key={idx} className="text-xs font-mono">
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Results Summary</CardTitle>
            <CardDescription>Agent 2 validation metrics</CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-semibold">Validated</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">
                    {result.metadata.validated_count}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Runtime</span>
                    <span className="font-medium">{(result.metadata.runtime_ms / 1000).toFixed(2)}s</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Serper Cost</span>
                    <span className="font-medium">${result.metadata.serper_cost.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Serper Calls</span>
                    <span className="font-medium">{result.metadata.serper_calls}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Clusters</span>
                    <span className="font-medium">{result.clusters.length}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No results yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Validated Keywords */}
      {result && result.validated_keywords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Validated Keywords</CardTitle>
            <CardDescription>
              Showing {result.validated_keywords.length} keywords with full analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {result.validated_keywords.map((kw, idx) => (
                  <div 
                    key={idx}
                    className="border rounded-lg p-4 space-y-3 hover:bg-accent transition-colors"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{kw.keyword}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">{kw.type}</Badge>
                          <Badge variant="outline" className="text-xs">{kw.source}</Badge>
                        </div>
                      </div>
                      <Badge className={`${getPriorityColor(kw.priority_tier)} text-white`}>
                        {kw.priority_tier.toUpperCase()}
                      </Badge>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Est. Volume</div>
                        <div className="font-semibold">{kw.estimated_volume.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">{kw.volume_confidence} confidence</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Competition</div>
                        <div className={`font-semibold ${getDifficultyColor(kw.competition_difficulty)}`}>
                          {kw.competition_score}/100
                        </div>
                        <div className="text-xs text-muted-foreground">{kw.competition_difficulty}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Priority Score</div>
                        <div className="font-semibold">{kw.priority_score}/100</div>
                        <div className="text-xs text-muted-foreground">Overall</div>
                      </div>
                    </div>

                    {/* Priority Reasons */}
                    {kw.priority_reasons.length > 0 && (
                      <div className="pt-2 border-t">
                        <div className="text-xs font-medium text-muted-foreground mb-1">Why this priority:</div>
                        <ul className="text-xs space-y-1">
                          {kw.priority_reasons.slice(0, 2).map((reason, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-green-600">•</span>
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Content Gaps */}
                    {kw.content_gaps.opportunity_score > 0 && (
                      <div className="pt-2 border-t">
                        <div className="text-xs font-medium text-muted-foreground mb-1">
                          Content Opportunity: {kw.content_gaps.opportunity_score}/100
                        </div>
                        {kw.content_gaps.content_suggestions.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            💡 {kw.content_gaps.content_suggestions[0]}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}