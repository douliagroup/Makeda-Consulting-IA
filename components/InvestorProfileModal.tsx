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
          className="glass-morphism-dark rounded-[2.5rem] shadow-2xl w-full max-w-lg p-8 lg:p-10 relative border border-white/20"
        >
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 text-white/40 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all"
          >
            <X size={24} />
          </button>

          <div className="flex gap-2 mb-10">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'bg-white/10'}`} />
            ))}
          </div>
          
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-2xl lg:text-3xl font-serif font-bold text-white mb-2">Qui êtes-vous ?</h2>
              <p className="text-white/40 text-xs mb-6 uppercase tracking-widest font-bold">Étape 1 sur 4</p>
              <div className="grid gap-3">
                {['Particulier', 'PME', 'Institutionnel'].map(t => (
                  <button 
                    key={t} 
                    onClick={() => handleNext({ type: t as any })} 
                    className="p-5 rounded-2xl border border-white/10 hover:border-white hover:bg-white/5 font-bold text-left transition-all group flex justify-between items-center text-white"
                  >
                    <span>{t}</span>
                    <ChevronRight size={18} className="text-white/20 group-hover:text-white transition-all" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-2xl lg:text-3xl font-serif font-bold text-white mb-2">Votre profil de risque ?</h2>
              <p className="text-white/40 text-xs mb-6 uppercase tracking-widest font-bold">Étape 2 sur 4</p>
              <div className="grid gap-3">
                {[
                  { id: InvestmentRisk.PRUDENT, label: "Prudent (4.5%)", desc: "Sécurité maximale" },
                  { id: InvestmentRisk.BALANCED, label: "Équilibré (6.5%)", desc: "Croissance modérée" },
                  { id: InvestmentRisk.DYNAMIC, label: "Dynamique (9.5%)", desc: "Performance élevée" }
                ].map(r => (
                  <button 
                    key={r.id} 
                    onClick={() => handleNext({ riskProfile: r.id })} 
                    className="p-5 rounded-2xl border border-white/10 hover:border-white hover:bg-white/5 font-bold text-left transition-all group text-white"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span>{r.label}</span>
                      <ChevronRight size={18} className="text-white/20 group-hover:text-white transition-all" />
                    </div>
                    <p className="text-[10px] font-normal text-white/40">{r.desc}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-2xl lg:text-3xl font-serif font-bold text-white mb-2">Horizon de placement ?</h2>
              <p className="text-white/40 text-xs mb-6 uppercase tracking-widest font-bold">Étape 3 sur 4</p>
              <div className="grid grid-cols-2 gap-3">
                {[2, 5, 10, 15].map(h => (
                  <button 
                    key={h} 
                    onClick={() => handleNext({ horizon: h })} 
                    className="p-6 rounded-2xl border border-white/10 hover:border-white hover:bg-white/5 font-bold text-center transition-all text-white"
                  >
                    <span className="text-xl block mb-1">{h}</span>
                    <span className="text-[10px] uppercase tracking-widest text-white/40">Ans</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-2xl lg:text-3xl font-serif font-bold text-white mb-2">Dernière étape</h2>
              <p className="text-white/40 text-xs mb-6 uppercase tracking-widest font-bold">Comment devons-nous vous appeler ?</p>
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Votre nom complet" 
                  autoFocus
                  className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-white transition-all text-lg font-medium"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleNext({ name: (e.target as HTMLInputElement).value });
                  }}
                />
                <button 
                  onClick={() => {
                    const input = document.querySelector('input') as HTMLInputElement;
                    handleNext({ name: input.value });
                  }}
                  className="w-full p-5 bg-white text-black rounded-2xl font-bold text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
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
