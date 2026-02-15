import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../../components/TopNav';
import { getAvailableItemsService, createExchangeService, getMeService, ExchangeItem } from '../../services';
import './Exchange.css';

const Exchange: React.FC = () => {
  const navigate = useNavigate();
  const [selectedOffer, setSelectedOffer] = useState<ExchangeItem | null>(null);
  const [selectedReceive, setSelectedReceive] = useState<ExchangeItem | null>(null);
  const [exchangeItems, setExchangeItems] = useState<ExchangeItem[]>([]);
  const [myItems, setMyItems] = useState<ExchangeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAvailableItems();
  }, []);

  const loadAvailableItems = async () => {
    setIsLoading(true);
    try {
      const items = await getAvailableItemsService();
      const currentUser = await getMeService();
      
      const myItemsList = items.filter(item => item.owner.id === currentUser.id);
      const otherItems = items.filter(item => item.owner.id !== currentUser.id);
      
      setMyItems(myItemsList);
      setExchangeItems(otherItems);
    } catch (error: any) {
      console.error('Error loading available items:', error);
      setError('Erro ao carregar itens disponíveis');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProposeExchange = async () => {
    if (!selectedOffer || !selectedReceive) return;

    setIsLoading(true);
    setError(null);

    try {
      await createExchangeService({
        offered_item_id: selectedOffer.id,
        requested_item_id: selectedReceive.id,
        message: `Gostaria de trocar ${selectedOffer.name} por ${selectedReceive.name}`
      });

      alert(`Troca proposta: ${selectedOffer.name} por ${selectedReceive.name}`);
      navigate('/chat');
    } catch (error: any) {
      console.error('Error proposing exchange:', error);
      setError(error.message || 'Erro ao propor troca');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="exchange-screen">
      <TopNav />
      <div className="page-container">
        <div className="exchange-header">
          <h1 className="page-title">Sistema de Troca</h1>
          <p className="exchange-subtitle">Selecione um item seu para oferecer e um item que deseja receber</p>
        </div>

        {error && (
          <div className="error-message" style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fee', color: '#c33', borderRadius: '8px' }}>
            {error}
          </div>
        )}

        <div className="exchange-sections">
          <div className="exchange-section">
            <h2 className="section-title">Meus itens para trocar</h2>
            <div className="items-grid">
              {myItems.map(item => (
                <div
                  key={item.id}
                  className={`exchange-item-card ${selectedOffer?.id === item.id ? 'selected' : ''}`}
                  onClick={() => setSelectedOffer(item)}
                >
                  {item.photos && item.photos.length > 0 ? (
                    <img src={item.photos[0]} alt={item.name} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px' }} />
                  ) : (
                    <div className="exchange-item-image">📦</div>
                  )}
                  <div className="exchange-item-name">{item.name}</div>
                  <div className="exchange-item-state">{item.description}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="exchange-arrow">⇄</div>

          <div className="exchange-section">
            <h2 className="section-title">Itens disponíveis para troca</h2>
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>Carregando...</div>
            ) : (
              <div className="items-grid">
                {exchangeItems.map(item => (
                  <div
                    key={item.id}
                    className={`exchange-item-card ${selectedReceive?.id === item.id ? 'selected' : ''}`}
                    onClick={() => setSelectedReceive(item)}
                  >
                    {item.photos && item.photos.length > 0 ? (
                      <img src={item.photos[0]} alt={item.name} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px' }} />
                    ) : (
                      <div className="exchange-item-image">📦</div>
                    )}
                    <div className="exchange-item-name">{item.name}</div>
                    <div className="exchange-item-state">{item.description}</div>
                    <div className="exchange-item-owner">{item.owner.name}</div>
                    <div className="exchange-item-city">📍 {item.owner.location}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {selectedOffer && selectedReceive && (
          <div className="exchange-proposal">
            <div className="proposal-summary">
              <div className="proposal-item">
                <span className="proposal-label">Oferecendo:</span>
                <span className="proposal-value">{selectedOffer.name}</span>
              </div>
              <div className="proposal-arrow">⇄</div>
              <div className="proposal-item">
                <span className="proposal-label">Recebendo:</span>
                <span className="proposal-value">{selectedReceive.name}</span>
              </div>
            </div>
            <button 
              className="btn btn-primary btn-full" 
              onClick={handleProposeExchange}
              disabled={isLoading}
            >
              {isLoading ? 'Propondo...' : 'Propor troca'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Exchange;

