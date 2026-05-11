import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invitationsApi } from '@entities/invitation/api/invitationsApi';
import toast from 'react-hot-toast';
import type { UserRole } from '@shared/api/types';

export function useInvitationSend() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [form, setForm] = useState<{ email: string; role: UserRole }>({ email: '', role: 'SalesManager' });

  const { data: allowedRolesData } = useQuery({
    queryKey: ['invitations', 'allowed-roles'],
    queryFn: invitationsApi.getAllowedRoles,
    staleTime: 5 * 60 * 1000,
  });

  const allowedRoles = (allowedRolesData?.allowedRoles ?? ['SalesManager', 'ROP']) as UserRole[];

  const sendMutation = useMutation({
    mutationFn: invitationsApi.send,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      try {
        const backendUrl = new URL(data.inviteLink);
        const token = backendUrl.searchParams.get('token');
        const frontendLink = token
          ? `${window.location.origin}/accept-invite?token=${token}`
          : data.inviteLink;
        setGeneratedLink(frontendLink);
      } catch {
        setGeneratedLink(data.inviteLink);
      }
      toast.success('Taklifnoma yaratildi');
    },
    onError: () => toast.error('Taklifnoma yuborishda xatolik yuz berdi'),
  });

  const open = () => {
    setForm({ email: '', role: (allowedRoles[0] ?? 'SalesManager') as UserRole });
    setGeneratedLink(null);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setGeneratedLink(null);
    setForm({ email: '', role: 'SalesManager' });
  };

  const send = () => {
    if (!form.email || !form.role) return;
    sendMutation.mutate(form);
  };

  return {
    isOpen,
    open,
    close,
    form,
    setForm,
    allowedRoles,
    generatedLink,
    send,
    isSending: sendMutation.isPending,
  };
}
