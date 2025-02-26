// components/MessageForm.jsx
import React, { useState } from 'react';

interface MessageFormProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const MessageForm: React.FC<MessageFormProps> = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <form className="message-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Введите сообщение..."
        disabled={isLoading}
      />
      <button type="submit" disabled={isLoading || !message.trim()}>
        {isLoading ? 'Отправка...' : 'Отправить'}
      </button>
    </form>
  );
};

export default MessageForm;

