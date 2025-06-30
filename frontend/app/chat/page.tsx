"use client"
import React, { useState } from 'react';
import Header from '@/components/Header';
import InputBar from '@/components/InputBar';
import MessageArea from '@/components/MessageArea';

// Types
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

// API endpoint for streaming chat responses
const CHAT_API_URL = 'http://127.0.0.1:8000/chat_stream/';

// Initial chat messages
const INITIAL_MESSAGES: Message[] = [
  { id: 1, content: 'Hi there, how can I help you?', isUser: false },
  { id: 2, content: 'Hello! I have a question.', isUser: true },
  { id: 3, content: 'Sure, go ahead!', isUser: false }
];

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [checkpointId, setCheckpointId] = useState<string | null>(null);

  // Handles user message submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (currentMessage.trim()) {
      // Generate new message IDs
      const newMessageId = messages.length > 0 ? Math.max(...messages.map(msg => msg.id)) + 1 : 1;
      const userMessage: Message = {
        id: newMessageId,
        content: currentMessage,
        isUser: true
      };
      // Add user message and AI response placeholder
      setMessages(prev => [
        ...prev,
        userMessage,
        {
          id: newMessageId + 1,
          content: '',
          isUser: false,
          isLoading: true,
          searchInfo: { stages: [], query: '', urls: [] }
        }
      ]);
      const userInput = currentMessage;
      setCurrentMessage("");

      // Build the EventSource URL with checkpointId if available
      let url = `${CHAT_API_URL}${encodeURIComponent(userInput)}`;
      if (checkpointId) {
        url += `?checkpoint_id=${encodeURIComponent(checkpointId)}`;
      }
      const aiResponseId = newMessageId + 1;
      const eventSource = new window.EventSource(url);
      let streamedContent = '';
      let searchData: SearchInfo | null = null;

      // Handle incoming SSE events
      eventSource.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'checkpoint') {
            // Store checkpointId for this session
            if (data.checkpoint_id) {
              setCheckpointId(data.checkpoint_id);
            }
          } else if (data.type === 'content') {
            streamedContent += data.content;
            setMessages(prev =>
              prev.map(msg =>
                msg.id === aiResponseId
                  ? { ...msg, content: streamedContent, isLoading: false }
                  : msg
              )
            );
          } else if (data.type === 'search_start') {
            // Create search info with 'searching' stage
            const newSearchInfo: SearchInfo = {
              stages: ['searching'],
              query: data.query,
              urls: []
            };
            searchData = newSearchInfo;
            setMessages(prev =>
              prev.map(msg =>
                msg.id === aiResponseId
                  ? { ...msg, content: streamedContent, searchInfo: newSearchInfo, isLoading: false }
                  : msg
              )
            );
          } else if (data.type === 'search_results') {
            // Parse URLs from search results robustly
            let urls: string[] = [];
            if (Array.isArray(data.urls)) {
              urls = data.urls;
            } else if (typeof data.urls === 'string') {
              try {
                const parsed = JSON.parse(data.urls);
                urls = Array.isArray(parsed) ? parsed : [data.urls];
              } catch {
                urls = [data.urls];
              }
            }
            const newSearchInfo: SearchInfo = {
              stages: searchData ? [...searchData.stages, 'reading'] : ['reading'],
              query: searchData?.query || '',
              urls: urls
            };
            searchData = newSearchInfo;
            setMessages(prev =>
              prev.map(msg =>
                msg.id === aiResponseId
                  ? { ...msg, content: streamedContent, searchInfo: newSearchInfo, isLoading: false }
                  : msg
              )
            );
          } else if (data.type === 'search_error') {
            // Handle search error
            const newSearchInfo: SearchInfo = {
              stages: searchData ? [...searchData.stages, 'error'] : ['error'],
              query: searchData?.query || '',
              error: data.error,
              urls: []
            };
            searchData = newSearchInfo;
            setMessages(prev =>
              prev.map(msg =>
                msg.id === aiResponseId
                  ? { ...msg, content: streamedContent, searchInfo: newSearchInfo, isLoading: false }
                  : msg
              )
            );
          } else if (data.type === 'end') {
            // When stream ends, add 'writing' stage if we had search info
            if (searchData) {
              const finalSearchInfo: SearchInfo = {
                ...searchData,
                stages: [...searchData.stages, 'writing']
              };
              setMessages(prev =>
                prev.map(msg =>
                  msg.id === aiResponseId
                    ? { ...msg, searchInfo: finalSearchInfo, isLoading: false }
                    : msg
                )
              );
            }
            eventSource.close();
          }
        } catch (error) {
          console.error('Error parsing event data:', error, event.data);
        }
      };
      // Handle SSE errors
      eventSource.onerror = (error: Event) => {
        console.error('EventSource error:', error);
        eventSource.close();
        setMessages(prev =>
          prev.map(msg =>
            msg.id === aiResponseId
              ? { ...msg, content: 'Sorry, there was an error processing your request.', isLoading: false }
              : msg
          )
        );
      };
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-full bg-transparent">
      {/* Main container: glassy, dark, seamless, with inner glow and animated overlay */}
      <div className="w-full sm:w-[90%] md:w-[80%] lg:w-[70%] bg-gradient-to-br from-[#181e29]/80 to-[#23293a]/80 backdrop-blur-3xl rounded-[2.2rem] shadow-[0_8px_40px_0_rgba(16,30,60,0.45)] border border-blue-900/40 flex flex-col overflow-hidden h-[90vh] max-h-[900px] transition-all duration-300 relative">
        {/* Animated gradient overlay for extra depth */}
        <div className="pointer-events-none absolute inset-0 z-0 rounded-[2.2rem] bg-gradient-to-tr from-blue-400/5 via-indigo-400/5 to-blue-900/10 animate-gradient-move" />
        {/* Soft inner border glow */}
        <div className="pointer-events-none absolute inset-0 z-0 rounded-[2.2rem] border-2 border-blue-400/10 shadow-[0_0_32px_4px_rgba(56,189,248,0.08)_inset]" />
        <div className="relative z-10 flex flex-col h-full">
          {/* Header component */}
          <Header />
          {/* MessageArea component with messages state */}
          <MessageArea messages={messages} />
          {/* InputBar component with state and handlers */}
          <InputBar currentMessage={currentMessage} setCurrentMessage={setCurrentMessage} onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
