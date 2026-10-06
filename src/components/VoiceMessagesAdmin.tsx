import React, { useEffect, useState } from 'react';
import { Mic, Trash2 } from 'lucide-react';
import { VoiceMessageRecord } from '../types';

export const VoiceMessagesAdmin: React.FC = () => {
  const [messages, setMessages] = useState<VoiceMessageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const load = async () => { setLoading(true); try { const r = await fetch('/api/voice-messages'); const j = await r.json() as { messages?: VoiceMessageRecord[] }; if (r.ok) setMessages(j.messages || []); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  const remove = async (id: string) => { if (!window.confirm('حذف هذه الرسالة الصوتية؟')) return; const r = await fetch(`/api/voice-messages/${id}`, { method: 'DELETE' }); if (r.ok) setMessages(prev => prev.filter(m => m.id !== id)); };
  return <section className="p-5 sm:p-7 rounded-3xl bg-[#FCFAF7] border border-[#DEC496] space-y-4" dir="rtl"><div className="flex items-center gap-2"><Mic className="w-5 h-5 text-[#832E41]" /><div><h2 className="font-bold text-lg text-[#2B1117]">الرسائل الصوتية</h2><p className="text-xs text-[#7E3243]">رسائل الضيوف الخاصة للعروسين</p></div></div>{loading ? <p className="text-sm text-[#7E3243]">جارٍ التحميل…</p> : messages.length === 0 ? <p className="text-sm text-[#7E3243]">لا توجد رسائل صوتية حتى الآن.</p> : <div className="space-y-3">{messages.map(m => <div key={m.id} className="p-4 rounded-2xl bg-white border border-[#E5DECF]"><div className="flex justify-between gap-2 mb-2"><div><b className="text-sm text-[#2B1117]">{m.guestName}</b><p className="text-[11px] text-[#8C4A5A]">{new Date(m.createdAt).toLocaleString('ar-EG')} · {m.durationSeconds} ثانية</p></div><button onClick={() => remove(m.id)} className="text-[#832E41]" title="حذف الرسالة"><Trash2 className="w-4 h-4" /></button></div><audio controls preload="none" src={`/api/voice-messages/${m.id}/audio`} className="w-full" /></div>)}</div>}</section>;
};
