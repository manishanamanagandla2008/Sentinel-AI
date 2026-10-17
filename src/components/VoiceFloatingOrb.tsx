import React, { useState } from 'react';
import {
  Mic,
  Radio,
  Volume2,
  VolumeX,
  Sparkles,
  Bot
} from 'lucide-react';
import { soundFx } from '../lib/soundFx.ts';

interface VoiceFloatingOrbProps {
  onOpenVoiceModal: () => void;
}

export const VoiceFloatingOrb: React.FC<VoiceFloatingOrbProps> = ({
  onOpenVoiceModal,
}) => {
  const [isMuted, setIsMuted] = useState(!soundFx.enabled);

  const toggleSound = () => {
    soundFx.enabled = !soundFx.enabled;
    setIsMuted(!soundFx.enabled);
    if (soundFx.enabled) {
      soundFx.playBlip(1200);
    }
  };

  return (
    <div className="fixed bottom-5 left-5 z-40 flex items-center gap-2 select-none font-mono">
      {/* Voice SecOps Holographic Orb Launcher */}
      <button
        onClick={() => {
          soundFx.playBlip(980);
          onOpenVoiceModal();
        }}
        className="group relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-slate-950/90 border border-cyan-500/50 hover:border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.3)] hover:shadow-[0_0_35px_rgba(6,182,212,0.5)] backdrop-blur-xl transition-all duration-300"
        title="Open Gemini 3.8 Live API Voice SecOps Conversation"
      >
        {/* Pulsing glow aura */}
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-cyan-500/20 blur-sm opacity-70 group-hover:opacity-100 transition-opacity"></div>

        {/* Center Orb Icon */}
        <div className="relative flex items-center justify-center w-7 h-7 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950 shadow-md">
          <Mic className="w-4 h-4 text-slate-950 fill-slate-950" />
        </div>

        <div className="relative text-left">
          <div className="text-xs font-bold text-white flex items-center gap-1.5">
            <span>Voice SecOps</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          </div>
          <div className="text-[10px] text-cyan-300">
            gemini-3.8-live
          </div>
        </div>
      </button>

      {/* Cyber Sound FX Toggle Button */}
      <button
        onClick={toggleSound}
        className={`p-2.5 rounded-2xl border transition-all ${
          !isMuted
            ? 'bg-slate-950/80 border-cyan-500/40 text-cyan-400 hover:border-cyan-300'
            : 'bg-slate-950/80 border-slate-800 text-slate-500 hover:text-slate-300'
        }`}
        title={isMuted ? 'Unmute cybernetic UI sound effects' : 'Mute UI sound effects'}
      >
        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>
    </div>
  );
};
