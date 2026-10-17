import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Radio,
  Sparkles,
  Bot,
  Send,
  ShieldAlert,
  Cpu,
  Layers,
  Flame,
  Terminal,
  Activity
} from 'lucide-react';
import { floatTo16BitPCMBase64, base64PCMToAudioBuffer } from '../lib/audioUtils.ts';

interface VoiceSecOpsModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemStatus: string;
}

interface MessageItem {
  id: string;
  sender: 'user' | 'model' | 'system';
  text: string;
  timestamp: string;
}

export const VoiceSecOpsModal: React.FC<VoiceSecOpsModalProps> = ({
  isOpen,
  onClose,
  systemStatus,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'init-1',
      sender: 'system',
      text: 'Voice Operations Channel Established. Model: gemini-3.8-live (Live API). Speak or type your cybersecurity query.',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [textInput, setTextInput] = useState('');
  const [activeModelName, setActiveModelName] = useState('gemini-3.8-live');

  // Audio Contexts & WebSockets
  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Connect WebSocket on modal open
  useEffect(() => {
    if (!isOpen) {
      cleanupAudio();
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setIsConnected(false);
      setIsMicActive(false);
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/live-ws`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'connected') {
          setActiveModelName(data.model || 'gemini-3.8-live');
          setMessages(prev => [
            ...prev,
            {
              id: `sys-${Date.now()}`,
              sender: 'system',
              text: data.message,
              timestamp: new Date().toLocaleTimeString()
            }
          ]);
        } else if (data.type === 'audio') {
          handleIncomingAudio(data.audio);
        } else if (data.type === 'text') {
          setIsModelSpeaking(true);
          setMessages(prev => [
            ...prev,
            {
              id: `model-${Date.now()}`,
              sender: 'model',
              text: data.text,
              timestamp: new Date().toLocaleTimeString()
            }
          ]);
          // If in speech synthesis fallback
          speakWithBrowserFallback(data.text);
        } else if (data.type === 'interrupted') {
          stopOngoingAudio();
        } else if (data.type === 'fallback') {
          setActiveModelName('SecOps Voice Telemetry Engine');
          setMessages(prev => [
            ...prev,
            {
              id: `sys-${Date.now()}`,
              sender: 'system',
              text: data.message,
              timestamp: new Date().toLocaleTimeString()
            }
          ]);
        }
      } catch (e) {
        console.error('Error parsing live WS payload:', e);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      setIsMicActive(false);
    };

    ws.onerror = (err) => {
      console.error('Live WS error:', err);
    };

    return () => {
      cleanupAudio();
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [isOpen]);

  const cleanupAudio = () => {
    stopOngoingAudio();
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close().catch(() => {});
      inputAudioCtxRef.current = null;
    }
    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close().catch(() => {});
      outputAudioCtxRef.current = null;
    }
  };

  const stopOngoingAudio = () => {
    activeSourcesRef.current.forEach(source => {
      try {
        source.stop();
      } catch {
        // ignore
      }
    });
    activeSourcesRef.current = [];
    if (outputAudioCtxRef.current) {
      nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;
    }
    setIsModelSpeaking(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const handleIncomingAudio = (base64Audio: string) => {
    setIsModelSpeaking(true);
    if (!outputAudioCtxRef.current) {
      outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000
      });
      nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;
    }

    const ctx = outputAudioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const audioBuffer = base64PCMToAudioBuffer(ctx, base64Audio, 24000);
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);

    const currentTime = ctx.currentTime;
    const startTime = Math.max(currentTime, nextStartTimeRef.current);
    source.start(startTime);
    nextStartTimeRef.current = startTime + audioBuffer.duration;

    activeSourcesRef.current.push(source);
    source.onended = () => {
      activeSourcesRef.current = activeSourcesRef.current.filter(s => s !== source);
      if (activeSourcesRef.current.length === 0) {
        setIsModelSpeaking(false);
      }
    };
  };

  const speakWithBrowserFallback = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 0.95;
      utterance.onend = () => setIsModelSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleMicrophone = async () => {
    if (isMicActive) {
      cleanupAudio();
      setIsMicActive(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000
      });
      inputAudioCtxRef.current = inputCtx;

      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      source.connect(processor);
      processor.connect(inputCtx.destination);

      processor.onaudioprocess = (e) => {
        const channelData = e.inputBuffer.getChannelData(0);
        const pcmBase64 = floatTo16BitPCMBase64(channelData);

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ audio: pcmBase64 }));
        }
      };

      setIsMicActive(true);
      setMessages(prev => [
        ...prev,
        {
          id: `mic-${Date.now()}`,
          sender: 'system',
          text: 'Microphone streaming 16kHz PCM audio to gemini-3.8-live. Speak now...',
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } catch (err) {
      console.error('Microphone access denied or error:', err);
      alert('Could not access microphone. You can still type queries or use quick prompt chips!');
    }
  };

  const handleSendText = (textToSend?: string) => {
    const text = textToSend || textInput;
    if (!text.trim()) return;

    setMessages(prev => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: text.trim(),
        timestamp: new Date().toLocaleTimeString()
      }
    ]);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ text: text.trim() }));
    }

    if (!textToSend) {
      setTextInput('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md font-mono text-xs">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-cyan-500/50 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/60 shadow-lg">
              <Bot className="w-4 h-4 text-cyan-300" />
              {isModelSpeaking && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">SentinelAI Voice SecOps</span>
                <span className="text-[10px] px-2 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold">
                  {activeModelName}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Real-Time Two-Way Audio Conversation (Live API) · IBM Z SecOps Intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded border ${
              isConnected ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300' : 'bg-rose-950/60 border-rose-700 text-rose-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></span>
              <span>{isConnected ? 'ONLINE' : 'CONNECTING'}</span>
            </span>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Audio Wave Visualizer Bar */}
        <div className="bg-slate-950 border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className={`w-4 h-4 ${isMicActive || isModelSpeaking ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
            <span className="text-[11px] text-slate-300">
              {isModelSpeaking
                ? 'Model Speaking (24kHz Live Audio)...'
                : isMicActive
                ? 'Listening to Microphone (16kHz PCM)...'
                : 'Click mic or send a query to talk'}
            </span>
          </div>

          {/* Dynamic Sound Wave Bars */}
          <div className="flex items-center gap-1 h-5">
            {[4, 12, 18, 10, 20, 14, 8, 16, 22, 9, 15, 6].map((h, i) => (
              <span
                key={i}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isModelSpeaking ? 'bg-cyan-400' : isMicActive ? 'bg-emerald-400' : 'bg-slate-700'
                }`}
                style={{
                  height: isModelSpeaking || isMicActive
                    ? `${Math.max(4, (h * (0.5 + Math.random() * 0.8)))}px`
                    : '4px'
                }}
              ></span>
            ))}
          </div>
        </div>

        {/* Conversation Transcript Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-900/60">
          {messages.map(m => {
            const isUser = m.sender === 'user';
            const isSystem = m.sender === 'system';

            if (isSystem) {
              return (
                <div key={m.id} className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 text-center">
                  {m.text}
                </div>
              );
            }

            return (
              <div
                key={m.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
              >
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span>{isUser ? 'Operator (You)' : 'SentinelAI Officer'}</span>
                  <span>·</span>
                  <span>{m.timestamp}</span>
                </div>
                <div
                  className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                    isUser
                      ? 'bg-cyan-950/80 border border-cyan-700 text-cyan-100 rounded-tr-none'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            );
          })}
          <div ref={transcriptEndRef} />
        </div>

        {/* Quick Voice Prompt Chips */}
        <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/60 flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-slate-500 shrink-0">Quick Prompts:</span>
          <button
            onClick={() => handleSendText('Provide an incident briefing on our DEFCON status and active critical alerts.')}
            className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 whitespace-nowrap transition-colors"
          >
            Incident Briefing
          </button>
          <button
            onClick={() => handleSendText('Explain why transaction TXN-90218 was flagged and what rules fired.')}
            className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 whitespace-nowrap transition-colors"
          >
            Explain TXN-90218
          </button>
          <button
            onClick={() => handleSendText('What are the key SMF record types monitored on the IBM Z mainframe?')}
            className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 whitespace-nowrap transition-colors"
          >
            IBM Z SMF Intel
          </button>
          <button
            onClick={() => handleSendText('Recommend containment steps for the $84,500 offshore wire transfer.')}
            className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 whitespace-nowrap transition-colors"
          >
            Containment Protocol
          </button>
        </div>

        {/* Controls & Input Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
          {/* Microphone Live Push-to-Talk / Toggle */}
          <button
            onClick={toggleMicrophone}
            className={`p-2.5 rounded-xl border font-bold flex items-center gap-2 transition-all ${
              isMicActive
                ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-950/60 animate-pulse'
                : 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 border-cyan-400'
            }`}
            title={isMicActive ? 'Mute microphone' : 'Start live voice conversation (gemini-3.8-live)'}
          >
            {isMicActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span className="text-xs">{isMicActive ? 'Mute Mic' : 'Live Voice'}</span>
          </button>

          {/* Text Input Option */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendText()}
              placeholder="Ask SentinelAI via voice or type here..."
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <button
            onClick={() => handleSendText()}
            disabled={!textInput.trim()}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-cyan-300 border border-slate-700 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
