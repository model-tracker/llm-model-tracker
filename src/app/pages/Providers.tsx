import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { providers } from "../data/mockData";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../components/ui/sheet";
import { ArrowRight, Building2, Search, ChevronDown, ChevronUp } from "lucide-react";
import { useModels } from "../hooks/useModels";

export function Providers() {
  const { models } = useModels();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedModel, setExpandedModel] = useState<string | null>(null);

  const selectedProviderData = providers.find(p => p.id === selectedProvider);

  const providerNameMap: Record<string, string> = {
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    google: 'Google',
    azure: 'Azure OpenAI',
    xai: 'xAI',
    bedrock: 'Amazon Bedrock',
  };

  const providerModels = useMemo(() => {
    if (!selectedProvider) return [];
    const providerName = providerNameMap[selectedProvider] || '';
    return models.filter(m => m.provider === providerName);
  }, [selectedProvider, models]);

  const filteredModels = useMemo(() => {
    if (!searchQuery) return providerModels;
    return providerModels.filter(m =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [providerModels, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold mb-2">Providers</h1>
        <p className="text-gray-600">Browse LLM providers and their model offerings</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold mb-1">
              {providers.reduce((sum, p) => sum + p.activeModels, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Active Models</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold mb-1">{providers.length}</div>
            <div className="text-sm text-gray-600">Providers Tracked</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold mb-1">
              {providers.reduce((sum, p) => sum + p.deprecatedModels, 0)}
            </div>
            <div className="text-sm text-gray-600">Deprecated Models</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold mb-1">
              {providers.reduce((sum, p) => sum + p.upcomingModels, 0)}
            </div>
            <div className="text-sm text-gray-600">Upcoming Models</div>
          </CardContent>
        </Card>
      </div>

      {/* Provider Cards */}
      {providers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((provider) => (
            <Card key={provider.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <img src={provider.logo} alt={provider.name} className="h-10 w-10 object-contain" />
                  <div>
                    <CardTitle className="text-xl">{provider.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {provider.activeModels + provider.deprecatedModels + provider.upcomingModels} total models
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-700">{provider.activeModels}</div>
                    <div className="text-xs text-gray-600 mt-1">Active</div>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <div className="text-xl font-bold text-red-700">{provider.deprecatedModels}</div>
                    <div className="text-xs text-gray-600 mt-1">Deprecated</div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-700">{provider.upcomingModels}</div>
                    <div className="text-xs text-gray-600 mt-1">Upcoming</div>
                  </div>
                </div>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => {
                    setSelectedProvider(provider.id);
                    setSearchQuery("");
                    setExpandedModel(null);
                  }}
                >
                  View Models
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
              <Building2 className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="font-semibold mb-1">No providers available</h3>
            <p className="text-sm text-gray-600">Providers will appear here once added to the tracker</p>
          </CardContent>
        </Card>
      )}

      {/* Slide-out Sheet */}
      <Sheet open={!!selectedProvider} onOpenChange={(open) => { if (!open) setSelectedProvider(null); }}>
        <SheetContent className="w-full sm:max-w-xl flex flex-col p-0 gap-0">
          {/* Header */}
          <SheetHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
            <div className="flex items-center gap-3">
              {selectedProviderData && (
                <img src={selectedProviderData.logo} alt={selectedProviderData.name} className="h-8 w-8 object-contain" />
              )}
              <SheetTitle className="text-lg">{selectedProviderData?.name} Models</SheetTitle>
            </div>
          </SheetHeader>

          {/* Search + Count */}
          <div className="px-6 pt-4 pb-3 flex-shrink-0 border-b bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="text-xs text-gray-500 mt-2">{filteredModels.length} model{filteredModels.length !== 1 ? 's' : ''}</div>
          </div>

          {/* Model List — scrollable */}
          <div className="overflow-y-auto flex-1">
            <div className="divide-y divide-gray-100">
              {filteredModels.map((model) => (
                <div key={model.id}>
                  <button
                    className="w-full flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 text-left transition-colors"
                    onClick={() => setExpandedModel(expandedModel === model.id ? null : model.id)}
                  >
                    <div>
                      <div className="font-medium text-sm text-gray-900">{model.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{model.releaseDate}</div>
                    </div>
                    <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                      <Badge className={
                        model.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                        model.status === 'deprecated' ? 'bg-red-100 text-red-700 hover:bg-red-100' :
                        'bg-blue-100 text-blue-700 hover:bg-blue-100'
                      }>
                        {model.status.charAt(0).toUpperCase() + model.status.slice(1)}
                      </Badge>
                      {expandedModel === model.id
                        ? <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        : <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />}
                    </div>
                  </button>

                  {expandedModel === model.id && (
                    <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 space-y-3 text-sm">
                      {model.inputPricing && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Input Pricing</span>
                          <span className="font-medium text-gray-900">{model.inputPricing}</span>
                        </div>
                      )}
                      {model.outputPricing && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Output Pricing</span>
                          <span className="font-medium text-gray-900">{model.outputPricing}</span>
                        </div>
                      )}
                      {model.contextWindow && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Context Window</span>
                          <span className="font-medium text-gray-900">{model.contextWindow.toLocaleString()} tokens</span>
                        </div>
                      )}
                      {model.maxOutputTokens && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Max Output</span>
                          <span className="font-medium text-gray-900">{model.maxOutputTokens.toLocaleString()} tokens</span>
                        </div>
                      )}
                      {model.deprecationDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Deprecation Date</span>
                          <span className="font-medium text-amber-600">{model.deprecationDate}</span>
                        </div>
                      )}
                      {model.replacementModel && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Replacement</span>
                          <span className="font-medium text-indigo-600">{model.replacementModel}</span>
                        </div>
                      )}
                      {model.capabilities?.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-gray-500">Capabilities</span>
                          <div className="flex flex-wrap gap-1">
                            {model.capabilities.map(cap => (
                              <Badge key={cap} variant="outline" className="text-xs">{cap}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {model.notes && (
                        <div className="text-gray-400 italic text-xs pt-1">{model.notes}</div>
                      )}
                      {model.sourceUrl && (
                        <Button size="sm" variant="outline" className="w-full mt-1" onClick={() => window.open(model.sourceUrl, '_blank')}>
                          View Docs
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {filteredModels.length === 0 && (
                <div className="text-center text-gray-500 py-12 px-6">No models found</div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
