/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  ShieldCheck, 
  Briefcase, 
  MessageSquare, 
  Send, 
  User, 
  Bot, 
  ChevronRight, 
  PieChart, 
  Phone, 
  Mail,
  Info,
  Menu,
  X,
  ArrowRight
} from 'lucide-react';
import Markdown from 'react-markdown';
import { cn } from './lib/utils';
import { getGeminiResponse } from './services/geminiService';

interface Message {
  role: 'user' | 'model';
  content: string;
}

const PRODUCTS = [
  {
    id: 'horizon',
    name: 'FCP Makeda Horizon',
    type: 'Obligataire',
    target: '6% (2024)',
    vl: '~10 964 FCFA',
    ticket: '50 000 FCFA',
    description: 'Idéal pour une épargne stable et performante en zone CEMAC.',
    icon: TrendingUp
  },
  {
    id: 'patrimoine',
    name: 'Asset Assurance',
    type: 'Makeda Patrimoine',
    target: 'Partenariat SanlamAllianz',
    vl: 'Février 2025',
    ticket: 'Sur mesure',
    description: 'Sécurisez votre avenir et celui de vos proches avec une assurance vie d\'élite.',
    icon: ShieldCheck
  },
  {
    id: 'pme',
    name: 'Mandat PME',
    type: 'Gestion Discrétionnaire',
    target: 'Croissance x5',
    vl: '1,4Md FCFA sous gestion',
    ticket: 'Investisseurs Qualifiés',
    description: 'Participez à l\'essor des champions économiques de demain.',
    icon: Briefcase
  }
];

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'model', 
      content: "Bienvenue chez Makeda Asset Management. Je suis votre expert Makeda Consulting IA. Comment puis-je vous accompagner dans la croissance de votre patrimoine aujourd'hui ?" 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const chatHistory = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));
      chatHistory.push({ role: 'user', parts: [{ text: userMessage }] });

      const response = await getGeminiResponse(chatHistory);
      if (response) {
        setMessages(prev => [...prev, { role: 'model', content: response }]);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages(prev => [...prev, { role: 'model', content: "Désolé, j'ai rencontré une difficulté technique. Pouvons-nous reprendre notre échange ?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#f5f2ed] text-[#1a1a1a] font-serif overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-80 bg-white border-r border-[#1a1a1a]/10 p-6">
        <div className="mb-10">
          <h1 className="text-2xl font-bold tracking-tighter text-[#1a1a1a]">MAKEDA</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#1a1a1a]/50">Asset Management</p>
        </div>

        <div className="flex-1 space-y-8 overflow-y-auto pr-2">
          <div>
            <h2 className="text-xs uppercase tracking-widest text-[#1a1a1a]/40 mb-4">Nos Solutions</h2>
            <div className="space-y-4">
              {PRODUCTS.map((product) => (
                <div key={product.id} className="group cursor-pointer">
                  <div className="flex items-center gap-3 mb-1">
                    <product.icon className="w-4 h-4 text-[#1a1a1a]/60 group-hover:text-[#1a1a1a]" />
                    <span className="text-sm font-medium">{product.name}</span>
                  </div>
                  <p className="text-[11px] text-[#1a1a1a]/50 leading-relaxed pl-7">
                    {product.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-[#1a1a1a]/5">
            <h2 className="text-xs uppercase tracking-widest text-[#1a1a1a]/40 mb-4">Contact Direct</h2>
            <div className="space-y-3">
              <a href="tel:+237699674616" className="flex items-center gap-3 text-xs hover:underline">
                <Phone className="w-3 h-3" /> +237 6 99 67 46 16
              </a>
              <a href="mailto:contact@makeda.capital" className="flex items-center gap-3 text-xs hover:underline">
                <Mail className="w-3 h-3" /> contact@makeda.capital
              </a>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-[#1a1a1a]/5">
          <div className="p-4 bg-[#f5f2ed] rounded-2xl">
            <p className="text-[10px] italic text-[#1a1a1a]/60 leading-relaxed">
              "Chez Makeda, tout le monde trouve son compte."
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-white z-50 p-6 flex flex-col lg:hidden"
            >
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h1 className="text-xl font-bold tracking-tighter">MAKEDA</h1>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-[#1a1a1a]/50">Asset Management</p>
                </div>
                <button onClick={() => setIsSidebarOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              {/* Mobile Sidebar Content (Same as desktop) */}
              <div className="flex-1 space-y-8 overflow-y-auto">
                <div>
                  <h2 className="text-xs uppercase tracking-widest text-[#1a1a1a]/40 mb-4">Nos Solutions</h2>
                  <div className="space-y-4">
                    {PRODUCTS.map((product) => (
                      <div key={product.id}>
                        <div className="flex items-center gap-3 mb-1">
                          <product.icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{product.name}</span>
                        </div>
                        <p className="text-[11px] text-[#1a1a1a]/50 leading-relaxed pl-7">
                          {product.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-[#1a1a1a]/5 bg-white/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 hover:bg-[#f5f2ed] rounded-full transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Makeda Consulting IA</h2>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-[#1a1a1a]/50 uppercase tracking-wider">Expert en ligne</span>
                </div>
              </div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4">
             <div className="text-[10px] text-[#1a1a1a]/40 uppercase tracking-widest font-sans">Agrément COSUMAF-SGP-06/2021</div>
          </div>
        </header>

        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth"
        >
          <div className="max-w-3xl mx-auto space-y-8">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-4",
                  message.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                  message.role === 'user' ? "bg-[#1a1a1a]/5" : "bg-[#1a1a1a]"
                )}>
                  {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-white" />}
                </div>
                <div className={cn(
                  "max-w-[85%] p-5 rounded-3xl text-sm leading-relaxed",
                  message.role === 'user' 
                    ? "bg-[#1a1a1a] text-white rounded-tr-none" 
                    : "bg-white border border-[#1a1a1a]/5 rounded-tl-none shadow-sm"
                )}>
                  <div className="markdown-body prose prose-sm max-w-none">
                    <Markdown>{message.content}</Markdown>
                  </div>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-[#1a1a1a]/5 p-5 rounded-3xl rounded-tl-none shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-[#1a1a1a]/20 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-[#1a1a1a]/20 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-[#1a1a1a]/20 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white/80 backdrop-blur-md border-t border-[#1a1a1a]/5">
          <div className="max-w-3xl mx-auto relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Décrivez vos objectifs d'investissement..."
              className="w-full bg-[#f5f2ed] border-none rounded-2xl py-4 pl-5 pr-14 text-sm focus:ring-1 focus:ring-[#1a1a1a]/20 resize-none h-14 min-h-[56px] max-h-32 transition-all"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-2 w-10 h-10 bg-[#1a1a1a] text-white rounded-xl flex items-center justify-center hover:bg-[#1a1a1a]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="max-w-3xl mx-auto text-center mt-3 text-[10px] text-[#1a1a1a]/40 uppercase tracking-widest">
            Les performances passées ne préjugent pas des performances futures.
          </p>
        </div>
      </main>
    </div>
  );
}
