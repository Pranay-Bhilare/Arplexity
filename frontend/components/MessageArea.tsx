import React, { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo3D } from './Header';

interface SearchInfo {
    stages: string[];
    query: string;
    urls: string[];
    error?: string;
}

interface Message {
    id: number;
    content: string;
    isUser: boolean;
    isLoading?: boolean;
    searchInfo?: SearchInfo;
}

interface MessageAreaProps {
    messages: Message[];
}

const PremiumTypingAnimation: React.FC = () => {
    return (
        <div className="flex items-center">
            <div className="flex items-center space-x-1.5">
                <div className="w-1.5 h-1.5 bg-gray-400/70 rounded-full animate-pulse" style={{ animationDuration: "1s", animationDelay: "0ms" }}></div>
                <div className="w-1.5 h-1.5 bg-gray-400/70 rounded-full animate-pulse" style={{ animationDuration: "1s", animationDelay: "300ms" }}></div>
                <div className="w-1.5 h-1.5 bg-gray-400/70 rounded-full animate-pulse" style={{ animationDuration: "1s", animationDelay: "600ms" }}></div>
            </div>
        </div>
    );
};

const SearchStages: React.FC<{ searchInfo: SearchInfo }> = ({ searchInfo }) => {
    if (!searchInfo || !searchInfo.stages || searchInfo.stages.length === 0) return null;

    return (
        <div className="max-w-[70%] sm:max-w-xl mr-auto w-full">
            <div className="mb-3 mt-1 relative pl-4">
                {/* Search Process UI */}
                <div className="flex flex-col space-y-4 text-sm text-blue-200">
                    {/* Searching Stage */}
                    {searchInfo.stages.includes('searching') && (
                        <div className="relative">
                            {/* Green dot */}
                            <div className="absolute -left-3 top-1 w-2.5 h-2.5 bg-teal-400 rounded-full z-10 shadow-[0_0_8px_2px_rgba(45,212,191,0.5)] animate-pulse"></div>

                            {/* Connecting line to next item if reading exists */}
                            {searchInfo.stages.includes('reading') && (
                                <div className="absolute -left-[7px] top-3 w-0.5 h-[calc(100%+1rem)] bg-gradient-to-b from-teal-300 to-teal-200 shadow-[0_0_8px_2px_rgba(45,212,191,0.3)] animate-pulse"></div>
                            )}

                            <div className="flex flex-col">
                                <span className="font-semibold mb-2 ml-2 text-blue-100 drop-shadow-sm">Searching the web</span>

                                {/* Search Query in box styling */}
                                <div className="flex flex-wrap gap-2 pl-2 mt-1">
                                    <div className="bg-cyan-900/30 text-cyan-100 border-cyan-400/20 hover:bg-cyan-800/40 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/40 text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 shadow-md backdrop-blur-sm inline-flex items-center">
                                        <svg className="w-3 h-3 mr-1.5 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                        </svg>
                                        {searchInfo.query}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Reading Stage */}
                    {searchInfo.stages.includes('reading') && (
                        <div className="relative">
                            {/* Green dot */}
                            <div className="absolute -left-3 top-1 w-2.5 h-2.5 bg-teal-400 rounded-full z-10 shadow-[0_0_8px_2px_rgba(45,212,191,0.5)] animate-pulse"></div>

                            <div className="flex flex-col">
                                <span className="font-semibold mb-2 ml-2 text-blue-100 drop-shadow-sm">Reading</span>

                                {/* Search Results */}
                                {searchInfo.urls && searchInfo.urls.length > 0 && (
                                    <div className="pl-2 space-y-1">
                                        <div className="flex flex-wrap gap-2">
                                            {Array.isArray(searchInfo.urls) ? (
                                                searchInfo.urls.map((url: string | unknown, index: number) => {
                                                    const urlStr = typeof url === 'string' ? url : String(url);
                                                    return (
                                                        <a
                                                            key={index}
                                                            href={typeof url === 'string' ? url : '#'}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="bg-cyan-900/30 text-cyan-100 border-cyan-400/20 hover:bg-cyan-800/40 hover:text-white hover:underline focus:outline-none focus:ring-2 focus:ring-cyan-400/40 text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 truncate max-w-[220px] shadow-md backdrop-blur-sm"
                                                            title={urlStr}
                                                        >
                                                            {urlStr.substring(0, 30)}
                                                        </a>
                                                    );
                                                })
                                            ) : (
                                                <a
                                                    href={typeof searchInfo.urls === 'string' ? searchInfo.urls : '#'}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="bg-cyan-900/30 text-cyan-100 border-cyan-400/20 hover:bg-cyan-800/40 hover:text-white hover:underline focus:outline-none focus:ring-2 focus:ring-cyan-400/40 text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 truncate max-w-[220px] shadow-md backdrop-blur-sm"
                                                    title={typeof searchInfo.urls === 'string' ? searchInfo.urls : String(searchInfo.urls)}
                                                >
                                                    {(typeof searchInfo.urls === 'string' ? searchInfo.urls : String(searchInfo.urls)).substring(0, 30)}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Writing Stage */}
                    {searchInfo.stages.includes('writing') && (
                        <div className="relative">
                            {/* Green dot with subtle glow effect */}
                            <div className="absolute -left-3 top-1 w-2.5 h-2.5 bg-teal-400 rounded-full z-10 shadow-[0_0_8px_2px_rgba(45,212,191,0.5)] animate-pulse"></div>
                            <span className="font-semibold pl-2 text-blue-100 drop-shadow-sm">Writing answer</span>
                        </div>
                    )}

                    {/* Error Message */}
                    {searchInfo.stages.includes('error') && (
                        <div className="relative">
                            {/* Red dot over the vertical line */}
                            <div className="absolute -left-3 top-1 w-2.5 h-2.5 bg-red-400 rounded-full z-10 shadow-[0_0_8px_2px_rgba(45,212,191,0.5)] animate-pulse"></div>
                            <span className="font-semibold text-red-300 drop-shadow-sm">Search error</span>
                            <div className="pl-4 text-xs text-red-500 mt-1">
                                {searchInfo.error || "An error occurred during search."}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Subtle animated 3D particles background
const ParticlesBG = () => (
  <Canvas style={{ position: 'absolute', inset: 0, zIndex: 0 }} camera={{ position: [0, 0, 1] }}>
    <Points limit={100}>
      <sphereGeometry args={[1, 32, 32]} />
      <PointMaterial
        transparent
        color="#60a5fa"
        size={0.03}
        sizeAttenuation
        depthWrite={false}
      />
    </Points>
  </Canvas>
);

// User avatar SVG
const UserAvatar = () => (
  <div className="ml-3 flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-700/80 to-blue-400/80 shadow-lg">
    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  </div>
);

const MessageArea: React.FC<MessageAreaProps> = ({ messages }) => {
    const bottomRef = useRef<HTMLDivElement | null>(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    return (
        <div className="flex-grow overflow-y-auto relative bg-gradient-to-br from-[#10131a] via-[#181e29] to-[#0a0d13] backdrop-blur-2xl border-b border-[#23293a]" style={{ minHeight: 0 }} tabIndex={0}>
            {/* 3D Particles Background */}
            <div className="absolute inset-0 pointer-events-none select-none z-0">
              <ParticlesBG />
            </div>
            <div className="w-full p-2 sm:p-6 px-2 sm:px-6 relative z-10">
                <AnimatePresence initial={false}>
                {messages.map((message: Message) => (
                    <motion.div
                        key={message.id}
                        className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} items-end mb-4 sm:mb-5 gap-x-2`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                        {/* AI avatar/logo on left */}
                        {!message.isUser && (
                            <div className="flex items-end self-end justify-center w-10 h-10">
                                <Logo3D />
                            </div>
                        )}
                        <div className="flex flex-col">
                            {/* Search Status Display - Now ABOVE the message */}
                            {!message.isUser && message.searchInfo && (
                                <SearchStages searchInfo={message.searchInfo} />
                            )}
                            {/* Message Content */}
                            <div
                                className={`group rounded-2xl py-4 px-6 transition-all duration-200 shadow-xl border backdrop-blur-lg text-base leading-relaxed select-text max-w-[70%] sm:max-w-xl w-full break-words
                                    ${message.isUser
                                        ? 'bg-gradient-to-br from-[#1e293b]/90 to-[#334155]/90 text-white border-blue-700/30 focus:ring-blue-400/40 focus:ring-2 ml-auto'
                                        : 'bg-gradient-to-br from-[#23293a]/80 to-[#1e2233]/90 text-blue-100 border-blue-900/20 focus:ring-blue-300/30 focus:ring-2 mr-auto'}
                                    focus:outline-none
                                    group-hover:shadow-[0_4px_32px_0_rgba(56,189,248,0.10)] group-hover:-translate-y-1
                                    group-hover:ring-2 group-hover:ring-blue-400/20
                                    shadow-inner shadow-blue-400/5`
                                }
                                tabIndex={0}
                            >
                                {message.isLoading ? (
                                    <PremiumTypingAnimation />
                                ) : (
                                    message.content
                                )}
                            </div>
                        </div>
                        {/* User avatar on right */}
                        {message.isUser && (
                            <div className="flex items-end self-end justify-center w-10 h-10">
                                <UserAvatar />
                            </div>
                        )}
                    </motion.div>
                ))}
                </AnimatePresence>
                {/* Dummy div for scroll-to-bottom */}
                <div ref={bottomRef} />
            </div>
        </div>
    );
};

export default MessageArea;
