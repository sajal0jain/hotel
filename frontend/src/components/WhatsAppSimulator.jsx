import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Sparkles, 
  AlertTriangle, 
  CheckCheck, 
  Phone, 
  Video, 
  MoreVertical, 
  Smile, 
  Paperclip, 
  Terminal, 
  ShieldAlert, 
  ThumbsUp, 
  HelpCircle,
  Clock,
  User
} from 'lucide-react';
import { api } from '../api';

const PRESET_PERSONAS = [
  {
    name: 'Ananya Roy (Suite 407)',
    phone: '+919811122334',
    room: '407',
    vip: true,
    prompt: 'What is the Wi-Fi password and what time does breakfast start tomorrow?'
  },
  {
    name: 'Sneha Sen (Room 204)',
    phone: '+919765432109',
    room: '204',
    vip: false,
    prompt: 'My bathroom tap is leaking heavily and the AC is making a loud buzzing noise! This is unacceptable!'
  },
  {
    name: 'Priyanka Mehra (Room 107)',
    phone: '+919833344455',
    room: '107',
    vip: false,
    prompt: 'Could you please send 2 extra feather pillows and dental kits to Room 107?'
  },
  {
    name: 'David Miller (Room 408)',
    phone: '+14159876543',
    room: '408',
    vip: true,
    prompt: 'Can I order a Heritage Club Sandwich and artisanal hot chocolate to Room 408?'
  },
  {
    name: 'Prospective Guest',
    phone: '+919876500000',
    room: null,
    vip: false,
    prompt: 'Hi, can I book a Deluxe Garden view room for this Friday? What are your rates and amenities?'
  }
];

export default function WhatsAppSimulator({ onRequestCreated }) {
  const [selectedPersona, setSelectedPersona] = useState(PRESET_PERSONAS[0]);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      content: 'Welcome to *The Grand Heritage Boutique Hotel* Concierge! 🏨✨ How may I assist you with your stay today?',
      time: '12:00 PM'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState(null);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'guest',
      content: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInputText('');
    setIsTyping(true);

    try {
      const response = await api.simulateWhatsApp({
        phone: selectedPersona.phone,
        name: selectedPersona.name.split(' ')[0],
        room_number: selectedPersona.room,
        message: textToSend
      });

      setIsTyping(false);
      setLastAnalysis(response);

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        content: response.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);

      if (onRequestCreated && (response.intent === 'in_stay_request' || response.escalated)) {
        onRequestCreated();
      }
    } catch (err) {
      setIsTyping(false);
      const errMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        content: 'Thank you for your message! Our concierge desk has received your note.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errMsg]);
    }
  };

  const handleSelectPreset = (p) => {
    setSelectedPersona(p);
    setInputText(p.prompt);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left: Persona Switcher & Quick Scenario Bar */}
      <div className="lg:col-span-4 space-y-4">
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="font-heading text-sm font-bold text-white">Interactive Guest Personas</h3>
          </div>
          <p className="text-xs text-slate-400">
            Select a simulated guest persona to test Groq RAG knowledge retrieval, intent classification, and real-time escalation triggers:
          </p>

          <div className="space-y-2">
            {PRESET_PERSONAS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectPreset(p)}
                className={`w-full p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                  selectedPersona.phone === p.phone
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                    : 'bg-slate-900/50 border-slate-800/80 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-heading font-semibold text-xs text-white">{p.name}</span>
                  {p.vip && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                      VIP
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 italic">"{p.prompt}"</p>
              </button>
            ))}
          </div>
        </div>

        {/* Live NLP & Escalation Diagnostic Card */}
        {lastAnalysis && (
          <div className="glass-card p-5 space-y-3 animate-fade-in border border-slate-700/60">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-heading text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                Live NLP Pipeline Diagnostics
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                Groq Llama 3.3 70B
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Classified Intent:</span>
                <span className="font-semibold text-amber-400 capitalize">{lastAnalysis.intent}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Category:</span>
                <span className="font-semibold text-emerald-400 capitalize">{lastAnalysis.category}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">Sentiment Score:</span>
                <span className={`font-mono font-bold ${
                  lastAnalysis.sentiment_score > 0 ? 'text-emerald-400' : lastAnalysis.sentiment_score < -0.2 ? 'text-red-400' : 'text-slate-300'
                }`}>
                  {lastAnalysis.sentiment_score > 0 ? `+${lastAnalysis.sentiment_score}` : lastAnalysis.sentiment_score}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className={`h-full transition-all ${
                    lastAnalysis.sentiment_score >= 0 ? 'bg-emerald-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(Math.abs(lastAnalysis.sentiment_score) * 100, 100)}%` }}
                />
              </div>
            </div>

            {lastAnalysis.escalated ? (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-300 text-xs space-y-1 animate-pulse-urgent">
                <div className="flex items-center gap-1.5 font-bold text-red-400">
                  <ShieldAlert className="w-4 h-4" />
                  <span>URGENT ESCALATION FLAGGED</span>
                </div>
                <p className="text-[11px] text-red-200">{lastAnalysis.escalation_reason}</p>
                <p className="text-[10px] text-red-300 font-medium">Duty Manager & Housekeeping notified in real-time.</p>
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] flex items-center gap-1.5">
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Normal Resolution: Answered from Hotel Knowledge Base</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Ultra-realistic WhatsApp Phone Simulator */}
      <div className="lg:col-span-8 flex justify-center">
        <div className="w-full max-w-md rounded-[36px] bg-slate-950 border-[6px] border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[650px] relative">
          
          {/* Phone Top Speaker & Camera Notch */}
          <div className="w-full h-5 bg-slate-950 flex items-center justify-center">
            <div className="w-20 h-3 rounded-full bg-slate-900" />
          </div>

          {/* WhatsApp Header */}
          <div className="bg-[#075E54] text-white px-4 py-3 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 font-bold text-sm shadow">
                  GH
                </div>
                <div className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#075E54] absolute bottom-0 right-0" />
              </div>
              <div>
                <h4 className="text-sm font-bold leading-tight flex items-center gap-1">
                  The Grand Heritage
                  <span className="text-[10px] px-1 rounded bg-emerald-700 text-emerald-100 font-normal">Verified</span>
                </h4>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
                  Concierge Bot • Active
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-emerald-100">
              <Phone className="w-4 h-4 cursor-pointer hover:text-white" />
              <Video className="w-4 h-4 cursor-pointer hover:text-white" />
              <MoreVertical className="w-4 h-4 cursor-pointer hover:text-white" />
            </div>
          </div>

          {/* Chat Background & Message Stream */}
          <div 
            className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0B141A]"
            style={{
              backgroundImage: 'radial-gradient(circle at center, rgba(18, 140, 126, 0.04) 0, transparent 100%)'
            }}
          >
            {/* Encryption notice */}
            <div className="flex justify-center">
              <div className="px-3 py-1 rounded-lg bg-[#182229] border border-slate-800 text-[10px] text-amber-300/80 text-center max-w-xs shadow-sm">
                🔒 Messages with The Grand Heritage Concierge are secured.
              </div>
            </div>

            {messages.map((m) => {
              const isUser = m.sender === 'guest';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-fade-in`}
                >
                  <div
                    className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs shadow-md space-y-1 relative ${
                      isUser
                        ? 'bg-[#005C4B] text-slate-100 rounded-tr-none'
                        : 'bg-[#202C33] text-slate-200 rounded-tl-none border border-slate-700/40'
                    }`}
                  >
                    <p className="whitespace-pre-line leading-relaxed">{m.content}</p>
                    <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400">
                      <span>{m.time}</span>
                      {isUser && <CheckCheck className="w-3.5 h-3.5 text-[#53BDEB]" />}
                    </div>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-[#202C33] w-20 text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* WhatsApp Input Bar */}
          <div className="bg-[#202C33] px-3 py-2 flex items-center gap-2 border-t border-slate-800">
            <button className="text-slate-400 hover:text-slate-200 p-1">
              <Smile className="w-5 h-5" />
            </button>
            <button className="text-slate-400 hover:text-slate-200 p-1">
              <Paperclip className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your WhatsApp message..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-[#2A3942] text-slate-100 text-xs outline-none placeholder-slate-400 border border-transparent focus:border-emerald-500/50"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim()}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                inputText.trim()
                  ? 'bg-[#00A884] text-white shadow-md active:scale-95'
                  : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
