import React, { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import TopNav from '../../components/TopNav';
import { Add, Edit, Delete, Inventory, Close, Warning } from '@mui/icons-material';
import {
  getMyListingsService,
  deleteListingService,
  updateListingService,
  Listing,
  UpdateListingInput,
} from '../../services';
import { formatCurrency, getImageUrl, getListingTypeLabel } from '../../utils/format';
import './MyListings.css';

const MyListings: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<Listing | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit modal
  const [editTarget, setEditTarget] = useState<Listing | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    condition: '',
    price: '',
    city: '',
    message: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const loadListings = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const response = await getMyListingsService({
        page,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      setItems(response.data || []);
      if (response.meta) {
        setTotalPages(response.meta.pages);
        setCurrentPage(response.meta.page);
      }
    } catch (error: any) {
      console.error('Error loading my listings:', error);
      toast.error('Erro ao carregar seus anúncios');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadListings(currentPage);
  }, [currentPage]);

  // Delete
  const handleDeleteClick = (item: Listing, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTarget(item);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteListingService(deleteTarget.id);
      toast.success('Anúncio excluído com sucesso');
      setDeleteTarget(null);
      // Se a página atual ficar vazia após deletar, volta para a anterior
      if (items.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        loadListings(currentPage);
      }
    } catch (error: any) {
      console.error('Error deleting listing:', error);
      const msg = error.message || '';
      if (msg.includes('403') || msg.toLowerCase().includes('permiss')) {
        toast.error('Você não tem permissão para excluir este anúncio');
      } else if (msg.includes('404') || msg.toLowerCase().includes('não encontrad')) {
        toast.error('Anúncio não encontrado. Ele pode já ter sido excluído.');
        loadListings(currentPage);
      } else {
        toast.error(msg || 'Erro ao excluir anúncio. Tente novamente.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Edit
  const handleEditClick = (item: Listing, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditTarget(item);
    setEditForm({
      name: item.name || '',
      description: item.description || '',
      condition: item.condition || '',
      price: item.price !== null && item.price !== undefined ? String(item.price) : '',
      city: item.city || '',
      message: item.message || '',
    });
  };

  const handleEditChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const saveEdit = async () => {
    if (!editTarget) return;
    setIsSaving(true);
    try {
      const payload: UpdateListingInput = {
        name: editForm.name,
        description: editForm.description,
        condition: editForm.condition as UpdateListingInput['condition'],
        city: editForm.city || undefined,
        message: editForm.message || undefined,
      };

      if (editForm.price.trim()) {
        payload.price = parseFloat(editForm.price.replace(',', '.'));
      }

      await updateListingService(editTarget.id, payload);
      toast.success('Anúncio atualizado com sucesso');
      setEditTarget(null);
      loadListings(currentPage);
    } catch (error: any) {
      console.error('Error updating listing:', error);
      toast.error(error.message || 'Erro ao atualizar anúncio');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="my-listings-screen">
      <TopNav />
      <div className="my-listings-container">
        <div className="my-listings-header">
          <h1>Meus Anúncios</h1>
          <button className="btn-add" onClick={() => navigate('/add-item')}>
            <Add />
            <span>Novo anúncio</span>
          </button>
        </div>

        {isLoading ? (
          <div className="my-listings-list">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="my-listing-card" style={{ pointerEvents: 'none' }}>
                <div className="sk" style={{ width: 160, minWidth: 160, height: 140, borderRadius: 0 }} />
                <div style={{ flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10 }}>
                  <div className="sk sk-text-sm" style={{ width: 60 }} />
                  <div className="sk sk-text" style={{ width: '65%' }} />
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div className="sk sk-text-sm" style={{ width: 70 }} />
                    <div className="sk sk-text-sm" style={{ width: 90 }} />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px' }}>
                  <div className="sk" style={{ width: 44, height: 44, borderRadius: 12 }} />
                  <div className="sk" style={{ width: 44, height: 44, borderRadius: 12 }} />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="my-listings-empty">
            <div className="my-listings-empty-icon">
              <Inventory />
            </div>
            <h3>Você ainda não tem anúncios</h3>
            <p>Publique seu primeiro item e comece a trocar, doar ou vender.</p>
            <button className="btn-add-first" onClick={() => navigate('/add-item')}>
              <Add />
              <span>Publicar primeiro anúncio</span>
            </button>
          </div>
        ) : (
          <>
            <div className="my-listings-list">
              {items.map((item) => {
                const imageUrl = getImageUrl(item.photos?.[0]);
                return (
                  <div key={item.id} className="my-listing-card">
                    <div
                      className="my-listing-image"
                      onClick={() => navigate(`/item/${item.id}`)}
                    >
                      {imageUrl ? (
                        <img src={imageUrl} alt={item.name} />
                      ) : (
                        <span className="my-listing-image-placeholder">Sem foto</span>
                      )}
                    </div>

                    <div
                      className="my-listing-content"
                      onClick={() => navigate(`/item/${item.id}`)}
                    >
                      <span className="my-listing-type-badge">
                        {getListingTypeLabel(item.listingType)}
                      </span>
                      <h3 className="my-listing-name">{item.name}</h3>
                      <div className="my-listing-details">
                        {item.price !== null && item.price !== undefined ? (
                          <span className="my-listing-price">{formatCurrency(item.price)}</span>
                        ) : null}
                        {item.city && <span>{item.city}</span>}
                        {item.createdAt && (
                          <span className="my-listing-date">{formatDate(item.createdAt)}</span>
                        )}
                      </div>
                    </div>

                    <div className="my-listing-actions">
                      <button
                        className="btn-edit"
                        title="Editar"
                        onClick={(e) => handleEditClick(item, e)}
                      >
                        <Edit />
                      </button>
                      <button
                        className="btn-delete"
                        title="Excluir"
                        onClick={(e) => handleDeleteClick(item, e)}
                      >
                        <Delete />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="my-listings-pagination">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isLoading}
                >
                  Anterior
                </button>
                <span className="page-info">
                  {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || isLoading}
                >
                  Próxima
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de confirmação de exclusão */}
      {deleteTarget && (
        <div className="delete-modal-overlay" onClick={() => !isDeleting && setDeleteTarget(null)}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-icon">
              <Warning />
            </div>
            <h3>Excluir anúncio?</h3>
            <p>
              Tem certeza que deseja excluir <strong>{deleteTarget.name}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="delete-modal-actions">
              <button
                className="btn-cancel-delete"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                className="btn-confirm-delete"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edição */}
      {editTarget && (
        <div className="edit-modal-overlay" onClick={() => !isSaving && setEditTarget(null)}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <h3>Editar Anúncio</h3>
              <button className="edit-modal-close" onClick={() => setEditTarget(null)}>
                <Close />
              </button>
            </div>

            <div className="edit-form-group">
              <label htmlFor="edit-name">Nome do produto</label>
              <input
                id="edit-name"
                name="name"
                type="text"
                value={editForm.name}
                onChange={handleEditChange}
              />
            </div>

            <div className="edit-form-group">
              <label htmlFor="edit-description">Descrição</label>
              <textarea
                id="edit-description"
                name="description"
                value={editForm.description}
                onChange={handleEditChange}
                rows={3}
              />
            </div>

            <div className="edit-form-group">
              <label htmlFor="edit-condition">Estado do produto</label>
              <select
                id="edit-condition"
                name="condition"
                value={editForm.condition}
                onChange={handleEditChange}
              >
                <option value="">Selecione</option>
                <option value="Novo">Novo</option>
                <option value="Usado - Excelente">Usado - Excelente</option>
                <option value="Usado - Bom">Usado - Bom</option>
                <option value="Usado - Regular">Usado - Regular</option>
              </select>
            </div>

            <div className="edit-form-group">
              <label htmlFor="edit-price">Preço (R$)</label>
              <input
                id="edit-price"
                name="price"
                type="text"
                value={editForm.price}
                onChange={handleEditChange}
                placeholder="Ex: 350,00"
              />
            </div>

            <div className="edit-form-group">
              <label htmlFor="edit-city">Cidade</label>
              <input
                id="edit-city"
                name="city"
                type="text"
                value={editForm.city}
                onChange={handleEditChange}
              />
            </div>

            <div className="edit-form-group">
              <label htmlFor="edit-message">Mensagem (opcional)</label>
              <textarea
                id="edit-message"
                name="message"
                value={editForm.message}
                onChange={handleEditChange}
                rows={2}
              />
            </div>

            <div className="edit-modal-actions">
              <button
                className="btn-cancel-edit"
                onClick={() => setEditTarget(null)}
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button
                className="btn-save-edit"
                onClick={saveEdit}
                disabled={isSaving}
              >
                {isSaving ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyListings;
