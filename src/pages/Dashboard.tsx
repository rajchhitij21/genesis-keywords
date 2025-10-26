import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, Database, Clock, Zap } from "lucide-react";
import { toast } from "sonner";

interface KeywordStats {
  total_keywords: number;
  pending: number;
  analyzed: number;
  published: number;
  avg_trend_score: number;
  top_categories: Array<{ category: string; count: number }>;
}

interface Keyword {
  id: string;
  keyword: string;
  type: string;
  category: string;
  source: string;
  trend_score: number;
  growth_rate: number;
  twitter_mentions: number;
  reddit_mentions: number;
  hn_mentions: number;
  total_engagement: number;
  status: string;
  created_at: string;
}

interface PipelineRun {
  id: string;
  started_at: string;
  completed_at: string;
  status: string;
  keywords_saved: number;
  runtime_seconds: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<KeywordStats | null>(null);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningPipeline, setRunningPipeline] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const { data: statsData } = await supabase.rpc('get_keyword_stats');
      setStats(statsData);

      // Fetch keywords
      const { data: keywordsData } = await supabase
        .from('keyword_variations')
        .select('*')
        .order('trend_score', { ascending: false })
        .limit(50);
      setKeywords(keywordsData || []);

      // Fetch recent runs
      const { data: runsData } = await supabase
        .from('pipeline_runs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(10);
      setRuns(runsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const runPipeline = async () => {
    setRunningPipeline(true);
    toast.info('Pipeline will run automatically every 12 hours');
    
    // For now, just simulate by generating some sample keywords
    setTimeout(async () => {
      const sampleKeywords = [
        { keyword: 'ai automation revenue', category: 'ai_automation', trend_score: 87 },
        { keyword: 'cursor ai vs copilot 2025', category: 'tool_comparisons', trend_score: 92 },
        { keyword: 'ai voice agent tutorial', category: 'ai_automation', trend_score: 78 },
      ];
      
      toast.success('Sample keywords generated! Connect Lovable Cloud to enable full pipeline.');
      setRunningPipeline(false);
      fetchData();
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-warning/10 text-warning border-warning/20';
      case 'ANALYZED': return 'bg-primary/10 text-primary border-primary/20';
      case 'PUBLISHED': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      builder_stories: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      ai_automation: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      tool_comparisons: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      real_vs_hype: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      trending_opportunities: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
      pseo_innovation: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    };
    return colors[category] || 'bg-muted text-muted-foreground';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Keyword Pipeline
              </h1>
              <p className="text-muted-foreground mt-1">AI-Powered Trend Discovery System</p>
            </div>
            <Button 
              onClick={runPipeline} 
              disabled={runningPipeline}
              className="bg-primary hover:bg-primary/90"
            >
              {runningPipeline ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Run Pipeline
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-primary/20 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Keywords
              </CardTitle>
              <Database className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats?.total_keywords || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-warning/20 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending
              </CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats?.pending || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-accent/20 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg Trend Score
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats?.avg_trend_score || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-success/20 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Published
              </CardTitle>
              <Database className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats?.published || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Pipeline Runs */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Pipeline Runs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {runs.slice(0, 5).map((run) => (
                <div key={run.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-4">
                    <Badge className={run.status === 'SUCCESS' ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'}>
                      {run.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(run.started_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <span className="text-foreground">
                      <strong>{run.keywords_saved}</strong> keywords
                    </span>
                    <span className="text-muted-foreground">
                      {run.runtime_seconds}s
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Keywords Table */}
        <Card>
          <CardHeader>
            <CardTitle>Trending Keywords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 pr-4 text-sm font-medium text-muted-foreground">Keyword</th>
                    <th className="pb-3 px-4 text-sm font-medium text-muted-foreground">Category</th>
                    <th className="pb-3 px-4 text-sm font-medium text-muted-foreground">Score</th>
                    <th className="pb-3 px-4 text-sm font-medium text-muted-foreground">Growth</th>
                    <th className="pb-3 px-4 text-sm font-medium text-muted-foreground">Engagement</th>
                    <th className="pb-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {keywords.map((kw) => (
                    <tr key={kw.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-4 pr-4">
                        <div className="font-medium text-foreground">{kw.keyword}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {kw.source && <Badge variant="outline" className="text-xs">{kw.source}</Badge>}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getCategoryColor(kw.category)}>
                          {kw.category?.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-primary to-accent" 
                              style={{ width: `${kw.trend_score}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-foreground">{kw.trend_score}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-sm font-medium ${kw.growth_rate > 0 ? 'text-success' : 'text-destructive'}`}>
                          {kw.growth_rate > 0 ? '+' : ''}{kw.growth_rate}%
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-foreground">{kw.total_engagement}</div>
                        <div className="text-xs text-muted-foreground">
                          T:{kw.twitter_mentions} R:{kw.reddit_mentions} H:{kw.hn_mentions}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getStatusColor(kw.status)}>
                          {kw.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
