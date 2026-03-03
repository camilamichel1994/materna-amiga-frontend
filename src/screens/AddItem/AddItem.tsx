import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import TopNav from '../../components/TopNav';
import { CameraAlt, Close, LocationOn } from '@mui/icons-material';
import { createListingService, CreateListingInput } from '../../services';
import { getUserCity } from '../../utils/geolocation';
import './AddItem.css';

type ListingType = 'doar' | 'trocar' | 'vender';

interface FormData {
  name: string;
  description: string;
  state: string;
  listingType: ListingType;
  price: string;
  city: string;
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
    city: '',
    message: '',
    images: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const location = await getUserCity();
      setFormData((prev) => ({
        ...prev,
        city: location.city,
      }));
    } catch (error) {
      console.warn('Não foi possível detectar a localização:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

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
        city: formData.city || undefined,
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

  return (
    <div className="add-item-screen">
      <TopNav />
      <form onSubmit={handleSubmit} className="add-item-form">
        {/* HEADER */}
        <div className="add-item-header">
          <h1>Novo Anúncio</h1>
          <button type="submit" className="btn-publish" disabled={isLoading}>
            {isLoading ? 'Publicando...' : 'Publicar'}
          </button>
        </div>

        {/* GRID PRINCIPAL */}
        <div className="add-item-grid">
          {/* PAINEL FOTOS */}
          <div className="panel panel-photos">
            <div className="panel-label">
              Fotos <span className="photo-counter">{formData.images.length}/{MAX_PHOTOS}</span>
            </div>
            <div className="photos-gallery">
              {formData.images.map((image, index) => (
                <div key={index} className={`photo-cell ${index === 0 ? 'photo-cell-main' : ''}`}>
                  <img src={URL.createObjectURL(image)} alt={`Foto ${index + 1}`} />
                  <button type="button" className="photo-remove" onClick={() => removeImage(index)}>
                    <Close />
                  </button>
                  {index === 0 && <span className="photo-badge-main">Principal</span>}
                </div>
              ))}
              {formData.images.length < MAX_PHOTOS && (
                <label className={`photo-cell photo-cell-add ${formData.images.length === 0 ? 'photo-cell-empty' : ''}`}>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="file-input-hidden" multiple />
                  <CameraAlt />
                  <span>Adicionar</span>
                </label>
              )}
            </div>
          </div>

          {/* PAINEL DETALHES */}
          <div className="panel panel-details">
            <div className="panel-label">Detalhes do produto</div>
            <div className="fields-grid">
              <div className="field field-name">
                <label htmlFor="name">Nome do produto</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="Ex: Carrinho de bebê Chicco" />
              </div>
              <div className="field field-state">
                <label htmlFor="state">Estado</label>
                <select id="state" name="state" value={formData.state} onChange={handleChange} required>
                  <option value="">Selecione</option>
                  <option value="Novo">Novo</option>
                  <option value="Usado - Excelente">Usado - Excelente</option>
                  <option value="Usado - Bom">Usado - Bom</option>
                  <option value="Usado - Regular">Usado - Regular</option>
                </select>
              </div>
              <div className="field field-desc">
                <label htmlFor="description">Descrição</label>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} required rows={4} placeholder="Marca, modelo, condições de uso..." />
              </div>
            </div>
          </div>

          {/* PAINEL TIPO + PREÇO */}
          <div className="panel panel-type">
            <div className="panel-label">Tipo e valor</div>
            <div className="type-pills">
              <label className={`pill ${formData.listingType === 'doar' ? 'pill-active' : ''}`}>
                <input type="radio" name="listingType" value="doar" checked={formData.listingType === 'doar'} onChange={handleChange} />
                Doar
              </label>
              <label className={`pill ${formData.listingType === 'trocar' ? 'pill-active' : ''}`}>
                <input type="radio" name="listingType" value="trocar" checked={formData.listingType === 'trocar'} onChange={handleChange} />
                Trocar
              </label>
              <label className={`pill ${formData.listingType === 'vender' ? 'pill-active' : ''}`}>
                <input type="radio" name="listingType" value="vender" checked={formData.listingType === 'vender'} onChange={handleChange} />
                Vender
              </label>
            </div>
            {formData.listingType === 'vender' && (
              <div className="field field-price">
                <label htmlFor="price">Preço (R$)</label>
                <input type="text" id="price" name="price" value={formData.price} onChange={handleChange} placeholder="350,00" />
              </div>
            )}
          </div>

          {/* PAINEL LOCALIZAÇÃO */}
          <div className="panel panel-location">
            <div className="panel-label">
              Localização
              {isLoadingLocation && <span className="location-loading">detectando...</span>}
            </div>
            <div className="city-input-wrapper">
              <LocationOn className="city-input-icon" />
              <input type="text" id="city" name="city" value={formData.city} onChange={handleChange} placeholder="Sua cidade" />
            </div>
          </div>

          {/* PAINEL OBSERVAÇÕES */}
          <div className="panel panel-obs">
            <div className="panel-label">Observações</div>
            <textarea id="message" name="message" value={formData.message} onChange={handleChange} rows={3} placeholder="Informações adicionais para o comprador..." />
          </div>
        </div>

        {/* BOTÃO MOBILE */}
        <div className="publish-mobile">
          <button type="submit" className="btn-publish" disabled={isLoading}>
            {isLoading ? 'Publicando...' : 'Publicar Anúncio'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddItem;

