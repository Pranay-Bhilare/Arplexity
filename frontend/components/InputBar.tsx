import React from "react"
import { motion } from 'framer-motion';

interface InputBarProps {
    currentMessage: string;
    setCurrentMessage: React.Dispatch<React.SetStateAction<string>>;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const InputBar: React.FC<InputBarProps> = ({ currentMessage, setCurrentMessage, onSubmit }) => {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentMessage(e.target.value)
    }

    return (
        <form onSubmit={onSubmit} className="p-4 bg-gradient-to-t from-[#10131a]/80 via-[#181e29]/80 to-transparent backdrop-blur-xl border-t border-[#23293a]">
            <div className="flex items-center bg-gradient-to-br from-[#23293a]/80 to-[#1e2233]/80 rounded-full p-3 shadow-2xl border border-blue-900/30 backdrop-blur-lg relative">
                <motion.button
                    type="button"
                    className="p-2 rounded-full text-blue-300 hover:text-white hover:bg-blue-900/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </motion.button>
                <input
                    type="text"
                    placeholder="Type a message"
                    value={currentMessage}
                    onChange={handleChange}
                    className="flex-grow px-4 py-2 bg-transparent focus:outline-none text-white placeholder-blue-300 text-base"
                />
                <motion.button
                    type="button"
                    className="p-2 text-blue-300 hover:text-white hover:bg-blue-900/30 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                    </svg>
                </motion.button>
                <motion.button
                    type="submit"
                    className="bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-800 hover:to-blue-600 rounded-full p-3 ml-2 shadow-lg transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                    whileHover={{ scale: 1.12, boxShadow: '0 0 16px 2px #3b82f6' }}
                    whileTap={{ scale: 0.97 }}
                >
                    <svg className="w-6 h-6 text-white transform rotate-45 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                    </svg>
                </motion.button>
            </div>
        </form>
    )
}

export default InputBar;