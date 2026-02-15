import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import TopNav from '../../components/TopNav';
import { CameraAlt, Add, Close } from '@mui/icons-material';
import { createListingService, CreateListingInput } from '../../services';
import './AddItem.css';

type ListingType = 'doar' | 'trocar' | 'vender';

interface FormData {
  name: string;
  description: string;
  state: string;
  listingType: ListingType;
  price: string;
  message: string;
  images: File[];
}

const AddItem: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    state: '',
    listingType: 'vender',
    price: '',
    message: '',
    images: []
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const MAX_PHOTOS = 5;

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = MAX_PHOTOS - formData.images.length;
    if (remaining <= 0) {
      toast.warning('Máximo de 5 fotos por anúncio.');
      e.target.value = '';
      return;
    }
    const toAdd = files.slice(0, remaining);
    if (files.length > remaining) {
      toast.info(`Apenas as primeiras ${remaining} foto(s) foram adicionadas. Máximo: 5 fotos.`);
    }
    setFormData({
      ...formData,
      images: [...formData.images, ...toAdd]
    });
    e.target.value = '';
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (formData.images.length === 0) {
        toast.error('É necessário adicionar pelo menos uma foto');
        setIsLoading(false);
        return;
      }

      if (formData.description.length < 20) {
        toast.error('A descrição deve ter pelo menos 20 caracteres');
        setIsLoading(false);
        return;
      }

      if (formData.name.length < 5) {
        toast.error('O nome deve ter pelo menos 5 caracteres');
        setIsLoading(false);
        return;
      }

      if (formData.listingType === 'vender') {
        if (!formData.price.trim()) {
          toast.error('Informe o preço para anúncios de venda');
          setIsLoading(false);
          return;
        }
        const parsed = parseFloat(formData.price.replace(',', '.'));
        if (Number.isNaN(parsed) || parsed < 0) {
          toast.error('Preço inválido. Use um valor numérico positivo.');
          setIsLoading(false);
          return;
        }
      }

      const price = formData.listingType === 'vender' && formData.price
        ? parseFloat(formData.price.replace(',', '.'))
        : undefined;

      const listingTypeMap: Record<ListingType, 'venda' | 'doacao' | 'troca'> = {
        vender: 'venda',
        doar: 'doacao',
        trocar: 'troca'
      };

      const photos: string[] = await Promise.all(
        formData.images.map((file) => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve(reader.result as string);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        })
      );

      const payload: CreateListingInput = {
        name: formData.name,
        description: formData.description,
        condition: formData.state as 'Novo' | 'Usado - Excelente' | 'Usado - Bom' | 'Usado - Regular',
        listingType: listingTypeMap[formData.listingType],
        price: price,
        city: 'São Paulo',
        message: formData.message || undefined,
        photos: photos
      };
      await createListingService(payload);

      toast.success('Item publicado com sucesso!');
      navigate('/feed');
    } catch (error: any) {
      console.error('Error creating listing:', error);
      toast.error(error.message || 'Erro ao publicar item. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  const mainImage = formData.images[0] || null;
  const hasAdditionalImages = formData.images.length > 1;

  return (
    <div className="add-item-screen">
      <TopNav />
      <div className="add-item-container">
        <form onSubmit={handleSubmit} className="add-item-layout">
          <div className="image-upload-section">
            <h2 className="section-title">Fotos do produto <span className="photo-limit-label"></span></h2>
            
            <div className="main-image-upload">
              {mainImage ? (
                <div className="main-image-preview">
                  <button
                    type="button"
                    className="remove-main-image"
                    onClick={() => removeImage(0)}
                  >
                    <Close />
                  </button>
                  <div className="image-preview-content">
                    <img src={URL.createObjectURL(mainImage)} alt="Preview" />
                  </div>
                </div>
              ) : (
                <label className="main-image-upload-area">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file-input-hidden"
                  />
                  <div className="upload-placeholder">
                    <CameraAlt className="camera-icon" />
                    <div className="upload-text">Clique para adicionar foto principal</div>
                  </div>
                </label>
              )}
            </div>

            <div className="additional-image-upload">
              {hasAdditionalImages ? (
                <div className="additional-images-grid">
                  {formData.images.slice(1).map((image, index) => (
                    <div key={index + 1} className="additional-image-preview">
                      <button
                        type="button"
                        className="remove-additional-image"
                        onClick={() => removeImage(index + 1)}
                      >
                        <Close />
                      </button>
                      <img src={URL.createObjectURL(image)} alt={`Additional ${index + 1}`} />
                    </div>
                  ))}
                  {formData.images.length < 5 && (
                    <label className="add-additional-image-btn">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="file-input-hidden"
                        multiple
                      />
                      <Add className="add-icon" />
                    </label>
                  )}
                </div>
              ) : (
                <label className="add-additional-image-btn">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file-input-hidden"
                    multiple
                  />
                  <Add className="add-icon" />
                </label>
              )}
            </div>
          </div>

          <div className="form-section">
            <div className="form-group">
              <label htmlFor="name">Nome do produto</label>
              <input
                type="text"
                id="name"
                name="name"
                className="input"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Digite o nome do produto"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Descrição</label>
              <textarea
                id="description"
                name="description"
                className="input textarea"
                value={formData.description}
                onChange={handleChange}
                required
                rows={2}
                placeholder="Descreva o item, incluindo marca, modelo, condições de uso..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="state">Estado do produto</label>
              <select
                id="state"
                name="state"
                className="input"
                value={formData.state}
                onChange={handleChange}
                required
              >
                <option value="">Selecione</option>
                <option value="Novo">Novo</option>
                <option value="Usado - Excelente">Usado - Excelente</option>
                <option value="Usado - Bom">Usado - Bom</option>
                <option value="Usado - Regular">Usado - Regular</option>
              </select>
            </div>

            <div className="form-group">
              <span className="radio-label">O que você deseja fazer com este item?</span>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="listingType"
                    value="doar"
                    checked={formData.listingType === 'doar'}
                    onChange={handleChange}
                  />
                  <span>Doar</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="listingType"
                    value="trocar"
                    checked={formData.listingType === 'trocar'}
                    onChange={handleChange}
                  />
                  <span>Trocar</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="listingType"
                    value="vender"
                    checked={formData.listingType === 'vender'}
                    onChange={handleChange}
                  />
                  <span>Vender</span>
                </label>
              </div>
            </div>

            {formData.listingType === 'vender' && (
              <div className="form-group">
                <label htmlFor="price">Preço (R$)</label>
                <input
                  type="text"
                  id="price"
                  name="price"
                  className="input"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Ex: 350,00"
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="message">Mensagem (Opcional)</label>
              <textarea
                id="message"
                name="message"
                className="input textarea"
                value={formData.message}
                onChange={handleChange}
                rows={2}
                placeholder="Informações adicionais sobre o produto..."
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-publish"
              disabled={isLoading}
            >
              {isLoading ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItem;

