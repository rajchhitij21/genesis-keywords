import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Play, Zap, ArrowRight, CheckCircle2, TrendingUp, Target, BarChart3, Lightbulb } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import Navigation from '@/components/Navigation';

interface PipelineResult {
  success: boolean;
  agent1_result: any;
  agent2_result: any;
  final_keywords: any[];
  metadata: {
    agent1_runtime_ms: number;
    agent2_runtime_ms: number;
    total_runtime_ms: number;
    agent1_keywords_count: number;
    agent2_validated_count: number;
    total_gemini_cost: number;
    total_serper_cost: number;
    total_cost: number;
  };
}

export default function FullPipeline() {
  const [loading, setLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState<'idle' | 'agent1' | 'agent2' | 'complete'>('idle');
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const runFullPipeline = async () => {
    setLoading(true);
    setLogs([]);
    setResult(null);
    setCurrentStage('agent1');
    
    addLog('🚀 Starting Full Pipeline (Agent 1 → Agent 2)...');
    
    try {
      const { data, error } = await supabase.functions.invoke('full-pipeline', {
        method: 'POST'
      });

      if (error) throw new Error(error.message);
      if (!data.success) throw new Error(data.error || 'Pipeline failed');

      setCurrentStage('complete');
      
      addLog('✅ Full Pipeline completed successfully!');
      addLog(`📈 Agent 1: Generated ${data.metadata.agent1_keywords_count} keywords`);
      addLog(`🎯 Agent 2: Validated ${data.metadata.agent2_validated_count} keywords`);
      addLog(`⏱️ Total Runtime: ${(data.metadata.total_runtime_ms / 1000).toFixed(2)}s`);
      addLog(`💰 Total Cost: $${data.metadata.total_cost.toFixed(4)}`);

      setResult(data);
      toast.success(`Pipeline Complete! ${data.metadata.agent2_validated_count} validated keywords`);

    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
      toast.error(`Pipeline Failed: ${error.message}`);
      setCurrentStage('idle');
    } finally {
      setLoading(false);
    }
  };

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
  };

  const getProgress = () => {
    switch (currentStage) {
      case 'idle': return 0;
      case 'agent1': return 35;
      case 'agent2': return 70;
      case 'complete': return 100;
      default: return 0;
    }
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

  return (
    <div>
      <Navigation />
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-orange-500 to-red-500 bg-clip-text text-transparent">
            Full Pipeline
          </h1>
          <p className="text-muted-foreground mt-2">
            Complete Keyword Discovery & Validation Flow
          </p>
        </div>
        
        <Button 
          onClick={runFullPipeline}
          disabled={loading}
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-red-500"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-5 w-5" />
              Run Pipeline
            </>
          )}
        </Button>
      </div>

      {/* Pipeline Stage Visualizer */}
      {loading && (
        <Card className="border-2 border-purple-200 dark:border-purple-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Pipeline Progress
            </CardTitle>
            <CardDescription>
              {currentStage === 'agent1' && 'Agent 1 is hunting for trending keywords...'}
              {currentStage === 'agent2' && 'Agent 2 is validating keywords with SEO analysis...'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={getProgress()} className="h-2" />
            <div className="flex items-center justify-between mt-4 text-sm">
              <div className={`flex items-center gap-2 ${currentStage === 'agent1' ? 'text-purple-600 font-semibold' : 'text-muted-foreground'}`}>
                <TrendingUp className="h-4 w-4" />
                Agent 1
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className={`flex items-center gap-2 ${currentStage === 'agent2' ? 'text-orange-600 font-semibold' : 'text-muted-foreground'}`}>
                <Target className="h-4 w-4" />
                Agent 2
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className={`flex items-center gap-2 ${currentStage === 'complete' ? 'text-green-600 font-semibold' : 'text-muted-foreground'}`}>
                <CheckCircle2 className="h-4 w-4" />
                Complete
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Overview */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-purple-200 dark:border-purple-900">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <Badge className="bg-purple-500">Agent 1</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{result.metadata.agent1_keywords_count}</div>
              <div className="text-sm text-muted-foreground">Keywords Generated</div>
              <div className="text-xs text-muted-foreground mt-1">
                {(result.metadata.agent1_runtime_ms / 1000).toFixed(1)}s • ${result.metadata.total_gemini_cost.toFixed(4)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 dark:border-orange-900">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Target className="h-5 w-5 text-orange-500" />
                <Badge className="bg-orange-500">Agent 2</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{result.metadata.agent2_validated_count}</div>
              <div className="text-sm text-muted-foreground">Keywords Validated</div>
              <div className="text-xs text-muted-foreground mt-1">
                {(result.metadata.agent2_runtime_ms / 1000).toFixed(1)}s • ${result.metadata.total_serper_cost.toFixed(4)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-900">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <Badge className="bg-green-500">Final</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {((result.metadata.agent2_validated_count / result.metadata.agent1_keywords_count) * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-muted-foreground">Validation Rate</div>
              <div className="text-xs text-muted-foreground mt-1">
                {(result.metadata.total_runtime_ms / 1000).toFixed(1)}s total • ${result.metadata.total_cost.toFixed(4)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Logs</CardTitle>
            <CardDescription>Real-time execution logs</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              {logs.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  Click "Run Pipeline" to start
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

        {/* Priority Distribution */}
        {result && result.agent2_result && (
          <Card>
            <CardHeader>
              <CardTitle>Priority Distribution</CardTitle>
              <CardDescription>Validated keywords by priority</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      Urgent
                    </span>
                    <Badge variant="destructive">{result.agent2_result.metadata.urgent_count}</Badge>
                  </div>
                  <Progress 
                    value={(result.agent2_result.metadata.urgent_count / result.metadata.agent2_validated_count) * 100} 
                    className="h-2 bg-red-100 dark:bg-red-950"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      High
                    </span>
                    <Badge className="bg-orange-500">{result.agent2_result.metadata.high_count}</Badge>
                  </div>
                  <Progress 
                    value={(result.agent2_result.metadata.high_count / result.metadata.agent2_validated_count) * 100} 
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      Medium
                    </span>
                    <Badge className="bg-yellow-600">{result.agent2_result.metadata.medium_count}</Badge>
                  </div>
                  <Progress 
                    value={(result.agent2_result.metadata.medium_count / result.metadata.agent2_validated_count) * 100} 
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      Low
                    </span>
                    <Badge className="bg-blue-500">{result.agent2_result.metadata.low_count}</Badge>
                  </div>
                  <Progress 
                    value={(result.agent2_result.metadata.low_count / result.metadata.agent2_validated_count) * 100} 
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Final Keywords */}
      {result && result.final_keywords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Final Validated Keywords</CardTitle>
            <CardDescription>
              Top {Math.min(result.final_keywords.length, 20)} keywords sorted by priority
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {result.final_keywords
                  .sort((a, b) => b.priority_score - a.priority_score)
                  .slice(0, 20)
                  .map((kw, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-semibold flex items-center gap-2">
                          {kw.keyword}
                          {kw.volume_signals?.has_videos && <span title="Has Videos">📹</span>}
                          {kw.volume_signals?.has_news && <span title="Has News">📰</span>}
                          {kw.volume_signals?.has_shopping && <span title="Has Shopping">🛒</span>}
                          {kw.volume_signals?.commercial_words > 0 && <span title="Commercial Intent">💰</span>}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                          <span className="text-muted-foreground">
                            📊 Vol: {kw.estimated_volume.toLocaleString()} ({kw.volume_confidence})
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground">
                            🎯 Comp: {kw.competition_score}/100
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <span className={`font-medium ${
                            kw.trend_direction === 'rising' ? 'text-green-600' : 
                            kw.trend_direction === 'declining' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {kw.trend_direction === 'rising' ? '📈' : kw.trend_direction === 'declining' ? '📉' : '➡️'} {kw.trend_direction} ({kw.trend_score}/100)
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground">
                            ⭐ Score: {kw.priority_score}/100
                          </span>
                        </div>
                        {kw.content_gaps?.content_suggestions && kw.content_gaps.content_suggestions.length > 0 && (
                          <div className="mt-2 text-xs text-muted-foreground flex items-start gap-1">
                            <Lightbulb className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-1">{kw.content_gaps.content_suggestions[0]}</span>
                          </div>
                        )}
                      </div>
                      <Badge className={`${getPriorityColor(kw.priority_tier)} text-white`}>
                        {kw.priority_tier.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}
