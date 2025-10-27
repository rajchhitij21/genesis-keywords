import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Play, CheckCircle2, AlertCircle, TrendingUp, MessageSquare, Search, Sparkles, Database } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Agent1Result {
  success: boolean;
  keywords: Array<{
    keyword: string;
    type: string;
    source: string;
    category?: string;
    commercial_intent?: string;
  }>;
  metadata: {
    google_trends_count: number;
    twitter_count: number;
    reddit_count: number;
    autocomplete_count: number;
    gemini_variations_count: number;
    base_keywords_count: number;
    total_keywords: number;
    gemini_calls: number;
    gemini_cost: number;
    runtime_ms: number;
  };
}

export default function TestAgent1V2() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Agent1Result | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const runAgent1 = async () => {
    setLoading(true);
    setLogs([]);
    setResult(null);
    
    addLog('🚀 Starting Agent 1 V2 (Trend Hunter)...');
    
    try {
      addLog('📡 Calling agent-1-trend-hunter function...');
      
      const { data, error } = await supabase.functions.invoke('agent-1-trend-hunter', {
        method: 'POST'
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Agent 1 failed');
      }

      addLog('✅ Agent 1 completed successfully!');
      addLog(`📊 Generated ${data.metadata.total_keywords} keywords`);
      addLog(`⏱️ Runtime: ${(data.metadata.runtime_ms / 1000).toFixed(2)}s`);
      addLog(`💰 Cost: $${data.metadata.gemini_cost.toFixed(4)}`);

      setResult(data);
      toast.success(`Agent 1 V2 Complete! ${data.metadata.total_keywords} keywords generated`);

    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
      toast.error(`Agent 1 Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
            Agent 1 V2 Test
          </h1>
          <p className="text-muted-foreground mt-2">
            Test the Trend Hunter with 5 data sources
          </p>
        </div>
        
        <Button 
          onClick={runAgent1}
          disabled={loading}
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-blue-500"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="mr-2 h-5 w-5" />
              Run Agent 1
            </>
          )}
        </Button>
      </div>

      {/* Status Cards */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Google Trends */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <TrendingUp className="h-5 w-5 text-red-500" />
                <Badge variant="secondary">{result.metadata.google_trends_count}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">Google Trends</div>
              <div className="text-xs text-muted-foreground">RSS Feed</div>
            </CardContent>
          </Card>

          {/* Twitter/X */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <svg className="h-5 w-5 text-black dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <Badge variant="secondary">{result.metadata.twitter_count || 0}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">Twitter/X</div>
              <div className="text-xs text-muted-foreground">API v2</div>
            </CardContent>
          </Card>

          {/* Reddit */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <MessageSquare className="h-5 w-5 text-orange-500" />
                <Badge variant="secondary">{result.metadata.reddit_count}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">Reddit</div>
              <div className="text-xs text-muted-foreground">Hot Posts</div>
            </CardContent>
          </Card>

          {/* Autocomplete */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Search className="h-5 w-5 text-green-500" />
                <Badge variant="secondary">{result.metadata.autocomplete_count}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">Autocomplete</div>
              <div className="text-xs text-muted-foreground">Google Suggestions</div>
            </CardContent>
          </Card>

          {/* Gemini */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <Badge variant="secondary">{result.metadata.gemini_variations_count}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">Gemini AI</div>
              <div className="text-xs text-muted-foreground">{result.metadata.gemini_calls} calls</div>
            </CardContent>
          </Card>

          {/* Base Keywords */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Database className="h-5 w-5 text-orange-500" />
                <Badge variant="secondary">{result.metadata.base_keywords_count}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">Base Keywords</div>
              <div className="text-xs text-muted-foreground">Manual Seeds</div>
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
                  Click "Run Agent 1" to start
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
            <CardDescription>Agent 1 output metrics</CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-semibold">Success</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">
                    {result.metadata.total_keywords}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Runtime</span>
                    <span className="font-medium">{(result.metadata.runtime_ms / 1000).toFixed(2)}s</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Gemini Cost</span>
                    <span className="font-medium">${result.metadata.gemini_cost.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Unique Keywords</span>
                    <span className="font-medium">{result.metadata.total_keywords}</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-sm font-medium mb-2">Keyword Types</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">trend</Badge>
                      <span className="text-xs text-muted-foreground">
                        {result.keywords.filter(k => k.type === 'trend').length}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">social</Badge>
                      <span className="text-xs text-muted-foreground">
                        {result.keywords.filter(k => k.type === 'social').length}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">autocomplete</Badge>
                      <span className="text-xs text-muted-foreground">
                        {result.keywords.filter(k => k.type === 'autocomplete').length}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">variation</Badge>
                      <span className="text-xs text-muted-foreground">
                        {result.keywords.filter(k => k.type === 'variation').length}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">base</Badge>
                      <span className="text-xs text-muted-foreground">
                        {result.keywords.filter(k => k.type === 'base').length}
                      </span>
                    </div>
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

      {/* Keywords Table */}
      {result && result.keywords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Keywords</CardTitle>
            <CardDescription>
              Showing {result.keywords.length} keywords from all sources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {result.keywords.slice(0, 100).map((keyword, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{keyword.keyword}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {keyword.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {keyword.source}
                        </Badge>
                        {keyword.category && (
                          <Badge variant="outline" className="text-xs">
                            {keyword.category}
                          </Badge>
                        )}
                        {keyword.commercial_intent && (
                          <Badge 
                            variant={keyword.commercial_intent === 'high' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {keyword.commercial_intent} intent
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {result.keywords.length > 100 && (
                  <div className="text-center text-sm text-muted-foreground py-4">
                    Showing first 100 of {result.keywords.length} keywords
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
