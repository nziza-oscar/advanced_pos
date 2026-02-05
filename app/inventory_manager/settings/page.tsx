'use client';

import { useState, useEffect } from 'react';
import { 
  Settings, Store, Bell, ShieldCheck, 
  Database, Save, Loader2, Globe 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Titles from '@/components/layout/Titles';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [shopName, setShopName] = useState('');

  useEffect(() => {
    // Simulate fetching initial settings
    setTimeout(() => {
      setShopName("Oscar's POS System");
      setFetching(false);
    }, 800);
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      // API call logic here
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to save changes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      

      <Titles title='System Configuration' description='Manage your store preferences and security settings' />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation Tabs (Visual only) */}
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 text-blue-600 text-sm transition-all">
            <Store className="w-4 h-4" /> Store Profile
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 text-sm transition-all">
            <Bell className="w-4 h-4" /> Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 text-sm transition-all">
            <ShieldCheck className="w-4 h-4" /> Security
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 text-sm transition-all">
            <Database className="w-4 h-4" /> Backup & Data
          </button>
        </div>

        {/* Settings Form */}
        <div className="md:col-span-2 space-y-6 relative min-h-[400px]">
          {fetching ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 z-10">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : (
            <>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm text-blue-500 uppercase tracking-widest flex items-center gap-2">
                    <Globe className="w-4 h-4" /> General Information
                  </h3>
                  
                  <div className="grid gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="shopName" className="text-xs text-slate-500 uppercase tracking-tight">Shop Display Name</Label>
                      <Input 
                        id="shopName"
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                        className="rounded-xl border-slate-200 focus:ring-blue-500"
                        placeholder="Enter your business name"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-slate-500 uppercase tracking-tight">System Currency</Label>
                        <Input value="FRW" disabled className="rounded-xl bg-slate-50 text-slate-400" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-slate-500 uppercase tracking-tight">Timezone</Label>
                        <Input value="GMT+02:00 (Kigali)" disabled className="rounded-xl bg-slate-50 text-slate-400" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50 space-y-4">
                  <h3 className="text-sm text-blue-500 uppercase tracking-widest">Preferences</h3>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div>
                      <p className="text-sm text-slate-900">Automatic Inventory Sync</p>
                      <p className="text-xs text-slate-400">Updates stock count immediately after sales</p>
                    </div>
                    <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="ghost" className="rounded-xl text-slate-500 px-6">
                  Discard
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={loading}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 px-8 flex items-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}