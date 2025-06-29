import React from 'react';

const ChatPage = () => {
  return (
    <div className="flex justify-center bg-gray-100 min-h-screen py-8 px-4">
      {/* Main container with shadow and border */}
      <div className="w-[70%] bg-white flex flex-col rounded-xl shadow-lg border border-gray-100 overflow-hidden h-[90vh]">
        {/* Header placeholder */}
        <div className="h-20 bg-gradient-to-r from-[#4A3F71] to-[#5E507F] flex items-center justify-center">
          <span className="text-white text-xl font-bold">Header</span>
        </div>
        {/* Message area placeholder */}
        <div className="flex-grow bg-[#FCFCF8] border-b border-gray-100 flex items-center justify-center">
          <span className="text-gray-400">Messages will appear here</span>
        </div>
        {/* Input bar placeholder */}
        <div className="h-24 bg-white flex items-center justify-center border-t border-gray-100">
          <span className="text-gray-400">Input bar</span>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
