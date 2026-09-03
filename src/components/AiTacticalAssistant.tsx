import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  HelpCircle,
  CheckCircle2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Lineup, Formation, TacticalPreset } from '../types';
import { footballApi } from '../services/footballApi';

interface AiTacticalAssistantProps {
  currentLineup: Lineup;
  currentFormation: Formation;
  availableFormations: Formation[];
  availablePresets: TacticalPreset[];
  onApplyFormation: (formationId: string) => void;
  onApplyPreset: (preset: TacticalPreset) => void;
  onClose?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  recommendedFormationId?: string;
  recommendedPresetId?: string;
}

export const AiTacticalAssistant: React.FC<AiTacticalAssistantProps> = ({
  currentLineup,
  currentFormation,
  availableFormations,
  availablePresets,
  onApplyFormation,
  onApplyPreset,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `**Welcome to the UEFA Pro Tactical Assistant.**\n\nI analyze your squad using **100% verified real football tactical theory and canonical database records**. I can explain tactical mechanics, suggest role assignments, diagnose weaknesses, or counter opposing formations.\n\n*Try asking a tactical question below or select one of the tactical presets.*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputValue.trim();
    if (!textToSend || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputValue('');
    setLoading(true);

    try {
      const response = await footballApi.askTacticalAssistant(
        textToSend,
        currentLineup,
        currentFormation.id
      );

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: response.answer || response.error || 'Tactical analysis complete.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendedFormationId: response.recommendedFormationId,
        recommendedPresetId: response.recommendedPresetId,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: 'Unable to reach tactical reasoning engine. Please ensure network connectivity.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFormation = (formationId: string) => {
    const formation = availableFormations.find((f) => f.id === formationId);
    if (formation) {
      onApplyFormation(formationId);
      setAppliedNotice(`Applied ${formation.name} to the tactics pitch!`);
      setTimeout(() => setAppliedNotice(null), 3000);
    }
  };

  const handleApplyPreset = (presetId: string) => {
    const preset = availablePresets.find((p) => p.id === presetId);
    if (preset) {
      onApplyPreset(preset);
      setAppliedNotice(`Applied ${preset.name} with tactical annotations!`);
      setTimeout(() => setAppliedNotice(null), 3000);
    }
  };

  const sampleQuestions = [
    'What formation works best against a 4-3-3?',
    'How does a 3-2-4-1 build up?',
    'What is the difference between an inverted fullback and a wingback?',
    'Show high press tactics',
    'Who should play as false 9 in this lineup?',
    'Analyze our squad balance and tactical strengths',
  ];

  return (
    <div className="flex flex-col h-full bg-[#0d1017] border border-[#202532] rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#131722] border-b border-[#202532]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-white">AI Tactical Assistant</span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5" /> Real Database Grounded
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Active: <span className="text-slate-200 font-medium">{currentFormation.name}</span>
            </p>
          </div>
        </div>

        {appliedNotice && (
          <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-2.5 py-1 rounded-md flex items-center gap-1 animate-fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{appliedNotice}</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Question Chips */}
      <div className="p-2.5 bg-[#10131c] border-b border-[#1b202c] overflow-x-auto flex items-center gap-1.5 scrollbar-thin">
        <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 whitespace-nowrap pl-1">
          <HelpCircle className="w-3 h-3 text-emerald-400" /> Prompts:
        </span>
        {sampleQuestions.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => handleSend(q)}
            disabled={loading}
            className="text-[11px] whitespace-nowrap bg-[#171b26] hover:bg-[#222836] text-slate-300 hover:text-white px-2.5 py-1 rounded-full border border-[#262c3d] transition-all disabled:opacity-50 cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-none shadow-md font-medium'
                  : 'bg-[#151924] border border-[#232938] text-slate-200 rounded-bl-none shadow-lg'
              }`}
            >
              {/* Message text with basic markdown bold/bullet styling */}
              <div className="space-y-1.5 whitespace-pre-wrap font-sans">
                {m.text.split('\n\n').map((para, i) => (
                  <p key={i} className="leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>

              {/* Actionable buttons if a formation or preset was recommended */}
              {m.sender === 'assistant' && (m.recommendedFormationId || m.recommendedPresetId) && (
                <div className="mt-3 pt-2.5 border-t border-[#2a3142] flex flex-wrap gap-2">
                  {m.recommendedFormationId && (
                    <button
                      type="button"
                      onClick={() => handleApplyFormation(m.recommendedFormationId!)}
                      className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Apply Formation: {availableFormations.find((f) => f.id === m.recommendedFormationId)?.name || m.recommendedFormationId}
                    </button>
                  )}
                  {m.recommendedPresetId && (
                    <button
                      type="button"
                      onClick={() => handleApplyPreset(m.recommendedPresetId!)}
                      className="bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-[11px] font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Apply Tactical Preset: {availablePresets.find((p) => p.id === m.recommendedPresetId)?.name || m.recommendedPresetId}
                    </button>
                  )}
                </div>
              )}

              <span className="block text-[9px] text-slate-400 text-right mt-1">
                {m.timestamp}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-[#151924] border border-[#232938] rounded-xl px-4 py-2.5 w-fit">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            <span>Analyzing tactical dynamics & database principles...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-[#131722] border-t border-[#202532] flex items-center gap-2"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask tactical question, request counters, or analyze lineup..."
          className="flex-1 bg-[#0d1017] border border-[#252b3b] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || loading}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white p-2 rounded-xl transition-all flex items-center justify-center cursor-pointer shadow-md"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
