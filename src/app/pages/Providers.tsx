import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { providers } from "../data/mockData";
import { ArrowRight, Building2 } from "lucide-react";
import { Link } from "react-router";
import { Skeleton } from "../components/ui/skeleton";

export function Providers() {
  const [isLoading, setIsLoading] = useState(false);
  
  if (isLoading) {
    return <ProvidersSkeleton />;
  }
  
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
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img src={provider.logo} alt={provider.name} className="h-10 w-10 object-contain" />
                    <div>
                      <CardTitle className="text-xl">{provider.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {provider.activeModels + provider.deprecatedModels + provider.upcomingModels} total models
                      </CardDescription>
                    </div>
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
                
                <Link to={`/?provider=${provider.id}`}>
                  <Button className="w-full" variant="outline">
                    View Models
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
          <Building2 className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="font-semibold mb-1">No providers available</h3>
        <p className="text-sm text-gray-600">
          Providers will appear here once they are added to the tracker
        </p>
      </CardContent>
    </Card>
  );
}

function ProvidersSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
