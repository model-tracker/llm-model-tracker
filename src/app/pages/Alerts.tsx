import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Bell, Check } from "lucide-react";
import { toast } from "sonner";
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/server`;

interface AlertSettings {
  deprecation1Month: boolean;
  deprecation1Week: boolean;
  newModels: boolean;
  email: string;
}

export function Alerts() {
  const [settings, setSettings] = useState<AlertSettings>({
    deprecation1Month: true,
    deprecation1Week: true,
    newModels: true,
    email: ""
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!settings.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE}/subscribe`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${publicAnonKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: settings.email,
          alertNewModels: settings.newModels,
          alert60Days: settings.deprecation1Month,
          alert7Days: settings.deprecation1Week,
        }),
      });
      if (!res.ok) throw new Error("Failed to subscribe");
      toast.success("You're subscribed! You'll receive email alerts based on your preferences.");
    } catch {
      toast.error("Failed to save preferences. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!settings.email) { toast.error("Enter your email to unsubscribe"); return; }
    try {
      await fetch(`${API_BASE}/unsubscribe/${encodeURIComponent(settings.email)}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${publicAnonKey}` },
      });
      toast.success("You've been unsubscribed.");
    } catch {
      toast.error("Failed to unsubscribe. Please try again.");
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold mb-2">Alert Settings</h1>
        <p className="text-gray-600">Configure your notification preferences for model updates</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>
              Choose which alerts you'd like to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Deprecation Alerts */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-gray-700">Deprecation Alerts</h3>
              
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="space-y-1 flex-1">
                  <Label htmlFor="alert-1month" className="text-base font-medium cursor-pointer">
                    1 Month Before Deprecation
                  </Label>
                  <p className="text-sm text-gray-600">
                    Get notified 30 days before a model is deprecated
                  </p>
                </div>
                <Switch
                  id="alert-1month"
                  checked={settings.deprecation1Month}
                  onCheckedChange={(checked) => 
                    setSettings({ ...settings, deprecation1Month: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="space-y-1 flex-1">
                  <Label htmlFor="alert-1week" className="text-base font-medium cursor-pointer">
                    1 Week Before Deprecation
                  </Label>
                  <p className="text-sm text-gray-600">
                    Get notified 7 days before a model is deprecated
                  </p>
                </div>
                <Switch
                  id="alert-1week"
                  checked={settings.deprecation1Week}
                  onCheckedChange={(checked) => 
                    setSettings({ ...settings, deprecation1Week: checked })
                  }
                />
              </div>
            </div>
            
            {/* New Model Alerts */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-gray-700">Release Alerts</h3>
              
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="space-y-1 flex-1">
                  <Label htmlFor="alert-new" className="text-base font-medium cursor-pointer">
                    New Model Releases
                  </Label>
                  <p className="text-sm text-gray-600">
                    Get notified when new models are released
                  </p>
                </div>
                <Switch
                  id="alert-new"
                  checked={settings.newModels}
                  onCheckedChange={(checked) => 
                    setSettings({ ...settings, newModels: checked })
                  }
                />
              </div>
            </div>
            
            {/* Email Input */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold text-sm text-gray-700">Notification Email</h3>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  placeholder="your.email@example.com"
                />
                <p className="text-xs text-gray-600">
                  We'll send notifications to this email address
                </p>
              </div>
            </div>
            
            {/* Save Button */}
            <div className="pt-4 flex gap-3">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full md:w-auto"
              >
                {isSaving ? "Saving..." : "Subscribe"}
              </Button>
              <Button
                onClick={handleUnsubscribe}
                variant="outline"
                className="w-full md:w-auto"
              >
                Unsubscribe
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Info Card */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Alert Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className={`mt-1 ${settings.deprecation1Month ? 'text-green-600' : 'text-gray-300'}`}>
                  {settings.deprecation1Month ? <Check className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">30-Day Warnings</div>
                  <div className="text-xs text-gray-600">Early deprecation alerts</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className={`mt-1 ${settings.deprecation1Week ? 'text-green-600' : 'text-gray-300'}`}>
                  {settings.deprecation1Week ? <Check className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">7-Day Warnings</div>
                  <div className="text-xs text-gray-600">Urgent deprecation alerts</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className={`mt-1 ${settings.newModels ? 'text-green-600' : 'text-gray-300'}`}>
                  {settings.newModels ? <Check className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">New Releases</div>
                  <div className="text-xs text-gray-600">Model launch notifications</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-indigo-50 border-indigo-200">
            <CardContent className="pt-6">
              <div className="text-sm text-indigo-900 space-y-2">
                <p className="font-medium">💡 Pro Tip</p>
                <p className="text-indigo-700">
                  Enable all alerts to stay ahead of breaking changes and discover new capabilities early.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
