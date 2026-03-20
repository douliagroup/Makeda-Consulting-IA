import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, TrendingUp, Calendar, ShieldCheck } from 'lucide-react';
import { InvestmentChart } from './InvestmentChart';
import { InvestmentRisk, SimulationInsight } from '../types';
import { MAKEDA_BRAND } from '../constants';

export const SimulationTool: React.FC = () => {
  const [initialCapital, setInitialCapital] = useState(5000000);
  const [monthlySavings, setMonthlySavings] = useState(100000);
  const [years, setYears] = useState(10);
  const [riskProfile, setRiskProfile] = useState<InvestmentRisk>(InvestmentRisk.BALANCED);

  const getRate = (profile: InvestmentRisk) => {
    switch (profile) {
      case InvestmentRisk.PRUDENT: return 4.5;
      case InvestmentRisk.BALANCED: return 6.5;
      case InvestmentRisk.DYNAMIC: return 9.5;
      default: return 6;
    }
  };

  const chartData = useMemo(() => {
    let current = initialCapital;
    const data = [{ year: 0, value: initialCapital }];
    const rate = getRate(riskProfile);
    const monthlyRate = rate / 100 / 12;
    for (let i = 1; i <= years; i++) {
      for (let m = 1; m <= 12; m++) current = (current + monthlySavings) * (1 + monthlyRate);
      data.push({ year: i, value: Math.round(current) });
    }
    return data;
  }, [initialCapital, monthlySavings, years, riskProfile]);

  const finalValue = chartData.length > 0 ? chartData[chartData.length - 1].value : 0;

  // AJOUT 3 : Dashboard d'Insights (Silent Logging)
  useEffect(() => {
    const logInsight = () => {
      const insight: SimulationInsight = {
        type: 'Autre', // Par défaut, peut être affiné via le chat
        timestamp: new Date(),
        riskProfile,
        targetCapital: finalValue
      };
      const existing = JSON.parse(localStorage.getItem('makeda_insights') || '[]');
      localStorage.setItem('makeda_insights', JSON.stringify([...existing, insight].slice(-100)));
    };
    const timer = setTimeout(logInsight, 2000); // Log après 2s de stabilité
    return () => clearTimeout(timer);
  }, [finalValue, riskProfile]);

  // AJOUT 1 : Le Pont WhatsApp
  const handleWhatsAppShare = () => {
    const text = `Bonjour Makeda, j'ai réalisé une simulation d'investissement :
- Apport : ${initialCapital.toLocaleString()} FCFA
- Épargne : ${monthlySavings.toLocaleString()} FCFA/mois
- Durée : ${years} ans
- Profil : ${riskProfile}
- Projection : ${finalValue.toLocaleString()} FCFA
Je souhaite recevoir mon plan d'investissement détaillé.`;
    window.open(`https://wa.me/${MAKEDA_BRAND.whatsapp}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      className="text-white"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
        <div className="space-y-6">
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                <TrendingUp size={12} /> Apport Initial (FCFA)
              </label>
              <input 
                type="number" 
                value={initialCapital} 
                onChange={(e) => setInitialCapital(Number(e.target.value))} 
                className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-sm focus:border-white/30 transition-all outline-none backdrop-blur-md" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                <Calendar size={12} /> Versement Mensuel
              </label>
              <input 
                type="number" 
                value={monthlySavings} 
                onChange={(e) => setMonthlySavings(Number(e.target.value))} 
                className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-sm focus:border-white/30 transition-all outline-none backdrop-blur-md" 
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/40">
                <span>Horizon de placement</span>
                <span className="text-white">{years} ans</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="30" 
                value={years} 
                onChange={(e) => setYears(Number(e.target.value))} 
                className="w-full h-1.5 bg-white/10 rounded-lg accent-white cursor-pointer" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                <ShieldCheck size={12} /> Profil de Risque
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[InvestmentRisk.PRUDENT, InvestmentRisk.BALANCED, InvestmentRisk.DYNAMIC].map((p) => (
                  <button 
                    key={p} 
                    onClick={() => setRiskProfile(p)} 
                    className={`py-3 rounded-xl text-[10px] font-bold border transition-all duration-300 ${
                      riskProfile === p 
                        ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
                        : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="flex flex-col justify-between gap-6">
          {/* AJOUT 4 : Glassmorphism Card */}
          <motion.div 
            variants={itemVariants}
            className="relative overflow-hidden bg-white p-8 rounded-[2rem] text-black shadow-2xl group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-black/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500" />
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3 opacity-60">Projection à {years} ans</p>
            <p className="text-3xl lg:text-5xl font-serif font-bold mb-4 tracking-tight">
              {finalValue.toLocaleString()} <span className="text-lg">FCFA</span>
            </p>
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-bold bg-black/10 px-4 py-2 rounded-full">
                Taux estimé : {getRate(riskProfile)}%
              </div>
              
              {/* AJOUT 1 : Bouton WhatsApp */}
              <button 
                onClick={handleWhatsAppShare}
                className="flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-full text-[10px] font-bold hover:scale-105 transition-transform shadow-lg"
              >
                <MessageCircle size={14} />
                Recevoir sur WhatsApp
              </button>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-2 bg-white/5 p-4 rounded-3xl backdrop-blur-xl border border-white/10">
            <InvestmentChart data={chartData} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
