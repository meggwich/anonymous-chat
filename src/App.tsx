import { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './App.css';
import MessageList from './components/MessageList';
import MessageForm from './components/MessageForm';

interface Message {
  id: string;
  userId: string;
  content: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [lastMessageId, setLastMessageId] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Инициализация userId из localStorage или создание нового
  useEffect(() => {
    const storedUserId = localStorage.getItem('chatUserId');
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      const newUserId = uuidv4();
      localStorage.setItem('chatUserId', newUserId);
      setUserId(newUserId);
    }
  }, []);

  // Мемоизированная функция для получения новых сообщений
  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:7070/messages?from=${lastMessageId}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      
      if (data.length > 0) {
        setMessages(prevMessages => [...prevMessages, ...data as Message[]]);
        setLastMessageId(data[data.length - 1].id);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [lastMessageId]);

  // Инициализация сообщений и настройка полинга
  useEffect(() => {
    const loadInitialMessages = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:7070/messages?from=0');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        
        if (data.length > 0) {
          setMessages(data as Message[]);
          setLastMessageId(data[data.length - 1].id);
        }
      } catch (error) {
        console.error('Error loading initial messages:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadInitialMessages();
    }
  }, [userId]);

  // Настройка интервала опроса сервера
  useEffect(() => {
    if (!userId) return;
    
    const interval = setInterval(() => {
      fetchMessages();
    }, 3000); // Проверка новых сообщений каждые 3 секунды
    
    return () => clearInterval(interval);
  }, [userId, lastMessageId, fetchMessages]);

  // Автоскроллинг к последнему сообщению
  useEffect(() => {
    if (messages.length > 0 && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Мемоизированная функция для отправки нового сообщения
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    setLoading(true);
    
    try {
      const newMessage = {
        id: 0, // Сервер заменит на реальный ID
        userId,
        content
      };
      
      const response = await fetch('http://localhost:7070/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newMessage)
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      // Немедленно получаем новые сообщения вместо ожидания интервала
      await fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, fetchMessages]);

  return (
    <div className="chat-container">
      <h1>Анонимный чат</h1>
      <div className="chat-box">
        {loading && <div className="loading-indicator">Загрузка...</div>}
        <MessageList 
          messages={messages} 
          currentUserId={userId} 
          messagesEndRef={messagesEndRef}
        />
      </div>
      <MessageForm onSendMessage={sendMessage} isLoading={loading} />
    </div>
  );
}

export default App;