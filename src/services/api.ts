const BASE_URL = 'http://localhost:3333';

export const getAuthToken = (): string | null => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

export const setAuthToken = (token: string, remember: boolean = false): void => {
  if (remember) {
    localStorage.setItem('token', token);
  } else {
    sessionStorage.setItem('token', token);
  }
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
};

interface ApiRequestOptions extends RequestInit {
  requireAuth?: boolean;
}

const getHeaders = (includeAuth: boolean = false, isFormData: boolean = false): HeadersInit => {
  const headers: HeadersInit = {};
  
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

export const apiRequest = async <T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> => {
  const url = `${BASE_URL}${endpoint}`;
  const { requireAuth = true, ...requestOptions } = options;
  const hasAuthHeader = requestOptions.headers && 'Authorization' in requestOptions.headers;
  const includeAuth = hasAuthHeader || requireAuth;
  const isFormData = requestOptions.body instanceof FormData;
  
  const config: RequestInit = {
    ...requestOptions,
    headers: {
      ...getHeaders(includeAuth, isFormData),
      ...requestOptions.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage = data.message || data.error || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    if (data.success !== undefined) {
      if (!data.success) {
        throw new Error(data.message || data.error || 'Request failed');
      }
      return data.data || data;
    }

    return data;
  } catch (error: unknown) {
    // Garantir que sempre lançamos um Error válido
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('Erro de conexão. Verifique se o servidor está rodando em http://localhost:3333');
      }
      throw error;
    }
    // Se não for um Error, criar um novo
    throw new Error(String(error) || 'Erro desconhecido ao fazer requisição');
  }
};

