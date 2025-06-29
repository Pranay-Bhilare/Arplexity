import React from 'react';
import Header from '@/components/Header';
import InputBar from '@/components/InputBar';

const ChatPage = () => {
  return (
    <div className="flex justify-center bg-gray-100 min-h-screen py-8 px-4">
      {/* Main container with shadow and border */}
      <div className="w-[70%] bg-white flex flex-col rounded-xl shadow-lg border border-gray-100 overflow-hidden h-[90vh]">
        {/* Header component */}
        <Header />
        {/* Message area placeholder */}
        <div className="flex-grow bg-[#FCFCF8] border-b border-gray-100 flex items-center justify-center">
          <span className="text-gray-400">Messages will appear here</span>
        </div>
        {/* InputBar component */}
        <InputBar />
      </div>
    </div>
  );
};

export default ChatPage;
