import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { RSVPRecord, GuestbookMessage, InvitationData, INVITATION_DATA } from '../types';

interface WeddingDataContextType {
  invitationData: InvitationData;
  isLoadingInvitation: boolean;
  updateInvitationData: (newData: Partial<InvitationData>) => Promise<boolean>;
  resetInvitationData: () => Promise<boolean>;
  rsvps: RSVPRecord[];
  isLoadingRSVPs: boolean;
  guestbookMessages: GuestbookMessage[];
  isLoadingGuestbook: boolean;
  saveRSVP: (record: RSVPRecord) => Promise<boolean>;
  saveGuestbookMessage: (message: GuestbookMessage) => Promise<boolean>;
  likeGuestbookMessage: (id: string) => Promise<boolean>;
  deleteRSVP: (id: string) => Promise<boolean>;
  deleteGuestbookMessage: (id: string) => Promise<boolean>;
  setGuestbookMessages: React.Dispatch<React.SetStateAction<GuestbookMessage[]>>;
  exportRSVPsCSV: () => void;
  // Admin Session State
  isAdminAuthenticated: boolean;
  checkAdminSession: () => Promise<boolean>;
  adminLogin: (password: string) => Promise<{ success: boolean; error?: string }>;
  adminLogout: () => Promise<void>;
  fetchRSVPs: () => Promise<void>;
  fetchGuestbook: () => Promise<void>;
}

const WeddingDataContext = createContext<WeddingDataContextType | undefined>(undefined);

export const WeddingDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [invitationData, setInvitationData] = useState<InvitationData>(INVITATION_DATA);
  const [isLoadingInvitation, setIsLoadingInvitation] = useState<boolean>(true);
  const [rsvps, setRsvps] = useState<RSVPRecord[]>([]);
  const [isLoadingRSVPs, setIsLoadingRSVPs] = useState<boolean>(false);
  const [guestbookMessages, setGuestbookMessages] = useState<GuestbookMessage[]>([]);
  const [isLoadingGuestbook, setIsLoadingGuestbook] = useState<boolean>(true);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);

  // 1. Fetch live invitation data from /api/invitation
  const fetchInvitation = useCallback(async () => {
    try {
      setIsLoadingInvitation(true);
      const res = await fetch('/api/invitation');
      if (res.ok) {
        const json = (await res.json()) as any;
        if (json.success && json.data) {
          setInvitationData((prev) => ({
            ...prev,
            ...json.data,
            timelineEvents:
              json.data.timelineEvents && json.data.timelineEvents.length > 0
                ? json.data.timelineEvents
                : INVITATION_DATA.timelineEvents,
          }));
        }
      }
    } catch (e) {
      console.warn('Could not fetch remote invitation data, using defaults.', e);
    } finally {
      setIsLoadingInvitation(false);
    }
  }, []);

  // 2. Fetch live guestbook messages from /api/guestbook
  const fetchGuestbook = useCallback(async () => {
    try {
      setIsLoadingGuestbook(true);
      const res = await fetch('/api/guestbook');
      if (res.ok) {
        const json = (await res.json()) as any;
        if (json.success && Array.isArray(json.messages)) {
          setGuestbookMessages(json.messages);
        }
      }
    } catch (e) {
      console.warn('Could not fetch remote guestbook messages.', e);
    } finally {
      setIsLoadingGuestbook(false);
    }
  }, []);

  // 3. Fetch RSVPs (Admin only)
  const fetchRSVPs = useCallback(async () => {
    try {
      setIsLoadingRSVPs(true);
      const res = await fetch('/api/rsvps');
      if (res.ok) {
        const json = (await res.json()) as any;
        if (json.success && Array.isArray(json.rsvps)) {
          setRsvps(json.rsvps);
        }
      }
    } catch (e) {
      console.warn('Could not fetch remote RSVPs.', e);
    } finally {
      setIsLoadingRSVPs(false);
    }
  }, []);

  // 4. Check admin session status
  const checkAdminSession = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/session');
      if (res.ok) {
        const json = (await res.json()) as any;
        const authed = Boolean(json.authenticated);
        setIsAdminAuthenticated(authed);
        if (authed) {
          fetchRSVPs();
        }
        return authed;
      }
      setIsAdminAuthenticated(false);
      return false;
    } catch {
      setIsAdminAuthenticated(false);
      return false;
    }
  }, [fetchRSVPs]);

  // Initial data loading
  useEffect(() => {
    fetchInvitation();
    fetchGuestbook();
    checkAdminSession();
  }, [fetchInvitation, fetchGuestbook, checkAdminSession]);

  // Admin Login
  const adminLogin = useCallback(async (password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const json = (await res.json()) as any;
      if (res.ok && json.success) {
        setIsAdminAuthenticated(true);
        fetchRSVPs();
        return { success: true };
      }
      return { success: false, error: json.error || 'فشل تسجيل الدخول' };
    } catch (e: any) {
      return { success: false, error: 'تعذر الاتصال بالخادم. يرجى التحقق من الشبكة.' };
    }
  }, [fetchRSVPs]);

  // Admin Logout
  const adminLogout = useCallback(async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      setIsAdminAuthenticated(false);
      setRsvps([]);
    }
  }, []);

  // Update Live Event Data
  const updateInvitationData = useCallback(async (newData: Partial<InvitationData>): Promise<boolean> => {
    const updated = { ...invitationData, ...newData };
    try {
      const res = await fetch('/api/invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        setInvitationData(updated);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to save live invitation data to D1', err);
      return false;
    }
  }, [invitationData]);

  // Reset to Defaults
  const resetInvitationData = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/invitation/reset', { method: 'POST' });
      if (res.ok) {
        setInvitationData(INVITATION_DATA);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to reset stored event data', err);
      return false;
    }
  }, []);

  // Save an RSVP
  const saveRSVP = useCallback(async (record: RSVPRecord): Promise<boolean> => {
    try {
      const res = await fetch('/api/rsvps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        console.error('RSVP submission error:', errJson);
        return false;
      }
      const json = (await res.json()) as any;
      if (json.success && json.record) {
        setRsvps((prev) => [
          json.record,
          ...prev.filter((r) => r.id !== json.record.id && r.guestName !== json.record.guestName),
        ]);
        return true;
      }
      return false;
    } catch (err) {
      console.error('RSVP network error:', err);
      return false;
    }
  }, []);

  // Save a Guestbook message
  const saveGuestbookMessage = useCallback(async (msg: GuestbookMessage): Promise<boolean> => {
    try {
      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        console.error('Guestbook submission error:', errJson);
        return false;
      }
      const json = (await res.json()) as any;
      if (json.success && json.message) {
        setGuestbookMessages((prev) => [
          json.message,
          ...prev.filter((m) => m.id !== json.message.id),
        ]);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Guestbook network error:', err);
      return false;
    }
  }, []);

  // Like a Guestbook message
  const likeGuestbookMessage = useCallback(async (id: string): Promise<boolean> => {
    try {
      setGuestbookMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, likes: m.likes + 1 } : m))
      );
      const res = await fetch(`/api/guestbook/${encodeURIComponent(id)}/like`, {
        method: 'POST',
      });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  // Delete an RSVP (Admin)
  const deleteRSVP = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/rsvps/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setRsvps((prev) => prev.filter((r) => r.id !== id));
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to delete RSVP', e);
      return false;
    }
  }, []);

  // Delete a Guestbook Message (Admin)
  const deleteGuestbookMessage = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/guestbook/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setGuestbookMessages((prev) => prev.filter((m) => m.id !== id));
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to delete guestbook message', e);
      return false;
    }
  }, []);

  // Export all RSVPs to CSV (Excel-ready with Arabic UTF-8 BOM)
  const exportRSVPsCSV = useCallback(() => {
    if (rsvps.length === 0) return;
    const header = ['اسم الضيف', 'حالة الحضور', 'عدد المرافقين', 'الملاحظات / التهاني', 'تاريخ التسجيل'];
    const rows = rsvps.map((r) => [
      `"${r.guestName.replace(/"/g, '""')}"`,
      r.status === 'attending' ? 'مؤكد الحضور' : 'معتذر',
      r.status === 'attending' ? r.companionCount || 1 : 0,
      `"${(r.note || '').replace(/"/g, '""')}"`,
      `"${r.submittedAt}"`,
    ]);

    const csvContent = '\uFEFF' + [header.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `حضور_زفاف_${invitationData.groom}_و_${invitationData.bride}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [rsvps, invitationData.groom, invitationData.bride]);

  return (
    <WeddingDataContext.Provider
      value={{
        invitationData,
        isLoadingInvitation,
        updateInvitationData,
        resetInvitationData,
        rsvps,
        isLoadingRSVPs,
        guestbookMessages,
        isLoadingGuestbook,
        saveRSVP,
        saveGuestbookMessage,
        likeGuestbookMessage,
        deleteRSVP,
        deleteGuestbookMessage,
        setGuestbookMessages,
        exportRSVPsCSV,
        isAdminAuthenticated,
        checkAdminSession,
        adminLogin,
        adminLogout,
        fetchRSVPs,
        fetchGuestbook,
      }}
    >
      {children}
    </WeddingDataContext.Provider>
  );
};

export const useWeddingData = (): WeddingDataContextType => {
  const context = useContext(WeddingDataContext);
  if (!context) {
    throw new Error('useWeddingData must be used within a WeddingDataProvider');
  }
  return context;
};
