import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as React from 'react';

export const Logo3D = () => (
  <Canvas
    style={{ background: 'transparent', width: 40, height: 40 }}
    camera={{ position: [0, 0, 5], fov: 50 }}
    gl={{ preserveDrawingBuffer: true, alpha: true }}
  >
    <ambientLight intensity={0.7} />
    <directionalLight position={[2, 2, 5]} intensity={1} />
    <mesh castShadow receiveShadow>
      <torusKnotGeometry args={[1, 0.3, 128, 32]} />
      <meshStandardMaterial color="#14b8a6" metalness={0.7} roughness={0.2} />
    </mesh>
    <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={2} />
  </Canvas>
);

const navItems = [
  { label: 'CHAT', active: true },
];

const Header = () => {
  return (
    <header className="relative flex flex-col sm:flex-row items-center justify-between px-4 sm:px-10 py-5 bg-gradient-to-br from-[#232136] via-[#2a273f] to-[#181825] backdrop-blur-xl bg-opacity-80 shadow-2xl rounded-b-3xl border-b border-white/10 z-20 overflow-hidden">
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-2xl pointer-events-none z-0" />
      {/* Subtle animated gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-tr from-teal-400/10 via-indigo-400/10 to-purple-400/10 z-0"
        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
        style={{ backgroundSize: '200% 200%' }}
      />
      {/* 3D Logo */}
      <div className="flex items-center relative mb-3 sm:mb-0 z-10">
        <div className="mr-3">
          <Logo3D />
        </div>
        <span className="font-extrabold text-white text-2xl tracking-tight drop-shadow-lg select-none">Arplexity</span>
      </div>
      {/* Navigation */}
      <nav className="flex items-center space-x-2 w-full sm:w-auto justify-center z-10">
        {navItems.map((item, idx) => (
          <motion.a
            key={item.label}
            className={`relative text-xs px-5 py-2 font-semibold rounded-xl transition-all duration-200 cursor-pointer outline-none focus:ring-2 focus:ring-teal-400/50 focus:z-20
              ${item.active
                ? 'bg-gradient-to-r from-teal-500/80 to-indigo-500/80 text-white shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-white/10'}
            `}
            whileHover={{ scale: 1.08, y: -2, boxShadow: '0 4px 24px 0 rgba(20,184,166,0.15)' }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            tabIndex={0}
          >
            {item.label}
            {item.active && (
              <motion.span
                layoutId="nav-underline"
                className="absolute left-1/2 -bottom-1 w-2/3 h-1 bg-gradient-to-r from-teal-400 to-indigo-400 rounded-full -translate-x-1/2"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </motion.a>
        ))}
      </nav>
    </header>
  );
};

export default Header;