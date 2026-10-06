import React, { useEffect, useRef, useState } from 'react';
import { Mic, Square, RotateCcw, Send, Loader2 } from 'lucide-react';

interface Props { initialGuestName?: string; }
const MAX_SECONDS = 60;

export const VoiceMessageCard: React.FC<Props> = ({ initialGuestName = '' }) => {
  const [guestName, setGuestName] = useState(initialGuestName);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [audio, setAudio] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const chunks = useRef<Blob[]>([]);
  const startedAt = useRef(0);

  const cleanupStream = () => { stream.current?.getTracks().forEach(track => track.stop()); stream.current = null; };
  useEffect(() => () => { cleanupStream(); if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const stop = () => recorder.current?.state === 'recording' && recorder.current.stop();
  const start = async () => {
    if (!guestName.trim()) return setStatus('يرجى كتابة الاسم أولاً.');
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) return setStatus('التسجيل الصوتي غير مدعوم في هذا المتصفح.');
    try {
      setStatus(null); chunks.current = [];
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      const next = new MediaRecorder(stream.current, MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? { mimeType: 'audio/webm;codecs=opus' } : undefined);
      recorder.current = next; startedAt.current = Date.now(); setSeconds(0); setRecording(true);
      next.ondataavailable = e => { if (e.data.size) chunks.current.push(e.data); };
      next.onstop = () => { const blob = new Blob(chunks.current, { type: 'audio/webm' }); setAudio(blob); setPreviewUrl(URL.createObjectURL(blob)); setRecording(false); cleanupStream(); };
      next.start();
    } catch { setStatus('تعذر الوصول إلى الميكروفون. يرجى السماح بالإذن ثم المحاولة.'); cleanupStream(); }
  };
  useEffect(() => { if (!recording) return; const timer = window.setInterval(() => { const next = Math.min(MAX_SECONDS, Math.floor((Date.now() - startedAt.current) / 1000)); setSeconds(next); if (next >= MAX_SECONDS) stop(); }, 250); return () => clearInterval(timer); }, [recording]);
  const reset = () => { if (previewUrl) URL.revokeObjectURL(previewUrl); setPreviewUrl(null); setAudio(null); setSeconds(0); setStatus(null); };
  const send = async () => { if (!audio || !guestName.trim()) return; setUploading(true); setStatus(null); const form = new FormData(); form.set('guestName', guestName.trim()); form.set('durationSeconds', String(seconds)); form.set('audio', new File([audio], 'message.webm', { type: 'audio/webm' })); try { const response = await fetch('/api/voice-messages', { method: 'POST', body: form }); if (!response.ok) throw new Error(); reset(); setStatus('تم إرسال رسالتك الصوتية بنجاح ✨'); } catch { setStatus('تعذر إرسال التسجيل. يمكنك المحاولة مرة أخرى.'); } finally { setUploading(false); } };

  return <section id="voice-message-section" className="w-full max-w-2xl mx-auto my-6 sm:my-8 select-none" dir="rtl">
    <div className="relative bg-[#FCFAF7] rounded-3xl p-4 xs:p-6 sm:p-8 md:p-9 border-2 border-[#DFCBA0] shadow-[0_16px_48px_rgba(45,11,20,0.08)] overflow-hidden space-y-5">
    <div className="text-center"><div className="flex items-center justify-center gap-3 mb-2"><span className="h-px w-10 sm:w-14 bg-[#C4AA7E]" /><Mic className="w-4 h-4 sm:w-5 sm:h-5 text-[#832E41]" /><span className="h-px w-10 sm:w-14 bg-[#C4AA7E]" /></div><h3 className="font-sans-ar text-xl xs:text-2xl sm:text-3xl font-bold text-[#2B1117]">اترك رسالة صوتية للعروسين</h3><p className="font-sans-ar text-xs sm:text-sm text-[#7E3243] mt-1.5">رسالتك تصلنا بسرية تامة — حتى 60 ثانية</p></div>
    <input value={guestName} onChange={e => setGuestName(e.target.value)} maxLength={100} placeholder="اسمك الكريم" className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DDD5C5] text-[#2B1117] placeholder:text-[#B59199] focus:outline-none focus:ring-2 focus:ring-[#832E41]/40 font-sans-ar text-sm" disabled={recording || uploading} />
    {recording ? <button onClick={stop} className="w-full py-3.5 rounded-2xl bg-[#832E41] hover:bg-[#6E2233] text-[#FAF8F5] font-sans-ar text-sm font-bold shadow-md flex justify-center gap-2"><Square className="w-4 h-4" />إيقاف التسجيل ({seconds}/{MAX_SECONDS})</button> : !audio ? <button onClick={start} className="w-full py-3.5 rounded-2xl bg-[#832E41] hover:bg-[#6E2233] text-[#FAF8F5] font-sans-ar text-sm font-bold shadow-md flex justify-center gap-2"><Mic className="w-4 h-4" />ابدأ التسجيل</button> : <div className="space-y-3"><audio controls src={previewUrl || undefined} className="w-full" /><div className="grid grid-cols-2 gap-2"><button onClick={reset} className="py-2.5 rounded-xl bg-white border border-[#E8D0D6] text-[#832E41] font-sans-ar font-bold flex justify-center gap-1"><RotateCcw className="w-4 h-4" />إعادة التسجيل</button><button onClick={send} disabled={uploading} className="py-2.5 rounded-xl bg-[#832E41] text-white font-sans-ar font-bold flex justify-center gap-1">{uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}إرسال الرسالة</button></div></div>}
    {status && <p className="text-center text-xs text-[#832E41]">{status}</p>}
    </div>
  </section>;
};
