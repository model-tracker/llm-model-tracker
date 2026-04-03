import { useMemo, useState } from "react";
import { AlertTriangle, TrendingUp, Calendar, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { ModelsTable } from "../components/ModelsTable";
import { ModelReleasesChart, ProviderActivityChart } from "../components/Charts";
import { Skeleton } from "../components/ui/skeleton";
import { useModels } from "../hooks/useModels";
import type { LLMModel } from "../data/mockData";

function getProviderDocsUrl(provider: string): string {
  const urls: Record<string, string> = {
    'OpenAI': 'https://platform.openai.com/docs/deprecations',
    'Anthropic': 'https://docs.anthropic.com/en/docs/about-claude/models/overview',
    'Google': 'https://ai.google.dev/gemini-api/docs/models',
    'Azure OpenAI': 'https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/model-retirements',
    'Amazon Bedrock': 'https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids.html',
    'xAI': 'https://docs.x.ai/docs',
  };
  return urls[provider] || 'https://platform.openai.com/docs/models';
}

export function Dashboard() {
  const { models, isLoading, lastUpdated, refetch, triggerScrape } = useModels();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Get models deprecating soon (within 60 days)
  const deprecatingSoon = useMemo(() => 
    models.filter(m => m.daysUntilDeprecation && m.daysUntilDeprecation <= 60)
      .sort((a, b) => (a.daysUntilDeprecation || 0) - (b.daysUntilDeprecation || 0)),
    [models]
  );
  
  // Get new releases (within last 30 days)
  const newReleases = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return models
      .filter(m => {
        const releaseDate = new Date(m.releaseDate);
        return releaseDate >= thirtyDaysAgo && m.status === 'active';
      })
      .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
  }, [models]);
  
  // Calculate stats
  const stats = useMemo(() => {
    const active = models.filter(m => m.status === 'active').length;
    const deprecated = models.filter(m => m.status === 'deprecated').length;
    const upcoming = models.filter(m => m.status === 'upcoming').length;
    const criticalWarnings = models.filter(m => m.daysUntilDeprecation && m.daysUntilDeprecation <= 30).length;
    
    return { active, deprecated, upcoming, criticalWarnings };
  }, [models]);
  
  // Calculate chart data from real models
  const modelReleasesOverTime = useMemo(() => {
    const monthCounts: Record<string, number> = {};
    
    models.forEach(model => {
      const date = new Date(model.releaseDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
    });
    
    // Get last 12 months
    const result = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
      result.push({
        id: monthKey,
        month: monthLabel,
        count: monthCounts[monthKey] || 0,
      });
    }
    
    return result;
  }, [models]);
  
  const providerActivity = useMemo(() => {
    const providerCounts: Record<string, number> = {};
    
    models.filter(m => m.status === 'active').forEach(model => {
      providerCounts[model.provider] = (providerCounts[model.provider] || 0) + 1;
    });
    
    return Object.entries(providerCounts).map(([provider, count]) => ({
      id: provider,
      provider,
      models: count,
    }));
  }, [models]);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };
  
  const handleTriggerScrape = async () => {
    setIsRefreshing(true);
    await triggerScrape();
    setIsRefreshing(false);
  };
  
  if (isLoading) {
    return <DashboardSkeleton />;
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Dashboard</h1>
          <p className="text-gray-600">Track and monitor LLM models across providers</p>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {formatDate(lastUpdated)} at {new Date(lastUpdated).toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={handleTriggerScrape}
            disabled={isRefreshing}
            size="sm"
          >
            {isRefreshing ? 'Updating...' : 'Update Now'}
          </Button>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600 mb-1">{stats.active}</div>
            <div className="text-sm text-gray-600">Active Models</div>
          </CardContent>
        </Card>
        
        <Card className={stats.criticalWarnings > 0 ? 'border-amber-200 bg-amber-50/30' : ''}>
          <CardContent className="pt-6">
            <div className={`text-2xl font-bold mb-1 ${stats.criticalWarnings > 0 ? 'text-amber-600' : 'text-gray-600'}`}>
              {stats.criticalWarnings}
            </div>
            <div className="text-sm text-gray-600">Critical Warnings</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600 mb-1">{stats.upcoming}</div>
            <div className="text-sm text-gray-600">Upcoming Models</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600 mb-1">{stats.deprecated}</div>
            <div className="text-sm text-gray-600">Deprecated Models</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Deprecating Soon Section */}
      {deprecatingSoon.length > 0 ? (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <h2 className="text-xl font-semibold">Deprecating Soon</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deprecatingSoon.map((model) => (
              <Card key={model.id} className="border-amber-200 bg-amber-50/50">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{model.name}</CardTitle>
                      <CardDescription className="mt-1">{model.provider}</CardDescription>
                    </div>
                    <span className="text-2xl">{getProviderEmoji(model.provider)}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold text-amber-600">
                      {model.daysUntilDeprecation}
                    </div>
                    <div className="text-sm text-gray-600">days left</div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-xs text-gray-600">Deprecation Date</div>
                    <div className="text-sm font-medium">{formatDate(model.deprecationDate!)}</div>
                  </div>
                  
                  {model.replacementModel && (
                    <div className="space-y-1">
                      <div className="text-xs text-gray-600">Replacement Model</div>
                      <div className="text-sm font-medium text-indigo-600">{model.replacementModel}</div>
                    </div>
                  )}
                  
                  <Button size="sm" variant="outline" className="w-full mt-2" onClick={() => window.open(model.sourceUrl || getProviderDocsUrl(model.provider), '_blank')}>
                    View Migration Guide
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : (
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="py-8 text-center">
            <div className="text-4xl mb-2">✅</div>
            <h3 className="font-semibold mb-1">All Clear!</h3>
            <p className="text-sm text-gray-600">No models deprecating in the next 60 days</p>
          </CardContent>
        </Card>
      )}
      
      {/* New Releases Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-green-600" />
          <h2 className="text-xl font-semibold">New Model Releases</h2>
        </div>
        
        {newReleases.length > 0 ? (
          <div className="relative">
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {newReleases.map((model) => (
                <Card key={model.id} className="min-w-[320px] border-green-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{model.name}</CardTitle>
                        <CardDescription className="mt-1">{model.provider}</CardDescription>
                      </div>
                      <span className="text-2xl">{getProviderEmoji(model.provider)}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Released {formatDate(model.releaseDate)}</span>
                    </div>
                    
                    <div>
                      <div className="text-xs text-gray-600 mb-2">Capabilities</div>
                      <div className="flex flex-wrap gap-1">
                        {model.capabilities.map((cap) => (
                          <Badge key={cap} variant="secondary" className="text-xs">
                            {cap}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      New
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-gray-600">
              <p>No new models released in the last 30 days</p>
            </CardContent>
          </Card>
        )}
      </section>
      
      {/* All Models Table */}
      <section>
        <h2 className="text-xl font-semibold mb-4">All Models</h2>
        <ModelsTable
          models={models.map(m => ({ ...m, provider: m.provider as LLMModel['provider'], status: (m.status.charAt(0).toUpperCase() + m.status.slice(1)) as LLMModel['status'], capabilities: m.capabilities as LLMModel['capabilities'] }))}
          isLoading={isLoading}
        />
      </section>
      
      {/* Insights Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Insights & Trends</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Models Released Over Time</CardTitle>
              <CardDescription>Monthly model release activity</CardDescription>
            </CardHeader>
            <CardContent>
              <ModelReleasesChart data={modelReleasesOverTime} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Provider Activity</CardTitle>
              <CardDescription>Active models by provider</CardDescription>
            </CardHeader>
            <CardContent>
              <ProviderActivityChart data={providerActivity} />
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function getProviderEmoji(provider: string): string {
  const emojiMap: Record<string, string> = {
    'OpenAI': '🤖',
    'Anthropic': '🧠',
    'Google': '✨',
    'Azure OpenAI': '☁️',
    'xAI': '⚡',
    'Amazon Bedrock': '📦'
  };
  return emojiMap[provider] || '🔮';
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}