import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companyApi } from '@entities/user/api/companyApi';
import { 
  Lock, 
  Bell, 
  Cloud, 
  CreditCard,
  Building,
  Save,
  CheckCircle2,
  Trash2,
  Loader2
} from 'lucide-react';
import { cn } from '@shared/lib/utils';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'notifications' | 'billing'>('general');

  const { data: settings } = useQuery({
    queryKey: ['company-settings'],
    queryFn: companyApi.getSettings,
  });

  const [form] = useState({
    companyName: '',
    industry: '',
    timezone: '',
    currency: 'USD',
  });

  const updateMutation = useMutation({
    mutationFn: companyApi.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-settings'] });
      toast.success('Settings saved successfully');
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Building },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];

  return (
    <div className="space-y-8">
      <div>
         <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
         <p className="text-sm text-[var(--color-text-muted)]">Configure your workspace and system preferences.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
         {/* Sidebar Tabs */}
         <div className="lg:col-span-1 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 no-scrollbar">
            {tabs.map((tab) => {
               const Icon = tab.icon;
               return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap lg:w-full",
                      activeTab === tab.id 
                        ? "bg-gradient-brand text-white shadow-glow-soft" 
                        : "text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-white"
                    )}
                  >
                     <Icon size={18} />
                     {tab.label}
                  </button>
               );
            })}
         </div>

         {/* Settings Content */}
         <div className="lg:col-span-3 space-y-6">
            {activeTab === 'general' && (
               <div className="card-surface rounded-2xl p-8 border-white/[0.05] animate-fade-in">
                  <form onSubmit={handleSave} className="space-y-8">
                     <div>
                        <h3 className="text-lg font-bold mb-6">Company Profile</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-1.5">
                              <label className="label-eyebrow">Company Name</label>
                              <div className="glass rounded-xl px-4 py-2.5">
                                 <input 
                                    defaultValue={settings?.companyName}
                                    className="bg-transparent text-sm w-full outline-none" 
                                    placeholder="SalesPulse Inc."
                                 />
                              </div>
                           </div>
                           <div className="space-y-1.5">
                              <label className="label-eyebrow">Industry</label>
                              <div className="glass rounded-xl px-4 py-2.5">
                                 <input 
                                    defaultValue={settings?.industry}
                                    className="bg-transparent text-sm w-full outline-none" 
                                    placeholder="SaaS / Technology"
                                 />
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="pt-8 border-t border-white/[0.05]">
                        <h3 className="text-lg font-bold mb-6">Localization</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-1.5">
                              <label className="label-eyebrow">Timezone</label>
                              <select className="w-full glass rounded-xl px-4 py-2.5 text-sm outline-none border-white/[0.05]">
                                 <option>(GMT+05:00) Tashkent, Uzbekistan</option>
                                 <option>(GMT+00:00) London, United Kingdom</option>
                                 <option>(GMT-05:00) New York, USA</option>
                              </select>
                           </div>
                           <div className="space-y-1.5">
                              <label className="label-eyebrow">Currency</label>
                              <select className="w-full glass rounded-xl px-4 py-2.5 text-sm outline-none border-white/[0.05]">
                                 <option>USD ($)</option>
                                 <option>EUR (€)</option>
                                 <option>UZS (so'm)</option>
                              </select>
                           </div>
                        </div>
                     </div>

                     <div className="pt-8 flex justify-end">
                        <button 
                           type="submit"
                           disabled={updateMutation.isPending}
                           className="inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-6 py-2.5 text-sm font-bold text-white shadow-glow-soft hover:shadow-glow transition-all active:scale-[0.98]"
                        >
                           {updateMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                           Save Workspace Settings
                        </button>
                     </div>
                  </form>
               </div>
            )}

            {activeTab === 'security' && (
               <div className="space-y-6 animate-fade-in">
                  <div className="card-surface rounded-2xl p-8 border-white/[0.05]">
                     <h3 className="text-lg font-bold mb-6">Authentication</h3>
                     <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl glass border-white/[0.05]">
                           <div className="flex items-center gap-3">
                              <div className="p-2 bg-[var(--color-success-muted)] text-[var(--color-success)] rounded-lg">
                                 <CheckCircle2 size={20} />
                              </div>
                              <div>
                                 <p className="text-sm font-bold">Two-Factor Authentication</p>
                                 <p className="text-xs text-[var(--color-text-muted)]">Enabled via Google Authenticator</p>
                              </div>
                           </div>
                           <button className="text-xs font-bold text-[var(--color-danger)] hover:underline">Disable</button>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl glass border-white/[0.05]">
                           <div className="flex items-center gap-3">
                              <div className="p-2 bg-white/5 text-[var(--color-text-secondary)] rounded-lg">
                                 <Cloud size={20} />
                              </div>
                              <div>
                                 <p className="text-sm font-bold">Single Sign-On (SSO)</p>
                                 <p className="text-xs text-[var(--color-text-muted)]">Not configured</p>
                              </div>
                           </div>
                           <button className="text-xs font-bold text-[var(--color-accent)] hover:underline">Setup SSO</button>
                        </div>
                     </div>
                  </div>

                  <div className="card-surface rounded-2xl p-8 border-white/[0.05] border-l-4 border-l-[var(--color-danger)]">
                     <h3 className="text-lg font-bold text-[var(--color-danger)] mb-2">Danger Zone</h3>
                     <p className="text-sm text-[var(--color-text-muted)] mb-6">Permanently delete your workspace and all associated data. This action cannot be undone.</p>
                     <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-danger-muted)] text-[var(--color-danger)] text-sm font-bold hover:bg-[var(--color-danger)] hover:text-white transition-all">
                        <Trash2 size={18} /> Delete Workspace
                     </button>
                  </div>
               </div>
            )}
            
            {activeTab === 'notifications' && (
               <div className="space-y-6 animate-fade-in">
                  <div className="card-surface rounded-2xl p-8 border-white/[0.05]">
                     <h3 className="text-lg font-bold mb-6">Email Preferences</h3>
                     <div className="space-y-6">
                        {[
                           { id: 'n1', title: 'New Registration Alerts', desc: 'Notify when a new manager joins the team.', active: true },
                           { id: 'n2', title: 'Weekly Performance Digest', desc: 'Get a summary of your team performance every Monday.', active: true },
                           { id: 'n3', title: 'System Updates', desc: 'Receive news about new features and improvements.', active: false },
                        ].map((item) => (
                           <div key={item.id} className="flex items-center justify-between">
                              <div>
                                 <p className="text-sm font-bold">{item.title}</p>
                                 <p className="text-xs text-[var(--color-text-muted)]">{item.desc}</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                 <input type="checkbox" defaultChecked={item.active} className="sr-only peer" />
                                 <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-accent)]"></div>
                              </label>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="card-surface rounded-2xl p-8 border-white/[0.05]">
                     <h3 className="text-lg font-bold mb-6">Security Notifications</h3>
                     <div className="space-y-6">
                        <div className="flex items-center justify-between">
                           <div>
                              <p className="text-sm font-bold">New Login Attempt</p>
                              <p className="text-xs text-[var(--color-text-muted)]">Always notify when a login occurs from a new device.</p>
                           </div>
                           <span className="px-3 py-1 rounded-full bg-[var(--color-success-muted)] text-[var(--color-success)] text-[10px] font-bold uppercase tracking-wider">Mandatory</span>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'billing' && (
               <div className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="md:col-span-2 card-surface rounded-2xl p-8 border-white/[0.05]">
                        <div className="flex items-center justify-between mb-8">
                           <div>
                              <h3 className="text-lg font-bold">Current Plan</h3>
                              <p className="text-sm text-[var(--color-text-muted)]">You are currently on the Professional Plan.</p>
                           </div>
                           <span className="px-4 py-1.5 rounded-xl bg-gradient-brand text-white text-xs font-bold shadow-glow-soft">Pro Plan</span>
                        </div>
                        
                        <div className="space-y-4 mb-8">
                           <div className="flex justify-between text-sm">
                              <span className="text-[var(--color-text-secondary)]">Managers Usage</span>
                              <span className="font-bold">12 / 50</span>
                           </div>
                           <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-[var(--color-accent)] rounded-full" style={{ width: '24%' }}></div>
                           </div>
                        </div>

                        <div className="flex gap-4">
                           <button className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10 transition-all">Change Plan</button>
                           <button className="px-6 py-2.5 rounded-xl text-sm font-bold text-[var(--color-danger)] hover:bg-[var(--color-danger-muted)] transition-all">Cancel Subscription</button>
                        </div>
                     </div>

                     <div className="card-surface rounded-2xl p-8 border-white/[0.05] flex flex-col items-center justify-center text-center bg-gradient-to-br from-blue-600/10 to-indigo-600/10">
                        <p className="text-sm text-[var(--color-text-secondary)] mb-2">Next Payment</p>
                        <p className="text-3xl font-black mb-1">$49.00</p>
                        <p className="text-xs text-[var(--color-text-muted)]">Due on June 1, 2026</p>
                     </div>
                  </div>

                  <div className="card-surface rounded-2xl p-8 border-white/[0.05]">
                     <h3 className="text-lg font-bold mb-6">Payment Methods</h3>
                     <div className="flex items-center justify-between p-4 rounded-xl glass border-white/[0.05]">
                        <div className="flex items-center gap-4">
                           <div className="h-10 w-14 bg-white/5 rounded-lg flex items-center justify-center">
                              <CreditCard size={24} className="text-white/40" />
                           </div>
                           <div>
                              <p className="text-sm font-bold">•••• •••• •••• 4242</p>
                              <p className="text-xs text-[var(--color-text-muted)]">Expires 12/28</p>
                           </div>
                        </div>
                        <button className="text-xs font-bold text-[var(--color-accent)] hover:underline">Edit</button>
                     </div>
                  </div>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}
