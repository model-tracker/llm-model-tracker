import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { llmModels } from '../data/mockData';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/server`;

export interface Model {
  id: string;
  name: string;
  provider: string;
  releaseDate: string;
  deprecationDate?: string;
  status: 'active' | 'deprecated' | 'upcoming';
  contextWindow?: number;
  maxOutputTokens?: number;
  inputPricing?: string;
  outputPricing?: string;
  capabilities: string[];
  notes?: string;
  lastUpdated: string;
  sourceUrl: string;
  daysUntilDeprecation?: number;
  replacementModel?: string;
}

export interface Deprecation {
  id: string;
  modelName: string;
  provider: string;
  deprecationDate: string;
  replacementModel?: string;
  reason?: string;
  daysUntilDeprecation?: number;
}

export interface Alert {
  id: string;
  type: 'deprecation' | 'new_model' | 'update';
  severity: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  modelId?: string;
  provider: string;
  createdAt: string;
  read: boolean;
}

interface ModelsResponse {
  models: Model[];
  lastUpdated: string | null;
  count: number;
}

interface DeprecationsResponse {
  deprecations: Deprecation[];
  lastUpdated: string | null;
  count: number;
}

interface AlertsResponse {
  alerts: Alert[];
  count: number;
}

function buildMockFallback(): Model[] {
  const now = new Date();
  return llmModels.map(m => {
    let daysUntilDeprecation = m.daysUntilDeprecation;
    if (m.deprecationDate && daysUntilDeprecation === undefined) {
      const diffTime = new Date(m.deprecationDate).getTime() - now.getTime();
      daysUntilDeprecation = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }
    return {
      id: m.id,
      name: m.name,
      provider: m.provider,
      releaseDate: m.releaseDate,
      deprecationDate: m.deprecationDate,
      status: m.status.toLowerCase() as 'active' | 'deprecated' | 'upcoming',
      capabilities: m.capabilities,
      replacementModel: m.replacementModel,
      lastUpdated: now.toISOString(),
      sourceUrl: '',
      daysUntilDeprecation,
    };
  });
}

export function useModels() {
  const [models, setModels] = useState<Model[]>([]);
  const [deprecations, setDeprecations] = useState<Deprecation[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const headers = {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      };

      const [modelsRes, deprecationsRes, alertsRes] = await Promise.all([
        fetch(`${API_BASE}/models`, { headers }),
        fetch(`${API_BASE}/deprecations`, { headers }),
        fetch(`${API_BASE}/alerts`, { headers }),
      ]);

      if (!modelsRes.ok || !deprecationsRes.ok || !alertsRes.ok) {
        throw new Error('Failed to fetch data from server');
      }

      const modelsData: ModelsResponse = await modelsRes.json();
      const deprecationsData: DeprecationsResponse = await deprecationsRes.json();
      const alertsData: AlertsResponse = await alertsRes.json();

      // Merge API data with local mock — API wins on conflict, mock fills gaps
      // This ensures locally curated models always appear even if the deployed
      // Edge Function hasn't been updated yet.
      const mockModels = buildMockFallback();
      const apiById = new Map(modelsData.models.map(m => [m.id, m]));
      const allIds = new Set([...apiById.keys(), ...mockModels.map(m => m.id)]);
      const merged = Array.from(allIds).map(id =>
        apiById.get(id) ?? mockModels.find(m => m.id === id)!
      );

      // Process models and add deprecation info
      const processedModels = merged.map(model => {
        if (model.deprecationDate) {
          const depDate = new Date(model.deprecationDate);
          const now = new Date();
          const diffTime = depDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return {
            ...model,
            daysUntilDeprecation: Math.max(0, diffDays),
            status: diffDays <= 0 ? 'deprecated' as const : model.status,
          };
        }
        return model;
      });

      setModels(processedModels);
      setDeprecations(deprecationsData.deprecations);
      setAlerts(alertsData.alerts);
      setLastUpdated(modelsData.lastUpdated);
    } catch (err) {
      console.error('Error fetching models:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      // Fall back to mock data so the UI is functional without a backend
      setModels(buildMockFallback());
    } finally {
      setIsLoading(false);
    }
  };

  const triggerScrape = async () => {
    try {
      const response = await fetch(`${API_BASE}/scrape`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to trigger scrape');
      }

      // Refresh data after scraping
      await fetchData();

      return true;
    } catch (err) {
      console.error('Error triggering scrape:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchData();

    // Refresh data every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    models,
    deprecations,
    alerts,
    lastUpdated,
    isLoading,
    error,
    refetch: fetchData,
    triggerScrape,
  };
}
