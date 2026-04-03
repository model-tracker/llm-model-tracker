import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Card, CardContent } from "./ui/card";
import { llmModels, LLMModel } from "../data/mockData";
import { Search, ArrowUpDown, Filter, Package, AlertCircle } from "lucide-react";

interface ModelsTableProps {
  models?: (LLMModel & { sourceUrl?: string })[];
  isLoading?: boolean;
}
import { Skeleton } from "./ui/skeleton";
import { ModelDetailModal } from "./ModelDetailModal";

type SortField = 'name' | 'provider' | 'releaseDate' | 'status';
type SortDirection = 'asc' | 'desc';

export function ModelsTable({ models: modelsProp, isLoading = false }: ModelsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [providerFilter, setProviderFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>('releaseDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedModel, setSelectedModel] = useState<LLMModel | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  const filteredAndSortedModels = useMemo(() => {
    const source = modelsProp ?? llmModels;
    let filtered = source;
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(model =>
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.provider.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Provider filter
    if (providerFilter !== "all") {
      filtered = filtered.filter(model => model.provider === providerFilter);
    }
    
    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(model => model.status === statusFilter);
    }
    
    // Sort
    const sorted = [...filtered].sort((a, b) => {
      let compareValue = 0;
      
      switch (sortField) {
        case 'name':
          compareValue = a.name.localeCompare(b.name);
          break;
        case 'provider':
          compareValue = a.provider.localeCompare(b.provider);
          break;
        case 'releaseDate':
          compareValue = new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
          break;
        case 'status':
          compareValue = a.status.localeCompare(b.status);
          break;
      }
      
      return sortDirection === 'asc' ? compareValue : -compareValue;
    });
    
    return sorted;
  }, [modelsProp, searchQuery, providerFilter, statusFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const handleRowClick = (model: LLMModel) => {
    setSelectedModel(model);
    setModalOpen(true);
  };
  
  const providers = Array.from(new Set((modelsProp ?? llmModels).map(m => m.provider)));
  
  if (isLoading) {
    return <TableSkeleton />;
  }
  
  return (
    <>
      <Card>
        <CardContent className="p-6">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={providerFilter} onValueChange={setProviderFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Providers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                {providers.map(provider => (
                  <SelectItem key={provider} value={provider}>
                    {provider}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Deprecated">Deprecated</SelectItem>
                <SelectItem value="Upcoming">Upcoming</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Results count */}
          <div className="text-sm text-gray-600 mb-4">
            Showing {filteredAndSortedModels.length} of {(modelsProp ?? llmModels).length} models
          </div>
          
          {/* Table */}
          {filteredAndSortedModels.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="-ml-3 h-8 font-semibold"
                          onClick={() => handleSort('name')}
                        >
                          Model Name
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="-ml-3 h-8 font-semibold"
                          onClick={() => handleSort('provider')}
                        >
                          Provider
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="-ml-3 h-8 font-semibold"
                          onClick={() => handleSort('status')}
                        >
                          Status
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="-ml-3 h-8 font-semibold"
                          onClick={() => handleSort('releaseDate')}
                        >
                          Release Date
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="font-semibold">Deprecation</TableHead>
                      <TableHead className="font-semibold">Replacement</TableHead>
                      <TableHead className="font-semibold">Capabilities</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedModels.map((model) => (
                      <TableRow 
                        key={model.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleRowClick(model)}
                      >
                        <TableCell className="font-medium">{model.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <img src={getProviderEmoji(model.provider)} alt={model.provider} className="h-5 w-5 object-contain" />
                            <span>{model.provider}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={model.status} />
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(model.releaseDate)}
                        </TableCell>
                        <TableCell>
                          {model.deprecationDate ? (
                            <div className="space-y-1">
                              <div className="text-sm">{formatDate(model.deprecationDate)}</div>
                              {model.daysUntilDeprecation !== undefined && (
                                <div className="text-xs text-amber-600 font-medium">
                                  {model.daysUntilDeprecation} days left
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {model.replacementModel ? (
                            <span className="text-sm text-indigo-600">{model.replacementModel}</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {model.capabilities.slice(0, 3).map((cap) => (
                              <Badge key={cap} variant="secondary" className="text-xs">
                                {cap}
                              </Badge>
                            ))}
                            {model.capabilities.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{model.capabilities.length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <EmptyState
              searchQuery={searchQuery}
              hasFilters={providerFilter !== "all" || statusFilter !== "all"}
              onClearFilters={() => {
                setSearchQuery("");
                setProviderFilter("all");
                setStatusFilter("all");
              }}
            />
          )}
        </CardContent>
      </Card>
      
      <ModelDetailModal 
        model={selectedModel}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}

function StatusBadge({ status }: { status: LLMModel['status'] }) {
  const variants = {
    'Active': 'bg-green-100 text-green-700 hover:bg-green-100',
    'Deprecated': 'bg-red-100 text-red-700 hover:bg-red-100',
    'Upcoming': 'bg-blue-100 text-blue-700 hover:bg-blue-100'
  };
  
  return (
    <Badge className={variants[status]}>
      {status}
    </Badge>
  );
}

function EmptyState({ searchQuery, hasFilters, onClearFilters }: { searchQuery: string; hasFilters: boolean; onClearFilters: () => void }) {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
        {searchQuery || hasFilters ? (
          <AlertCircle className="h-6 w-6 text-gray-400" />
        ) : (
          <Package className="h-6 w-6 text-gray-400" />
        )}
      </div>
      <h3 className="font-semibold mb-1">
        {searchQuery || hasFilters ? 'No models found' : 'No models available'}
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        {searchQuery || hasFilters
          ? 'Try adjusting your search or filters'
          : 'Models will appear here once they are added to the tracker'}
      </p>
      {(searchQuery || hasFilters) && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
        >
          Clear filters
        </Button>
      )}
    </div>
  );
}

function TableSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-4 mb-6">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-10 w-[180px]" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function getProviderEmoji(provider: string): string {
  const logoMap: Record<string, string> = {
    'OpenAI': '/logos/openai.png',
    'Anthropic': '/logos/anthropic.png',
    'Google': '/logos/google.png',
    'Azure OpenAI': '/logos/azure.png',
    'xAI': '/logos/xai.png',
    'Amazon Bedrock': '/logos/amazon.png',
  };
  return logoMap[provider] || '';
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}