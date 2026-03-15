import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import TopNav from '../../components/TopNav';
import { Favorite, FavoriteBorder, ExpandMore, ExpandLess, LocationOn, Person, Star, Chat } from '@mui/icons-material';
import { getListingByIdService, getSimilarListingsService, addFavoriteService, removeFavoriteService, getFavoritesService, createChatService, getChatsService, getMeService, Listing } from '../../services';
import { formatCurrency, getImageUrl, getListingTypeLabel } from '../../utils/format';
import './ItemDetail.css';
import { useAccount } from '../../contexts/AccountContext';

const ItemDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [item, setItem] = useState<Listing | null>(null);
  const [similarItems, setSimilarItems] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [existingChatId, setExistingChatId] = useState<string | null>(null);
  const { user: currentUser } = useAccount();

  useEffect(() => {
    if (id) {
      loadItem();
      loadSimilarItems();
      checkIfFavorite(id);
      checkExistingChat(id);
    }
  }, [id]);

  const checkExistingChat = async (listingId: string) => {
    try {
      const chats = await getChatsService();
      const existing = chats.find(c => c.item.id === listingId);
      setExistingChatId(existing?.id ?? null);
    } catch {
      // ignore - user may not be logged in
    }
  };

  const checkIfFavorite = async (itemId: string) => {
    try {
      const favorites = await getFavoritesService();
      const found = favorites.some(fav => fav.item?.id === itemId);
      setIsFavorite(found);
    } catch {
      // ignore - user may not be logged in
    }
  };

  useEffect(() => {
    if (item?.description) {
      setExpandedDescription(true);
    }
  }, [item?.description]);

  const loadItem = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const itemData = await getListingByIdService(id);
      setItem(itemData);
    } catch (error: any) {
      console.error('Error loading item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSimilarItems = async () => {
    if (!id) return;
    try {
      const similar = await getSimilarListingsService(id);
      setSimilarItems(similar);
    } catch (error: any) {
      console.error('Error loading similar items:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!id) return;
    try {
      if (isFavorite) {
        await removeFavoriteService(id);
        setIsFavorite(false);
      } else {
        await addFavoriteService(id);
        setIsFavorite(true);
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
    }
  };

  const getStateLabel = (state: string): string => {
    return state;
  };

  const isOwnListing = Boolean(item && currentUser?.id && item.seller?.id === currentUser?.id);

  const openMessageModal = () => setMessageModalOpen(true);

  const closeMessageModal = () => {
    setMessageModalOpen(false);
    setMessageText('');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item?.seller?.id || !messageText.trim() || isSending) return;
    setIsSending(true);
    try {
      await createChatService({
        item_id: item.id,
        receiver_id: item.seller.id,
        message: messageText.trim(),
      });
      toast.success('Mensagem enviada!');
      closeMessageModal();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="item-detail-screen">
        <TopNav />
        <div className="item-detail-container">
          <div className="sk-detail-layout">
            <div style={{ width: '50%', flexShrink: 0 }}>
              <div className="sk sk-detail-image" />
              <div className="sk-detail-thumbs">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="sk sk-detail-thumb" />
                ))}
              </div>
            </div>
            <div className="sk-detail-info">
              <div className="sk sk-text-lg" style={{ width: '60%' }} />
              <div className="sk sk-text-lg" style={{ width: '30%' }} />
              <div className="sk sk-text" style={{ width: '45%' }} />
              <div className="sk-detail-seller">
                <div className="sk sk-circle" style={{ width: 44, height: 44 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="sk sk-text" style={{ width: '50%' }} />
                  <div className="sk sk-text-sm" style={{ width: '30%' }} />
                </div>
              </div>
              <div className="sk sk-text" style={{ width: '100%' }} />
              <div className="sk sk-text" style={{ width: '90%' }} />
              <div className="sk sk-text" style={{ width: '70%' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="item-detail-screen">
        <TopNav />
        <div style={{ textAlign: 'center', padding: '40px' }}>Item não encontrado</div>
      </div>
    );
  }

  const images = item.images ?? item.photos ?? [];
  const seller = item.seller || { name: 'Anônimo', rating: 0 };
  const condition = item.condition ?? (seller as { state?: string }).state ?? '';
  const location = item.location ?? item.city ?? '';

  return (
    <div className="item-detail-screen">
      <TopNav />
      <div className="item-detail-container">
        <div className="item-detail-layout">
          <div className="item-image-section">
            <div className="item-image-main">
              {currentUser?.id !== item.seller?.id && (
              <button 
                className="favorite-btn-large"
                onClick={toggleFavorite}
              >
                  {isFavorite ? <Favorite /> : <FavoriteBorder />}
                </button>
              )}
              <div className="item-image-container">
                {(() => {
                  const imageUrl = getImageUrl(images[currentImageIndex]);
                  return imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt={item.name}
                      onError={(e) => {
                        console.error('Error loading image:', imageUrl);
                        e.currentTarget.style.display = 'none';
                        const placeholder = e.currentTarget.parentElement?.querySelector('.image-placeholder-large');
                        if (placeholder) {
                          (placeholder as HTMLElement).style.display = 'flex';
                        }
                      }}
                    />
                  ) : (
                    <div className="image-placeholder-large">Imagem</div>
                  );
                })()}
              </div>
            </div>
            {images.length > 1 && (
              <div className="item-image-thumbnails">
                {images.map((img, index) => (
                  <div
                    key={index}
                    className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img 
                      src={getImageUrl(img) || ''} 
                      alt={`${item.name} ${index + 1}`} 
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      onError={(e) => {
                        console.error('Error loading thumbnail:', img);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="item-info-section">
            <div className="item-header-info">
              <h1 className="item-detail-name">{item.name}</h1>
              {item.sold && (
                <span className="item-sold-badge">
                  {item.listingType === 'doacao' ? 'Doado' : item.listingType === 'troca' ? 'Trocado' : 'Vendido'}
                </span>
              )}
            </div>
            
            {item.price !== null ? (
              <div className="item-price-large">{formatCurrency(item.price)}</div>
            ) : (
              <div className="item-price-large" style={{ fontStyle: 'italic', color: '#666' }}>{getListingTypeLabel(item.listingType)}</div>
            )}
            
            <div className="item-meta-info">
              {condition && (
                <div className="meta-item">
                  <span className="meta-label">Estado:</span>
                  <span className="meta-value">{getStateLabel(condition)}</span>
                </div>
              )}
              {location && (
                <div className="meta-item">
                  <LocationOn className="meta-icon" />
                  <span className="meta-value">{location}</span>
                </div>
              )}
            </div>

            <div className="seller-header seller-info">
              <Person className="seller-icon" />
              <div className="seller-details">
                <span className="seller-name">{seller.name}</span>
                {(seller.rating != null && seller.rating > 0) ? (
                  <div className="seller-rating">
                    <Star className="star-icon" />
                    <span>{seller.rating.toFixed(1)}</span>
                  </div>
                ) : (
                  <div className="seller-rating">
                    <Star className="star-icon star-empty" />
                    <span>0</span>
                  </div>
                )}
              </div>
            </div>

            {item.description && (
              <div className="item-description-accordion">
                <button
                  type="button"
                  className="accordion-header"
                  onClick={() => setExpandedDescription(!expandedDescription)}
                >
                  <span>Descrição</span>
                  {expandedDescription ? (
                    <ExpandLess className="accordion-icon" />
                  ) : (
                    <ExpandMore className="accordion-icon" />
                  )}
                </button>
                {expandedDescription && (
                  <div className="accordion-content">
                    <p>{item.description}</p>
                  </div>
                )}
              </div>
            )}

            {!isOwnListing && !item.sold && (
              existingChatId ? (
                <button type="button" className="btn btn-buy" onClick={() => navigate('/chat', { state: { openChatId: existingChatId } })}>
                  Ir para conversa
                </button>
              ) : (
                <button type="button" className="btn btn-buy" onClick={openMessageModal}>
                  Enviar mensagem
                </button>
              )
            )}
          </div>
        </div>

        {similarItems.length > 0 && (
          <div className="similar-items-section">
            <h2 className="similar-items-title">Itens Similares</h2>
            <div className="similar-items-grid">
              {similarItems.map(similarItem => (
                <div
                  key={similarItem.id}
                  className="similar-item-card"
                  onClick={() => navigate(`/item/${similarItem.id}`)}
                >
                  <div className="similar-item-image">
                    {(() => {
                      const similarImages = similarItem.images ?? similarItem.photos ?? [];
                      const similarImgUrl = getImageUrl(similarImages[0]);
                      return similarImgUrl ? (
                        <img src={similarImgUrl} alt={similarItem.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      ) : (
                        <div className="image-placeholder">Imagem</div>
                      );
                    })()}
                  </div>
                  <div className="similar-item-info">
                    <h3 className="similar-item-name">{similarItem.name}</h3>
                    {similarItem.price !== null && similarItem.price !== undefined ? (
                      <div className="similar-item-price">{formatCurrency(similarItem.price)}</div>
                    ) : (
                      <div className="similar-item-price" style={{ fontStyle: 'italic', color: '#666' }}>{getListingTypeLabel(similarItem.listingType)}</div>
                    )}
                    {(similarItem.location ?? similarItem.city) && (
                      <div className="similar-item-city">
                        <LocationOn className="city-icon" />
                        {similarItem.location ?? similarItem.city}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {messageModalOpen && item?.seller && (
          <div className="message-modal-overlay" onClick={closeMessageModal} aria-hidden="false">
            <div className="message-modal-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="message-modal-title">
              <div className="message-modal-handle" aria-hidden />
              <h2 id="message-modal-title" className="message-modal-title">Enviar mensagem</h2>
              <p className="message-modal-subtitle">Para {item.seller.name} · {item.name}</p>
              <form onSubmit={handleSendMessage} className="message-modal-form">
                <textarea
                  className="message-modal-textarea"
                  placeholder="Digite sua mensagem..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows={4}
                  autoFocus
                  required
                />
                <div className="message-modal-actions">
                  <button type="button" className="message-modal-cancel" onClick={closeMessageModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="message-modal-send" disabled={!messageText.trim() || isSending}>
                    {isSending ? 'Enviando...' : 'Enviar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemDetail;

