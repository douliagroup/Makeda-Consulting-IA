import React, { useState, useMemo } from 'react';
import { InvestmentChart } from './InvestmentChart';
import { InvestmentRisk } from '../types';

export const SimulationTool: React.FC = () => {
  const [mode, setMode] = useState<'free' | 'goal'>('free');
  const [initialCapital, setInitialCapital] = useState(5000000);
  const [monthlySavings, setMonthlySavings] = useState(100000);
  const [years, setYears] = useState(10);
  const [riskProfile, setRiskProfile] = useState<InvestmentRisk>(InvestmentRisk.BALANCED);
  
  // Goal mode states
  const [goalAmount, setGoalAmount] = useState(50000000);
  const [goalYears, setGoalYears] = useState(5);
  const [goalInitial, setGoalInitial] = useState(0);

  const getRate = (profile: InvestmentRisk) => {
    switch (profile) {
      case InvestmentRisk.PRUDENT: return 4.5;
      case InvestmentRisk.BALANCED: return 6.5;
      case InvestmentRisk.DYNAMIC: return 9.5;
      default: return 6;
    }
  };

  const { neededMonthly, chartData } = useMemo(() => {
    if (mode === 'goal') {
      const rate = 6; // FCP Makeda Horizon target
      const r = rate / 100 / 12;
      const n = goalYears * 12;
      const fv = goalAmount;
      const pv = goalInitial;

      // PMT = (FV - PV * (1+r)^n) / (((1+r)^n - 1) / r)
      const pow = Math.pow(1 + r, n);
      const numerator = fv - pv * pow;
      const denominator = (pow - 1) / r;
      const pmt = Math.max(0, Math.round(numerator / denominator));

      // Update chart data for goal mode
      let current = pv;
      const data = [{ year: 0, value: pv }];
      for (let i = 1; i <= goalYears; i++) {
        for (let m = 1; m <= 12; m++) current = (current + pmt) * (1 + r);
        data.push({ year: i, value: Math.round(current) });
      }
      return { neededMonthly: pmt, chartData: data };
    } else {
      let current = initialCapital;
      const data = [{ year: 0, value: initialCapital }];
      const rate = getRate(riskProfile);
      const monthlyRate = rate / 100 / 12;
      for (let i = 1; i <= years; i++) {
        for (let m = 1; m <= 12; m++) current = (current + monthlySavings) * (1 + monthlyRate);
        data.push({ year: i, value: Math.round(current) });
      }
      return { neededMonthly: 0, chartData: data };
    }
  }, [mode, initialCapital, monthlySavings, years, riskProfile, goalAmount, goalYears, goalInitial]);

  const finalValue = chartData.length > 0 ? chartData[chartData.length - 1].value : 0;

  return (
    <div className="text-white">
      <div className="flex gap-2 mb-8 p-1 bg-white/5 rounded-2xl w-fit mx-auto">
        <button 
          onClick={() => setMode('free')}
          className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${mode === 'free' ? 'bg-white text-black shadow-xl' : 'text-white/40 hover:text-white'}`}
        >
          Simulation Libre
        </button>
        <button 
          onClick={() => setMode('goal')}
          className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${mode === 'goal' ? 'bg-white text-black shadow-xl' : 'text-white/40 hover:text-white'}`}
        >
          Objectif d'Épargne
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
        <div className="space-y-6">
          {mode === 'free' ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-white/40">Apport Initial (FCFA)</label>
                  <input type="number" value={initialCapital} onChange={(e) => setInitialCapital(Number(e.target.value))} className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-white/30" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-white/40">Versement Mensuel</label>
                  <input type="number" value={monthlySavings} onChange={(e) => setMonthlySavings(Number(e.target.value))} className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-white/30" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-white/40">Durée : {years} ans</label>
                </div>
                <input type="range" min="1" max="30" value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg accent-white" />
                <div className="grid grid-cols-3 gap-2">
                  {[InvestmentRisk.PRUDENT, InvestmentRisk.BALANCED, InvestmentRisk.DYNAMIC].map((p) => (
                    <button key={p} onClick={() => setRiskProfile(p)} className={`py-2 rounded-lg text-[9px] font-bold border transition-all ${riskProfile === p ? 'bg-white text-black' : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:border-white/30'}`}>{p}</button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-white/40">Mon Objectif (ex: Achat maison)</label>
                  <input type="text" placeholder="Achat maison, Études, Retraite..." className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-white/30" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-white/40">Montant Cible (FCFA)</label>
                    <input type="number" value={goalAmount} onChange={(e) => setGoalAmount(Number(e.target.value))} className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-white/30" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-white/40">Apport Initial</label>
                    <input type="number" value={goalInitial} onChange={(e) => setGoalInitial(Number(e.target.value))} className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-white/30" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-white/40">Horizon : {goalYears} ans</label>
                  </div>
                  <input type="range" min="1" max="30" value={goalYears} onChange={(e) => setGoalYears(Number(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg accent-white" />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col justify-between">
          <div className="bg-white p-6 rounded-3xl text-black shadow-2xl">
            {mode === 'free' ? (
              <>
                <p className="text-[9px] font-bold uppercase tracking-widest mb-2 opacity-50">Projection à {years} ans</p>
                <p className="text-2xl lg:text-4xl font-serif font-bold mb-2">{finalValue.toLocaleString()} FCFA</p>
                <div className="text-[9px] font-bold bg-black/10 px-3 py-1.5 rounded-full w-fit">Taux estimé : {getRate(riskProfile)}%</div>
              </>
            ) : (
              <>
                <p className="text-[9px] font-bold uppercase tracking-widest mb-2 opacity-50">Effort d'épargne mensuel requis</p>
                <p className="text-2xl lg:text-4xl font-serif font-bold mb-2 text-emerald-600">{neededMonthly.toLocaleString()} FCFA</p>
                <div className="text-[9px] font-bold bg-black/10 px-3 py-1.5 rounded-full w-fit mb-4">Calculé avec FCP Makeda Horizon (6%)</div>
                <p className="text-[10px] text-black/60 leading-relaxed italic">
                  Pour atteindre {goalAmount.toLocaleString()} FCFA dans {goalYears} ans, vous devez épargner {neededMonthly.toLocaleString()} FCFA chaque mois.
                </p>
              </>
            )}
          </div>
          <div className="mt-4 h-[200px]"><InvestmentChart data={chartData} /></div>
        </div>
      </div>
    </div>
  );
};
