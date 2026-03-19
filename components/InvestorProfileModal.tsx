import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
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
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg p-8 relative">
          <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-black"><X size={24} /></button>
          <div className="flex gap-2 mb-8">{[1, 2, 3, 4].map(s => <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? 'bg-[#C5A059]' : 'bg-gray-100'}`} />)}</div>
          
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#001A3D] mb-4">Qui êtes-vous ?</h2>
              <div className="grid gap-3">
                {['Particulier', 'PME', 'Institutionnel'].map(t => (
                  <button key={t} onClick={() => handleNext({ type: t as any })} className="p-4 rounded-xl border border-gray-100 hover:border-[#C5A059] font-bold text-left">
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#001A3D] mb-4">Votre profil de risque ?</h2>
              <div className="grid gap-3">
                {[InvestmentRisk.PRUDENT, InvestmentRisk.BALANCED, InvestmentRisk.DYNAMIC].map(r => (
                  <button key={r} onClick={() => handleNext({ riskProfile: r })} className="p-4 rounded-xl border border-gray-100 hover:border-[#C5A059] font-bold text-left">
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#001A3D] mb-4">Horizon de placement ?</h2>
              <div className="grid gap-3">
                {[2, 5, 10, 15].map(h => (
                  <button key={h} onClick={() => handleNext({ horizon: h })} className="p-4 rounded-xl border border-gray-100 hover:border-[#C5A059] font-bold text-left">
                    {h} ans
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#001A3D] mb-4">Dernière étape</h2>
              <input 
                type="text" 
                placeholder="Votre nom" 
                className="w-full p-4 rounded-xl border border-gray-100 mb-4"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNext({ name: (e.target as HTMLInputElement).value });
                }}
              />
              <button 
                onClick={() => {
                  const input = document.querySelector('input') as HTMLInputElement;
                  handleNext({ name: input.value });
                }}
                className="w-full p-4 bg-[#C5A059] text-white rounded-xl font-bold"
              >
                Valider
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
