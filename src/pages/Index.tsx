import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Zap, Database, Brain, TestTube } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-6 py-20">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <Zap className="h-4 w-4" />
            <span className="text-sm font-medium">AI-Powered Keyword Research</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Never Run Out of Trending Content Ideas
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Our AI pipeline monitors 5 external sources, generates smart keyword variations with Claude, 
            and validates trends with Google Trends—all automated every 12 hours.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={() => navigate('/dashboard')} 
              size="lg"
              className="bg-primary hover:bg-primary/90 text-lg px-8"
            >
              View Dashboard
            </Button>
            <Button 
              onClick={() => navigate('/test-agent-1')} 
              size="lg"
              variant="outline"
              className="text-lg px-8 border-2 border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950"
            >
              <TestTube className="mr-2 h-5 w-5" />
              Test Agent 1 V2
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">LLM-Powered Variations</h3>
            <p className="text-muted-foreground text-sm">
              Claude analyzes ProductHunt, Twitter, GitHub, Reddit, and HackerNews to generate 60-150 smart keyword variations
            </p>
          </div>

          <div className="p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Trend Validation</h3>
            <p className="text-muted-foreground text-sm">
              Google Trends filters out noise—only keywords with real search volume make it through
            </p>
          </div>

          <div className="p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center mb-4">
              <Database className="h-6 w-6 text-success" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Social Enrichment</h3>
            <p className="text-muted-foreground text-sm">
              Each keyword gets enriched with Twitter mentions, Reddit upvotes, and HackerNews points
            </p>
          </div>
        </div>

        {/* Stats Preview */}
        <div className="mt-20 max-w-3xl mx-auto p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Pipeline Performance</h2>
            <p className="text-muted-foreground">Generates 40-80 validated keywords every 12 hours</p>
          </div>
          
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-1">5</div>
              <div className="text-sm text-muted-foreground">External Sources</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-1">90-180</div>
              <div className="text-sm text-muted-foreground">Keywords Checked</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-success mb-1">20-40</div>
              <div className="text-sm text-muted-foreground">Trending Found</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
