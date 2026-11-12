'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { PhoneOff, ChevronLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import AiOrb from '@/components/AiOrb';
import Vapi from '@vapi-ai/web';

const VAPI_PUBLIC_KEY = 'c4d2d332-b9ae-489d-9b64-ab26902f2af1'; 
const VAPI_ASSISTANT_ID = '5de15b62-d5c5-47ae-8712-e1bfe23c44e6';

type TranscriptMsg = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

type VapiMessage = {
  type: string;
  transcriptType?: string;
  role?: 'user' | 'assistant';
  transcript?: string;
};

function errorText(e: unknown): string {
  const o = e as { message?: string; error?: { message?: string } } | null;
  return o?.message || o?.error?.message || (typeof e === 'object' ? JSON.stringify(e) : String(e));
}

export default function VoiceCall() {
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'active' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [transcripts, setTranscripts] = useState<TranscriptMsg[]>([]);
  
  const vapiRef = useRef<Vapi | null>(null);
  const scrollRefLeft = useRef<HTMLDivElement>(null);
  const scrollRefRight = useRef<HTMLDivElement>(null);

  // Initialize Vapi
  useEffect(() => {
    if (typeof window !== 'undefined' && !vapiRef.current) {
      const vapi = new Vapi(VAPI_PUBLIC_KEY);
      vapiRef.current = vapi;

      vapi.on('call-start', () => setCallStatus('active'));
      vapi.on('call-end', () => setCallStatus('idle'));
      
      vapi.on('volume-level', (level: number) => {
        // level is 0 to 1
        setVolumeLevel(level);
      });

      vapi.on('message', (message: VapiMessage) => {
        if (message.type === 'transcript' && message.transcriptType === 'final' && message.role && message.transcript) {
          setTranscripts(prev => [...prev, {
            id: `${Date.now()}-${prev.length}`,
            role: message.role as 'user' | 'assistant',
            text: message.transcript as string,
          }]);
        }
      });

      vapi.on('error', (e: unknown) => {
        console.error(e);
        setErrorMessage(`Error: ${errorText(e)}`);
        setCallStatus('error');
      });
    }

    return () => {
      vapiRef.current?.stop();
    };
  }, []);



  const endCall = () => {
    vapiRef.current?.stop();
    setCallStatus('idle');
  };

  // Auto-scroll transcripts
  useEffect(() => {
    scrollRefLeft.current?.scrollIntoView({ behavior: 'smooth' });
    scrollRefRight.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  const userMsgs = transcripts.filter(t => t.role === 'user');
  const aiMsgs = transcripts.filter(t => t.role === 'assistant');

  return (
    <main className="theme-dark relative h-screen bg-bg text-ink flex overflow-hidden">
      
      {/* Background ambient grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_100%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      {/* Back Button / End Call */}
      <Link href="/ai-link" onClick={endCall} className="absolute top-8 left-8 flex items-center gap-2 text-mute hover:text-red-400 transition-colors z-50">
        <ChevronLeft className="w-4 h-4" />
        <span className="font-mono text-xs uppercase tracking-widest">Abort Voice Protocol</span>
      </Link>

      {/* Status Bar Top Right */}
      <div className="absolute top-8 right-8 flex items-center gap-4 z-50">
        <div className="font-mono text-xs text-mute tracking-widest uppercase">
          Neural Link: {callStatus === 'active' ? <span className="text-teal">STABLE</span> : <span className="text-amber-500">PENDING</span>}
        </div>
        {callStatus === 'active' && (
          <button onClick={endCall} className="bg-red-500/10 border border-red-500/30 text-red-400 p-2 rounded-full hover:bg-red-500/20 transition-colors">
            <PhoneOff className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Layout Grid */}
      <div className="w-full h-full flex flex-col lg:grid lg:grid-cols-3 relative z-10 pt-20 lg:pt-0">
        
        {/* Center Column: The Orb (Moved to top on mobile via order) */}
        <div className="order-1 lg:order-2 flex-none lg:flex-1 flex flex-col items-center justify-center relative mt-4 lg:mt-0 z-20">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
            className="mt-4 lg:mt-12 relative cursor-pointer"
            onClick={callStatus === 'idle' || callStatus === 'error' ? () => {
              setCallStatus('connecting');
              setErrorMessage('');
              vapiRef.current?.start(VAPI_ASSISTANT_ID).catch((e: unknown) => {
                console.error(e);
                setErrorMessage(`Error: ${errorText(e)}`);
                setCallStatus('error');
              });
            } : undefined}
          >
            {callStatus === 'connecting' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-cyan font-mono text-sm tracking-widest uppercase">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            )}
            
            <div className={`transform scale-75 lg:scale-100 ${callStatus !== 'active' ? 'opacity-50' : ''}`}>
              <AiOrb 
                scale={1.5} 
                audioLevel={volumeLevel} 
                text={
                  callStatus === 'active' ? "GIAN AI\nLIVE" : 
                  callStatus === 'error' ? "ERROR\nRETRY" :
                  callStatus === 'connecting' ? "" :
                  "INITIATE\nLINK"
                } 
              />
            </div>
          </motion.div>

          <div className="mt-4 lg:mt-16 text-center">
            <div className="font-mono text-[10px] lg:text-xs uppercase tracking-[0.3em] text-cyan/70">
              Voice Protocol
            </div>
            <div className="text-mute text-xs mt-2 max-w-[200px] mx-auto font-sans">
              {callStatus === 'error' ? (
                <span className="text-red-400">{errorMessage}</span>
              ) : callStatus === 'idle' ? (
                "Click the orb to establish a neural link."
              ) : (
                "Speak naturally. The system is listening and processing."
              )}
            </div>
          </div>
        </div>

        {/* Subtitles Container for Mobile (Splits the remaining space) */}
        <div className="order-2 lg:contents flex flex-col flex-1 overflow-hidden lg:overflow-visible">
          
          {/* Left Column: User Subtitles */}
          <div className="lg:order-1 flex-1 flex flex-col justify-end p-6 lg:p-8 pb-2 lg:pb-32 opacity-70">
            <div className="font-mono text-[10px] lg:text-xs text-mute mb-2 lg:mb-4 border-b border-line/30 pb-1 lg:pb-2 uppercase tracking-widest">User Audio Stream</div>
            <div className="space-y-2 lg:space-y-4 max-h-[25vh] lg:max-h-[60vh] overflow-y-auto no-scrollbar">
              {userMsgs.map(msg => (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} key={msg.id} className="text-teal font-mono text-xs lg:text-sm leading-relaxed">
                  &gt; {msg.text}
                </motion.div>
              ))}
              <div ref={scrollRefLeft} />
            </div>
          </div>

          {/* Right Column: AI Subtitles */}
          <div className="lg:order-3 flex-1 flex flex-col justify-start lg:justify-end p-6 lg:p-8 pt-2 lg:pt-8 pb-6 lg:pb-32 opacity-70">
            <div className="font-mono text-[10px] lg:text-xs text-mute mb-2 lg:mb-4 border-b border-line/30 pb-1 lg:pb-2 uppercase tracking-widest text-right">System Output Stream</div>
            <div className="space-y-2 lg:space-y-4 max-h-[25vh] lg:max-h-[60vh] overflow-y-auto no-scrollbar flex flex-col items-end text-right">
              {aiMsgs.map(msg => (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} key={msg.id} className="text-cyan font-mono text-xs lg:text-sm leading-relaxed">
                  {msg.text} &lt;
                </motion.div>
              ))}
              <div ref={scrollRefRight} />
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}
