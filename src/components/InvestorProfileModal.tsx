import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';
import { InvestmentRisk, UserProfile } from '../types';

export const InvestorProfileModal: React.FC<{ isOpen: boolean; onClose: () => void; onComplete: (p: UserProfile) => void }> = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({});

  const handleNext = (data: Partial<UserProfile>) => {
    const newProfile = { ...profile, ...data };
    setProfile(newProfile);
    if (step < 4) setStep(step + 1); else onComplete(newProfile);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          className="glass-morphism-dark rounded-[2.5rem] shadow-2xl w-full max-w-lg p-8 lg:p-10 relative border border-white/20 text-white dark:text-white"
        >
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 opacity-40 hover:opacity-100 hover:bg-white/10 p-2 rounded-full transition-all"
          >
            <X size={24} />
          </button>

          <div className="flex gap-2 mb-10">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-[#C5A059] shadow-[0_0_10px_rgba(197,160,89,0.5)]' : 'bg-white/10'}`} />
            ))}
          </div>
          
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-2xl lg:text-3xl font-serif font-bold mb-2">Qui êtes-vous ?</h2>
              <p className="opacity-40 text-xs mb-6 uppercase tracking-widest font-bold">Étape 1 sur 4</p>
              <div className="grid gap-3">
                {['Particulier', 'PME', 'Institutionnel'].map(t => (
                  <button 
                    key={t} 
                    onClick={() => handleNext({ type: t as "Particulier" | "PME" | "Institutionnel" })} 
                    className="p-5 rounded-2xl border border-white/10 hover:border-[#C5A059] hover:bg-[#C5A059]/5 font-bold text-left transition-all group flex justify-between items-center"
                  >
                    <span>{t}</span>
                    <ChevronRight size={18} className="opacity-20 group-hover:opacity-100 transition-all" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-2xl lg:text-3xl font-serif font-bold mb-2">Votre profil de risque ?</h2>
              <p className="opacity-40 text-xs mb-6 uppercase tracking-widest font-bold">Étape 2 sur 4</p>
              <div className="grid gap-3">
                {[
                  { id: InvestmentRisk.PRUDENT, label: "Prudent (4.5%)", desc: "Sécurité maximale" },
                  { id: InvestmentRisk.BALANCED, label: "Équilibré (6.5%)", desc: "Croissance modérée" },
                  { id: InvestmentRisk.DYNAMIC, label: "Dynamique (9.5%)", desc: "Performance élevée" }
                ].map(r => (
                  <button 
                    key={r.id} 
                    onClick={() => handleNext({ riskProfile: r.id })} 
                    className="p-5 rounded-2xl border border-white/10 hover:border-[#C5A059] hover:bg-[#C5A059]/5 font-bold text-left transition-all group"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span>{r.label}</span>
                      <ChevronRight size={18} className="opacity-20 group-hover:opacity-100 transition-all" />
                    </div>
                    <p className="text-[10px] font-normal opacity-40">{r.desc}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-2xl lg:text-3xl font-serif font-bold mb-2">Horizon de placement ?</h2>
              <p className="opacity-40 text-xs mb-6 uppercase tracking-widest font-bold">Étape 3 sur 4</p>
              <div className="grid grid-cols-2 gap-3">
                {[2, 5, 10, 15].map(h => (
                  <button 
                    key={h} 
                    onClick={() => handleNext({ horizon: h })} 
                    className="p-6 rounded-2xl border border-white/10 hover:border-[#C5A059] hover:bg-[#C5A059]/5 font-bold text-center transition-all"
                  >
                    <span className="text-xl block mb-1">{h}</span>
                    <span className="text-[10px] uppercase tracking-widest opacity-40">Ans</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-2xl lg:text-3xl font-serif font-bold mb-2">Dernière étape</h2>
              <p className="opacity-40 text-xs mb-6 uppercase tracking-widest font-bold">Comment devons-nous vous appeler ?</p>
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Votre nom complet" 
                  autoFocus
                  className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 focus:outline-none focus:border-[#C5A059] transition-all text-lg font-medium"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleNext({ name: (e.target as HTMLInputElement).value });
                  }}
                />
                <button 
                  onClick={() => {
                    const input = document.querySelector('input') as HTMLInputElement;
                    handleNext({ name: input.value });
                  }}
                  className="w-full p-5 bg-[#C5A059] text-black rounded-2xl font-bold text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Finaliser mon profil
                </button>
              </div>
            </motion.div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
