import React, { useState, FormEvent, ChangeEvent, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import TopNav from '../../components/TopNav';
import {
  getChatsService, getChatMessagesService, sendMessageService, markChatAsReadService,
  Chat as ChatType, Message,
  getListingByIdService, Listing, ListingTypeApi,
  createTransactionService, getTransactionsService, TransactionItem,
  createReviewService, getReviewsByUserService,
} from '../../services';
import './Chat.css';
import { useAccount } from '../../contexts/AccountContext';
import Avatar from '../../components/Avatar';

const SELLER_CONFIRM_PREFIX = '✅ Transação finalizada:';

const getSellerActionLabel = (type?: ListingTypeApi) => {
  switch (type) {
    case 'doacao': return 'Doei para essa pessoa';
    case 'troca': return 'Troquei com essa pessoa';
    default: return 'Vendi para essa pessoa';
  }
};

const getSellerConfirmQuestion = (type?: ListingTypeApi) => {
  switch (type) {
    case 'doacao': return 'Confirmar que doou este item?';
    case 'troca': return 'Confirmar que trocou este item?';
    default: return 'Confirmar que vendeu este item?';
  }
};

const getSellerMessage = (type?: ListingTypeApi, itemName?: string) => {
  switch (type) {
    case 'doacao': return `${SELLER_CONFIRM_PREFIX} Doei "${itemName}" para você! Por favor, confirme o recebimento.`;
    case 'troca': return `${SELLER_CONFIRM_PREFIX} Troquei "${itemName}" com você! Por favor, confirme o recebimento.`;
    default: return `${SELLER_CONFIRM_PREFIX} Vendi "${itemName}" para você! Por favor, confirme o recebimento.`;
  }
};

const getCompletedLabel = (type?: ListingTypeApi) => {
  switch (type) {
    case 'doacao': return 'Doação concluída';
    case 'troca': return 'Troca concluída';
    default: return 'Venda concluída';
  }
};

const Chat: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [chats, setChats] = useState<ChatType[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAccount();

  const [listingDetails, setListingDetails] = useState<Listing | null>(null);
  const [chatTransaction, setChatTransaction] = useState<TransactionItem | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

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
      const chat = chats.find(c => c.id === selectedChat);
      if (chat) loadListingAndTransaction(chat.item.id);
    } else {
      setListingDetails(null);
      setChatTransaction(null);
      setReviewSubmitted(false);
      setSelectedRating(0);
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

  const loadListingAndTransaction = async (listingId: string) => {
    try {
      const [listing, txResponse] = await Promise.all([
        getListingByIdService(listingId),
        getTransactionsService(1, 100),
      ]);
      setListingDetails(listing);
      const existing = txResponse.items.find(t => t.listing.id === listingId);
      setChatTransaction(existing || null);

      const sId = listing.seller?.id || listing.ownerId;
      if (sId && user?.id !== sId) {
        try {
          const reviewsResponse = await getReviewsByUserService(sId, 1, 100);
          const alreadyReviewed = reviewsResponse.items.some(r => r.reviewer.id === user?.id);
          setReviewSubmitted(alreadyReviewed);
        } catch {
          setReviewSubmitted(false);
        }
      }
    } catch (error) {
      console.error('Error loading listing/transaction:', error);
    }
  };

  const handleSellerConfirm = async () => {
    const chat = chats.find(c => c.id === selectedChat);
    if (!selectedChat || !listingDetails || !chat) return;
    setIsSubmitting(true);
    try {
      const text = getSellerMessage(listingDetails.listingType, chat.item.name);
      const newMsg = await sendMessageService(selectedChat, { text });
      setMessages(prev => [...prev, newMsg]);
      setShowConfirmDialog(false);
      loadChats();
      toast.success('Solicitação enviada! Aguarde a confirmação.');
    } catch (error) {
      console.error('Error sending confirmation message:', error);
      toast.error('Erro ao enviar solicitação');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBuyerConfirmReceipt = async () => {
    if (!selectedChat || !listingDetails) return;
    setIsSubmitting(true);
    try {
      await createTransactionService({ listing_id: listingDetails.id });
      await loadListingAndTransaction(listingDetails.id);
      toast.success('Recebimento confirmado!');
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast.error('Erro ao confirmar recebimento');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReview = async (rating: number) => {
    const reviewedUserId = listingDetails?.seller?.id || listingDetails?.ownerId;
    if (!listingDetails || !reviewedUserId) return;
    setIsSubmitting(true);
    try {
      await createReviewService({
        reviewed_user_id: reviewedUserId,
        rating,
        comment: '',
      });
      setReviewSubmitted(true);
      toast.success('Avaliação enviada!');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Erro ao enviar avaliação');
    } finally {
      setIsSubmitting(false);
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
    const sellerId = listingDetails?.seller?.id || listingDetails?.ownerId;
    const isSeller = !!listingDetails && !!sellerId && user?.id === sellerId;
    const isBuyer = !!listingDetails && !!sellerId && user?.id !== sellerId;
    const hasTransaction = !!chatTransaction;
    const sellerHasSignaled = messages.some(m => m.text.startsWith(SELLER_CONFIRM_PREFIX));

    return (
      <div className="chat-screen">
        <TopNav />
        <div className="chat-header">
          <button className="back-button" onClick={() => setSelectedChat(null)}>
            ←
          </button>
          <div className="chat-header-info">
            <div className="chat-name">{chat?.other_user.name}</div>
            <div
              className="chat-item chat-item-link"
              onClick={() => chat && navigate(`/item/${chat.item.id}`)}
            >
              {chat?.item.name}
            </div>
          </div>

          {isSeller && !hasTransaction && !sellerHasSignaled && (
            <button
              className="transaction-action-btn"
              onClick={() => setShowConfirmDialog(true)}
            >
              {getSellerActionLabel(listingDetails?.listingType)}
            </button>
          )}

          {isSeller && !hasTransaction && sellerHasSignaled && (
            <span className="transaction-badge pending">
              ⏳ Aguardando confirmação
            </span>
          )}

          {isSeller && hasTransaction && (
            <span className="transaction-badge completed">
              ✓ {getCompletedLabel(listingDetails?.listingType)}
            </span>
          )}

          {isBuyer && !hasTransaction && sellerHasSignaled && (
            <button
              className="transaction-action-btn buyer"
              onClick={handleBuyerConfirmReceipt}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Confirmando...' : 'Confirmar recebimento'}
            </button>
          )}

          {isBuyer && hasTransaction && !reviewSubmitted && (
            <div className="rating-inline">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  className={`star-btn ${star <= (hoverRating || selectedRating) ? 'filled' : ''}`}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => {
                    setSelectedRating(star);
                    handleSubmitReview(star);
                  }}
                  disabled={isSubmitting}
                  aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
                >
                  ★
                </button>
              ))}
            </div>
          )}

          {isBuyer && hasTransaction && reviewSubmitted && (
            <span className="transaction-badge reviewed">
              ★ Avaliado
            </span>
          )}
        </div>

        {showConfirmDialog && (
          <div className="confirm-overlay" onClick={() => setShowConfirmDialog(false)}>
            <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
              <p className="confirm-text">{getSellerConfirmQuestion(listingDetails?.listingType)}</p>
              <p className="confirm-subtext">
                Item: <strong>{chat?.item.name}</strong><br />
                Para: <strong>{chat?.other_user.name}</strong>
              </p>
              <div className="confirm-actions">
                <button
                  className="confirm-btn cancel"
                  onClick={() => setShowConfirmDialog(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  className="confirm-btn confirm"
                  onClick={handleSellerConfirm}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Enviando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        )}

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

