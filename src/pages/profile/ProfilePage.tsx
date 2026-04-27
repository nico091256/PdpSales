import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '@entities/user/api/profileApi';
import { 
  User, 
  Mail, 
  Phone, 
  Camera, 
  Shield, 
  Building, 
  Globe,
  Save,
  Loader2
} from 'lucide-react';
import { cn } from '@shared/lib/utils';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.getProfile,
  });

  const [form, setForm] = useState({
    fullName: '',
    phoneNumber: '',
    crmId: '',
    telephonyId: '',
  });

  const updateMutation = useMutation({
    mutationFn: profileApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully');
      setIsEditing(false);
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const handleEdit = () => {
    if (profile) {
      setForm({
        fullName: profile.fullName || '',
        phoneNumber: profile.phoneNumber || '',
        crmId: profile.crmId || '',
        telephonyId: profile.telephonyId || '',
      });
      setIsEditing(true);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse space-y-8">
       <div className="h-48 bg-white/5 rounded-2xl" />
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-64 bg-white/5 rounded-2xl" />
          <div className="h-64 bg-white/5 rounded-2xl" />
       </div>
    </div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="card-surface rounded-2xl overflow-hidden border-white/[0.05]">
         <div className="h-32 bg-gradient-brand opacity-80" />
         <div className="px-8 pb-8 relative">
            <div className="absolute -top-12 left-8">
               <div className="relative group">
                  <div className="h-24 w-24 rounded-full bg-gradient-brand p-1 shadow-2xl">
                     <div className="h-full w-full rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center text-3xl font-bold">
                        {profile?.fullName?.[0] || 'U'}
                     </div>
                  </div>
                  <button className="absolute bottom-0 right-0 p-2 bg-[var(--color-accent)] text-white rounded-full shadow-glow-soft hover:scale-110 transition-transform">
                     <Camera size={14} />
                  </button>
               </div>
            </div>
            
            <div className="pt-16 flex flex-wrap items-end justify-between gap-4">
               <div>
                  <h1 className="text-2xl font-bold">{profile?.fullName}</h1>
                  <p className="text-[var(--color-text-muted)] flex items-center gap-2 mt-1 text-sm uppercase tracking-wider">
                     <Shield size={14} /> {profile?.role} · {profile?.region || 'Global HQ'}
                  </p>
               </div>
               {!isEditing ? (
                 <button 
                   onClick={handleEdit}
                   className="px-5 py-2.5 rounded-xl glass border-white/[0.08] text-sm font-semibold hover:bg-white/5 transition-all"
                 >
                   Edit Profile
                 </button>
               ) : (
                 <div className="flex gap-2">
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="px-5 py-2.5 rounded-xl border border-white/10 text-sm font-medium hover:bg-white/5"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => updateMutation.mutate(form)}
                      disabled={updateMutation.isPending}
                      className="px-5 py-2.5 rounded-xl bg-gradient-brand text-white text-sm font-bold shadow-glow-soft flex items-center gap-2"
                    >
                      {updateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      Save Changes
                    </button>
                 </div>
               )}
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* Personal Info */}
         <div className="card-surface rounded-2xl p-6 space-y-6 border-white/[0.05]">
            <h3 className="text-lg font-bold flex items-center gap-2">
               <User size={18} className="text-[var(--color-accent)]" /> Personal Information
            </h3>
            
            <div className="space-y-4">
               <div className="space-y-1.5">
                  <label className="label-eyebrow">Full Name</label>
                  <div className={cn(
                    "glass rounded-xl px-4 py-2.5 flex items-center gap-3 transition-all",
                    isEditing ? "border-[var(--color-accent)]/50" : "border-transparent"
                  )}>
                     <User size={16} className="text-[var(--color-text-muted)]" />
                     <input 
                        disabled={!isEditing}
                        className="bg-transparent text-sm w-full outline-none disabled:text-[var(--color-text-secondary)]"
                        value={isEditing ? form.fullName : profile?.fullName || ''}
                        onChange={e => setForm({...form, fullName: e.target.value})}
                     />
                  </div>
               </div>

               <div className="space-y-1.5">
                  <label className="label-eyebrow">Email Address</label>
                  <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-3 bg-white/[0.02]">
                     <Mail size={16} className="text-[var(--color-text-muted)]" />
                     <input 
                        disabled
                        className="bg-transparent text-sm w-full outline-none text-[var(--color-text-muted)]"
                        value={profile?.email || ''}
                     />
                  </div>
               </div>

               <div className="space-y-1.5">
                  <label className="label-eyebrow">Phone Number</label>
                  <div className={cn(
                    "glass rounded-xl px-4 py-2.5 flex items-center gap-3 transition-all",
                    isEditing ? "border-[var(--color-accent)]/50" : "border-transparent"
                  )}>
                     <Phone size={16} className="text-[var(--color-text-muted)]" />
                     <input 
                        disabled={!isEditing}
                        className="bg-transparent text-sm w-full outline-none disabled:text-[var(--color-text-secondary)]"
                        value={isEditing ? form.phoneNumber : profile?.phoneNumber || ''}
                        onChange={e => setForm({...form, phoneNumber: e.target.value})}
                     />
                  </div>
               </div>
            </div>
         </div>

         {/* Integration & Organization */}
         <div className="card-surface rounded-2xl p-6 space-y-6 border-white/[0.05]">
            <h3 className="text-lg font-bold flex items-center gap-2">
               <Building size={18} className="text-[var(--color-accent)]" /> Organization & Tools
            </h3>
            
            <div className="space-y-4">
               <div className="space-y-1.5">
                  <label className="label-eyebrow">Department</label>
                  <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-3 bg-white/[0.02]">
                     <Globe size={16} className="text-[var(--color-text-muted)]" />
                     <input 
                        disabled
                        className="bg-transparent text-sm w-full outline-none text-[var(--color-text-secondary)]"
                        value={profile?.department || 'Main Operations'}
                     />
                  </div>
               </div>

               <div className="space-y-1.5">
                  <label className="label-eyebrow">CRM Integration ID</label>
                  <div className={cn(
                    "glass rounded-xl px-4 py-2.5 flex items-center gap-3 transition-all",
                    isEditing ? "border-[var(--color-accent)]/50" : "border-transparent"
                  )}>
                     <Shield size={16} className="text-[var(--color-text-muted)]" />
                     <input 
                        disabled={!isEditing}
                        className="bg-transparent text-sm w-full outline-none disabled:text-[var(--color-text-secondary)]"
                        value={isEditing ? form.crmId : profile?.crmId || ''}
                        onChange={e => setForm({...form, crmId: e.target.value})}
                     />
                  </div>
               </div>

               <div className="space-y-1.5">
                  <label className="label-eyebrow">Telephony Extension</label>
                  <div className={cn(
                    "glass rounded-xl px-4 py-2.5 flex items-center gap-3 transition-all",
                    isEditing ? "border-[var(--color-accent)]/50" : "border-transparent"
                  )}>
                     <Phone size={16} className="text-[var(--color-text-muted)]" />
                     <input 
                        disabled={!isEditing}
                        className="bg-transparent text-sm w-full outline-none disabled:text-[var(--color-text-secondary)]"
                        value={isEditing ? form.telephonyId : profile?.telephonyId || ''}
                        onChange={e => setForm({...form, telephonyId: e.target.value})}
                     />
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
