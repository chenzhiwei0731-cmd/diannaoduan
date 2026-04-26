import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import { 
  Home, 
  Compass, 
  BookOpen, 
  Leaf, 
  User, 
  Play, 
  ChevronLeft, 
  ChevronRight,
  Calendar, 
  Medal, 
  Ghost, 
  PenSquare, 
  Sun, 
  Moon, 
  CloudRain, 
  CloudSnow, 
  CloudSun,
  X,
  History,
  Heart,
  Settings,
  Share2,
  SkipBack,
  SkipForward,
  Pause,
  Shuffle,
  Repeat,
  Send,
  Search,
  Lock,
  Users,
  MessageCircle,
  Trophy,
  Wind,
  Flame,
  Mail,
  CheckCircle,
  Clock,
  Quote,
  Headphones,
  Book
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { cn } from './lib/utils';

// Web Audio API Hook for generating procedural noise
const useWebAudioNoise = (type: string, isPlaying: boolean) => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    if (!type.startsWith('webaudio://')) return;
    
    if (isPlaying) {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      
      const noiseType = type.replace('webaudio://', '');
      
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (noiseType === 'brown') { // ocean, fire
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5;
        } else if (noiseType === 'pink') { // rain, wind
          output[i] = (lastOut + white) / 2;
          lastOut = output[i];
          output[i] *= 1.5;
        } else { // white
          output[i] = white;
        }
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;
      
      const gainNode = ctx.createGain();
      gainNode.gain.value = 0.1;
      
      let filter: BiquadFilterNode | null = null;
      if (noiseType === 'brown') {
        filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        noiseSource.connect(filter);
        filter.connect(gainNode);
      } else if (noiseType === 'pink') {
        filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1000;
        noiseSource.connect(filter);
        filter.connect(gainNode);
      } else {
        noiseSource.connect(gainNode);
      }
      
      gainNode.connect(ctx.destination);
      noiseSource.start();
      sourceRef.current = noiseSource;
      
    } else {
      if (sourceRef.current) {
        sourceRef.current.stop();
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }
    }
    
    return () => {
      if (sourceRef.current) {
        sourceRef.current.stop();
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }
    };
  }, [isPlaying, type]);
};

// --- Types ---
interface Session {
  id: string;
  title: string;
  author: string;
  duration: string;
  cover: string;
  audioUrl?: string;
}

type PageId = 
  | 'login'
  | 'register'
  | 'home' 
  | 'explore' 
  | 'diary' 
  | 'healing' 
  | 'profile'
  | 'mood-checkin'
  | 'breathing'
  | 'stats'
  | 'duration-stats'
  | 'moments'
  | 'assessment'
  | 'course-detail'
  | 'community'
  | 'tree-hole'
  | 'achievements'
  | 'settings'
  | 'player';

interface Message {
  id: string;
  text: string;
  sender: 'ai' | 'user';
  timestamp: Date;
}

// --- Mock Data ---
const moodData = [
  { name: '周一', value: 45 },
  { name: '周二', value: 60 },
  { name: '周三', value: 25 },
  { name: '周四', value: 55 },
  { name: '周五', value: 78 },
  { name: '周六', value: 85 },
  { name: '周日', value: 92 },
];

const meditationData = [
  { name: '周一', value: 15 },
  { name: '周二', value: 20 },
  { name: '周三', value: 10 },
  { name: '周四', value: 25 },
  { name: '周五', value: 30 },
  { name: '周六', value: 45 },
  { name: '周日', value: 40 },
];

// --- Components ---

const AuroraBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    <div className="absolute w-full h-full bg-[#F0F8FF] dark:bg-slate-950 transition-colors duration-500" />
    <motion.div 
      animate={{
        x: [0, 30, -20, 0],
        y: [0, -50, 20, 0],
        scale: [1, 1.1, 0.9, 1],
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      className="absolute w-64 h-64 bg-[#E6E6FA] dark:bg-indigo-900/30 blur-[60px] opacity-50 -top-10 -left-10 transition-colors duration-500"
    />
    <motion.div 
      animate={{
        x: [0, -30, 20, 0],
        y: [0, 50, -20, 0],
        scale: [1, 1.2, 0.8, 1],
      }}
      transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      className="absolute w-72 h-72 bg-[#89CFF0] dark:bg-blue-900/30 blur-[60px] opacity-50 -bottom-10 -right-10 transition-colors duration-500"
    />
    <motion.div 
      animate={{
        x: [0, 20, -30, 0],
        y: [0, 30, -50, 0],
        scale: [1, 0.9, 1.1, 1],
      }}
      transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      className="absolute w-60 h-60 bg-[#FFD8B1] dark:bg-purple-900/20 blur-[60px] opacity-30 top-1/3 right-10 transition-colors duration-500"
    />
  </div>
);

const Sidebar = ({ activeTab, onTabChange }: { activeTab: string, onTabChange: (id: PageId) => void }) => {
  const tabs = [
    { id: 'home', icon: Home, label: '首页' },
    { id: 'explore', icon: Compass, label: '探索' },
    { id: 'diary', icon: BookOpen, label: '日记' },
    { id: 'healing', icon: Leaf, label: '疗愈' },
    { id: 'profile', icon: User, label: '我的' },
  ];

  return (
    <div className="w-[240px] h-full bg-white/80 dark:bg-[#2A2D34]/90 backdrop-blur-2xl border-r border-slate-200 dark:border-slate-800 flex flex-col py-10 px-6 z-50 relative">
      <div className="flex items-center gap-3 mb-16 px-2">
        <div className="w-10 h-10 bg-gradient-to-br from-[#89CFF0] to-[#E6E6FA] dark:from-indigo-500 dark:to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
          <Leaf size={24} className="text-white" />
        </div>
        <span className="text-xl font-bold text-[#2A2D34] dark:text-slate-100">心港驿站</span>
      </div>
      
      <div className="flex flex-col gap-4 flex-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as PageId)}
            className={cn(
              "flex items-center gap-4 px-4 py-4 rounded-2xl transition-all relative group",
              activeTab === tab.id 
                ? "bg-[#2A2D34] dark:bg-slate-800 text-white dark:text-indigo-400 shadow-md" 
                : "text-[#5D6979] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-[#2A2D34] dark:hover:text-slate-200"
            )}
          >
            {activeTab === tab.id && (
              <motion.div 
                layoutId="nav-indicator"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-[#89CFF0] dark:bg-indigo-500 rounded-r-full" 
              />
            )}
            <tab.icon size={22} className={cn(activeTab === tab.id ? "text-[#89CFF0] dark:text-indigo-400" : "")} />
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
      
      <div className="mt-auto pt-8 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <img src="https://picsum.photos/seed/user/100/100" alt="User" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-sm font-medium text-[#2A2D34] dark:text-slate-200">林晓</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">免费版</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Page Views ---

const LoginView = ({ onLogin, onNavigate }: { onLogin: () => void, onNavigate: (id: PageId) => void }) => (
  <div className="flex-1 flex flex-col relative min-h-0 transition-colors duration-300 px-8 justify-center z-10 items-center">
    <div className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-12 rounded-[40px] shadow-2xl border border-white/50 dark:border-slate-800">
      <div className="text-center mb-12">
        <div className="w-24 h-24 bg-gradient-to-br from-[#89CFF0] to-[#E6E6FA] dark:from-indigo-500 dark:to-purple-600 rounded-[32px] mx-auto mb-8 shadow-lg flex items-center justify-center">
          <Leaf size={48} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold text-[#2A2D34] dark:text-slate-100 mb-4 tracking-tight">欢迎回到心港驿站</h1>
        <p className="text-lg text-[#5D6979] dark:text-slate-400">继续你的心灵疗愈之旅</p>
      </div>
      <div className="space-y-6">
        <div className="relative">
          <Mail size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="email" placeholder="邮箱" className="w-full pl-16 pr-6 py-5 rounded-3xl bg-white/60 dark:bg-slate-800/60 border-2 border-slate-100 dark:border-slate-700 focus:outline-none focus:border-[#89CFF0] dark:focus:border-indigo-400 dark:text-slate-200 transition-colors text-lg" />
        </div>
        <div className="relative">
          <Lock size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="password" placeholder="密码" className="w-full pl-16 pr-6 py-5 rounded-3xl bg-white/60 dark:bg-slate-800/60 border-2 border-slate-100 dark:border-slate-700 focus:outline-none focus:border-[#89CFF0] dark:focus:border-indigo-400 dark:text-slate-200 transition-colors text-lg" />
        </div>
        <button onClick={onLogin} className="w-full py-5 bg-[#2A2D34] dark:bg-slate-100 text-white dark:text-slate-900 rounded-3xl text-xl font-bold shadow-xl shadow-slate-200 dark:shadow-none mt-8 hover:scale-[1.02] active:scale-[0.98] transition-all">
          登录
        </button>
      </div>
      <div className="mt-10 text-center">
        <button onClick={() => onNavigate('register')} className="text-base text-[#89CFF0] dark:text-indigo-400 font-medium hover:underline">
          没有账号？去注册
        </button>
      </div>
    </div>
  </div>
);

const RegisterView = ({ onRegister, onNavigate }: { onRegister: () => void, onNavigate: (id: PageId) => void }) => (
  <div className="flex-1 flex flex-col relative min-h-0 transition-colors duration-300 px-8 justify-center z-10 items-center">
    <div className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-12 rounded-[40px] shadow-2xl border border-white/50 dark:border-slate-800">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#2A2D34] dark:text-slate-100 mb-4 tracking-tight">创建新账号</h1>
        <p className="text-lg text-[#5D6979] dark:text-slate-400">开启你的专属心灵空间</p>
      </div>
      <div className="space-y-6">
        <div className="relative">
          <User size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="昵称" className="w-full pl-16 pr-6 py-5 rounded-3xl bg-white/60 dark:bg-slate-800/60 border-2 border-slate-100 dark:border-slate-700 focus:outline-none focus:border-[#89CFF0] dark:focus:border-indigo-400 dark:text-slate-200 transition-colors text-lg" />
        </div>
        <div className="relative">
          <Mail size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="email" placeholder="邮箱" className="w-full pl-16 pr-6 py-5 rounded-3xl bg-white/60 dark:bg-slate-800/60 border-2 border-slate-100 dark:border-slate-700 focus:outline-none focus:border-[#89CFF0] dark:focus:border-indigo-400 dark:text-slate-200 transition-colors text-lg" />
        </div>
        <div className="relative">
          <Lock size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="password" placeholder="密码" className="w-full pl-16 pr-6 py-5 rounded-3xl bg-white/60 dark:bg-slate-800/60 border-2 border-slate-100 dark:border-slate-700 focus:outline-none focus:border-[#89CFF0] dark:focus:border-indigo-400 dark:text-slate-200 transition-colors text-lg" />
        </div>
        <button onClick={onRegister} className="w-full py-5 bg-[#89CFF0] dark:bg-indigo-500 text-white rounded-3xl text-xl font-bold shadow-xl shadow-blue-200 dark:shadow-none mt-8 hover:scale-[1.02] active:scale-[0.98] transition-all">
          注册并登录
        </button>
      </div>
      <div className="mt-10 text-center">
        <button onClick={() => onNavigate('login')} className="text-base text-[#5D6979] dark:text-slate-400 font-medium hover:underline">
          已有账号？去登录
        </button>
      </div>
    </div>
  </div>
);

const HomeView = ({ onNavigate }: { onNavigate: (id: PageId) => void }) => {
  const [insight, setInsight] = useState('加载今日灵感...');
  const [isInsightLoading, setIsInsightLoading] = useState(true);

  useEffect(() => {
    const fetchInsight = async () => {
      try {
        const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
        const response = await genAI.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: "请为心理疗愈应用生成一条简短的今日灵感（20字以内），语气温暖、治愈。请直接输出这句灵感，不要包含任何其他解释、选项、Markdown格式或引号。",
        });
        let text = response.text || '每一个不曾起舞的日子，都是对生命的辜负。';
        text = text.replace(/["“”*]/g, '').trim();
        setInsight(text);
      } catch (error) {
        setInsight('愿你今天也能温柔地对待自己。');
      } finally {
        setIsInsightLoading(false);
      }
    };
    fetchInsight();
  }, []);

  return (
    <div className="flex-1 flex flex-col relative min-h-0 transition-colors duration-300">
      <div className="h-[80px] px-8 flex items-center justify-between relative z-10 backdrop-blur-md bg-white/10 dark:bg-slate-900/50 border-b border-white/20 dark:border-slate-800/50">
        <span className="text-[#2A2D34] dark:text-slate-100 font-medium text-2xl">心港驿站</span>
        <div className="flex gap-4">
          <button onClick={() => onNavigate('mood-checkin')} className="w-10 h-10 rounded-full bg-white/40 dark:bg-slate-800/60 border border-white/20 dark:border-slate-700/50 flex items-center justify-center hover:bg-white/60 transition-colors">
            <Sun size={20} className="text-amber-400" />
          </button>
          <button onClick={() => onNavigate('profile')} className="w-10 h-10 rounded-full bg-white/40 dark:bg-slate-800/60 border border-white/20 dark:border-slate-700/50 flex items-center justify-center hover:bg-white/60 transition-colors">
            <User size={20} className="text-[#5D6979] dark:text-slate-300" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-8 py-8 relative z-10 hide-scrollbar pb-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white/30 dark:bg-slate-800/40 backdrop-blur-xl border border-white/40 dark:border-slate-700/30 p-8 rounded-[32px] shadow-sm">
              <p className="text-sm text-[#5D6979] dark:text-slate-400 mb-2">2026年03月17日</p>
              <h2 className="text-3xl font-semibold text-[#2A2D34] dark:text-slate-100">今日宜静心</h2>
              <div className="mt-6 p-6 bg-white/20 dark:bg-slate-700/30 rounded-2xl border border-white/30 dark:border-slate-600/30">
                <p className={cn("text-lg text-[#2A2D34] dark:text-slate-200 italic", isInsightLoading && "animate-pulse")}>
                  “ {insight} ”
                </p>
              </div>
              <div className="flex gap-6 mt-8">
                <div className="flex-1 bg-white/40 dark:bg-slate-700/40 p-6 rounded-3xl cursor-pointer hover:bg-white/50 transition-colors" onClick={() => onNavigate('stats')}>
                  <p className="text-xs text-[#5D6979] dark:text-slate-400 uppercase tracking-wider mb-2">压力指数</p>
                  <p className="text-3xl font-bold text-[#89CFF0]">42%</p>
                </div>
                <div className="flex-1 bg-white/40 dark:bg-slate-700/40 p-6 rounded-3xl cursor-pointer hover:bg-white/50 transition-colors" onClick={() => onNavigate('achievements')}>
                  <p className="text-xs text-[#5D6979] dark:text-slate-400 uppercase tracking-wider mb-2">已冥想</p>
                  <p className="text-3xl font-bold text-[#27AE60] dark:text-emerald-400">15m</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div onClick={() => onNavigate('explore')} className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md p-8 rounded-[32px] flex flex-col items-center justify-center cursor-pointer hover:bg-white/50 dark:hover:bg-slate-800/60 transition-colors border border-white/20 dark:border-slate-700/30 group">
                <div className="w-16 h-16 bg-white/50 dark:bg-slate-700/50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen size={32} className="text-[#89CFF0]" />
                </div>
                <span className="text-base font-medium text-[#2A2D34] dark:text-slate-200">冥想库</span>
                <span className="text-xs mt-2 text-[#5D6979] dark:text-slate-400">探索更多课程</span>
              </div>
              <div onClick={() => onNavigate('community')} className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md p-8 rounded-[32px] flex flex-col items-center justify-center cursor-pointer hover:bg-white/50 dark:hover:bg-slate-800/60 transition-colors border border-white/20 dark:border-slate-700/30 group">
                <div className="w-16 h-16 bg-white/50 dark:bg-slate-700/50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users size={32} className="text-[#E6E6FA] dark:text-indigo-300" />
                </div>
                <span className="text-base font-medium text-[#2A2D34] dark:text-slate-200">共鸣社区</span>
                <span className="text-xs mt-2 text-[#5D6979] dark:text-slate-400">遇见同频的人</span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium text-[#2A2D34] dark:text-slate-100 mb-4 px-2">AI 智能推荐</h3>
              <div className="relative group cursor-pointer" onClick={() => onNavigate('course-detail')}>
                <div className="absolute -inset-1 bg-gradient-to-r from-[#FFD8B1] to-[#E6E6FA] dark:from-amber-900/40 dark:to-indigo-900/40 rounded-[32px] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg rounded-[32px] overflow-hidden border border-white/20 dark:border-slate-700/30">
                  <img 
                    src="https://picsum.photos/seed/meditation/800/600" 
                    alt="Meditation" 
                    className="w-full h-64 object-cover opacity-80 dark:opacity-70 mix-blend-multiply dark:mix-blend-screen group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="p-6">
                    <span className="bg-[#FFD8B1] dark:bg-amber-900/60 text-[#2A2D34] dark:text-amber-100 text-xs px-3 py-1 rounded-full font-bold uppercase">AI 方案</span>
                    <h4 className="mt-4 text-xl font-medium dark:text-slate-100">午间片段：瞬时放松</h4>
                    <p className="text-sm text-[#5D6979] dark:text-slate-400 mt-2 leading-relaxed">适合在工作间隙缓解视觉疲劳与压力，快速恢复精力。</p>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => onNavigate('breathing')}
              className="w-full h-[80px] bg-[#FFD8B1] dark:bg-amber-900/60 rounded-[24px] flex items-center justify-center gap-4 shadow-lg shadow-orange-100 dark:shadow-none hover:scale-[0.98] transition-transform border border-transparent dark:border-amber-800/50 group"
            >
              <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center group-hover:bg-white/40 transition-colors">
                <Play size={24} fill="currentColor" className="text-[#2A2D34] dark:text-amber-100" />
              </div>
              <span className="font-semibold text-lg text-[#2A2D34] dark:text-amber-100">3分钟紧急平静</span>
            </button>
          </div>
        </div>
      </div>
  </div>
  );
};

const MoodCheckinView = ({ onNavigate }: { onNavigate: (id: PageId) => void }) => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const weathers = [
    { id: 'sunny', icon: Sun, label: '晴朗', color: 'text-amber-400' },
    { id: 'cool', icon: CloudSnow, label: '微凉', color: 'text-[#89CFF0]' },
    { id: 'cloudy', icon: CloudSun, label: '多云', color: 'text-[#E6E6FA]' },
    { id: 'rainy', icon: CloudRain, label: '阵雨', color: 'text-slate-400' },
  ];

  const handleConfirm = () => {
    if (selectedMood) {
      onNavigate('home');
    }
  };

  return (
    <div className="flex-1 flex flex-col relative min-h-0 transition-colors duration-300">
      <div className="h-[80px] px-12 items-center flex relative z-10">
        <button onClick={() => onNavigate('home')} className="hover:bg-slate-200/50 dark:hover:bg-slate-800/50 p-2 rounded-full transition-colors">
          <ChevronLeft size={32} className="text-[#5D6979] dark:text-slate-400" />
        </button>
        <span className="ml-6 text-[#2A2D34] dark:text-slate-100 font-medium text-xl">情绪天气</span>
      </div>
      <div className="flex-1 px-12 flex flex-col relative z-10 pt-16 items-center">
        <h1 className="text-5xl font-semibold text-[#2A2D34] dark:text-slate-100 leading-tight text-center mb-6">此刻你的心境<br/>更像哪种天气？</h1>
        <p className="text-xl text-[#5D6979] dark:text-slate-400 mt-4 text-center">AI将根据您的状态匹配背景音效</p>
        
        <div className="grid grid-cols-4 gap-8 mt-20 max-w-4xl w-full">
          {weathers.map((w) => (
            <div 
              key={w.id}
              onClick={() => setSelectedMood(w.id)}
              className={cn(
                "aspect-square bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-[40px] flex flex-col items-center justify-center transition-all cursor-pointer group border-4",
                selectedMood === w.id ? "border-[#89CFF0] bg-white/80 dark:bg-slate-800/80 scale-105 shadow-xl" : "border-transparent hover:border-[#89CFF0]/30 hover:scale-105"
              )}
            >
              <w.icon size={80} className={cn(w.color, "transition-transform group-hover:scale-110")} />
              <span className="mt-6 text-xl font-medium dark:text-slate-200">{w.label}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-auto mb-20 w-full max-w-md">
          <button 
            onClick={handleConfirm}
            disabled={!selectedMood}
            className={cn(
              "w-full py-6 rounded-3xl text-xl font-bold shadow-xl transition-all",
              selectedMood ? "bg-[#89CFF0] text-white shadow-blue-200 dark:shadow-blue-900/20 hover:scale-[1.02] active:scale-[0.98]" : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
            )}
          >
            确认并开启疗愈
          </button>
        </div>
      </div>
    </div>
  );
};

const BreathingView = ({ onNavigate }: { onNavigate: (id: PageId) => void }) => {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [timeLeft, setTimeLeft] = useState(180);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  useEffect(() => {
    let phaseInterval: any;
    if (isActive) {
      const cycle = () => {
        setPhase('inhale');
        setTimeout(() => setPhase('hold'), 4000);
        setTimeout(() => setPhase('exhale'), 8000);
      };
      cycle();
      phaseInterval = setInterval(cycle, 12000);
    }
    return () => clearInterval(phaseInterval);
  }, [isActive]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="flex-1 flex flex-col relative bg-[#E6E6FA]/20 dark:bg-slate-900 transition-colors duration-300 min-h-0">
      <div className="h-[80px] px-12 flex justify-between items-center relative z-10">
        <button onClick={() => onNavigate('home')} className="hover:bg-slate-200/50 dark:hover:bg-slate-800/50 p-2 rounded-full transition-colors">
          <X size={32} className="text-[#5D6979] dark:text-slate-400" />
        </button>
        <span className="text-[#2A2D34] dark:text-slate-200 text-lg font-semibold tracking-widest uppercase">深呼吸练习</span>
        <div className="w-12" />
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        <div className="relative flex items-center justify-center mb-32">
          <motion.div 
            animate={{ 
              scale: phase === 'inhale' ? 1.5 : phase === 'hold' ? 1.5 : 1,
              opacity: phase === 'inhale' ? 0.8 : phase === 'hold' ? 1 : 0.6
            }}
            transition={{ duration: 4, ease: "easeInOut" }}
            className="w-64 h-64 bg-[#FFD8B1] dark:bg-indigo-500/30 rounded-full blur-3xl absolute"
          />
          <motion.div 
            animate={{ 
              scale: phase === 'inhale' ? 1.6 : phase === 'hold' ? 1.6 : 1
            }}
            transition={{ duration: 4, ease: "easeInOut" }}
            className="w-96 h-96 border-4 border-[#FFD8B1]/30 dark:border-indigo-500/20 rounded-full absolute"
          />
          <div className="w-48 h-48 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-full shadow-inner flex items-center justify-center z-20 transition-colors duration-300">
            <span className="text-[#2A2D34] dark:text-slate-200 font-light text-5xl tracking-tighter">
              {phase === 'inhale' ? '吸气' : phase === 'hold' ? '屏息' : '呼气'}
            </span>
          </div>
        </div>
        
        <div className="text-center space-y-4">
          <p className="text-[#2A2D34] dark:text-slate-100 text-4xl font-bold">{formatTime(timeLeft)}</p>
          <p className="text-[#5D6979] dark:text-slate-400 text-xl">跟随圆圈的节奏，平稳呼吸</p>
        </div>
        
        <button 
          onClick={() => setIsActive(!isActive)}
          className={cn(
            "mt-20 px-20 py-6 rounded-full font-bold text-2xl text-white shadow-xl transition-all active:scale-95 hover:scale-105",
            isActive ? "bg-rose-400 shadow-rose-200 dark:shadow-rose-900/20" : "bg-[#89CFF0] shadow-blue-200 dark:shadow-blue-900/20"
          )}
        >
          {isActive ? '暂停' : '开始练习'}
        </button>
      </div>
    </div>
  );
};

const StatsView = ({ onNavigate }: { onNavigate: (id: PageId) => void }) => (
  <div className="flex-1 flex flex-col relative min-h-0 transition-colors duration-300">
    <div className="h-[80px] px-12 flex items-center justify-between relative z-10">
      <h1 className="text-[#2A2D34] dark:text-slate-100 font-medium text-2xl">统计回顾</h1>
      <Calendar size={28} className="text-[#5D6979] dark:text-slate-400" />
    </div>
    <div className="flex-1 px-12 py-10 space-y-10 relative z-10 overflow-y-auto hide-scrollbar pb-32">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-7xl mx-auto">
        <div className="bg-white/50 dark:bg-slate-800/50 border border-white dark:border-slate-700 p-10 rounded-[40px] shadow-sm backdrop-blur-lg transition-colors duration-300">
          <div className="flex justify-between items-end mb-10">
            <div>
              <p className="text-sm text-[#5D6979] dark:text-slate-400 uppercase tracking-wider">本周心情起伏</p>
              <h3 className="text-3xl font-semibold text-[#2A2D34] dark:text-slate-200 mt-2">稳步回升</h3>
            </div>
            <span className="text-lg font-medium text-[#27AE60] dark:text-emerald-400 bg-[#27AE60]/10 dark:bg-emerald-400/10 px-4 py-2 rounded-xl">+12% 平静度</span>
          </div>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={moodData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#89CFF0" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#89CFF0" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', fontSize: '16px', padding: '12px 20px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#89CFF0" 
                  strokeWidth={6}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/50 dark:bg-slate-800/50 border border-white dark:border-slate-700 p-10 rounded-[40px] shadow-sm backdrop-blur-lg transition-colors duration-300">
          <div className="flex justify-between items-end mb-10">
            <div>
              <p className="text-sm text-[#5D6979] dark:text-slate-400 uppercase tracking-wider">本周冥想时长 (分钟)</p>
              <h3 className="text-3xl font-semibold text-[#2A2D34] dark:text-slate-200 mt-2">深度专注</h3>
            </div>
            <span className="text-lg font-medium text-[#89CFF0] dark:text-[#89CFF0] bg-[#89CFF0]/10 dark:bg-[#89CFF0]/20 px-4 py-2 rounded-xl">共 185 分钟</span>
          </div>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={meditationData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 14, fill: '#94a3b8' }} dy={10} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', fontSize: '16px', padding: '12px 20px' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {meditationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 5 ? '#89CFF0' : '#E6E6FA'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto bg-white/50 dark:bg-slate-800/50 border border-white dark:border-slate-700 p-10 rounded-[40px] shadow-sm backdrop-blur-lg space-y-6 transition-colors duration-300">
        <h3 className="text-2xl font-medium dark:text-slate-200">心理洞察</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex gap-4">
            <div className="w-2 bg-[#89CFF0] rounded-full" />
            <p className="text-lg text-[#5D6979] dark:text-slate-400 leading-relaxed">过去7天，你在早晨的焦虑感显著降低，这可能与你坚持清晨的“5分钟呼吸练习”有关。</p>
          </div>
          <div className="flex gap-4">
            <div className="w-2 bg-[#E6E6FA] dark:bg-indigo-400 rounded-full" />
            <p className="text-lg text-[#5D6979] dark:text-slate-400 leading-relaxed">周三晚间压力峰值明显，建议下周此时段安排一次“深度冥想”。</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-2 gap-10">
        <div className="bg-[#FFD8B1]/20 dark:bg-[#FFD8B1]/10 border border-[#FFD8B1]/30 dark:border-[#FFD8B1]/20 p-8 rounded-[40px] text-center transition-colors duration-300">
          <Medal className="mx-auto text-[#FFD8B1]" size={48} />
          <p className="text-sm mt-4 text-[#5D6979] dark:text-slate-400 uppercase tracking-wider">连胜天数</p>
          <p className="text-4xl font-bold dark:text-slate-200 mt-2">12</p>
        </div>
        <div className="bg-[#98FF98]/20 dark:bg-[#98FF98]/10 border border-[#98FF98]/30 dark:border-[#98FF98]/20 p-8 rounded-[40px] text-center transition-colors duration-300">
          <Ghost className="mx-auto text-emerald-500 dark:text-emerald-400" size={48} />
          <p className="text-sm mt-4 text-[#5D6979] dark:text-slate-400 uppercase tracking-wider">治愈瞬间</p>
          <p className="text-4xl font-bold dark:text-slate-200 mt-2">84</p>
        </div>
      </div>
    </div>
  </div>
);

const DiaryView = ({ onNavigate }: { onNavigate: (id: PageId) => void }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());

  const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const firstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  const days = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let i = 1; i <= totalDays; i++) days.push(i);

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const isToday = (d: number) => {
    const today = new Date();
    return d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const isSelected = (d: number) => {
    return d === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();
  };

  // Mock mood data for calendar dots
  const moodDots: Record<number, string> = {
    10: 'bg-amber-400',
    12: 'bg-[#89CFF0]',
    15: 'bg-[#E6E6FA]',
    17: 'bg-emerald-400',
  };

  return (
    <div className="flex-1 flex flex-col relative min-h-0 transition-colors duration-300">
      <div className="h-[80px] px-8 flex items-center justify-between relative z-10 border-b border-white/20 dark:border-slate-800/50 backdrop-blur-md bg-white/10 dark:bg-slate-900/50">
        <h1 className="text-2xl text-[#2A2D34] dark:text-slate-100 font-medium">心迹回顾</h1>
        <div className="flex gap-4">
          <button onClick={() => onNavigate('tree-hole')} className="w-10 h-10 rounded-full bg-white/40 dark:bg-slate-800/60 flex items-center justify-center hover:bg-white/60 transition-colors">
            <Flame size={20} className="text-amber-400 dark:text-amber-500" />
          </button>
          <button onClick={() => onNavigate('mood-checkin')} className="w-10 h-10 rounded-full bg-white/40 dark:bg-slate-800/60 flex items-center justify-center hover:bg-white/60 transition-colors">
            <PenSquare size={20} className="text-[#89CFF0] dark:text-[#89CFF0]" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-8 py-8 relative z-10 hide-scrollbar pb-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Calendar Card */}
          <div>
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white dark:border-slate-700 p-8 rounded-[32px] shadow-sm transition-colors duration-300">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-[#2A2D34] dark:text-slate-200">{year}年 {month + 1}月</h2>
                <div className="flex gap-4">
                  <button onClick={prevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                    <ChevronLeft size={20} className="text-[#5D6979] dark:text-slate-400" />
                  </button>
                  <button onClick={nextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                    <ChevronRight size={20} className="text-[#5D6979] dark:text-slate-400" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-y-6 text-center">
                {['日', '一', '二', '三', '四', '五', '六'].map(d => (
                  <span key={d} className="text-sm font-bold text-slate-300 dark:text-slate-500 uppercase">{d}</span>
                ))}
                {days.map((d, i) => (
                  <div key={i} className="flex flex-col items-center justify-center h-12 relative">
                    {d && (
                      <button
                        onClick={() => setSelectedDate(new Date(year, month, d))}
                        className={cn(
                          "w-10 h-10 rounded-full text-sm flex items-center justify-center transition-all relative hover:bg-slate-100 dark:hover:bg-slate-700",
                          isSelected(d) ? "bg-[#89CFF0] hover:bg-[#89CFF0] text-white shadow-lg shadow-blue-100 dark:shadow-blue-900/20 font-bold" : 
                          isToday(d) ? "text-[#89CFF0] font-bold" : "text-[#2A2D34] dark:text-slate-300"
                        )}
                      >
                        {d}
                        {moodDots[d] && !isSelected(d) && (
                          <span className={cn("absolute -bottom-1.5 w-1.5 h-1.5 rounded-full", moodDots[d])} />
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Selected Day Entries */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-lg font-bold text-[#2A2D34] dark:text-slate-200">
                {selectedDate.getMonth() + 1}月{selectedDate.getDate()}日 的记录
              </h3>
              <span className="text-sm text-slate-400 dark:text-slate-500">共 {isSelected(17) ? '2' : '0'} 条记录</span>
            </div>

            {isSelected(17) ? (
              <div className="space-y-6">
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white dark:border-slate-700 p-6 rounded-[32px] shadow-sm transition-colors duration-300 hover:shadow-md">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold text-[#E6E6FA] dark:text-indigo-300 tracking-tighter uppercase">11:24</span>
                    <Sun size={18} className="text-amber-300 dark:text-amber-400" />
                  </div>
                  <p className="text-base text-[#2A2D34] dark:text-slate-300 leading-relaxed">完成了早晨的冥想后，感觉整个人的重心都放低了。原本担心的项目会议，也能够以更平稳的心态去复盘...</p>
                  <div className="mt-6 flex gap-3">
                    <span className="text-xs px-3 py-1 bg-[#89CFF0]/10 dark:bg-[#89CFF0]/20 text-[#89CFF0] rounded-md">午间思考</span>
                    <span className="text-xs px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-400 rounded-md">#职场稳态</span>
                  </div>
                </div>

                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white dark:border-slate-700 p-6 rounded-[32px] shadow-sm transition-colors duration-300 hover:shadow-md">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold text-[#5D6979] dark:text-slate-400 tracking-tighter uppercase">08:15</span>
                    <Wind size={18} className="text-[#89CFF0] dark:text-[#89CFF0]" />
                  </div>
                  <p className="text-base text-[#2A2D34] dark:text-slate-300 leading-relaxed">晨间呼吸练习，空气很清新。今天也要加油。</p>
                </div>
              </div>
            ) : (
              <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-dashed border-slate-200 dark:border-slate-700 p-12 rounded-[32px] text-center transition-colors duration-300 flex flex-col items-center justify-center h-full min-h-[300px]">
                <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">这一天还没有留下文字记录</p>
                <button 
                  onClick={() => onNavigate('mood-checkin')}
                  className="px-6 py-3 bg-[#89CFF0] text-white rounded-xl text-sm font-bold hover:bg-blue-400 transition-colors shadow-sm"
                >
                  去记录此刻心情 →
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-16 h-20 flex items-center justify-center text-sm text-[#5D6979]/40 dark:text-slate-500/50 font-light">
          —— 你的文字，是时间的温柔回响 ——
        </div>
      </div>
    </div>
  );
};

const ExploreView = ({ onNavigate, onPlay }: { onNavigate: (id: PageId) => void, onPlay: (session: Session) => void }) => {
  const categories = ['全部', '睡眠', '专注', '放松', '冥想'];
  const [activeCategory, setActiveCategory] = useState('全部');

  return (
  <div className="flex-1 flex flex-col relative min-h-0 transition-colors duration-300">
    <div className="h-[80px] px-8 flex items-center justify-between relative z-10 border-b border-white/20 dark:border-slate-800/50 backdrop-blur-md bg-white/10 dark:bg-slate-900/50">
      <h1 className="text-2xl text-[#2A2D34] dark:text-slate-100 font-medium">我的白噪音库</h1>
      <div className="w-10 h-10 rounded-full bg-white/40 dark:bg-slate-800/60 flex items-center justify-center cursor-pointer hover:bg-white/60 transition-colors">
        <Search size={20} className="text-[#5D6979] dark:text-slate-400" />
      </div>
    </div>
    <div className="flex-1 overflow-y-auto px-8 py-8 relative z-10 hide-scrollbar pb-24">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex gap-4 overflow-x-auto hide-scrollbar mb-6">
          {categories.map(c => (
            <button 
              key={c} 
              onClick={() => setActiveCategory(c)} 
              className={cn(
                "px-6 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors", 
                activeCategory === c 
                  ? "bg-[#2A2D34] dark:bg-slate-100 text-white dark:text-slate-900" 
                  : "bg-white/50 dark:bg-slate-800/50 text-[#5D6979] dark:text-slate-400 border border-white/20 dark:border-slate-700/30 hover:bg-white/80"
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {[
            { title: '林间清风', icon: Wind, color: 'bg-[#89CFF0]/20 dark:bg-[#89CFF0]/10', iconColor: 'text-[#89CFF0] dark:text-[#89CFF0]', count: '1,240', audioUrl: 'webaudio://pink' },
            { title: '壁炉火光', icon: Flame, color: 'bg-[#FFD8B1]/20 dark:bg-[#FFD8B1]/10', iconColor: 'text-[#FFD8B1] dark:text-[#FFD8B1]', count: '2,103', audioUrl: 'webaudio://brown' },
            { title: '深海共鸣', icon: Ghost, color: 'bg-[#E6E6FA]/20 dark:bg-[#E6E6FA]/10', iconColor: 'text-[#E6E6FA] dark:text-[#E6E6FA]', count: '856', audioUrl: 'webaudio://brown' },
            { title: '夏日雨声', icon: CloudRain, color: 'bg-slate-100 dark:bg-slate-800', iconColor: 'text-slate-400 dark:text-slate-300', count: '3,412', audioUrl: 'webaudio://pink' },
            { title: '秋日落叶', icon: Leaf, color: 'bg-amber-100 dark:bg-amber-900/30', iconColor: 'text-amber-500 dark:text-amber-400', count: '1,892', audioUrl: 'webaudio://pink' },
            { title: '静谧星空', icon: Moon, color: 'bg-indigo-100 dark:bg-indigo-900/30', iconColor: 'text-indigo-500 dark:text-indigo-400', count: '4,521', audioUrl: 'webaudio://white' },
          ].map((item, i) => (
            <div 
              key={i} 
              className="bg-white/60 dark:bg-slate-800/60 p-6 rounded-[32px] border border-white dark:border-slate-700/30 shadow-sm cursor-pointer hover:scale-[1.02] hover:shadow-md transition-all group"
              onClick={() => onPlay({
                id: `white-noise-${i}`,
                title: item.title,
                author: '白噪音',
                duration: '∞',
                cover: `https://picsum.photos/seed/${item.title}/400/400`,
                audioUrl: item.audioUrl
              })}
            >
              <div className={cn("w-full aspect-square rounded-3xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform", item.color)}>
                <item.icon size={48} className={item.iconColor} />
              </div>
              <p className="font-medium text-base dark:text-slate-200">{item.title}</p>
              <p className="text-xs text-[#5D6979] dark:text-slate-400 mt-1">{item.count} 人正在听</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
  );
};

const HealingView = ({ onNavigate }: { onNavigate: (id: PageId) => void }) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('healing_chat_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      } catch (e) {
        console.error('Failed to parse chat history', e);
      }
    }
    return [
      {
        id: '1',
        text: '你好，我是你的AI心理伙伴。感觉到你今天的情绪似乎有些低落，愿意和我聊聊发生了什么吗？',
        sender: 'ai',
        timestamp: new Date()
      }
    ];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    localStorage.setItem('healing_chat_history', JSON.stringify(messages));
  }, [messages]);

  const clearHistory = () => {
    const initialMessage: Message = {
      id: Date.now().toString(),
      text: '你好，我是你的AI心理伙伴。感觉到你今天的情绪似乎有些低落，愿意和我聊聊发生了什么吗？',
      sender: 'ai',
      timestamp: new Date()
    };
    setMessages([initialMessage]);
    localStorage.removeItem('healing_chat_history');
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      let rawContents = [...messages, userMessage].map(msg => ({
        role: msg.sender === 'ai' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));

      // 1. Ensure the first message is from 'user'
      while (rawContents.length > 0 && rawContents[0].role === 'model') {
        rawContents.shift();
      }

      // 2. Ensure alternating roles by merging consecutive messages from the same role
      const contents = [];
      for (const msg of rawContents) {
        if (contents.length === 0) {
          contents.push(msg);
        } else {
          const lastMsg = contents[contents.length - 1];
          if (lastMsg.role === msg.role) {
            lastMsg.parts[0].text += '\n\n' + msg.parts[0].text;
          } else {
            contents.push(msg);
          }
        }
      }

      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: contents,
        config: {
          systemInstruction: "你是一个名为Serene的专业心理咨询师。你的目标是提供情感支持、心理疏导和建议。保持简洁、温暖且专业的语气。如果用户表现出严重的心理问题或自残倾向，请引导他们寻求专业医疗帮助。"
        }
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text || '抱歉，我现在无法回应。请稍后再试。',
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('AI Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `抱歉，连接AI伙伴时出了点问题。错误信息：${error?.message || '未知错误'}。请检查网络或稍后再试。`,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col relative min-h-0 transition-colors duration-300">
      <div className="h-[80px] px-8 flex items-center border-b border-gray-100 dark:border-slate-800 bg-white/10 dark:bg-slate-900/50 backdrop-blur-md relative z-10 flex-shrink-0 transition-colors duration-300">
        <div className="w-10 h-10 bg-[#89CFF0] dark:bg-indigo-600 rounded-full flex items-center justify-center mr-4 transition-colors duration-300 shadow-sm">
          <Ghost size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-[#2A2D34] dark:text-slate-100">AI 心理伙伴 Serene</h2>
          <p className="text-xs text-emerald-500 flex items-center mt-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-1.5" />
            在线倾听中
          </p>
        </div>
        <div className="flex gap-4">
          <button onClick={clearHistory} className="text-sm text-slate-400 dark:text-slate-500 font-medium border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-300">
            清空记录
          </button>
          <button onClick={() => onNavigate('assessment')} className="text-sm text-[#89CFF0] dark:text-indigo-400 font-medium border border-[#89CFF0]/20 dark:border-indigo-500/30 px-4 py-2 rounded-full hover:bg-blue-50 dark:hover:bg-indigo-500/10 transition-colors duration-300">
            压力评估
          </button>
        </div>
      </div>
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden min-h-0 max-w-4xl mx-auto w-full">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 hide-scrollbar min-h-0 pb-4">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex gap-4", msg.sender === 'user' ? "flex-row-reverse" : "")}>
              {msg.sender === 'ai' && (
                <div className="w-10 h-10 bg-[#89CFF0]/20 dark:bg-indigo-500/20 rounded-xl flex-shrink-0 flex items-center justify-center transition-colors duration-300">
                  <Ghost size={20} className="text-[#89CFF0] dark:text-indigo-400" />
                </div>
              )}
              <div className={cn("flex flex-col max-w-[70%]", msg.sender === 'user' ? "items-end" : "items-start")}>
                <div className={cn(
                  "p-4 rounded-3xl shadow-sm border transition-colors duration-300",
                  msg.sender === 'ai' 
                    ? "bg-white dark:bg-slate-800 rounded-tl-none border-gray-100 dark:border-slate-700 text-[#2A2D34] dark:text-slate-200" 
                    : "bg-[#89CFF0] dark:bg-indigo-600 rounded-tr-none border-[#89CFF0] dark:border-indigo-600 text-white"
                )}>
                  {msg.sender === 'ai' ? (
                    <div className="text-sm leading-relaxed">
                      <Markdown
                        components={{
                          p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 last:mb-0" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3 last:mb-0" {...props} />,
                          li: ({node, ...props}) => <li className="mb-1" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-bold text-gray-800 dark:text-slate-100">“{props.children}”</strong>,
                        }}
                      >
                        {msg.text}
                      </Markdown>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  )}
                </div>
                <span className="text-xs text-gray-400 dark:text-slate-500 mt-2 px-2">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-[#89CFF0]/20 dark:bg-indigo-500/20 rounded-xl flex-shrink-0 flex items-center justify-center transition-colors duration-300">
                <Ghost size={20} className="text-[#89CFF0] dark:text-indigo-400" />
              </div>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl rounded-tl-none shadow-sm border border-gray-100 dark:border-slate-700 transition-colors duration-300">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-[#89CFF0] dark:bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-[#89CFF0] dark:bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-[#89CFF0] dark:bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="p-6 bg-transparent mb-8 transition-colors duration-300">
          <div className="flex gap-4 bg-white dark:bg-slate-800 p-2 rounded-full shadow-lg border border-slate-100 dark:border-slate-700">
            <div className="flex-1 rounded-full px-6 py-3 flex items-center transition-colors duration-300">
              <input 
                className="bg-transparent border-none focus:outline-none text-sm w-full dark:text-slate-200 dark:placeholder-slate-500" 
                placeholder="输入你想说的..." 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
            </div>
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center text-white transition-colors",
                isLoading || !input.trim() ? "bg-slate-300 dark:bg-slate-700" : "bg-[#89CFF0] dark:bg-indigo-600 hover:bg-blue-400"
              )}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileView = ({ onNavigate }: { onNavigate: (id: PageId) => void }) => (
  <div className="flex-1 flex flex-col relative min-h-0 transition-colors duration-300">
    <div className="h-[320px] bg-gradient-to-br from-[#E6E6FA] to-[#F8F8FF] dark:from-indigo-900/40 dark:to-slate-900 relative flex flex-col items-center justify-center transition-colors duration-300">
      <div className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 shadow-lg overflow-hidden mb-4">
        <img 
          className="w-full h-full object-cover" 
          src="https://picsum.photos/seed/avatar/200/200" 
          alt="Avatar"
          referrerPolicy="no-referrer"
        />
      </div>
      <h2 className="text-2xl font-bold text-[#2A2D34] dark:text-slate-100">沐浴时光</h2>
      <p className="text-sm text-[#5D6979] dark:text-slate-400 mt-2">加入 心港驿站 第 342 天</p>
      <p className="text-sm text-[#2A2D34]/70 dark:text-slate-300 mt-3 px-8 text-center max-w-md">“在喧嚣的世界里，寻找内心的宁静与平和。”</p>
    </div>
    <div className="flex-1 px-8 space-y-8 pt-8 relative z-10 overflow-y-auto hide-scrollbar pb-24 max-w-4xl mx-auto w-full">
      <div className="grid grid-cols-3 gap-6 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 p-4 rounded-2xl transition-colors" onClick={() => onNavigate('duration-stats')}>
          <p className="text-3xl font-bold text-[#2A2D34] dark:text-slate-100 mb-1">4.2k</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">累计时长</p>
        </div>
        <div className="text-center border-x border-slate-100 dark:border-slate-700 p-4">
          <p className="text-3xl font-bold text-[#2A2D34] dark:text-slate-100 mb-1">56</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">已修课程</p>
        </div>
        <div className="text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 p-4 rounded-2xl transition-colors" onClick={() => onNavigate('moments')}>
          <p className="text-3xl font-bold text-[#2A2D34] dark:text-slate-100 mb-1">128</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">收藏瞬间</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div onClick={() => onNavigate('stats')} className="flex items-center justify-between p-6 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all cursor-pointer group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#89CFF0]/10 dark:bg-[#89CFF0]/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <History size={24} className="text-[#89CFF0] dark:text-[#89CFF0]" />
            </div>
            <span className="text-base font-medium dark:text-slate-200">最近练习记录</span>
          </div>
          <SkipForward size={20} className="text-slate-300 dark:text-slate-600 group-hover:text-[#89CFF0] transition-colors" />
        </div>
        <div onClick={() => onNavigate('achievements')} className="flex items-center justify-between p-6 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all cursor-pointer group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#FFD8B1]/10 dark:bg-[#FFD8B1]/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Trophy size={24} className="text-[#FFD8B1] dark:text-[#FFD8B1]" />
            </div>
            <span className="text-base font-medium dark:text-slate-200">我的成就勋章</span>
          </div>
          <SkipForward size={20} className="text-slate-300 dark:text-slate-600 group-hover:text-[#FFD8B1] transition-colors" />
        </div>
        <div onClick={() => onNavigate('settings')} className="flex items-center justify-between p-6 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all cursor-pointer group col-span-2">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-400/10 dark:bg-indigo-400/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Settings size={24} className="text-indigo-400 dark:text-indigo-400" />
            </div>
            <span className="text-base font-medium dark:text-slate-200">偏好与设置</span>
          </div>
          <SkipForward size={20} className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-400 transition-colors" />
        </div>
      </div>

      <div className="p-6 bg-gradient-to-r from-[#89CFF0]/10 to-[#89CFF0]/5 dark:from-[#89CFF0]/10 dark:to-transparent rounded-3xl border border-[#89CFF0]/20 dark:border-[#89CFF0]/10">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-base font-bold text-[#89CFF0] dark:text-[#89CFF0] mb-1">心港驿站 Pro</p>
            <p className="text-sm text-[#5D6979] dark:text-slate-400">尊享 200+ 专属疗愈音频，解锁全部高级功能</p>
          </div>
          <button className="px-6 py-2.5 bg-[#89CFF0] dark:bg-[#89CFF0]/80 hover:bg-[#89CFF0]/90 text-white text-sm rounded-full font-bold transition-colors shadow-sm">查看详情</button>
        </div>
      </div>
    </div>
  </div>
);

const PlayerView = ({ onNavigate, session }: { onNavigate: (id: PageId) => void, session: Session | null }) => {
  const displaySession = session || {
    id: 'default',
    title: '晨间唤醒冥想',
    author: '引导语：李思远 心理师',
    duration: '15:00',
    cover: 'https://picsum.photos/seed/nature/400/400',
    audioUrl: 'webaudio://pink'
  };

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const isWebAudio = displaySession.audioUrl?.startsWith('webaudio://');
  useWebAudioNoise(displaySession.audioUrl || '', isPlaying);

  useEffect(() => {
    if (audioRef.current && !isWebAudio) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, isWebAudio]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && !isWebAudio) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && !isWebAudio) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return "∞";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isWebAudio) return;
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const progress = isWebAudio ? 100 : (duration > 0 ? (currentTime / duration) * 100 : 0);

  return (
    <div className="h-full flex flex-col relative bg-[#1A1C22] text-white overflow-hidden">
      {/* Dynamic Immersive Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src={displaySession.cover} 
          alt="" 
          className="w-full h-full object-cover blur-3xl opacity-40 scale-125" 
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1C22] via-transparent to-[#1A1C22]/80" />
      </div>

      <div className="h-[80px] px-8 flex items-center justify-between relative z-10 max-w-5xl mx-auto w-full">
        <button onClick={() => onNavigate('home')} className="p-3 -ml-3 hover:bg-white/10 rounded-full transition-colors">
          <ChevronLeft size={28} />
        </button>
        <div className="text-center">
          <p className="text-xs text-white/50 uppercase tracking-widest font-medium">正在播放</p>
          <p className="text-sm font-medium text-white/90 mt-1">{displaySession.title}</p>
        </div>
        <button className="p-3 -mr-3 hover:bg-white/10 rounded-full transition-colors">
          <Share2 size={24} />
        </button>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10 max-w-3xl mx-auto w-full">
        <motion.div 
          animate={isPlaying ? { scale: [1, 1.05, 1] } : { scale: 1 }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-96 h-96 flex items-center justify-center mb-16"
        >
          {/* Outer glow rings */}
          {isPlaying && (
            <>
              <motion.div 
                animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.1, 0.3] }} 
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} 
                className="absolute inset-0 rounded-full bg-white/10" 
              />
              <motion.div 
                animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0, 0.15] }} 
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }} 
                className="absolute inset-0 rounded-full bg-white/5" 
              />
            </>
          )}
          <img 
            className={cn(
              "w-80 h-80 rounded-full object-cover shadow-[0_0_60px_rgba(0,0,0,0.5)] border-4 border-white/10 transition-all duration-1000 z-10", 
              isPlaying ? "scale-100" : "scale-95 grayscale-[30%]"
            )} 
            src={displaySession.cover} 
            alt="Cover"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        
        <div className="text-center mb-12 w-full">
          <h2 className="text-white text-3xl font-bold tracking-tight">{displaySession.title}</h2>
          <p className="text-white/60 text-base mt-3 font-medium">{displaySession.author}</p>
        </div>
        
        {isWebAudio ? (
          <div className="w-full flex flex-col items-center justify-center space-y-4 mb-12 h-[60px]">
            <div className="flex items-center justify-center space-x-2 h-8">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={isPlaying ? { height: ['20%', '100%', '20%'] } : { height: '20%' }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
                  className="w-1.5 bg-white/50 rounded-full"
                />
              ))}
            </div>
            <span className="text-xs text-white/40 tracking-[0.2em] uppercase font-medium">无限环境音</span>
          </div>
        ) : (
          <div className="w-full space-y-4 mb-12">
            <div className="relative h-2 w-full bg-white/10 rounded-full overflow-hidden group cursor-pointer">
              <div className="absolute top-0 left-0 h-full bg-white/80 transition-all duration-100" style={{ width: `${progress}%` }} />
              <input 
                type="range" 
                min="0" 
                max={duration || 100} 
                value={currentTime} 
                onChange={handleSeek}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <div className="flex justify-between text-sm font-medium text-white/50">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between w-full px-12">
          <Shuffle size={24} className={cn("transition-colors", isWebAudio ? "text-white/20 cursor-not-allowed" : "text-white/40 cursor-pointer hover:text-white/80")} />
          <SkipBack 
            size={36} 
            className={cn("transition-colors", isWebAudio ? "text-white/20 cursor-not-allowed" : "text-white/80 cursor-pointer hover:text-white")} 
            onClick={() => {
              if (audioRef.current && !isWebAudio) {
                audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
              }
            }}
          />
          <div 
            className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.2)] cursor-pointer hover:scale-105 active:scale-95 transition-all"
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Pause size={36} fill="#1A1C22" className="text-[#1A1C22]" />
            ) : (
              <Play size={36} fill="#1A1C22" className="text-[#1A1C22] ml-1" />
            )}
          </div>
          <SkipForward 
            size={36} 
            className={cn("transition-colors", isWebAudio ? "text-white/20 cursor-not-allowed" : "text-white/80 cursor-pointer hover:text-white")} 
            onClick={() => {
              if (audioRef.current && !isWebAudio) {
                audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10);
              }
            }}
          />
          <Repeat size={24} className={cn("transition-colors", isWebAudio ? "text-white/20 cursor-not-allowed" : "text-white/40 cursor-pointer hover:text-white/80")} />
        </div>
      </div>
      
      {/* Hidden Audio Element */}
      {displaySession.audioUrl && !isWebAudio && (
        <audio 
          ref={audioRef} 
          src={displaySession.audioUrl} 
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />
      )}
    </div>
  );
};

const SettingsView = ({ onNavigate, isDarkMode, toggleDarkMode, onLogout }: { onNavigate: (id: PageId) => void, isDarkMode: boolean, toggleDarkMode: () => void, onLogout: () => void }) => (
  <div className="flex-1 flex flex-col relative min-h-0">
    <div className="h-[80px] px-8 flex items-center bg-white dark:bg-slate-950 relative z-10 transition-colors duration-300 border-b border-gray-100 dark:border-slate-800">
      <button onClick={() => onNavigate('profile')} className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors mr-4">
        <ChevronLeft size={28} className="text-[#2A2D34] dark:text-slate-200" />
      </button>
      <h1 className="text-xl text-[#2A2D34] dark:text-slate-100 font-bold">应用设置</h1>
    </div>
    <div className="flex-1 overflow-y-auto px-8 py-8 space-y-10 relative z-10 hide-scrollbar max-w-3xl mx-auto w-full">
      <div className="space-y-4">
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest px-2">基础设置</p>
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 space-y-8 transition-colors duration-300 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between cursor-pointer group" onClick={toggleDarkMode}>
            <span className="text-base font-medium dark:text-slate-200 group-hover:text-[#89CFF0] transition-colors">深色模式</span>
            <div className={cn("w-12 h-6 rounded-full relative transition-colors duration-300", isDarkMode ? "bg-[#89CFF0]" : "bg-slate-200 dark:bg-slate-700")}>
              <motion.div 
                className="absolute top-1 w-4 h-4 bg-white rounded-full"
                animate={{ left: isDarkMode ? '1.5rem' : '0.25rem' }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between cursor-pointer group">
            <span className="text-base font-medium dark:text-slate-200 group-hover:text-[#89CFF0] transition-colors">消息通知</span>
            <div className="w-12 h-6 bg-[#89CFF0] rounded-full relative transition-colors duration-300">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest px-2">隐私与服务</p>
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 space-y-8 transition-colors duration-300 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between cursor-pointer group">
            <span className="text-base font-medium dark:text-slate-200 group-hover:text-[#89CFF0] transition-colors">账号隐私设置</span>
            <SkipForward size={20} className="text-slate-300 dark:text-slate-600 group-hover:text-[#89CFF0] transition-colors" />
          </div>
          <div className="flex items-center justify-between cursor-pointer group">
            <span className="text-base font-medium dark:text-slate-200 group-hover:text-[#89CFF0] transition-colors">清除本地缓存</span>
            <span className="text-sm text-slate-400">128 MB</span>
          </div>
        </div>
      </div>

      <button onClick={onLogout} className="w-full py-4 text-red-500 dark:text-red-400 text-base font-bold hover:bg-red-50 dark:hover:bg-red-900/20 rounded-3xl transition-colors border border-red-100 dark:border-red-900/30">退出登录</button>
      
      <div className="text-center pt-12 pb-8">
        <p className="text-xs text-slate-400 dark:text-slate-500">© 2026 心港驿站 AI. All rights reserved.</p>
      </div>
    </div>
  </div>
);

const CommunityPost = ({ user, time, content, images, initialLikes, comments }: any) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [showPopper, setShowPopper] = useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleLike = () => {
    if (!isLiked) {
      setShowPopper(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setShowPopper(false), 800);
    } else {
      setShowPopper(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
    setIsLiked(!isLiked);
    setLikeCount((prev: number) => isLiked ? prev - 1 : prev + 1);
  };

  // Clean up timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[24px] p-5 space-y-4 transition-colors duration-300">
      <div className="flex items-center gap-3">
        <img className="w-10 h-10 rounded-full" src={user.avatar} alt="User" />
        <div>
          <p className="text-xs font-bold dark:text-slate-200">{user.name}</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">{time}</p>
        </div>
      </div>
      <p className="text-sm text-[#2A2D34] dark:text-slate-300 leading-relaxed">{content}</p>
      {images && images.length > 0 && (
        <div className={cn("grid gap-4", images.length === 1 ? "grid-cols-1" : "grid-cols-2")}>
          {images.map((img: string, i: number) => (
            <img key={i} className="rounded-2xl w-full h-48 md:h-64 object-cover" src={img} alt="Post" />
          ))}
        </div>
      )}
      <div className="flex justify-between pt-2">
        <div className="flex gap-4">
          <button 
            onClick={handleLike}
            className={cn("flex items-center gap-1 text-[10px] transition-colors relative", isLiked ? "text-rose-500" : "text-slate-400 dark:text-slate-500")}
          >
            <motion.div
              animate={isLiked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
              transition={{ duration: 0.3, type: "tween" }}
            >
              <Heart size={14} fill={isLiked ? "currentColor" : "none"} />
            </motion.div>
            <AnimatePresence>
              {showPopper && (
                <motion.div
                  initial={{ opacity: 1, y: 0, scale: 0.5 }}
                  animate={{ opacity: 0, y: -30, scale: 1.5 }}
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute -top-4 left-0 text-rose-500 pointer-events-none"
                >
                  <Heart size={14} fill="currentColor" />
                </motion.div>
              )}
            </AnimatePresence>
            <span>{likeCount}</span>
          </button>
          <button className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 hover:text-[#89CFF0] dark:hover:text-[#89CFF0] transition-colors">
            <MessageCircle size={14} /> {comments}
          </button>
        </div>
        <button className="text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 transition-colors">
          <Share2 size={14} />
        </button>
      </div>
    </div>
  );
};

const CommunityView = ({ onNavigate }: { onNavigate: (id: PageId) => void }) => (
  <div className="flex-1 flex flex-col relative min-h-0 transition-colors duration-300">
    <div className="h-[80px] px-8 flex items-center justify-between relative z-10 border-b border-slate-50 dark:border-slate-800 transition-colors duration-300 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
      <h1 className="text-xl text-[#2A2D34] dark:text-slate-100 font-bold">共鸣社区</h1>
      <Users size={24} className="text-[#89CFF0] dark:text-[#89CFF0]" />
    </div>
    <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 relative z-10 hide-scrollbar pb-24 max-w-4xl mx-auto w-full">
      <div className="flex gap-6 overflow-x-auto hide-scrollbar pb-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} className="flex-shrink-0 items-center flex flex-col gap-2 cursor-pointer group">
            <div className={cn("w-20 h-20 rounded-full border-2 p-1 transition-all duration-300 group-hover:scale-105", i === 1 ? "border-[#FFD8B1] dark:border-[#FFD8B1]" : "border-slate-200 dark:border-slate-700")}>
              <img className="rounded-full w-full h-full object-cover" src={`https://i.pravatar.cc/150?u=${i}`} alt="User" />
            </div>
            <span className="text-xs font-medium text-[#5D6979] dark:text-slate-400">{i === 1 ? '练习中' : '已打卡'}</span>
          </div>
        ))}
      </div>
      
      <div className="space-y-6">
        <CommunityPost 
          user={{ name: '林间小鹿', avatar: 'https://i.pravatar.cc/150?u=9' }}
          time="2026-03-17 09:12"
          content="今天在清晨的练习中获得了一种前所未有的自由感。感觉自己像是一片飘在半空的云。#冥想日常"
          images={['https://picsum.photos/seed/forest/600/400', 'https://picsum.photos/seed/clouds/600/400']}
          initialLikes={128}
          comments={34}
        />
        <CommunityPost 
          user={{ name: '深海里的鱼', avatar: 'https://i.pravatar.cc/150?u=12' }}
          time="2026-03-16 22:45"
          content="听着白噪音入睡，感觉整个世界的喧嚣都远去了。晚安，每一个努力生活的人。"
          images={[]}
          initialLikes={85}
          comments={12}
        />
        <CommunityPost 
          user={{ name: '向日葵', avatar: 'https://i.pravatar.cc/150?u=15' }}
          time="2026-03-15 14:20"
          content="周末的午后，一杯茶，一本书，一段轻柔的音乐。这就是我向往的生活。"
          images={['https://picsum.photos/seed/tea/600/400']}
          initialLikes={210}
          comments={56}
        />
      </div>
    </div>
  </div>
);

const TreeHoleView = ({ onNavigate }: { onNavigate: (id: PageId) => void }) => {
  const [isSending, setIsSending] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [noteContent, setNoteContent] = useState('');

  const handleOpenNote = () => setIsWriting(true);
  const handleCloseNote = () => {
    setIsWriting(false);
    setNoteContent('');
  };

  const handleSend = () => {
    if (!noteContent.trim()) return;
    setIsWriting(false);
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setNoteContent('');
    }, 2000);
  };

  return (
    <div className="flex-1 flex flex-col relative bg-[#2A2D34] text-white min-h-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 to-transparent opacity-50" />
      
      <AnimatePresence>
        {isWriting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, rotate: -2 }}
              animate={{ scale: 1, y: 0, rotate: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="bg-[#fef3c7] dark:bg-amber-900/90 w-full max-w-2xl rounded-bl-3xl rounded-tr-3xl rounded-tl-md rounded-br-md p-10 shadow-2xl relative transition-colors duration-300"
            >
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-4 bg-amber-200/50 dark:bg-amber-700/50 rounded-full shadow-sm transition-colors duration-300" />
              <textarea
                autoFocus
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="写下你想对星星说的话..."
                className="w-full h-64 bg-transparent resize-none outline-none text-slate-700 dark:text-amber-50 placeholder:text-slate-400/70 dark:placeholder:text-amber-200/50 text-lg leading-relaxed mt-6 transition-colors duration-300"
              />
              <div className="flex justify-end gap-6 mt-6">
                <button 
                  onClick={handleCloseNote}
                  className="px-6 py-3 text-base text-slate-500 dark:text-amber-200/70 hover:text-slate-700 dark:hover:text-amber-100 transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={handleSend}
                  disabled={!noteContent.trim()}
                  className="px-8 py-3 bg-amber-400 dark:bg-amber-600 hover:bg-amber-500 dark:hover:bg-amber-500 disabled:opacity-50 disabled:hover:bg-amber-400 dark:disabled:hover:bg-amber-600 text-amber-950 dark:text-amber-50 text-base font-medium rounded-xl transition-colors shadow-sm"
                >
                  投递
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSending && (
          <motion.div 
            initial={{ opacity: 0, y: 100, scale: 0.5 }}
            animate={{ opacity: [0, 1, 1, 0], y: -500, scale: 1.5, rotate: 15 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
          >
            <PenSquare size={96} className="text-amber-200" />
            <div className="absolute top-0 left-0 w-full h-full bg-amber-200 blur-2xl opacity-50 rounded-full" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-[80px] px-8 flex items-center justify-between relative z-10 max-w-5xl mx-auto w-full">
        <button onClick={() => onNavigate('diary')} className="p-3 -ml-3 hover:bg-white/10 rounded-full transition-colors">
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-xl font-bold tracking-wider">星光树洞</h1>
        <Flame size={28} className="text-amber-400" />
      </div>
      <div className="flex-1 flex flex-col relative z-10 px-8 pt-12 overflow-y-auto hide-scrollbar pb-24 max-w-4xl mx-auto w-full">
        <div className="flex-1 grid grid-cols-2 gap-8 content-start">
          <motion.div 
            initial={{ rotate: 1, opacity: 0, y: 20 }}
            animate={{ rotate: 1, opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[40px] hover:bg-white/10 transition-colors"
          >
            <p className="text-white/80 text-base leading-loose">有些秘密只能说给星星听。今晚，我终于放下了对那个人的执念，祝他好，也祝我自己好。</p>
            <p className="mt-6 text-xs text-white/30 text-right">— 来自某个遥远的小行星</p>
          </motion.div>
          <motion.div 
            initial={{ rotate: -2, opacity: 0, y: 20 }}
            animate={{ rotate: -2, opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[40px] hover:bg-white/10 transition-colors"
          >
            <p className="text-white/80 text-base leading-loose">工作压力真的好大，感觉要碎了。写在这里，希望明早醒来能有力气继续。加油，陌生人。</p>
            <p className="mt-6 text-xs text-white/30 text-right">— 深海里的鱼</p>
          </motion.div>
        </div>
        <div className="mt-12 mb-12 text-center space-y-6 max-w-md mx-auto w-full">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={handleOpenNote}
            disabled={isSending}
            className="w-full py-5 bg-white/10 hover:bg-white/20 transition-all text-white rounded-3xl border border-white/20 flex items-center justify-center gap-4 relative overflow-hidden"
          >
            {isSending ? (
              <motion.span 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-amber-200 font-medium text-lg"
              >
                信笺已化作流星...
              </motion.span>
            ) : (
              <>
                <PenSquare size={24} />
                <span className="text-lg font-medium">投递我的心情信笺</span>
              </>
            )}
          </motion.button>
          <p className="text-xs text-white/30 tracking-wider">这些心声将在24小时后化作流星消失</p>
        </div>
      </div>
    </div>
  );
};

const AssessmentView = ({ onNavigate }: { onNavigate: (id: PageId) => void }) => (
  <div className="flex-1 flex flex-col relative min-h-0 transition-colors duration-300">
    <div className="h-[80px] px-8 flex items-center justify-between relative z-10 border-b border-gray-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md max-w-5xl mx-auto w-full">
      <button onClick={() => onNavigate('healing')} className="p-3 -ml-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
        <ChevronLeft size={28} className="dark:text-slate-400 text-[#2A2D34]" />
      </button>
      <span className="text-xl font-bold dark:text-slate-200 text-[#2A2D34]">焦虑自评量表 (SAS)</span>
      <span className="text-sm font-medium text-[#5D6979] dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-full">1 / 20</span>
    </div>
    <div className="flex-1 px-8 pt-16 relative z-10 flex flex-col pb-24 max-w-3xl mx-auto w-full">
      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full mb-16 transition-colors duration-300 overflow-hidden">
        <div className="w-[5%] h-full bg-[#89CFF0] dark:bg-indigo-500 rounded-full shadow-[0_0_12px_rgba(137,207,240,0.5)] dark:shadow-[0_0_12px_rgba(99,102,241,0.5)] transition-all duration-500" />
      </div>
      <h2 className="text-3xl font-bold text-[#2A2D34] dark:text-slate-100 mb-16 leading-relaxed text-center">我觉得比平常容易激动或者着急，甚至感到惊恐？</h2>
      <div className="space-y-6">
        {['没有或很少时间有', '小部分时间有', '相当多时间有', '绝大部分或全部时间有'].map((option, i) => (
          <button 
            key={i}
            onClick={() => onNavigate('healing')}
            className="w-full py-6 px-8 text-center border-2 border-slate-200 dark:border-slate-700 rounded-3xl hover:border-[#89CFF0] dark:hover:border-indigo-500 hover:bg-[#89CFF0]/5 dark:hover:bg-indigo-500/10 transition-all text-lg font-medium text-[#5D6979] dark:text-slate-300 hover:shadow-md hover:-translate-y-1"
          >
            {option}
          </button>
        ))}
      </div>
      <div className="mt-auto mb-12 text-center">
        <p className="text-sm text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 inline-block px-6 py-3 rounded-full">所有评估结果仅供参考，不作为医疗诊断依据</p>
      </div>
    </div>
  </div>
);

const CourseDetailView = ({ onNavigate, onPlay }: { onNavigate: (id: PageId) => void, onPlay: (session: Session) => void }) => {
  const chapters = [
    { id: '1', title: '唤醒：建立身体觉知', duration: '12:00', author: '王宁 导师', cover: 'https://picsum.photos/seed/yoga/400/400', audioUrl: 'https://actions.google.com/sounds/v1/water/rain_on_roof.ogg' },
    { id: '2', title: '定心：与呼吸同步', duration: '15:00', author: '王宁 导师', cover: 'https://picsum.photos/seed/breath/400/400', locked: true },
    { id: '3', title: '内观：情绪的流变', duration: '18:00', author: '王宁 导师', cover: 'https://picsum.photos/seed/mind/400/400', locked: true },
  ];

  return (
    <div className="flex-1 flex flex-col relative min-h-0 transition-colors duration-300">
      <div className="h-[240px] relative shrink-0">
        <img className="w-full h-full object-cover" src="https://picsum.photos/seed/yoga/1920/1080" alt="Course" />
        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-950 via-transparent to-transparent transition-colors duration-300" />
        <button onClick={() => onNavigate('explore')} className="absolute top-8 left-8 w-12 h-12 bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 dark:border-white/10 transition-colors duration-300 hover:bg-white/30 dark:hover:bg-black/40">
          <ChevronLeft size={28} />
        </button>
      </div>
      <div className="flex-1 px-12 pt-8 flex flex-col relative z-10 overflow-y-auto hide-scrollbar pb-24 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-4 mb-6">
          <span className="bg-[#E6E6FA] dark:bg-indigo-900/50 text-[#2A2D34] dark:text-indigo-200 text-sm px-4 py-1.5 rounded-full font-bold uppercase transition-colors duration-300">21天进阶</span>
          <span className="text-[#5D6979] dark:text-slate-400 text-base font-medium">4.9分 (2.3k 评价)</span>
        </div>
        <h1 className="text-4xl font-bold text-[#2A2D34] dark:text-slate-100 mb-6">正念冥想：重塑内在秩序</h1>
        <p className="text-lg text-[#5D6979] dark:text-slate-400 leading-relaxed mb-12 max-w-3xl">本课程由资深冥想导师王宁设计，结合神经科学与心理学，通过21天的刻意练习，帮助你建立稳定的情绪内核。</p>
        <div className="space-y-6 mb-12">
          <h3 className="text-xl font-bold dark:text-slate-200 mb-6">课程大纲</h3>
          {chapters.map((chapter, idx) => (
            <div 
              key={chapter.id} 
              className={cn(
                "flex items-center justify-between p-6 rounded-2xl border transition-all duration-300",
                chapter.locked ? "bg-white dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 opacity-60" : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-[#89CFF0]/50 dark:hover:border-indigo-500/50 cursor-pointer hover:shadow-md hover:-translate-y-1"
              )}
              onClick={() => !chapter.locked && onPlay(chapter)}
            >
              <div className="flex items-center gap-6">
                <div className={cn(
                  "w-12 h-12 border-2 rounded-full flex items-center justify-center text-lg font-bold transition-colors duration-300",
                  chapter.locked ? "border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500" : "border-[#89CFF0] dark:border-indigo-400 text-[#2A2D34] dark:text-indigo-100"
                )}>
                  {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                </div>
                <div>
                  <span className="text-lg font-bold block dark:text-slate-200 mb-1">{chapter.title}</span>
                  {!chapter.locked && <span className="text-sm text-slate-500 dark:text-slate-400">{chapter.duration}</span>}
                </div>
              </div>
              {chapter.locked ? (
                <Lock size={24} className="text-slate-300 dark:text-slate-600" />
              ) : (
                <button 
                  className="w-12 h-12 bg-[#89CFF0]/10 dark:bg-indigo-500/20 rounded-full flex items-center justify-center text-[#89CFF0] dark:text-indigo-400 hover:bg-[#89CFF0]/20 dark:hover:bg-indigo-500/30 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlay(chapter);
                  }}
                >
                  <Play size={20} fill="currentColor" className="ml-1" />
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="mt-auto mb-12">
          <button className="w-full py-6 bg-[#2A2D34] dark:bg-slate-100 text-white dark:text-slate-900 rounded-3xl text-xl font-bold shadow-xl shadow-slate-200 dark:shadow-none transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">立即开始 21天旅程</button>
        </div>
      </div>
    </div>
  );
};

const DurationStatsView = ({ onNavigate }: { onNavigate: (id: PageId) => void }) => {
  const data = [
    { name: '10月', value: 300 },
    { name: '11月', value: 450 },
    { name: '12月', value: 200 },
    { name: '1月', value: 600 },
    { name: '2月', value: 400 },
    { name: '3月', value: 900 },
  ];

  return (
    <div className="flex-1 flex flex-col relative min-h-0 transition-colors duration-300">
      <div className="h-[80px] px-8 flex items-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-md relative z-20 transition-colors duration-300 border-b border-gray-100 dark:border-slate-800">
        <button onClick={() => onNavigate('profile')} className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors mr-4">
          <ChevronLeft size={28} className="text-[#2A2D34] dark:text-slate-200" />
        </button>
        <h1 className="text-xl text-[#2A2D34] dark:text-slate-100 font-bold">累计时长</h1>
      </div>
      <div className="flex-1 overflow-y-auto px-8 py-12 space-y-12 relative z-10 hide-scrollbar pb-24 max-w-5xl mx-auto w-full">
        <div className="text-center space-y-4">
          <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">总计专注与放松</p>
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-7xl font-bold text-[#2A2D34] dark:text-slate-100 tracking-tight">4,200</span>
            <span className="text-xl text-slate-500 dark:text-slate-400 font-medium">分钟</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="text-xl font-bold text-[#2A2D34] dark:text-slate-100 mb-8">近半年时长分布</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 14, fill: '#94a3b8', fontWeight: 500 }} dy={10} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', padding: '12px 20px' }} />
                <Bar dataKey="value" fill="#89CFF0" radius={[8, 8, 8, 8]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-[#2A2D34] dark:text-slate-100">时长成就</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-3xl border border-blue-100 dark:border-blue-800/30 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-800/50 rounded-full flex items-center justify-center mb-4">
                <Leaf size={28} className="text-blue-500 dark:text-blue-400" />
              </div>
              <p className="text-sm text-blue-600/80 dark:text-blue-400/80 font-bold mb-2 uppercase tracking-wider">冥想学徒</p>
              <p className="text-lg font-bold text-blue-900 dark:text-blue-300">达成 1 小时</p>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-800/30 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-800/50 rounded-full flex items-center justify-center mb-4">
                <Clock size={28} className="text-indigo-500 dark:text-indigo-400" />
              </div>
              <p className="text-sm text-indigo-600/80 dark:text-indigo-400/80 font-bold mb-2 uppercase tracking-wider">初级行者</p>
              <p className="text-lg font-bold text-indigo-900 dark:text-indigo-300">达成 10 小时</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-800/30 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-800/50 rounded-full flex items-center justify-center mb-4">
                <Trophy size={28} className="text-emerald-500 dark:text-emerald-400" />
              </div>
              <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80 font-bold mb-2 uppercase tracking-wider">宁静大师</p>
              <p className="text-lg font-bold text-emerald-900 dark:text-emerald-300">达成 50 小时</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MomentsView = ({ onNavigate }: { onNavigate: (id: PageId) => void }) => {
  const [activeTab, setActiveTab] = useState('全部');
  const tabs = ['全部', '金句', '声音', '日记'];

  const moments = [
    { id: 1, type: 'quote', content: '在喧嚣的世界里，寻找内心的宁静与平和。', author: '心港驿站', date: '2026-03-26', color: 'from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20' },
    { id: 2, type: 'audio', content: '林间清风', duration: '15分钟', date: '2026-03-25', color: 'from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20' },
    { id: 3, type: 'diary', content: '今天心情很平静，完成了一次深呼吸练习。感觉整个人都轻松了许多。', mood: '😌', date: '2026-03-24', color: 'from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20' },
    { id: 4, type: 'quote', content: '接纳不完美的自己，是爱自己的开始。', author: '心理学指南', date: '2026-03-22', color: 'from-rose-500/10 to-orange-500/10 dark:from-rose-500/20 dark:to-orange-500/20' },
    { id: 5, type: 'audio', content: '深夜海浪', duration: '30分钟', date: '2026-03-20', color: 'from-sky-500/10 to-blue-500/10 dark:from-sky-500/20 dark:to-blue-500/20' },
  ];

  const filteredMoments = activeTab === '全部' 
    ? moments 
    : moments.filter(m => (activeTab === '金句' && m.type === 'quote') || (activeTab === '声音' && m.type === 'audio') || (activeTab === '日记' && m.type === 'diary'));

  return (
    <div className="flex-1 flex flex-col relative min-h-0 transition-colors duration-300">
      <div className="h-[80px] px-8 flex items-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-md relative z-20 transition-colors duration-300 border-b border-gray-100 dark:border-slate-800">
        <button onClick={() => onNavigate('profile')} className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors mr-4">
          <ChevronLeft size={28} className="text-[#2A2D34] dark:text-slate-200" />
        </button>
        <h1 className="text-xl text-[#2A2D34] dark:text-slate-100 font-bold">收藏瞬间</h1>
      </div>
      
      <div className="px-8 py-6 relative z-10 max-w-5xl mx-auto w-full">
        <div className="flex gap-4 overflow-x-auto hide-scrollbar">
          {tabs.map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={cn(
                "px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300", 
                activeTab === tab 
                  ? "bg-[#2A2D34] dark:bg-slate-100 text-white dark:text-slate-900 shadow-lg shadow-slate-200 dark:shadow-none scale-105" 
                  : "bg-white/50 dark:bg-slate-800/50 text-[#5D6979] dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 relative z-10 hide-scrollbar pb-24 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-2 gap-6 content-start">
          <AnimatePresence mode="popLayout">
            {filteredMoments.map((moment, index) => (
              <motion.div 
                key={moment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`p-8 rounded-[32px] bg-gradient-to-br ${moment.color} border border-white/50 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden`}
              >
                {moment.type === 'quote' && (
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <Quote size={64} className="absolute -top-4 -left-4 text-indigo-500/10 dark:text-indigo-400/10 rotate-180" />
                    <p className="text-xl font-serif text-[#2A2D34] dark:text-slate-200 leading-relaxed mt-6 relative z-10">
                      "{moment.content}"
                    </p>
                    <div className="mt-8 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">— {moment.author}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">{moment.date}</span>
                    </div>
                  </div>
                )}

                {moment.type === 'audio' && (
                  <div className="flex items-center gap-6 relative z-10 h-full">
                    <div className="w-16 h-16 rounded-full bg-white/60 dark:bg-black/20 flex items-center justify-center shadow-sm backdrop-blur-sm hover:scale-110 transition-transform cursor-pointer">
                      <Play size={28} className="text-emerald-600 dark:text-emerald-400 ml-1" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-[#2A2D34] dark:text-slate-200">{moment.content}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">{moment.duration} · {moment.date}</p>
                    </div>
                    <Headphones size={32} className="text-emerald-500/20 dark:text-emerald-400/20 absolute right-0 top-0" />
                  </div>
                )}

                {moment.type === 'diary' && (
                  <div className="relative z-10 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{moment.mood}</span>
                        <span className="text-xs font-medium text-slate-400 dark:text-slate-500">{moment.date}</span>
                      </div>
                      <Book size={24} className="text-blue-500/30 dark:text-blue-400/30" />
                    </div>
                    <p className="text-base text-[#2A2D34] dark:text-slate-200 leading-relaxed flex-1">
                      {moment.content}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const AchievementsView = ({ onNavigate }: { onNavigate: (id: PageId) => void }) => (
  <div className="flex-1 flex flex-col relative min-h-0 transition-colors duration-300">
    <div className="h-[80px] px-8 flex items-center justify-between bg-white/80 dark:bg-slate-950/80 backdrop-blur-md relative z-20 transition-colors duration-300 border-b border-gray-100 dark:border-slate-800">
      <button onClick={() => onNavigate('profile')} className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
        <ChevronLeft size={28} className="text-[#2A2D34] dark:text-slate-200" />
      </button>
      <h1 className="text-xl text-[#2A2D34] dark:text-slate-100 font-bold">成长里程碑</h1>
      <Trophy size={28} className="text-amber-400 dark:text-amber-500" />
    </div>
    <div className="flex-1 overflow-y-auto px-8 py-12 space-y-12 relative z-10 hide-scrollbar pb-24 max-w-5xl mx-auto w-full">
      <div className="bg-gradient-to-br from-[#89CFF0] to-[#E6E6FA] dark:from-indigo-600 dark:to-purple-800 p-10 rounded-[40px] text-white shadow-lg shadow-indigo-200/50 dark:shadow-none transition-colors duration-300">
        <p className="text-sm font-medium opacity-80 uppercase tracking-wider">当前等级</p>
        <h2 className="text-5xl font-bold mt-2 tracking-tight">心灵行者</h2>
        <div className="mt-10 flex items-center gap-6">
          <div className="flex-1 h-3 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white w-3/4 rounded-full" />
          </div>
          <span className="text-sm font-bold tracking-wider">750 / 1000 EXP</span>
        </div>
      </div>
      
      <div className="space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-3 dark:text-slate-200">
          <span className="w-1.5 h-6 bg-[#89CFF0] dark:bg-indigo-400 rounded-full" /> 进行中的挑战
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl flex items-center justify-between border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center text-orange-500 dark:text-orange-400"><Sun size={28} /></div>
              <div><p className="text-base font-bold dark:text-slate-200 mb-1">7天早起冥想</p><p className="text-sm text-slate-500 dark:text-slate-400 font-medium">已坚持 5 天</p></div>
            </div>
            <span className="text-lg font-bold text-[#89CFF0] dark:text-indigo-400">80%</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-3 dark:text-slate-200">
          <span className="w-1.5 h-6 bg-[#FFD8B1] dark:bg-amber-500 rounded-full" /> 荣誉勋章
        </h3>
        <div className="grid grid-cols-4 gap-6">
          {[
            { label: '初露锋芒', icon: Medal, color: 'text-yellow-500 dark:text-yellow-400', active: true },
            { label: '百里挑一', icon: Trophy, color: 'text-slate-300 dark:text-slate-600', active: false },
            { label: '静心大师', icon: Moon, color: 'text-slate-300 dark:text-slate-600', active: false },
            { label: '持之以恒', icon: Clock, color: 'text-slate-300 dark:text-slate-600', active: false },
          ].map((m, i) => (
            <div key={i} className={cn("flex flex-col items-center gap-4 p-6 rounded-3xl border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-colors", !m.active && "grayscale opacity-60")}>
              <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-[32px] shadow-sm border border-slate-50 dark:border-slate-700 flex items-center justify-center transition-colors duration-300">
                <m.icon size={48} className={m.color} />
              </div>
              <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{m.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// --- Main App ---

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageId>('login');
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const navigate = (page: PageId) => {
    setCurrentPage(page);
  };

  const playSession = (session: Session) => {
    setCurrentSession(session);
    setCurrentPage('player');
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('login');
  };

  const renderPage = () => {
    if (!isLoggedIn) {
      if (currentPage === 'register') return <RegisterView onRegister={handleLogin} onNavigate={navigate} />;
      return <LoginView onLogin={handleLogin} onNavigate={navigate} />;
    }

    switch (currentPage) {
      case 'home': return <HomeView onNavigate={navigate} />;
      case 'mood-checkin': return <MoodCheckinView onNavigate={navigate} />;
      case 'breathing': return <BreathingView onNavigate={navigate} />;
      case 'stats': return <StatsView onNavigate={navigate} />;
      case 'duration-stats': return <DurationStatsView onNavigate={navigate} />;
      case 'moments': return <MomentsView onNavigate={navigate} />;
      case 'diary': return <DiaryView onNavigate={navigate} />;
      case 'explore': return <ExploreView onNavigate={navigate} onPlay={playSession} />;
      case 'healing': return <HealingView onNavigate={navigate} />;
      case 'profile': return <ProfileView onNavigate={navigate} />;
      case 'player': return <PlayerView onNavigate={navigate} session={currentSession} />;
      case 'settings': return <SettingsView onNavigate={navigate} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} onLogout={handleLogout} />;
      case 'community': return <CommunityView onNavigate={navigate} />;
      case 'tree-hole': return <TreeHoleView onNavigate={navigate} />;
      case 'assessment': return <AssessmentView onNavigate={navigate} />;
      case 'course-detail': return <CourseDetailView onNavigate={navigate} onPlay={playSession} />;
      case 'achievements': return <AchievementsView onNavigate={navigate} />;
      default: return <HomeView onNavigate={navigate} />;
    }
  };

  // Determine if we should show the bottom navbar
  const showNavbar = ['home', 'explore', 'diary', 'healing', 'profile', 'community', 'stats'].includes(currentPage);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900 font-sans transition-colors duration-300 overflow-hidden">
      <div className="w-full max-w-[1920px] h-screen max-h-[1080px] bg-white dark:bg-slate-950 shadow-2xl relative overflow-hidden flex flex-row transition-colors duration-300">
        <AuroraBackground />
        
        {showNavbar && (
          <Sidebar 
            activeTab={['home', 'explore', 'diary', 'healing', 'profile', 'community', 'stats'].includes(currentPage) ? currentPage : 'home'} 
            onTabChange={navigate} 
          />
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 relative z-10 flex flex-col min-h-0 overflow-y-auto"
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
