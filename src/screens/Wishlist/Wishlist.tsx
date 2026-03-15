import React, { useState, ChangeEvent, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../../components/TopNav';
import { Search, Favorite } from '@mui/icons-material';
import { getFavoritesService, removeFavoriteService, Favorite as FavoriteItem } from '../../services';
import { formatCurrency, getImageUrl, getListingTypeLabel } from '../../utils/format';
import './Wishlist.css';

const Wishlist: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('new');
  const [listingTypeFilter, setListingTypeFilter] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isExecutingRef = useRef(false);

  useEffect(() => {
    // Se já está executando, ignora a segunda chamada do StrictMode
    if (isExecutingRef.current) return;
    isExecutingRef.current = true;

    const loadFavorites = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const items = await getFavoritesService();
        setFavorites(items);
      } catch (error: any) {
        console.error('Error loading favorites:', error);
        setError('Erro ao carregar favoritos');
      } finally {
        setIsLoading(false);
        isExecutingRef.current = false;
      }
    };

    loadFavorites();
  }, []);

  const removeFavorite = async (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await removeFavoriteService(itemId);
      setFavorites(favorites.filter(fav => fav.item.id !== itemId));
    } catch (error: any) {
      console.error('Error removing favorite:', error);
      setError('Erro ao remover dos favoritos');
    }
  };

  const filteredFavorites = favorites.filter(fav => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      if (
        !fav.item.name.toLowerCase().includes(query) &&
        !fav.item.description.toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    if (listingTypeFilter.length > 0) {
      const type = fav.item.listingType;
      if (!type || !listingTypeFilter.includes(type)) return false;
    }
    return true;
  });

  const sortedFavorites = [...filteredFavorites].sort((a, b) => {
    switch (sortBy) {
      case 'new':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'rating':
        return (b.item.rating || 0) - (a.item.rating || 0);
      default:
        return 0;
    }
  });

  return (
    <div className="wishlist-screen">
      <TopNav />
      <div className="wishlist-container">
        <div className="wishlist-header-card">
          <h1 className="page-title">Favoritos</h1>
          <div className="header-actions">
            <div className="search-container">
              <div className="search-input-wrapper">
                <Search className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Buscar"
                  value={searchQuery}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="sort-options">
              <button
                className={`sort-btn ${sortBy === 'new' ? 'active' : ''}`}
                onClick={() => setSortBy('new')}
              >
                Novos
              </button>
              <button
                className={`sort-btn ${sortBy === 'rating' ? 'active' : ''}`}
                onClick={() => setSortBy('rating')}
              >
                Avaliação
              </button>
              <button
                className={`sort-btn ${listingTypeFilter.includes('venda') ? 'active' : ''}`}
                onClick={() => setListingTypeFilter(prev =>
                  prev.includes('venda') ? prev.filter(t => t !== 'venda') : [...prev, 'venda']
                )}
              >
                Venda
              </button>
              <button
                className={`sort-btn ${listingTypeFilter.includes('doacao') ? 'active' : ''}`}
                onClick={() => setListingTypeFilter(prev =>
                  prev.includes('doacao') ? prev.filter(t => t !== 'doacao') : [...prev, 'doacao']
                )}
              >
                Doação
              </button>
              <button
                className={`sort-btn ${listingTypeFilter.includes('troca') ? 'active' : ''}`}
                onClick={() => setListingTypeFilter(prev =>
                  prev.includes('troca') ? prev.filter(t => t !== 'troca') : [...prev, 'troca']
                )}
              >
                Troca
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message" style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fee', color: '#c33', borderRadius: '8px' }}>
            {error}
          </div>
        )}

        <div className="wishlist-grid">
          {isLoading && favorites.length === 0 ? (
            <>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="wish-card" style={{ pointerEvents: 'none' }}>
                  <div className="sk" style={{ width: '100%', height: 200, borderRadius: 0 }} />
                  <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div className="sk sk-text" style={{ width: '75%' }} />
                    <div className="sk sk-text-lg" style={{ width: '45%' }} />
                    <div className="sk sk-text-sm" style={{ width: '35%' }} />
                  </div>
                </div>
              ))}
            </>
          ) : sortedFavorites.length === 0 ? (
            <div className="empty-state">
              <Favorite className="empty-icon" />
              <p>Você ainda não tem favoritos</p>
              <p className="empty-hint">Explore o feed e adicione itens aos seus favoritos!</p>
            </div>
          ) : (
            sortedFavorites.map(favorite => {
              const item = favorite.item;
              return (
                <div
                  key={favorite.id}
                  className="wish-card"
                  onClick={() => navigate(`/item/${item.id}`)}
                >
                  <button
                    className="favorite-btn"
                    onClick={(e) => removeFavorite(item.id, e)}
                  >
                    <Favorite />
                  </button>
                  <div className="wish-image">
                    {(() => {
                      const images = item.images ?? item.photos ?? [];
                      const imageUrl = getImageUrl(images[0]);
                      return imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            console.error('Error loading image:', imageUrl);
                            e.currentTarget.style.display = 'none';
                            const placeholder = e.currentTarget.parentElement?.querySelector('.image-placeholder');
                            if (placeholder) {
                              (placeholder as HTMLElement).style.display = 'flex';
                            }
                          }}
                        />
                      ) : null;
                    })()}
                    {(() => {
                      const images = item.images ?? item.photos ?? [];
                      const imageUrl = getImageUrl(images[0]);
                      return (!images.length || !imageUrl) && (
                        <div className="image-placeholder">Imagem</div>
                      );
                    })()}
                  </div>
                  <div className="wish-content">
                    <h3 className="wish-type">{item.name}</h3>
                    {item.price !== null ? (
                      <div className="wish-price">{formatCurrency(item.price)}</div>
                    ) : (
                      <div className="wish-price" style={{ fontStyle: 'italic', color: '#666' }}>{getListingTypeLabel(item.listingType)}</div>
                    )}
                    {item.city && (
                      <div className="wish-city">{item.city}</div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;

