'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, PhoneOff, MessageSquare, Send, Loader2, Volume2, Sparkles, PhoneCall } from 'lucide-react';
import Vapi from '@vapi-ai/web';

// Replace these with your actual Vapi credentials
const VAPI_PUBLIC_KEY = 'c4d2d332-b8ac-489d-9b64-eb28982f3ef1'; 
const VAPI_ASSISTANT_ID = '5de15b62-d5c5-47ae-8712-e1bfe23c44e6';

export default function AiDemo() {
  const [activeTab, setActiveTab] = useState<'voice' | 'chat'>('voice');
  
  // Voice State
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'active'>('idle');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const vapiRef = useRef<any>(null);

  // Chat State
  const [messages, setMessages] = useState<{role: 'user'|'ai', content: string}[]>([
    { role: 'ai', content: "Hi! I'm Gian's AI clone. How can I help you automate your business today?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize Vapi (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined' && !vapiRef.current) {
      const vapi = new Vapi(VAPI_PUBLIC_KEY);
      vapiRef.current = vapi;

      vapi.on('call-start', () => setCallStatus('active'));
      vapi.on('call-end', () => setCallStatus('idle'));
      vapi.on('speech-start', () => setIsSpeaking(true));
      vapi.on('speech-end', () => setIsSpeaking(false));
      vapi.on('error', (e) => {
        console.error(e);
        setCallStatus('idle');
      });
    }
  }, []);

  const toggleCall = async () => {
    if (callStatus === 'active' || callStatus === 'connecting') {
      vapiRef.current?.stop();
      setCallStatus('idle');
    } else {
      setCallStatus('connecting');
      try {
        await vapiRef.current?.start(VAPI_ASSISTANT_ID);
      } catch (e) {
        console.error(e);
        setCallStatus('idle');
      }
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const newMsg = inputValue.trim();
    setMessages(prev => [...prev, { role: 'user', content: newMsg }]);
    setInputValue('');
    setIsTyping(true);

    // TODO: Wire this up to your actual chat API (e.g., OpenAI/Gemini route)
    // For now, mock a response based on Gian's resume
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: "That sounds like a great use case. For a similar project at Intention Technology, Gian built an n8n and Power Automate pipeline that connected their CRM (GoHighLevel) with an AI voice receptionist and an Airtable approval dashboard. We could architect something similar for you. Let's schedule a deep-dive call!" 
      }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <section className="relative w-full py-24 bg-bg border-t border-line/30 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal/10 via-cyan/5 to-transparent blur-3xl rounded-[100%] pointer-events-none" />
      
      <div className="max-w-5xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row gap-16 items-center">
        
        {/* Left Content */}
        <div className="flex-1 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-teal/10 border border-teal/20 rounded-full px-4 py-1.5 mb-6"
          >
            <Sparkles className="w-4 h-4 text-teal" />
            <span className="font-mono text-xs text-teal uppercase tracking-widest">Live Demo</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-head font-extrabold text-4xl md:text-5xl lg:text-6xl text-ink tracking-tighter mb-6"
          >
            Talk to my <br className="hidden lg:block"/> AI Clone.
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-mute text-lg max-w-xl mx-auto lg:mx-0 mb-8"
          >
            Don't just take my word for it. Experience the technology I deploy for my clients firsthand. Ask my AI clone about my systems, my approach, or how we can automate your business.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center lg:justify-start gap-4"
          >
            <button
              onClick={() => setActiveTab('voice')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${activeTab === 'voice' ? 'bg-ink text-bg shadow-[0_0_20px_rgba(242,245,251,0.2)]' : 'bg-transparent border border-line text-mute hover:text-ink'}`}
            >
              <Mic className="w-4 h-4" />
              Voice Agent
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${activeTab === 'chat' ? 'bg-ink text-bg shadow-[0_0_20px_rgba(242,245,251,0.2)]' : 'bg-transparent border border-line text-mute hover:text-ink'}`}
            >
              <MessageSquare className="w-4 h-4" />
              Text Chat
            </button>
          </motion.div>
        </div>

        {/* Right Interactive Panel */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex-1 w-full max-w-md lg:max-w-none"
        >
          <div className="relative w-full h-[500px] bg-card/80 backdrop-blur-2xl border border-line/50 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            
            {/* Window Header */}
            <div className="w-full h-12 border-b border-line/30 flex items-center px-4 bg-white/5">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 font-mono text-xs text-faint uppercase tracking-widest">
                Gian_AI_v2.0
              </div>
            </div>

            <div className="flex-1 relative overflow-hidden">
              <AnimatePresence mode="wait">
                
                {/* Voice Interface */}
                {activeTab === 'voice' && (
                  <motion.div
                    key="voice"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute inset-0 flex flex-col items-center justify-center p-8"
                  >
                    <div className="relative mb-12">
                      {/* Pulse rings for active call */}
                      {callStatus === 'active' && (
                        <>
                          <motion.div 
                            animate={{ scale: [1, 1.5, 2], opacity: [0.5, 0.2, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                            className="absolute inset-0 bg-teal/30 rounded-full"
                          />
                          <motion.div 
                            animate={{ scale: [1, 1.2, 1.5], opacity: [0.8, 0.4, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                            className="absolute inset-0 bg-cyan/30 rounded-full"
                          />
                        </>
                      )}
                      
                      {/* Main Mic Button */}
                      <button
                        onClick={toggleCall}
                        className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${
                          callStatus === 'active' 
                            ? 'bg-gradient-to-br from-teal to-cyan shadow-[0_0_40px_rgba(45,212,191,0.4)]' 
                            : 'bg-surface border border-line hover:border-teal/50 hover:bg-white/5'
                        }`}
                      >
                        {callStatus === 'connecting' ? (
                          <Loader2 className="w-10 h-10 text-mute animate-spin" />
                        ) : callStatus === 'active' ? (
                          <PhoneOff className="w-10 h-10 text-bg" />
                        ) : (
                          <Mic className="w-10 h-10 text-ink" />
                        )}
                      </button>
                    </div>
                    
                    <div className="text-center">
                      <h3 className="font-head text-2xl font-bold text-ink mb-2">
                        {callStatus === 'idle' && "Click to call AI"}
                        {callStatus === 'connecting' && "Connecting..."}
                        {callStatus === 'active' && (isSpeaking ? "AI is speaking..." : "Listening...")}
                      </h3>
                      <p className="text-mute text-sm max-w-[250px] mx-auto">
                        {callStatus === 'idle' 
                          ? "Make sure your microphone is enabled."
                          : "Speak naturally. You can interrupt at any time."
                        }
                      </p>
                    </div>

                    {callStatus === 'active' && isSpeaking && (
                      <div className="absolute bottom-8 flex gap-1 items-end h-8">
                        {[1,2,3,4,5].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ height: ['20%', '100%', '20%'] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
                            className="w-1.5 bg-teal rounded-full"
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Text Chat Interface */}
                {activeTab === 'chat' && (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute inset-0 flex flex-col bg-surface"
                  >
                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                            msg.role === 'user' 
                              ? 'bg-ink text-bg rounded-br-none' 
                              : 'bg-card border border-line text-ink rounded-bl-none'
                          }`}>
                            {msg.content}
                          </div>
                        </div>
                      ))}
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-card border border-line rounded-2xl rounded-bl-none px-4 py-3 flex gap-1.5 items-center">
                            <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-mute rounded-full" />
                            <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-mute rounded-full" />
                            <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-mute rounded-full" />
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 bg-card border-t border-line">
                      <form onSubmit={handleSendMessage} className="relative flex items-center">
                        <input 
                          type="text"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          placeholder="Ask anything..."
                          className="w-full bg-surface border border-line rounded-full px-5 py-3 pr-12 text-sm text-ink placeholder:text-faint focus:outline-none focus:border-teal/50 transition-colors"
                        />
                        <button 
                          type="submit"
                          disabled={!inputValue.trim()}
                          className="absolute right-2 p-2 bg-ink text-bg rounded-full disabled:opacity-50 disabled:bg-surface disabled:text-faint transition-colors"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  </motion.div>
                )}
                
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
