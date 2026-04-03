import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { LLMModel } from "../data/mockData";
import { Calendar, AlertTriangle, Check, X, ArrowRight } from "lucide-react";

interface ModelDetailModalProps {
  model: LLMModel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ModelDetailModal({ model, open, onOpenChange }: ModelDetailModalProps) {
  if (!model) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">{model.name}</DialogTitle>
              <DialogDescription className="mt-2 flex items-center gap-2">
                <span className="text-2xl">{getProviderEmoji(model.provider)}</span>
                <span>{model.provider}</span>
              </DialogDescription>
            </div>
            <StatusBadge status={model.status} />
          </div>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Key Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">Release Date</div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="font-medium">{formatDate(model.releaseDate)}</span>
              </div>
            </div>
            
            {model.deprecationDate && (
              <div className="space-y-2">
                <div className="text-sm text-gray-600">Deprecation Date</div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span className="font-medium">{formatDate(model.deprecationDate)}</span>
                </div>
                {model.daysUntilDeprecation !== undefined && (
                  <div className="text-sm text-amber-600">
                    {model.daysUntilDeprecation} days remaining
                  </div>
                )}
              </div>
            )}
          </div>
          
          <Separator />
          
          {/* Capabilities */}
          <div className="space-y-3">
            <h3 className="font-semibold">Capabilities</h3>
            <div className="grid grid-cols-2 gap-3">
              <CapabilityItem 
                label="Text Generation" 
                enabled={model.capabilities.includes('Text')} 
              />
              <CapabilityItem 
                label="Vision" 
                enabled={model.capabilities.includes('Vision')} 
              />
              <CapabilityItem 
                label="Agents/Tool Use" 
                enabled={model.capabilities.includes('Agents')} 
              />
              <CapabilityItem 
                label="Function Calling" 
                enabled={model.capabilities.includes('Function Calling')} 
              />
              <CapabilityItem 
                label="JSON Mode" 
                enabled={model.capabilities.includes('JSON Mode')} 
              />
            </div>
          </div>
          
          <Separator />
          
          {/* Migration Info */}
          {model.replacementModel && (
            <div className="space-y-3">
              <h3 className="font-semibold">Migration Path</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="text-sm text-gray-600 mb-1">Recommended Replacement</div>
                    <div className="font-medium text-lg text-indigo-700">
                      {model.replacementModel}
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-indigo-600" />
                </div>
                <Button
                  className="mt-4 w-full"
                  variant="outline"
                  onClick={() => window.open(model.sourceUrl || getProviderDocsUrl(model.provider), '_blank')}
                >
                  View Migration Guide
                </Button>
              </div>
            </div>
          )}
          
          {/* Pricing */}
          {(model.inputPricing || model.outputPricing || model.contextWindow || model.maxOutputTokens) && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold">Pricing & Specs</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  {model.inputPricing && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Input Pricing</span>
                      <span className="font-medium">{model.inputPricing}</span>
                    </div>
                  )}
                  {model.outputPricing && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Output Pricing</span>
                      <span className="font-medium">{model.outputPricing}</span>
                    </div>
                  )}
                  {model.contextWindow && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Context Window</span>
                      <span className="font-medium">{model.contextWindow.toLocaleString()} tokens</span>
                    </div>
                  )}
                  {model.maxOutputTokens && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Max Output</span>
                      <span className="font-medium">{model.maxOutputTokens.toLocaleString()} tokens</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Additional Info */}
          <div className="space-y-3">
            <h3 className="font-semibold">Additional Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Model ID</span>
                <span className="font-mono">{model.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className="font-medium">{model.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Provider</span>
                <span className="font-medium">{model.provider}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CapabilityItem({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg border bg-white">
      {enabled ? (
        <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
      ) : (
        <X className="h-4 w-4 text-gray-300 flex-shrink-0" />
      )}
      <span className={`text-sm ${enabled ? 'text-gray-900' : 'text-gray-400'}`}>
        {label}
      </span>
    </div>
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
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}
