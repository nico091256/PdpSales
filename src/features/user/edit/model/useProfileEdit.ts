import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '@entities/user/api/profileApi';
import { useAuthStore } from '@entities/auth';
import { useI18n } from '@app/providers/I18nProvider';
import toast from 'react-hot-toast';
import { validateImageFile } from '@shared/lib/validation';

export function useProfileEdit() {
  const queryClient = useQueryClient();
  const { setUser, user: authUser } = useAuthStore();
  const { t } = useI18n();
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
      if (authUser) {
        setUser({
          ...authUser,
          fullName: updatedProfile.fullName || authUser.fullName,
          photoUrl: updatedProfile.photoUrl || authUser.photoUrl,
        });
      }
      toast.success(t('profile.saveChanges') + ' ✓');
      setIsEditing(false);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail ?? t('common.error.loadFailed');
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
      toast.success('✓');
    },
    onError: () => toast.error(t('common.error.loadFailed')),
  });

  const uploadPhoto = (file: File) => {
    const fileError = validateImageFile(file);
    if (fileError) {
      toast.error(fileError);
      return;
    }
    photoMutation.mutate(file);
  };

  return {
    profile,
    isLoading,
    isEditing,
    setIsEditing,
    form,
    setForm,
    updateProfile: () => updateMutation.mutate(form),
    isUpdating: updateMutation.isPending,
    uploadPhoto,
    isUploading: photoMutation.isPending,
  };
}
