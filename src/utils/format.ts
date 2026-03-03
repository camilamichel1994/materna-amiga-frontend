export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3333';

export const getImageUrl = (photo: string | null | undefined): string | null => {
  if (!photo) return null;
  
  if (photo.startsWith('data:image/')) {
    return photo;
  }
  
  if (photo.startsWith('http://') || photo.startsWith('https://')) {
    return photo;
  }
  
  if (photo.startsWith('/')) {
    return `${API_BASE}${photo}`;
  }
  
  return `${API_BASE}/${photo}`;
};

const LISTING_TYPE_LABELS: Record<string, string> = {
  venda: 'Venda',
  doacao: 'Doação',
  troca: 'Troca',
};

export const getListingTypeLabel = (listingType: string | null | undefined): string => {
  if (!listingType) return 'Troca';
  return LISTING_TYPE_LABELS[listingType] ?? 'Troca';
};

