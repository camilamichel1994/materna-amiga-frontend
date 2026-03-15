import React, { useState, FormEvent, ChangeEvent, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TopNav from '../../components/TopNav';
import { getChatsService, getChatMessagesService, sendMessageService, markChatAsReadService, Chat as ChatType, Message } from '../../services';
import './Chat.css';
import { useAccount } from '../../contexts/AccountContext';
import Avatar from '../../components/Avatar';

const Chat: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [chats, setChats] = useState<ChatType[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAccount();

  const loadChats = useCallback(async () => {
    setIsLoading(true);
    try {
      const chatsList = await getChatsService();
      setChats(chatsList);
    } catch (error: any) {
      console.error('Error loading chats:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    loadChats();
  }, [user, loadChats]);

  useEffect(() => {
    const openChatId = (location.state as { openChatId?: string } | null)?.openChatId;
    if (!openChatId) return;
    const inList = chats.some((c) => c.id === openChatId);
    if (inList) {
      setSelectedChat(openChatId);
      navigate('/chat', { replace: true, state: {} });
      return;
    }
    if (chats.length > 0) {
      getChatsService().then((list) => {
        setChats(list);
        if (list.some((c) => c.id === openChatId)) setSelectedChat(openChatId);
        navigate('/chat', { replace: true, state: {} });
      });
    }
  }, [chats, location.state, navigate]);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat);
      markChatAsRead(selectedChat);
    }
  }, [selectedChat]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMessages = async (chatId: string) => {
    try {
      const response = await getChatMessagesService(chatId);
      setMessages(response.messages || []);
    } catch (error: any) {
      console.error('Error loading messages:', error);
    }
  };

  const markChatAsRead = async (chatId: string) => {
    try {
      await markChatAsReadService(chatId);
      loadChats();
    } catch (error: any) {
      console.error('Error marking chat as read:', error);
    }
  };

  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat) return;

    try {
      const newMessage = await sendMessageService(selectedChat, { text: message });
      setMessages([...messages, newMessage]);
      setMessage('');
      loadChats();
    } catch (error: any) {
      console.error('Error sending message:', error);
    }
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Ontem';
    } else if (days < 7) {
      return `${days} dias atrás`;
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  if (selectedChat) {
    const chat = chats.find(c => c.id === selectedChat);

    return (
      <div className="chat-screen">
        <TopNav />
        <div className="chat-header">
          <button className="back-button" onClick={() => setSelectedChat(null)}>
            ←
          </button>
          <div className="chat-header-info">
            <div className="chat-name">{chat?.other_user.name}</div>
            <div className="chat-item">{chat?.item.name}</div>
          </div>
        </div>
        <div className="messages-container">
          {[...messages].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).map(msg => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={`message ${isMe ? 'me' : 'other'}`}>
                <div className="message-bubble">
                  {msg.text}
                </div>
                <div className="message-time">{formatTime(msg.created_at)}</div>
              </div>
            );
          })}
        </div>
        <form onSubmit={handleSendMessage} className="message-input-form">
          <input
            type="text"
            className="message-input"
            placeholder="Digite sua mensagem..."
            value={message}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
          />
          <button type="submit" className="send-button">➤</button>
        </form>
      </div>
    );
  }

  return (
    <div className="chat-screen">
      <TopNav />
      <div className="page-container">
        <div className="chat-list-header">
          <h1 className="page-title">Conversas</h1>
        </div>
        <div className="chat-list" role="list">
          {isLoading ? (
            <div className="sk-chat-list">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="sk-chat-item">
                  <div className="sk sk-circle sk-chat-avatar" />
                  <div className="sk-chat-lines">
                    <div className="sk sk-text" style={{ width: '45%' }} />
                    <div className="sk sk-text-sm" style={{ width: '70%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : chats.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <p>Nenhuma conversa ainda</p>
              <p className="empty-hint">Inicie uma conversa a partir de um item no feed!</p>
            </div>
          ) : (
            chats.map(chat => (
              <div
                key={chat.id}
                className="chat-item-card"
                role="listitem"
                onClick={() => setSelectedChat(chat.id)}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedChat(chat.id)}
                tabIndex={0}
              >
                <div className="chat-avatar" aria-hidden>
                  <Avatar src={chat.other_user.avatar_url} name={chat.other_user.name} />
                </div>
                <div className="chat-info">
                  <div className="chat-item-name">{chat.item.name}</div>
                  <div className="chat-sender-name">{chat.other_user.name}</div>
                  <div className="chat-last-message">{chat.last_message?.text || 'Sem mensagens'}</div>
                </div>
                <div className="chat-meta">
                  <div className="chat-time">
                    {chat.last_message ? formatTime(chat.last_message.created_at) : '—'}
                  </div>
                  {chat.unread_count > 0 && (
                    <span className="unread-badge" aria-label={`${chat.unread_count} não lidas`}>
                      {chat.unread_count}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;

