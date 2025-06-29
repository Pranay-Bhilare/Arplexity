import React from 'react';
import Header from '@/components/Header';
import InputBar from '@/components/InputBar';
import MessageArea from '@/components/MessageArea';

const staticMessages = [
  { id: 1, content: 'Hi there, how can I help you?', isUser: false },
  { id: 2, content: 'Hello! I have a question.', isUser: true },
  { id: 3, content: 'Sure, go ahead!', isUser: false }
];

const ChatPage = () => {
  return (
    <div className="flex justify-center bg-gray-100 min-h-screen py-8 px-4">
      {/* Main container with shadow and border */}
      <div className="w-[70%] bg-white flex flex-col rounded-xl shadow-lg border border-gray-100 overflow-hidden h-[90vh]">
        {/* Header component */}
        <Header />
        {/* MessageArea component with static messages */}
        <MessageArea messages={staticMessages} />
        {/* InputBar component */}
        <InputBar />
      </div>
    </div>
  );
};

export default ChatPage;
