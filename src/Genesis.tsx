import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Download, 
  Plus, 
  Search, 
  TrendingUp, 
  Target, 
  BarChart3, 
  Lightbulb,
  X,
  ChevronDown,
  Eye,
  ExternalLink
} from 'lucide-react';
import './Genesis.css';

interface UnifiedResponse {
  success: boolean;
  pipeline_id: string;
  runtime_ms: number;
  agent1_results: {
    keywords_found: number;
    categories: any[];
    keyword_types: {
      seed: number;
      competitor: number;
      lsi: number;
      question: number;
      long_tail: number;
    };
    keywords: any[];
  };
  agent2_results: {
    validated_keywords: number;
    priority_distribution: {
      urgent: number;
      high: number;
      medium: number;
      low: number;
    };
    total_estimated_volume: number;
    avg_competition_score: number;
    trending_keywords: number;
    content_opportunities: number;
    validated_keywords_data: any[];
    clusters: any[];
  };
  executive_summary: {
    top_opportunities: string[];
    volume_insights: string[];
    trend_insights: string[];
    competition_insights: string[];
    content_recommendations: string[];
  };
  cost_breakdown: {
    agent1_cost: number;
    agent2_cost: number;
    total_cost: number;
  };
}

const Genesis: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<UnifiedResponse | null>(null);
  const [selectedKeyword, setSelectedKeyword] = useState<any>(null);
  const [filterTab, setFilterTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    business: '',
    niche: '',
    target_audience: '',
    goals: '',
    competitors: ''
  });

  // Handle form submission
  const handleAnalyze = async () => {
    if (!formData.business || !formData.niche || !formData.target_audience) {
      alert('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        business: formData.business,
        niche: formData.niche,
        target_audience: formData.target_audience,
        goals: formData.goals ? formData.goals.split(',').map(g => g.trim()) : [],
        competitors: formData.competitors ? formData.competitors.split(',').map(c => c.trim()) : []
      };

      const response = await fetch('https://kyeusjkivowioqxzwgpn.supabase.co/functions/v1/genesis-unified-api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY || ''
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (data.success) {
        setResults(data);
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (error: any) {
      console.error('Analysis error:', error);
      alert(`Analysis failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter keywords based on tab and search
  const filteredKeywords = results?.agent2_results.validated_keywords_data.filter(keyword => {
    const matchesFilter = filterTab === 'all' || keyword.priority_tier === filterTab;
    const matchesSearch = keyword.keyword.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  }) || [];

  // Get priority badge class
  const getPriorityBadge = (priority: string) => {
    const badges = {
      urgent: 'badge-urgent',
      high: 'badge-high',
      medium: 'badge-medium',
      low: 'badge-low'
    };
    return badges[priority as keyof typeof badges] || 'badge-low';
  };

  // Get trend badge
  const getTrendBadge = (direction: string, score: number) => {
    if (direction === 'rising') return { class: 'badge-rising', icon: '📈', text: 'Rising' };
    if (direction === 'declining') return { class: 'badge-declining', icon: '📉', text: 'Declining' };
    return { class: 'badge-stable', icon: '➡️', text: 'Stable' };
  };

  // Format large numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="genesis-app">
      
      {/* Navigation */}
      <nav className="nav">
        <div className="nav-container">
          <div className="nav-brand">
            <h1 className="brand-title">Genesis</h1>
            <span className="brand-subtitle">Keywords</span>
          </div>
          
          {results && (
            <div className="nav-actions">
              <button className="btn-secondary">
                <Download size={16} />
                Export
              </button>
              <button className="btn-primary" onClick={() => setResults(null)}>
                <Plus size={16} />
                New Analysis
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="main-container">
        
        {!results ? (
          // Input Section
          <section className="input-section">
            <div className="section-header">
              <h2 className="section-title">Start Your Analysis</h2>
              <p className="section-subtitle">Discover and analyze keywords with advanced AI-powered insights</p>
            </div>
            
            <div className="input-grid">
              <div className="input-group">
                <label className="input-label" htmlFor="business">Business *</label>
                <input 
                  type="text" 
                  id="business" 
                  className="input-field" 
                  placeholder="e.g., SaaS platform for project management"
                  value={formData.business}
                  onChange={(e) => setFormData({...formData, business: e.target.value})}
                />
              </div>
              
              <div className="input-group">
                <label className="input-label" htmlFor="niche">Niche *</label>
                <input 
                  type="text" 
                  id="niche" 
                  className="input-field" 
                  placeholder="e.g., productivity software, team collaboration"
                  value={formData.niche}
                  onChange={(e) => setFormData({...formData, niche: e.target.value})}
                />
              </div>
              
              <div className="input-group span-full">
                <label className="input-label" htmlFor="targetAudience">Target Audience *</label>
                <input 
                  type="text" 
                  id="targetAudience" 
                  className="input-field" 
                  placeholder="e.g., small business owners, remote teams, project managers"
                  value={formData.target_audience}
                  onChange={(e) => setFormData({...formData, target_audience: e.target.value})}
                />
              </div>
              
              <div className="input-group">
                <label className="input-label" htmlFor="goals">Goals (Optional)</label>
                <input 
                  type="text" 
                  id="goals" 
                  className="input-field" 
                  placeholder="e.g., increase organic traffic, improve conversion"
                  value={formData.goals}
                  onChange={(e) => setFormData({...formData, goals: e.target.value})}
                />
              </div>
              
              <div className="input-group">
                <label className="input-label" htmlFor="competitors">Competitors (Optional)</label>
                <input 
                  type="text" 
                  id="competitors" 
                  className="input-field" 
                  placeholder="e.g., asana.com, monday.com, trello.com"
                  value={formData.competitors}
                  onChange={(e) => setFormData({...formData, competitors: e.target.value})}
                />
              </div>
            </div>
            
            <div className="input-actions">
              <button 
                className="btn-primary-large" 
                onClick={handleAnalyze}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="btn-loading">
                    <div className="spinner"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="btn-content">
                    <Zap size={20} />
                    <span>Analyze Keywords</span>
                  </div>
                )}
              </button>
            </div>
          </section>
        ) : (
          // Results Section
          <section className="results-section">
            
            {/* Executive Summary */}
            <div className="card-premium-dark executive-summary">
              <div className="card-header">
                <h3 className="card-title">Executive Summary</h3>
                <div className="summary-stats">
                  <div className="stat">
                    <span className="stat-label">Pipeline ID</span>
                    <span className="stat-value">{results.pipeline_id}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Runtime</span>
                    <span className="stat-value">{(results.runtime_ms / 1000).toFixed(1)}s</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Total Cost</span>
                    <span className="stat-value">${results.cost_breakdown.total_cost.toFixed(4)}</span>
                  </div>
                </div>
              </div>
              
              <div className="summary-grid">
                <div className="summary-section">
                  <h4 className="summary-title">Top Opportunities</h4>
                  <ul className="summary-list">
                    {results.executive_summary.top_opportunities.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="summary-section">
                  <h4 className="summary-title">Volume Insights</h4>
                  <ul className="summary-list">
                    {results.executive_summary.volume_insights.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="summary-section">
                  <h4 className="summary-title">Trend Insights</h4>
                  <ul className="summary-list">
                    {results.executive_summary.trend_insights.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="summary-section">
                  <h4 className="summary-title">Competition Insights</h4>
                  <ul className="summary-list">
                    {results.executive_summary.competition_insights.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon">📊</div>
                <div className="metric-content">
                  <span className="metric-label">Total Volume</span>
                  <span className="metric-value">{formatNumber(results.agent2_results.total_estimated_volume)}</span>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">🎯</div>
                <div className="metric-content">
                  <span className="metric-label">Keywords Validated</span>
                  <span className="metric-value">{results.agent2_results.validated_keywords}</span>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">📈</div>
                <div className="metric-content">
                  <span className="metric-label">Trending Keywords</span>
                  <span className="metric-value">{results.agent2_results.trending_keywords}</span>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">💡</div>
                <div className="metric-content">
                  <span className="metric-label">Content Opportunities</span>
                  <span className="metric-value">{results.agent2_results.content_opportunities}</span>
                </div>
              </div>
            </div>

            {/* Priority Distribution */}
            <div className="card-light priority-section">
              <div className="card-header">
                <h3 className="card-title">Priority Distribution</h3>
                <p className="card-subtitle">Keywords by priority tier</p>
              </div>
              <div className="priority-bars">
                {Object.entries(results.agent2_results.priority_distribution).map(([tier, count]) => (
                  <div key={tier} className="priority-bar">
                    <div className="priority-bar-header">
                      <span className={`priority-label ${tier}`}>{tier.toUpperCase()}</span>
                      <span className="priority-count">{count}</span>
                    </div>
                    <div className="priority-bar-track">
                      <div 
                        className={`priority-bar-fill ${tier}`}
                        style={{
                          width: `${(count / results.agent2_results.validated_keywords) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Keywords Table */}
            <div className="card-white keywords-section">
              <div className="card-header">
                <h3 className="card-title">Validated Keywords</h3>
                <div className="table-controls">
                  <div className="filter-tabs">
                    {['all', 'urgent', 'high', 'medium', 'low'].map(tab => (
                      <button 
                        key={tab}
                        className={`filter-tab ${filterTab === tab ? 'active' : ''}`}
                        onClick={() => setFilterTab(tab)}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>
                  <div className="table-search">
                    <input 
                      type="text" 
                      placeholder="Search keywords..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                    <Search size={16} />
                  </div>
                </div>
              </div>
              
              <div className="table-container">
                <table className="keywords-table">
                  <thead>
                    <tr>
                      <th>Keyword</th>
                      <th>Volume</th>
                      <th>Competition</th>
                      <th>Trend</th>
                      <th>Priority</th>
                      <th>Signals</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredKeywords.map((keyword, index) => {
                      const trend = getTrendBadge(keyword.trend_direction, keyword.trend_score);
                      return (
                        <tr key={index}>
                          <td className="keyword-cell">
                            <div className="keyword-info">
                              <span className="keyword-text">{keyword.keyword}</span>
                              <span className="keyword-type">{keyword.type}</span>
                            </div>
                          </td>
                          <td>
                            <div className="volume-cell">
                              <span className="volume-number">{formatNumber(keyword.estimated_volume)}</span>
                              <span className={`confidence-badge ${keyword.volume_confidence}`}>
                                {keyword.volume_confidence}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="competition-cell">
                              <span className="competition-score">{keyword.competition_score}/100</span>
                              <div className="competition-bar">
                                <div 
                                  className="competition-fill"
                                  style={{width: `${keyword.competition_score}%`}}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`trend-badge ${trend.class}`}>
                              {trend.icon} {trend.text}
                            </span>
                          </td>
                          <td>
                            <span className={`priority-badge ${getPriorityBadge(keyword.priority_tier)}`}>
                              {keyword.priority_tier}
                            </span>
                          </td>
                          <td>
                            <div className="signals-cell">
                              {keyword.volume_signals.has_videos && <span className="signal">📹</span>}
                              {keyword.volume_signals.has_news && <span className="signal">📰</span>}
                              {keyword.volume_signals.has_shopping && <span className="signal">🛒</span>}
                              {keyword.volume_signals.commercial_words > 0 && <span className="signal">💰</span>}
                            </div>
                          </td>
                          <td>
                            <button 
                              className="btn-view"
                              onClick={() => setSelectedKeyword(keyword)}
                            >
                              <Eye size={14} />
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </section>
        )}
      </div>

      {/* Keyword Detail Modal */}
      {selectedKeyword && (
        <div className="modal-overlay" onClick={() => setSelectedKeyword(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{selectedKeyword.keyword}</h3>
              <button className="modal-close" onClick={() => setSelectedKeyword(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-content">
              <div className="modal-grid">
                
                {/* Volume Analysis */}
                <div className="modal-section">
                  <h4 className="modal-section-title">Volume Analysis</h4>
                  <div className="analysis-details">
                    <div className="detail-row">
                      <span className="detail-label">Estimated Volume</span>
                      <span className="detail-value">{formatNumber(selectedKeyword.estimated_volume)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Confidence</span>
                      <span className={`detail-badge ${selectedKeyword.volume_confidence}`}>
                        {selectedKeyword.volume_confidence}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Ads Count</span>
                      <span className="detail-value">{selectedKeyword.volume_signals.ads_count}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Related Searches</span>
                      <span className="detail-value">{selectedKeyword.volume_signals.related_searches_count}</span>
                    </div>
                  </div>
                </div>
                
                {/* Trend Analysis */}
                <div className="modal-section">
                  <h4 className="modal-section-title">Trend Analysis</h4>
                  <div className="analysis-details">
                    <div className="detail-row">
                      <span className="detail-label">Trend Score</span>
                      <span className="detail-value">{selectedKeyword.trend_score}/100</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Direction</span>
                      <span className={`detail-badge ${selectedKeyword.trend_direction}`}>
                        {selectedKeyword.trend_direction}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">News Mentions</span>
                      <span className="detail-value">{selectedKeyword.trend_signals?.news_mentions || 0}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Video Content</span>
                      <span className="detail-value">{selectedKeyword.trend_signals?.video_content || 0}</span>
                    </div>
                  </div>
                </div>
                
                {/* Content Gaps */}
                <div className="modal-section span-full">
                  <h4 className="modal-section-title">Content Opportunities</h4>
                  <div className="content-suggestions">
                    {selectedKeyword.content_gaps?.content_suggestions?.map((suggestion: string, index: number) => (
                      <div key={index} className="suggestion-item">
                        <Lightbulb size={16} />
                        <span>{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Genesis;