import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { RSVPRecord, GuestbookMessage, InvitationData, INVITATION_DATA } from '../types';

interface WeddingDataContextType {
  invitationData: InvitationData;
  updateInvitationData: (newData: Partial<InvitationData>) => void;
  resetInvitationData: () => void;
  rsvps: RSVPRecord[];
  guestbookMessages: GuestbookMessage[];
  saveRSVP: (record: RSVPRecord) => boolean;
  saveGuestbookMessage: (message: GuestbookMessage) => boolean;
  deleteRSVP: (id: string) => void;
  deleteGuestbookMessage: (id: string) => void;
  setGuestbookMessages: React.Dispatch<React.SetStateAction<GuestbookMessage[]>>;
  exportRSVPsCSV: () => void;
}

const WeddingDataContext = createContext<WeddingDataContextType | undefined>(undefined);

const INVITATION_DATA_STORAGE_KEY = 'wedding_invitation_live_event_data_v1';
const RSVP_STORAGE_KEY = 'wedding_invitation_rsvps';
const GUESTBOOK_STORAGE_KEY = 'wedding_guestbook_messages';

const INITIAL_GUESTBOOK_MESSAGES: GuestbookMessage[] = [
  {
    id: 'seed-1',
    author: 'عائلة العريس',
    relation: 'الأهل الكرام',
    content: 'بارك الله لكما وبارك عليكما وجمع بينكما في خير وسعادة دائمة، ألف مبروك يا قرة أعيننا.',
    createdAt: 'منذ يومين',
    likes: 12,
  },
  {
    id: 'seed-2',
    author: 'أميرة ومحمود',
    relation: 'أصدقاء العروسين',
    content: 'ألف ترليون مبروك لأجمل عروسين محمد ودنيا! عقبال مئة عام من المودة والرحمة والهناء.',
    createdAt: 'منذ يوم',
    likes: 9,
  },
  {
    id: 'seed-3',
    author: 'المهندس كريم الشامي',
    relation: 'صديق مقرب',
    content: 'فرحتنا بيكم اليوم لا توصف، نراكم على خير في ليلة العمر ونحتفل معكم بإذن الله تعالى.',
    createdAt: 'اليوم',
    likes: 7,
  },
];

export const WeddingDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [invitationData, setInvitationData] = useState<InvitationData>(INVITATION_DATA);
  const [rsvps, setRsvps] = useState<RSVPRecord[]>([]);
  const [guestbookMessages, setGuestbookMessages] = useState<GuestbookMessage[]>([]);

  // Load initial saved data from localStorage
  useEffect(() => {
    try {
      // 1. Load Live Event Data
      const storedEventData = localStorage.getItem(INVITATION_DATA_STORAGE_KEY);
      if (storedEventData) {
        const parsed = JSON.parse(storedEventData);
        setInvitationData((prev) => ({
          ...prev,
          ...parsed,
          // Ensure timeline events fallback properly if empty
          timelineEvents: parsed.timelineEvents && parsed.timelineEvents.length > 0
            ? parsed.timelineEvents
            : INVITATION_DATA.timelineEvents,
        }));
      }

      // 2. Load RSVPs
      const storedRsvps = localStorage.getItem(RSVP_STORAGE_KEY);
      if (storedRsvps) {
        setRsvps(JSON.parse(storedRsvps));
      }

      // 3. Load Guestbook
      const storedMsgs = localStorage.getItem(GUESTBOOK_STORAGE_KEY);
      if (storedMsgs) {
        setGuestbookMessages(JSON.parse(storedMsgs));
      } else {
        setGuestbookMessages(INITIAL_GUESTBOOK_MESSAGES);
      }
    } catch (e) {
      console.warn('Error loading wedding data from localStorage', e);
    }
  }, []);

  // Update Live Event Data in State and LocalStorage
  const updateInvitationData = useCallback((newData: Partial<InvitationData>) => {
    setInvitationData((prev) => {
      const updated = { ...prev, ...newData };
      try {
        localStorage.setItem(INVITATION_DATA_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to persist live invitation data', err);
      }
      return updated;
    });
  }, []);

  // Reset to Defaults
  const resetInvitationData = useCallback(() => {
    setInvitationData(INVITATION_DATA);
    try {
      localStorage.removeItem(INVITATION_DATA_STORAGE_KEY);
    } catch (err) {
      console.warn('Failed to clear stored event data', err);
    }
  }, []);

  // Save an RSVP
  const saveRSVP = useCallback((record: RSVPRecord): boolean => {
    setRsvps((prev) => {
      const updated = [record, ...prev.filter((r) => r.id !== record.id && r.guestName !== record.guestName)];
      try {
        localStorage.setItem(RSVP_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn(err);
      }
      return updated;
    });
    return true;
  }, []);

  // Save a Guestbook message
  const saveGuestbookMessage = useCallback((msg: GuestbookMessage): boolean => {
    setGuestbookMessages((prev) => {
      const updated = [msg, ...prev.filter((m) => m.id !== msg.id)];
      try {
        localStorage.setItem(GUESTBOOK_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn(err);
      }
      return updated;
    });
    return true;
  }, []);

  // Delete an RSVP
  const deleteRSVP = useCallback((id: string) => {
    setRsvps((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      try {
        localStorage.setItem(RSVP_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });
  }, []);

  // Delete a Guestbook Message
  const deleteGuestbookMessage = useCallback((id: string) => {
    setGuestbookMessages((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      try {
        localStorage.setItem(GUESTBOOK_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });
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
        updateInvitationData,
        resetInvitationData,
        rsvps,
        guestbookMessages,
        saveRSVP,
        saveGuestbookMessage,
        deleteRSVP,
        deleteGuestbookMessage,
        setGuestbookMessages,
        exportRSVPsCSV,
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
