'use client'
import Link from 'next/link';
import { Logo3D } from '@/components/Header';
import { Canvas } from '@react-three/fiber';
import { Sphere, OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';

// 3D animated floating glass orbs background
const GlassOrbsBG = () => (
  <Canvas style={{ position: 'absolute', inset: 0, zIndex: 0 }} camera={{ position: [0, 0, 8], fov: 50 }} gl={{ alpha: true }}>
    <ambientLight intensity={0.7} />
    <pointLight position={[10, 10, 10]} intensity={1.2} />
    {[...Array(7)].map((_, i) => (
      <Sphere key={i} args={[0.7 + Math.random() * 0.5, 32, 32]} position={[
        Math.sin(i) * 4 + (i % 2 ? 1 : -1),
        Math.cos(i) * 2 + (i % 3 ? 1 : -1),
        -2 + Math.sin(i * 2)
      ]}>
        <meshPhysicalMaterial
          color="#1ee0e0"
          transparent
          opacity={0.13 + 0.07 * (i % 3)}
          roughness={0.1}
          metalness={0.7}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transmission={0.95}
          ior={1.5}
          thickness={1.2}
        />
      </Sphere>
    ))}
    <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
  </Canvas>
);

const features = [
  {
    icon: (
      <svg className="w-10 h-10 text-cyan-400 drop-shadow-neon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
    ),
    title: 'Real-time AI Chat',
    desc: 'Instant, natural conversations with Arplexity AI. No lag, no limits.'
  },
  {
    icon: (
      <svg className="w-10 h-10 text-cyan-400 drop-shadow-neon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 014-4h4m0 0V7m0 4h-4" /></svg>
    ),
    title: 'Web Search',
    desc: 'Get up-to-date answers with live web search and source links.'
  },
  {
    icon: (
      <svg className="w-10 h-10 text-cyan-400 drop-shadow-neon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ),
    title: '3D Experience',
    desc: 'Futuristic, glassy, and animated. A chat UI like no other.'
  },
  {
    icon: (
      <svg className="w-10 h-10 text-cyan-400 drop-shadow-neon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8a9 9 0 100-18 9 9 0 000 18z" /></svg>
    ),
    title: 'Privacy First',
    desc: 'Your data stays yours. No tracking, no compromise.'
  },
];

export default function Landing() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-between bg-[#10131a] overflow-x-hidden">
      {/* 3D Glass Orbs Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <GlassOrbsBG />
      </div>
      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center pt-28 pb-20 w-full">
        {/* 3D Logo with glass halo */}
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1, type: 'spring' }} className="mb-8">
          <div className="relative flex items-center justify-center">
            <span className="absolute w-32 h-32 rounded-full bg-cyan-400/10 blur-2xl animate-pulse" />
            <span className="absolute w-24 h-24 rounded-full border-2 border-cyan-400/30 animate-spin-slow" />
            <div className="shadow-2xl rounded-full bg-[#181e29]/80 p-7">
              <Logo3D />
            </div>
          </div>
        </motion.div>
        {/* Animated Headline */}
        <motion.h1 initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.8, type: 'spring' }} className="text-6xl sm:text-7xl font-extrabold text-cyan-100 tracking-tight text-center mb-4 drop-shadow-xl">
          <span className="animate-glow">Arplexity</span>
        </motion.h1>
        {/* Glassy Info Card */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4, duration: 0.8, type: 'spring' }} className="bg-[#181e29]/80 border border-cyan-700/20 rounded-2xl shadow-xl px-8 py-6 mb-10 max-w-2xl text-center backdrop-blur-xl">
          <p className="text-2xl text-cyan-200/90 font-medium">
            The next-gen AI chat experience.<br />
            <span className="text-cyan-400 font-bold">Futuristic. Private. 3D. Mind-blowing.</span>
          </p>
        </motion.div>
        {/* 3D Effect Buttons */}
        <div className="flex gap-8 mt-2">
          <Link href="/chat">
            <motion.button whileHover={{ scale: 1.12, y: -2, boxShadow: '0 8px 32px 0 #14b8a6' }} whileTap={{ scale: 0.97 }} className="px-10 py-4 rounded-2xl bg-[#181e29] text-cyan-200 font-semibold text-xl shadow-xl border border-cyan-700/30 hover:bg-cyan-950/60 hover:text-cyan-100 transition-all duration-200 backdrop-blur-xl">
              Get Started
            </motion.button>
          </Link>
          <a href="#features" className="px-10 py-4 rounded-2xl bg-[#181e29] text-cyan-200 font-semibold text-xl shadow-xl border border-cyan-700/30 hover:bg-cyan-950/60 hover:text-cyan-100 transition-all duration-200 backdrop-blur-xl">
            Features
          </a>
        </div>
        {/* Floating 3D arrow for scroll cue */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }} className="flex flex-col items-center mt-12">
          <svg className="w-10 h-10 text-cyan-700 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </section>
      {/* Features Section */}
      <section id="features" className="relative z-10 w-full flex flex-col items-center py-20">
        <h2 className="text-4xl sm:text-5xl font-bold text-cyan-100 mb-14 text-center drop-shadow-lg">Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 w-full max-w-7xl px-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i, duration: 0.7, type: 'spring' }}
              whileHover={{ rotateY: 8, scale: 1.07, boxShadow: '0 8px 32px 0 #14b8a6' }}
              className="rounded-2xl bg-[#181e29]/80 border border-cyan-700/20 shadow-2xl p-10 flex flex-col items-center text-center backdrop-blur-xl hover:scale-105 transition-all duration-300 cursor-pointer"
              style={{ perspective: 800 }}
            >
              <div className="mb-5">{f.icon}</div>
              <h3 className="text-2xl font-bold text-cyan-100 mb-2">{f.title}</h3>
              <p className="text-cyan-200/80 text-lg">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
      {/* Footer */}
      <footer className="relative z-10 w-full flex flex-col items-center py-8 text-cyan-800 text-base opacity-80 backdrop-blur-xl border-t border-cyan-900/10">
        Made with <span className="mx-1">❤️</span> by Arplexity
      </footer>
      {/* Custom CSS for glow and neon effects */}
      <style>{`
        .animate-glow {
          animation: glow 2.5s ease-in-out infinite alternate;
        }
        @keyframes glow {
          0% { text-shadow: 0 0 8px #14b8a6, 0 0 16px #14b8a6; }
          100% { text-shadow: 0 0 24px #14b8a6, 0 0 48px #14b8a6; }
        }
        .drop-shadow-neon {
          filter: drop-shadow(0 0 8px #14b8a6) drop-shadow(0 0 16px #14b8a6);
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
