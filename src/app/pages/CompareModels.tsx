import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useModels } from "../hooks/useModels";
import { Check, X, GitCompare } from "lucide-react";

export function CompareModels() {
  const { models } = useModels();
  const [model1, setModel1] = useState<string>("");
  const [model2, setModel2] = useState<string>("");
  const [model3, setModel3] = useState<string>("");

  const activeModels = models.filter(m => m.status === 'active');

  const selectedModels = [
    model1 ? models.find(m => m.id === model1) : null,
    model2 ? models.find(m => m.id === model2) : null,
    model3 ? models.find(m => m.id === model3) : null,
  ].filter(Boolean);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold mb-2">Compare Models</h1>
        <p className="text-gray-600">Compare capabilities and features across different LLM models</p>
      </div>
      
      {/* Model Selectors */}
      <Card>
        <CardHeader>
          <CardTitle>Select Models to Compare</CardTitle>
          <CardDescription>Choose up to 3 models to compare side by side</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={model1} onValueChange={setModel1}>
              <SelectTrigger>
                <SelectValue placeholder="Select first model" />
              </SelectTrigger>
              <SelectContent>
                {activeModels.map(model => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name} ({model.provider})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={model2} onValueChange={setModel2}>
              <SelectTrigger>
                <SelectValue placeholder="Select second model" />
              </SelectTrigger>
              <SelectContent>
                {activeModels.map(model => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name} ({model.provider})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={model3} onValueChange={setModel3}>
              <SelectTrigger>
                <SelectValue placeholder="Select third model (optional)" />
              </SelectTrigger>
              <SelectContent>
                {activeModels.map(model => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name} ({model.provider})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Comparison Table */}
      {selectedModels.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-4 text-left font-semibold bg-gray-50 sticky left-0">
                      Feature
                    </th>
                    {selectedModels.map((model, idx) => (
                      <th key={idx} className="p-4 text-left bg-gray-50 min-w-[250px]">
                        <div>
                          <div className="font-semibold text-base">{model!.name}</div>
                          <div className="text-sm text-gray-600 mt-1">{model!.provider}</div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium sticky left-0 bg-white">Status</td>
                    {selectedModels.map((model, idx) => (
                      <td key={idx} className="p-4">
                        <StatusBadge status={model!.status} />
                      </td>
                    ))}
                  </tr>
                  
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium sticky left-0 bg-white">Release Date</td>
                    {selectedModels.map((model, idx) => (
                      <td key={idx} className="p-4 text-gray-700">
                        {formatDate(model!.releaseDate)}
                      </td>
                    ))}
                  </tr>
                  
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium sticky left-0 bg-white">Text Generation</td>
                    {selectedModels.map((model, idx) => (
                      <td key={idx} className="p-4">
                        <Check className="h-5 w-5 text-green-600" />
                      </td>
                    ))}
                  </tr>
                  
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium sticky left-0 bg-white">Vision Support</td>
                    {selectedModels.map((model, idx) => (
                      <td key={idx} className="p-4">
                        {model!.capabilities.includes('Vision') ? (
                          <Check className="h-5 w-5 text-green-600" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300" />
                        )}
                      </td>
                    ))}
                  </tr>
                  
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium sticky left-0 bg-white">Agent/Tool Use</td>
                    {selectedModels.map((model, idx) => (
                      <td key={idx} className="p-4">
                        {model!.capabilities.includes('Agents') ? (
                          <Check className="h-5 w-5 text-green-600" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300" />
                        )}
                      </td>
                    ))}
                  </tr>
                  
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium sticky left-0 bg-white">Function Calling</td>
                    {selectedModels.map((model, idx) => (
                      <td key={idx} className="p-4">
                        {model!.capabilities.includes('Function Calling') ? (
                          <Check className="h-5 w-5 text-green-600" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300" />
                        )}
                      </td>
                    ))}
                  </tr>
                  
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium sticky left-0 bg-white">JSON Mode</td>
                    {selectedModels.map((model, idx) => (
                      <td key={idx} className="p-4">
                        {model!.capabilities.includes('JSON Mode') ? (
                          <Check className="h-5 w-5 text-green-600" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300" />
                        )}
                      </td>
                    ))}
                  </tr>
                  
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium sticky left-0 bg-white">Deprecation Date</td>
                    {selectedModels.map((model, idx) => (
                      <td key={idx} className="p-4">
                        {model!.deprecationDate ? (
                          <div>
                            <div className="text-gray-700">{formatDate(model!.deprecationDate)}</div>
                            {model!.daysUntilDeprecation && (
                              <div className="text-sm text-amber-600 mt-1">
                                {model!.daysUntilDeprecation} days left
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">No deprecation scheduled</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  
                  <tr className="hover:bg-gray-50">
                    <td className="p-4 font-medium sticky left-0 bg-white">Replacement Model</td>
                    {selectedModels.map((model, idx) => (
                      <td key={idx} className="p-4">
                        {model!.replacementModel ? (
                          <span className="text-indigo-600">{model!.replacementModel}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
              <GitCompare className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="font-semibold mb-1">No models selected</h3>
            <p className="text-sm text-gray-600">
              Select models above to begin comparing their features and capabilities
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    'active': 'bg-green-100 text-green-700 hover:bg-green-100',
    'deprecated': 'bg-red-100 text-red-700 hover:bg-red-100',
    'upcoming': 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  };
  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <Badge className={variants[status] ?? ''}>
      {label}
    </Badge>
  );
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}
