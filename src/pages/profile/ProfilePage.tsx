import { useState, useRef, useEffect } from 'react';
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
  Loader2,
  X,
  Check
} from 'lucide-react';
import { cn } from '@shared/lib/utils';
import { useAuthStore } from '@entities/auth';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { setUser, user: authUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Sync form when profile data is loaded
  useEffect(() => {
    if (profile && !isEditing) {
      setForm({
        fullName: profile.fullName || '',
        phoneNumber: profile.phoneNumber || '',
        crmId: profile.crmId || '',
        telephonyId: profile.telephonyId || '',
      });
    }
  }, [profile, isEditing]);

  const updateMutation = useMutation({
    mutationFn: profileApi.updateProfile,
    onSuccess: (updatedProfile) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      // Update global auth store to keep sidebar/header in sync
      if (authUser) {
        setUser({
          ...authUser,
          fullName: updatedProfile.fullName || authUser.fullName,
          photoUrl: updatedProfile.photoUrl || authUser.photoUrl,
        });
      }
      toast.success('Profil muvaffaqiyatli yangilandi');
      setIsEditing(false);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.detail || 'Profilni yangilashda xatolik yuz berdi';
      toast.error(msg);
    },
  });

  const photoMutation = useMutation({
    mutationFn: profileApi.uploadPhoto,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      if (authUser) {
        setUser({ ...authUser, photoUrl: data.photoUrl });
      }
      toast.success('Rasm yangilandi');
    },
    onError: () => toast.error('Rasmni yuklashda xatolik'),
  });

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      photoMutation.mutate(file);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
        <div className="h-48 bg-white/5 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-64 bg-white/5 rounded-2xl" />
          <div className="h-64 bg-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-rise">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Profile Header */}
      <div className="card-surface rounded-2xl overflow-hidden border-white/[0.05] relative group/header">
        <div className="h-32 bg-gradient-brand opacity-80" />
        <div className="px-8 pb-8 relative">
          <div className="absolute -top-12 left-8">
            <div className="relative group">
              <div className="h-24 w-24 rounded-full bg-gradient-brand p-1 shadow-2xl transition-transform group-hover:scale-105">
                <div className="h-full w-full rounded-full bg-[var(--color-bg-secondary)] overflow-hidden flex items-center justify-center text-3xl font-bold">
                  {profile?.photoUrl ? (
                    <img src={profile.photoUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    profile?.fullName?.[0] || 'U'
                  )}
                </div>
              </div>
              <button 
                onClick={handlePhotoClick}
                disabled={photoMutation.isPending}
                className="absolute bottom-0 right-0 p-2 bg-[var(--color-accent)] text-white rounded-full shadow-glow-soft hover:scale-110 transition-transform active:scale-95"
              >
                {photoMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
              </button>
            </div>
          </div>
          
          <div className="pt-16 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{profile?.fullName}</h1>
              <p className="text-[var(--color-text-muted)] flex items-center gap-2 mt-1 text-sm uppercase tracking-widest font-semibold">
                <Shield size={14} className="text-[var(--color-accent)]" /> {profile?.role} · {profile?.region || 'Global HQ'}
              </p>
            </div>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-5 py-2.5 rounded-xl glass border-white/[0.08] text-sm font-semibold hover:bg-white/5 transition-all hover:border-white/20"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-sm font-medium hover:bg-white/5 transition-colors flex items-center gap-2"
                >
                  <X size={16} /> Bekor qilish
                </button>
                <button 
                  onClick={() => updateMutation.mutate(form)}
                  disabled={updateMutation.isPending}
                  className="px-5 py-2.5 rounded-xl bg-gradient-brand text-white text-sm font-bold shadow-glow-soft hover:shadow-glow flex items-center gap-2 transition-all active:scale-95"
                >
                  {updateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  Saqlash
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personal Info */}
        <div className="card-surface rounded-2xl p-6 space-y-6 border-white/[0.05] card-hover">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[var(--color-accent-muted)]">
              <User size={18} className="text-[var(--color-accent)]" />
            </div>
            Personal Information
          </h3>
          
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="label-eyebrow">Full Name</label>
              <div className={cn(
                "glass rounded-xl px-4 py-3 flex items-center gap-3 transition-all duration-300",
                isEditing ? "bg-white/[0.04] border-[var(--color-accent)]/30 ring-2 ring-[var(--color-accent)]/10" : "border-transparent"
              )}>
                <User size={18} className="text-[var(--color-text-muted)]" />
                <input 
                  disabled={!isEditing}
                  className="bg-transparent text-sm w-full outline-none disabled:text-[var(--color-text-secondary)] font-medium"
                  value={form.fullName}
                  onChange={e => setForm({...form, fullName: e.target.value})}
                  placeholder="Full name"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="label-eyebrow">Email Address</label>
              <div className="glass rounded-xl px-4 py-3 flex items-center gap-3 bg-white/[0.02] border-transparent cursor-not-allowed">
                <Mail size={18} className="text-[var(--color-text-muted)]" />
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
                "glass rounded-xl px-4 py-3 flex items-center gap-3 transition-all duration-300",
                isEditing ? "bg-white/[0.04] border-[var(--color-accent)]/30 ring-2 ring-[var(--color-accent)]/10" : "border-transparent"
              )}>
                <Phone size={18} className="text-[var(--color-text-muted)]" />
                <input 
                  disabled={!isEditing}
                  className="bg-transparent text-sm w-full outline-none disabled:text-[var(--color-text-secondary)] font-medium"
                  value={form.phoneNumber}
                  onChange={e => setForm({...form, phoneNumber: e.target.value})}
                  placeholder="+998 90 123 45 67"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Integration & Organization */}
        <div className="card-surface rounded-2xl p-6 space-y-6 border-white/[0.05] card-hover">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[var(--color-info-muted)]">
              <Building size={18} className="text-[var(--color-info)]" />
            </div>
            Organization & Tools
          </h3>
          
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="label-eyebrow">Department</label>
              <div className="glass rounded-xl px-4 py-3 flex items-center gap-3 bg-white/[0.02] border-transparent cursor-not-allowed">
                <Globe size={18} className="text-[var(--color-text-muted)]" />
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
                "glass rounded-xl px-4 py-3 flex items-center gap-3 transition-all duration-300",
                isEditing ? "bg-white/[0.04] border-[var(--color-info)]/30 ring-2 ring-[var(--color-info)]/10" : "border-transparent"
              )}>
                <Shield size={18} className="text-[var(--color-text-muted)]" />
                <input 
                  disabled={!isEditing}
                  className="bg-transparent text-sm w-full outline-none disabled:text-[var(--color-text-secondary)] font-medium font-mono"
                  value={form.crmId}
                  onChange={e => setForm({...form, crmId: e.target.value})}
                  placeholder="CRM-ID-12345"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="label-eyebrow">Telephony Extension</label>
              <div className={cn(
                "glass rounded-xl px-4 py-3 flex items-center gap-3 transition-all duration-300",
                isEditing ? "bg-white/[0.04] border-[var(--color-info)]/30 ring-2 ring-[var(--color-info)]/10" : "border-transparent"
              )}>
                <Phone size={18} className="text-[var(--color-text-muted)]" />
                <input 
                  disabled={!isEditing}
                  className="bg-transparent text-sm w-full outline-none disabled:text-[var(--color-text-secondary)] font-medium font-mono"
                  value={form.telephonyId}
                  onChange={e => setForm({...form, telephonyId: e.target.value})}
                  placeholder="EXT-405"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

