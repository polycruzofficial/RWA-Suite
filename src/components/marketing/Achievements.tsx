"use client";

import React from 'react';
import { FadeIn } from '@/components/ui/FadeIn';
import { PartnerLogoGrid } from './PartnerLogoGrid';
import { Trophy, Rocket, Box, Cloud, Users } from 'lucide-react';

export const Achievements: React.FC = () => {
  return (
    <section id="achievements" className="bg-white border-t border-neutral-200/60 font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 py-28 md:py-36">
        
        {/* Section Header */}
        <FadeIn>
          <div className="text-center mb-20">
            <p className="eyebrow">Achievements</p>
            <h2 className="display-xl mt-4 text-neutral-950">
              Recognized Excellence.
            </h2>
          </div>
        </FadeIn>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-20">
          
          {/* 1. Incubation Program - Main Hero Card */}
          <FadeIn className="col-span-1 md:col-span-6 h-[300px] md:h-[400px]">
            <div className="w-full h-full rounded-3xl overflow-hidden relative group border border-neutral-800 bg-[#0a0a0a] shadow-2xl">
               {/* Grid Overlay */}
               <div className="absolute inset-0 opacity-10 bg-grid-dark"></div>
               
               <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-8 text-center">
                  <h3 className="text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500 text-4xl md:text-7xl font-bold tracking-tight uppercase drop-shadow-sm">
                     INCUBATION PROGRAM
                  </h3>
                  <div className="flex items-center gap-6 mt-4">
                     <span className="h-[1px] w-20 bg-neutral-800"></span>
                     <span className="text-xl md:text-2xl font-mono text-neutral-300 tracking-[0.6em] uppercase font-light">BATCH 06</span>
                     <span className="h-[1px] w-20 bg-neutral-800"></span>
                  </div>
                  <p className="mt-8 text-neutral-500 text-[10px] font-semibold tracking-[0.3em] uppercase">WEB3X INCUBATION PROGRAM</p>
               </div>
            </div>
          </FadeIn>

          {/* 2. BNB AI Hack - Small Card */}
          <FadeIn delay={100} className="col-span-1 md:col-span-2 h-[340px]">
            <div className="w-full h-full rounded-3xl bg-[#0a0a0a] border border-neutral-800 shadow-xl p-8 flex flex-col justify-between relative overflow-hidden group">
               <div className="absolute inset-0 bg-grid-dark opacity-5" />
               <div className="flex justify-between items-start relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center border border-neutral-750">
                    <Trophy className="text-neutral-300 w-5 h-5" />
                  </div>
                  <span className="bg-neutral-800 text-neutral-300 text-[10px] font-semibold px-3 py-1 rounded-full uppercase border border-neutral-700 tracking-wider">Tier 4 Award</span>
               </div>
               <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-1">BNB AI HACK</h3>
                  <span className="text-neutral-400 font-bold text-lg uppercase tracking-wider">WINNERS</span>
                  <p className="text-neutral-500 text-xs mt-4 leading-relaxed font-medium">
                    Progress through tiers for larger cash prizes and support. Recognized for innovation in AI-driven Web3 products.
                  </p>
               </div>
            </div>
          </FadeIn>

          {/* 3. Ignit3 - Small Card */}
          <FadeIn delay={200} className="col-span-1 md:col-span-2 h-[340px]">
             <div className="w-full h-full rounded-3xl bg-[#0a0a0a] border border-neutral-800 border-t-2 border-t-neutral-500 shadow-xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-grid-dark opacity-5" />
                <div className="bg-neutral-800 border border-neutral-700 px-5 py-2.5 mb-6 rounded-xl relative z-10">
                   <span className="text-2xl font-bold text-white tracking-tight">IGNIT3</span>
                </div>
                <h3 className="text-neutral-500 text-[10px] font-semibold uppercase tracking-wider mb-2 opacity-60 relative z-10">Your Token Launch</h3>
                <span className="text-4xl font-bold text-white tracking-tight relative z-10">SUCCESS</span>
                <p className="text-neutral-500 text-[10px] mt-6 font-semibold uppercase tracking-wider relative z-10">Powered by Brinc</p>
             </div>
          </FadeIn>

          {/* 4. TDeFi - Small Card */}
          <FadeIn delay={300} className="col-span-1 md:col-span-2 h-[340px]">
             <div className="w-full h-full rounded-3xl bg-[#0a0a0a] border border-neutral-800 shadow-xl p-8 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #262626 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}></div>
                <div className="relative z-10">
                   <Rocket className="text-neutral-400 w-9 h-9 mb-2" strokeWidth={1.2} />
                </div>
                <div className="relative z-10">
                   <h3 className="text-4xl font-bold text-white tracking-tight mb-4">TDeFi</h3>
                   <div className="h-[2px] w-12 bg-neutral-700 mb-4"></div>
                   <p className="text-neutral-400 text-xs font-semibold uppercase tracking-wider leading-relaxed">
                     Web3 Acceleration Program & DMCC Partner.
                   </p>
                </div>
             </div>
          </FadeIn>

          {/* 5. Google Cloud - Membership Card */}
          <FadeIn delay={400} className="col-span-1 md:col-span-3 h-64">
             <div className="w-full h-full rounded-3xl bg-white border border-neutral-200 shadow-sm flex flex-col justify-center items-center relative overflow-hidden group">
                <div className="flex items-center gap-4 mb-6 relative z-10">
                   <Cloud className="text-neutral-900 w-10 h-10" strokeWidth={1.2} />
                   <span className="text-3xl font-semibold text-neutral-900 tracking-tight">Google Cloud</span>
                </div>
                <div className="flex items-center gap-2 relative z-10">
                   <div className="w-2 h-2 rounded-full bg-neutral-300"></div>
                   <div className="w-2 h-2 rounded-full bg-neutral-400"></div>
                   <div className="w-2 h-2 rounded-full bg-neutral-500"></div>
                   <div className="w-2 h-2 rounded-full bg-neutral-600"></div>
                </div>
                <p className="mt-6 text-neutral-400 text-[10px] font-semibold uppercase tracking-wider relative z-10">Startup Program Member</p>
             </div>
          </FadeIn>

          {/* 6. Thirdweb - Membership Card */}
          <FadeIn delay={500} className="col-span-1 md:col-span-3 h-64">
             <div className="w-full h-full rounded-3xl bg-[#0a0a0a] border border-neutral-800 relative overflow-hidden group shadow-lg flex flex-col justify-center items-center text-white">
                <div className="absolute top-0 right-0 p-24 bg-neutral-900/40 rounded-full blur-[60px] transform translate-x-1/2 -translate-y-1/2"></div>
                <Box className="w-12 h-12 mb-4 text-neutral-400" strokeWidth={1.2} />
                <h3 className="text-4xl font-bold tracking-tight mb-2">thirdweb</h3>
                <p className="text-neutral-500 text-[10px] font-semibold uppercase tracking-wider">Startup Program Partner</p>
             </div>
          </FadeIn>

        </div>

        {/* Community Traction Subsection */}
        <div className="mt-32 border-t border-neutral-200/60 pt-28">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <FadeIn>
                 <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 ring-1 ring-neutral-200 text-[10px] font-semibold uppercase tracking-widest mb-6">
                    <Users size={11} className="text-neutral-600" /> Community Momentum
                 </div>
                 <h2 className="display-xl text-neutral-950">
                    Shaping the future <br /> with our <span className="text-neutral-400">Founders.</span>
                 </h2>
                 <p className="mt-6 text-base text-neutral-500 leading-relaxed font-medium max-w-xl">
                   Early builders, creators, and founders are already shaping the Polycruz platform. Join a movement defining the next era of IP ownership.
                 </p>
              </FadeIn>

              <FadeIn delay={200}>
                 <div className="bg-neutral-50 rounded-3xl p-10 md:p-12 border border-neutral-200 relative overflow-hidden group">
                    <div className="absolute right-[-10%] top-[-10%] w-64 h-64 bg-neutral-950/5 rounded-full blur-[100px] group-hover:scale-125 transition-transform duration-1000"></div>
                    
                    <div className="relative z-10">
                       <div className="text-7xl md:text-8xl font-black text-neutral-950 tracking-tighter mb-4 flex items-center font-sans">
                          16,000<span className="text-neutral-400">+</span>
                       </div>
                       <div className="space-y-2">
                          <h4 className="text-xl font-bold text-neutral-950">Beta Waitlist Users</h4>
                          <p className="text-sm text-neutral-500 font-medium">Global users and growing across 50+ countries.</p>
                       </div>

                       <div className="mt-10 flex -space-x-3.5">
                          {[1,2,3,4,5].map(i => (
                             <div key={i} className="w-12 h-12 rounded-full border-4 border-neutral-50 bg-neutral-200 flex items-center justify-center text-[10px] font-bold overflow-hidden">
                                <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User avatar" />
                             </div>
                          ))}
                          <div className="w-12 h-12 rounded-full border-4 border-neutral-50 bg-neutral-900 flex items-center justify-center text-[10px] font-bold text-white z-10">
                             +15k
                          </div>
                       </div>
                    </div>
                 </div>
              </FadeIn>
           </div>
        </div>
      </div>

      {/* --- Partners Section --- */}
      <section id="partners" className="relative py-28 md:py-36 overflow-hidden bg-neutral-50/75 border-t border-neutral-200/60 font-sans">
        <div className="absolute inset-0 z-0 bg-grid opacity-30"></div>
        <div className="absolute inset-0 z-0 halo-light opacity-50"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <FadeIn>
            <div className="text-center mb-16">
              <p className="eyebrow text-neutral-500">Partners</p>
              <h3 className="display-lg mt-4 text-neutral-950">
                Ecosystem & Acceleration
              </h3>
              <p className="mt-4 text-sm text-neutral-500 max-w-2xl mx-auto font-medium">
                Trusted by leading protocols, ecosystems, and programs across Web3 and AI.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={200}>
            <div className="relative w-full max-w-6xl mx-auto">
              <PartnerLogoGrid />
            </div>
          </FadeIn>

          <div className="mt-20 text-center">
            <FadeIn delay={400}>
              <div className="h-px w-32 bg-gradient-to-r from-transparent via-neutral-300 to-transparent mx-auto mb-6"></div>
              <p className="text-neutral-400 text-[10px] font-semibold uppercase tracking-[0.4em]">
                Polycruz Achievement Ecosystem
              </p>
            </FadeIn>
          </div>
        </div>
      </section>
    </section>
  );
};
