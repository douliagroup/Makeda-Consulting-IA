import React, { useState, useMemo } from 'react';
import { InvestmentChart } from './InvestmentChart';
import { InvestmentRisk } from '../types';

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

  return (
    <div className="text-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold uppercase tracking-widest text-white/40">Apport Initial (FCFA)</label>
              <input type="number" value={initialCapital} onChange={(e) => setInitialCapital(Number(e.target.value))} className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold uppercase tracking-widest text-white/40">Versement Mensuel</label>
              <input type="number" value={monthlySavings} onChange={(e) => setMonthlySavings(Number(e.target.value))} className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm" />
            </div>
          </div>
          <div className="space-y-4">
            <input type="range" min="1" max="30" value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg accent-white" />
            <div className="grid grid-cols-3 gap-2">
              {[InvestmentRisk.PRUDENT, InvestmentRisk.BALANCED, InvestmentRisk.DYNAMIC].map((p) => (
                <button key={p} onClick={() => setRiskProfile(p)} className={`py-2 rounded-lg text-[9px] font-bold border ${riskProfile === p ? 'bg-white text-black' : 'bg-white/5 border-white/10 text-white/40'}`}>{p}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-between">
          <div className="bg-white p-6 rounded-3xl text-black shadow-2xl">
            <p className="text-[9px] font-bold uppercase tracking-widest mb-2">Projection à {years} ans</p>
            <p className="text-2xl lg:text-4xl font-serif font-bold mb-2">{finalValue.toLocaleString()} FCFA</p>
            <div className="text-[9px] font-bold bg-black/10 px-3 py-1.5 rounded-full w-fit">Taux estimé : {getRate(riskProfile)}%</div>
          </div>
          <div className="mt-4"><InvestmentChart data={chartData} /></div>
        </div>
      </div>
    </div>
  );
};
