// Функция для генерации цвета на основе userId
const generateUserColor = (userId: string) => {
  // Используем последние 6 символов UUID для создания цвета
  const hash = userId.slice(-6);
  // Ограничиваем яркость цветов для лучшей читаемости
  return `#${hash}`;
};

import React, { RefObject } from 'react';

interface Message {
  id: string;
  userId: string;
  content: string;
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  messagesEndRef: RefObject<HTMLDivElement | null>;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId, messagesEndRef }) => {
  // Кэшируем цвета для пользователей
  const userColors: { [key: string]: string } = {};
  
  return (
    <div className="message-list">
      {messages.map((message) => {
        const isCurrentUser = message.userId === currentUserId;
        
        // Получаем или генерируем цвет для пользователя
        if (!userColors[message.userId]) {
          userColors[message.userId] = generateUserColor(message.userId);
        }
        const userColor = userColors[message.userId];
        
        return (
          <div 
            key={message.id} 
            className={`message-item ${isCurrentUser ? 'message-right' : 'message-left'}`}
          >
            <div 
              className="message-bubble" 
              style={{ 
                backgroundColor: isCurrentUser ? '#dcf8c6' : userColor,
                color: isCurrentUser ? '#000' : '#fff'
              }}
            >
              {message.content}
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList