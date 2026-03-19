import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { geminiService } from './services/geminiService';
import { SimulationTool } from './components/SimulationTool';
import { InvestorProfileModal } from './components/InvestorProfileModal';
import { ChatMessage, UserProfile } from './types';
import { MAKEDA_BRAND } from './constants';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  ShieldCheck, 
  TrendingUp, 
  Briefcase,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  ChevronRight,
  Target,
  ArrowUpRight,
  MessageSquare,
  LayoutGrid,
  Info,
  Calculator,
  Contact as ContactIcon,
  ExternalLink,
  Globe,
  Award,
  Menu,
  X
} from 'lucide-react';

// Composant pour l'arrière-plan immersif "Labyrinthe de la Fortune"
const BackgroundEffects: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const particleCount = 40;

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;

      constructor(width: number, height: number) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.5 + 0.2;
      }

      update(width: number, height: number) {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > width) this.x = 0;
        else if (this.x < 0) this.x = width;
        if (this.y > height) this.y = 0;
        else if (this.y < 0) this.y = height;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`; // White
        ctx.fill();
      }
    }

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(canvas.width, canvas.height));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 200) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - distance / 200)})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      particles.forEach(p => {
        p.update(canvas.width, canvas.height);
        p.draw(ctx);
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, #001A3D 0%, #000000 100%)' }}
      />
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
    </div>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'solutions' | 'about' | 'simulator' | 'contact' | 'invest'>('home');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [externalUrl, setExternalUrl] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  // Persistence du profil et de l'historique
  useEffect(() => {
    const savedProfile = localStorage.getItem('makeda_user_profile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }

    const savedMessages = localStorage.getItem('makeda_chat_history');
    if (savedMessages) {
      const parsed = JSON.parse(savedMessages);
      setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
    } else {
      welcome();
    }
  }, []);

  useEffect(() => {
    if (userProfile) {
      localStorage.setItem('makeda_user_profile', JSON.stringify(userProfile));
    }
  }, [userProfile]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('makeda_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'fr-FR';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping, activeTab]);

  const welcome = async () => {
    setIsTyping(true);
    const welcomeMsg = userProfile 
      ? `Bonjour ${userProfile.name || ''}. Heureux de vous revoir. Je suis prêt à poursuivre notre échange sur votre stratégie d'investissement.`
      : "Bonjour. Je suis votre Consultant Makeda. Comment puis-je vous accompagner dans la structuration de votre patrimoine aujourd'hui ?";
    
    setMessages([{ role: 'model', content: welcomeMsg, timestamp: new Date() }]);
    setIsTyping(false);
    
    if (!isMuted) {
      const audio = await geminiService.generateSpeech(welcomeMsg);
      if (audio) geminiService.playBase64Audio(audio);
    }
  };

  const handleSend = async (text?: string) => {
    const messageToSend = text || input;
    if (!messageToSend.trim()) return;

    const userMsg: ChatMessage = { role: 'user', content: messageToSend, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const response = await geminiService.sendMessage(messageToSend);
    setMessages(prev => [...prev, { role: 'model', content: response, timestamp: new Date() }]);
    setIsTyping(false);

    if (!isMuted) {
      const audio = await geminiService.generateSpeech(response);
      if (audio) geminiService.playBase64Audio(audio);
    }
  };

  const handleProfileComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    setIsProfileModalOpen(false);
    const profileText = `Mon profil d'investisseur est défini : Je suis un ${profile.type}, mon objectif est ${profile.goals?.[0]}, mon profil de risque est ${profile.riskProfile} et mon horizon est de ${profile.horizon} ans. Proposez-moi une stratégie adaptée.`;
    handleSend(profileText);
  };

  const toggleMic = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  const toggleMute = () => {
    if (!isMuted) {
      geminiService.stopAudio();
    }
    setIsMuted(!isMuted);
  };

  const formatContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return <div key={idx} className="h-4"></div>;

      // Détection des listes numérotées pour les bulles
      const listMatch = trimmedLine.match(/^(\d+)\.\s(.*)/);
      if (listMatch) {
        return (
          <div key={idx} className="flex gap-3 my-4 items-start">
            <span className="flex-shrink-0 w-6 h-6 bg-white text-black rounded-full flex items-center justify-center font-bold text-xs shadow-lg border border-white/20">
              {listMatch[1]}
            </span>
            <div className="flex-1 pt-0.5 text-white font-medium leading-relaxed text-xs">
              {listMatch[2]}
            </div>
          </div>
        );
      }

      // Rendu normal avec mise en gras (sans astérisques)
      return (
        <p key={idx} className="mb-4 text-white/90 leading-relaxed font-medium">
           {trimmedLine}
        </p>
      );
    });
  };

  const solutions = [
    { 
      title: "FCP MAKEDA Horizon", 
      icon: <TrendingUp size={24} />, 
      desc: "Fonds obligataire. Horizon 2 ans. Souscription dès 50 000 FCFA.",
      longDesc: "Le FCP MAKEDA Horizon est conçu pour offrir une croissance stable avec un risque maîtrisé. Idéal pour les projets à moyen terme.",
      query: "Détaillez-moi les avantages du FCP MAKEDA Horizon."
    },
    { 
      title: "Makeda Patrimoine", 
      icon: <ShieldCheck size={24} />, 
      desc: "Asset-Assurance (PET). Accessible dès 10 000 FCFA.",
      longDesc: "Premier produit d'Asset-Assurance en Afrique Centrale, fusionnant la sécurité de l'assurance et la performance des marchés financiers.",
      query: "Comment fonctionne Makeda Patrimoine ?"
    },
    { 
      title: "Gestion Sous Mandat", 
      icon: <Briefcase size={24} />, 
      desc: "Gestion individualisée déléguée.",
      longDesc: "Déléguez la gestion de vos actifs à nos experts pour une stratégie sur mesure alignée sur vos objectifs spécifiques.",
      query: "Quels sont les critères pour une Gestion Sous Mandat ?"
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="flex flex-col h-full">
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-3 lg:p-6 space-y-4 lg:space-y-6 scroll-smooth pb-24 m-2 lg:m-4 rounded-2xl lg:rounded-3xl border border-white/10 bg-transparent backdrop-blur-[2px] shadow-2xl"
            >
              {messages.map((msg, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[90%] ${
                    msg.role === 'user' 
                      ? 'bg-white text-black rounded-2xl rounded-tr-none px-4 py-2.5 shadow-lg' 
                      : 'bg-white/[0.02] backdrop-blur-3xl rounded-2xl rounded-tl-none px-5 py-5 shadow-xl border border-white/10'
                  }`}>
                    <div className="text-xs leading-relaxed">
                      {msg.role === 'model' ? formatContent(msg.content) : msg.content}
                    </div>
                    <div className={`text-[8px] mt-2 font-bold uppercase tracking-widest opacity-40 ${msg.role === 'user' ? 'text-black' : 'text-white'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="glass-morphism-dark p-6 rounded-3xl rounded-tl-none flex gap-2 items-center border border-white/5">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  </div>
                </div>
              )}
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-1.5 lg:p-3 bg-black/60 backdrop-blur-xl border-t border-white/5 z-30">
              <div className="flex gap-2 glass-morphism-dark p-1 rounded-[1.2rem] border border-white/10 focus-within:border-white/50 transition-all shadow-2xl">
                <button 
                  onClick={toggleMic}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {isListening ? <MicOff size={12} /> : <Mic size={12} />}
                </button>
                <textarea 
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Posez votre question..."
                  rows={1}
                  className="flex-1 bg-transparent px-2 py-1.5 text-xs font-medium focus:outline-none placeholder:text-white/20 text-white resize-none max-h-32 overflow-y-auto"
                />
                <button 
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                  className="bg-white text-black w-8 h-8 rounded-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-20"
                >
                  <Send size={14} />
                </button>
              </div>
              <div className="mt-1 text-center">
                <p className="text-[7px] text-white/30 uppercase tracking-widest font-bold">Propulsé par DOULIA</p>
              </div>
            </div>
          </div>
        );
      case 'solutions':
        return (
          <div className="p-3 lg:p-6 space-y-6 pb-32 overflow-y-auto h-full">
            <div className="text-center">
              <h2 className="text-xl lg:text-2xl font-serif font-bold text-white mb-1">Nos Solutions</h2>
              <p className="text-white/50 max-w-2xl mx-auto text-[10px] lg:text-xs">Des produits conçus pour transformer votre épargne en capital productif.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6">
              {solutions.map((sol, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -3 }}
                  className="glass-morphism-dark p-4 lg:p-6 rounded-2xl lg:rounded-3xl border border-white/10 flex flex-col h-full"
                >
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/10 text-white rounded-lg lg:rounded-xl flex items-center justify-center mb-3 lg:mb-4 shadow-lg">
                    {sol.icon}
                  </div>
                  <h3 className="text-base lg:text-lg font-bold mb-1 lg:mb-2">{sol.title}</h3>
                  <p className="text-white/60 text-[10px] lg:text-xs mb-3 lg:mb-4 flex-1">{sol.longDesc}</p>
                  <div className="p-2 lg:p-3 bg-white/5 rounded-lg lg:rounded-xl mb-3 lg:mb-4">
                    <p className="text-[8px] font-bold text-white uppercase tracking-widest">{sol.desc}</p>
                  </div>
                  <button 
                    onClick={() => { setActiveTab('home'); handleSend(sol.query); }}
                    className="w-full py-2.5 lg:py-3 rounded-lg lg:rounded-xl bg-white text-black font-bold flex items-center justify-center gap-2 hover:scale-105 transition-all text-[10px] lg:text-xs"
                  >
                    En savoir plus <ChevronRight size={14} />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        );
      case 'about':
        return (
          <div className="p-3 lg:p-6 space-y-8 pb-32 overflow-y-auto h-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
              <div className="space-y-4 lg:space-y-6">
                <div className="inline-block px-2 py-0.5 bg-white/10 rounded-full border border-white/20">
                  <p className="text-[8px] font-bold text-white uppercase tracking-[0.2em]">À Propos</p>
                </div>
                <h2 className="text-xl lg:text-2xl font-serif font-bold text-white leading-tight">Démocratiser l'investissement en zone CEMAC</h2>
                <p className="text-white/70 leading-relaxed text-[10px] lg:text-xs">
                  MAKEDA Asset Management est une société de gestion d'actifs agréée par la COSUMAF (Réf: N° COSUMAF-SGP-06/2021). 
                </p>
                <div className="grid grid-cols-2 gap-3 lg:gap-4">
                  <div className="p-3 lg:p-4 glass-morphism-dark rounded-xl lg:rounded-2xl border border-white/5">
                    <h4 className="text-lg lg:text-xl font-bold text-white mb-0.5">2021</h4>
                    <p className="text-[8px] text-white/40 uppercase font-bold">Agrément</p>
                  </div>
                  <div className="p-3 lg:p-4 glass-morphism-dark rounded-xl lg:rounded-2xl border border-white/5">
                    <h4 className="text-lg lg:text-xl font-bold text-white mb-0.5">CEMAC</h4>
                    <p className="text-[8px] text-white/40 uppercase font-bold">Zone</p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-video lg:aspect-square rounded-2xl lg:rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl">
                  <img src="https://media.licdn.com/dms/image/v2/D4E22AQGa1oMoojqxow/feedshare-shrink_800/feedshare-shrink_800/0/1729509795752?e=2147483647&v=beta&t=8emmMeeqQANTrhyQQwnfLNvt5UtvuQEedi9fxqfp0Fw" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                </div>
              </div>
            </div>

            <div className="space-y-4 lg:space-y-6">
              <h3 className="text-lg lg:text-xl font-serif font-bold text-center">Vision & Valeurs</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-6">
                {[
                  { title: "Inclusion", desc: "Accessible à tous." },
                  { title: "Transparence", desc: "Gestion rigoureuse." },
                  { title: "Impact", desc: "Économie réelle." }
                ].map((v, i) => (
                  <div key={i} className="p-4 lg:p-6 glass-morphism-dark rounded-xl lg:rounded-2xl border border-white/5 text-center">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4 text-white">
                      <Sparkles size={16} />
                    </div>
                    <h4 className="font-bold mb-1 text-xs lg:text-sm">{v.title}</h4>
                    <p className="text-[9px] lg:text-[10px] text-white/50 leading-relaxed">{v.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'simulator':
        return (
          <div className="p-3 lg:p-6 space-y-6 pb-32 overflow-y-auto h-full">
            <div className="text-center">
              <h2 className="text-xl lg:text-2xl font-serif font-bold text-white mb-1">Simulateur</h2>
              <p className="text-white/50 max-w-2xl mx-auto text-[10px] lg:text-xs">Projetez la croissance de votre capital.</p>
            </div>
            <div className="glass-morphism-dark rounded-2xl lg:rounded-3xl p-3 lg:p-6 border border-white/5 shadow-2xl max-w-5xl mx-auto">
              <SimulationTool />
            </div>
          </div>
        );
      case 'contact':
        return (
          <div className="p-3 lg:p-6 space-y-8 pb-32 overflow-y-auto h-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <div className="space-y-6 lg:space-y-8">
                <div>
                  <h2 className="text-2xl lg:text-3xl font-serif font-bold text-white mb-2 lg:mb-4">Contact</h2>
                  <p className="text-white/60 text-[10px] lg:text-xs">Nos conseillers sont à votre disposition.</p>
                </div>
                
                <div className="space-y-3 lg:space-y-4">
                  <div className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 glass-morphism-dark rounded-xl lg:rounded-2xl border border-white/5">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/10 text-white rounded-lg lg:rounded-xl flex items-center justify-center">
                      <Phone size={16} />
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest mb-0.5">Téléphone</p>
                      <p className="font-bold text-sm lg:text-base">{MAKEDA_BRAND.contact}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 glass-morphism-dark rounded-xl lg:rounded-2xl border border-white/5">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/10 text-white rounded-lg lg:rounded-xl flex items-center justify-center">
                      <Mail size={16} />
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest mb-0.5">Email</p>
                      <p className="font-bold text-sm lg:text-base">{MAKEDA_BRAND.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-morphism-dark p-4 lg:p-8 rounded-2xl lg:rounded-3xl border border-white/5 shadow-2xl">
                <h3 className="text-lg lg:text-xl font-serif font-bold mb-4 lg:mb-6">Message</h3>
                <form className="space-y-3 lg:space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-white/30 uppercase tracking-widest ml-3">Nom</label>
                    <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg lg:rounded-xl px-3 lg:px-4 py-2 lg:py-3 focus:outline-none focus:border-white/50 transition-all text-xs" placeholder="Votre nom..." />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-white/30 uppercase tracking-widest ml-3">Email</label>
                    <input type="email" className="w-full bg-white/5 border border-white/10 rounded-lg lg:rounded-xl px-3 lg:px-4 py-2 lg:py-3 focus:outline-none focus:border-white/50 transition-all text-xs" placeholder="votre@email.com" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-white/30 uppercase tracking-widest ml-3">Message</label>
                    <textarea className="w-full bg-white/5 border border-white/10 rounded-lg lg:rounded-xl px-3 lg:px-4 py-2 lg:py-3 focus:outline-none focus:border-white/50 transition-all h-20 lg:h-24 text-xs" placeholder="Aide ?"></textarea>
                  </div>
                  <button className="w-full py-3 lg:py-4 bg-white text-black font-bold rounded-lg lg:rounded-xl shadow-xl hover:scale-[1.02] transition-all active:scale-95 text-xs">
                    Envoyer
                  </button>
                </form>
              </div>
            </div>
          </div>
        );
      case 'invest':
        return (
          <div className="h-full flex flex-col">
            {externalUrl ? (
              <div className="flex-1 relative">
                <button 
                  onClick={() => setExternalUrl(null)}
                  className="absolute top-3 left-3 z-50 bg-white text-black px-4 py-2 rounded-xl font-bold shadow-2xl flex items-center gap-2 hover:scale-105 transition-all text-xs"
                >
                  <ChevronRight size={16} className="rotate-180" /> Retour
                </button>
                <iframe 
                  src={externalUrl} 
                  className="w-full h-full border-none bg-white"
                  title="Makeda External"
                />
              </div>
            ) : (
              <div className="p-3 lg:p-6 space-y-6 pb-32 overflow-y-auto h-full">
                <div className="text-center">
                  <h2 className="text-xl lg:text-2xl font-serif font-bold text-white mb-1 lg:mb-2">Investir</h2>
                  <p className="text-white/50 max-w-2xl mx-auto text-[10px] lg:text-xs">Prenez le contrôle de votre avenir financier.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-6 max-w-6xl mx-auto">
                  {[
                    { 
                      title: "SIMULEZ", 
                      icon: <Calculator size={20} />, 
                      action: () => setActiveTab('simulator'),
                      desc: "Projetez vos gains."
                    },
                    { 
                      title: "SOUSCRIVEZ", 
                      icon: <Award size={20} />, 
                      action: () => setExternalUrl('https://www.makeda.capital/fr/subscription'),
                      desc: "Adhérez à nos fonds."
                    },
                    { 
                      title: "PAYEZ", 
                      icon: <Globe size={20} />, 
                      action: () => setExternalUrl('https://www.makeda.capital/fr/payment'),
                      desc: "Réglez en sécurité."
                    }
                  ].map((item, i) => (
                    <motion.div 
                      key={i}
                      whileHover={{ y: -3, scale: 1.01 }}
                      onClick={item.action}
                      className="glass-morphism-dark p-5 lg:p-8 rounded-xl lg:rounded-3xl border border-white/10 cursor-pointer group hover:bg-white/5 transition-all flex flex-col items-center text-center space-y-3 lg:space-y-4 shadow-2xl"
                    >
                      <div className="w-10 h-10 lg:w-14 lg:h-14 bg-white/5 text-white rounded-lg lg:rounded-2xl flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-500 shadow-inner">
                        {item.icon}
                      </div>
                      <h3 className="text-xs lg:text-sm font-bold leading-tight uppercase tracking-wider">{item.title}</h3>
                      <p className="text-[8px] lg:text-[9px] text-white/40 leading-relaxed">{item.desc}</p>
                      <div className="pt-1 lg:pt-2">
                        <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white transition-all">
                          <ArrowUpRight size={14} className="text-white/40 group-hover:text-white transition-all" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden font-sans text-white bg-black">
      <BackgroundEffects />
      
      {/* Global Header (Chatbot Top Bar Style) */}
      {activeTab === 'home' && (
        <header className="fixed top-0 left-0 right-0 z-[100] p-3 bg-black/60 backdrop-blur-2xl border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-8 h-8 rounded-full border-2 border-white/30 p-0.5 bg-black">
                <img src={MAKEDA_BRAND.logoUrl} className="w-full h-full rounded-full object-contain" />
              </div>
              <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-black rounded-full"></span>
            </div>
            <div>
              <h1 className="text-base font-serif font-bold text-white leading-none">{MAKEDA_BRAND.logoText}</h1>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                <p className="text-[8px] text-white/40 uppercase tracking-widest font-bold">Expert actif</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleMute}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                isMuted ? 'bg-white/5 text-white/30' : 'bg-white text-black shadow-lg shadow-white/20'
              }`}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-8 h-8 rounded-lg bg-white/5 text-white flex items-center justify-center hover:bg-white/10 transition-all border border-white/10"
            >
              {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

          {/* Hamburger Menu Overlay */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                className="absolute top-full right-6 mt-4 w-64 glass-morphism-dark border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-[60]"
              >
                <div className="p-4 space-y-2">
                  {[
                    { id: 'home', icon: <MessageSquare size={18} />, label: 'Accueil' },
                    { id: 'invest', icon: <TrendingUp size={18} />, label: 'Investir' },
                    { id: 'solutions', icon: <LayoutGrid size={18} />, label: 'Solutions' },
                    { id: 'about', icon: <Info size={18} />, label: 'Vision' },
                    { id: 'simulator', icon: <Calculator size={18} />, label: 'Simulateur' },
                    { id: 'contact', icon: <ContactIcon size={18} />, label: 'Contact' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id as any); setIsMenuOpen(false); }}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                        activeTab === tab.id ? 'bg-white text-black font-bold' : 'text-white/60 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {tab.icon}
                      <span className="text-xs uppercase tracking-widest">{tab.label}</span>
                    </button>
                  ))}
                  <div className="h-[1px] bg-white/10 my-2"></div>
                  <button 
                    onClick={() => { setIsProfileModalOpen(true); setIsMenuOpen(false); }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl text-white/60 hover:bg-white/5 hover:text-white transition-all"
                  >
                    <Target size={18} />
                    <span className="text-xs uppercase tracking-widest">Profil Investisseur</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>
      )}

      {/* Main Content Area */}
      <main className={`relative z-10 flex-1 overflow-hidden ${activeTab === 'home' ? 'pt-[64px]' : ''}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation Bar */}
      {activeTab !== 'home' && (
        <nav className="relative z-50 bg-black/90 backdrop-blur-2xl border-t border-white/10 px-2 py-2 flex justify-around items-center">
          {[
            { id: 'home', icon: <MessageSquare size={18} />, label: 'Accueil' },
            { id: 'invest', icon: <TrendingUp size={18} />, label: 'Investir' },
            { id: 'solutions', icon: <LayoutGrid size={18} />, label: 'Solutions' },
            { id: 'about', icon: <Info size={18} />, label: 'Vision' },
            { id: 'simulator', icon: <Calculator size={18} />, label: 'Simulateur' },
            { id: 'contact', icon: <ContactIcon size={18} />, label: 'Contact' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center gap-0.5 transition-all ${
                activeTab === tab.id ? 'text-white scale-105' : 'text-white/40 hover:text-white/60'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${activeTab === tab.id ? 'bg-white/10' : ''}`}>
                {tab.icon}
              </div>
              <span className="text-[7px] font-bold uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </nav>
      )}

      <InvestorProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)}
        onComplete={handleProfileComplete}
      />
    </div>
  );
};

export default App;
