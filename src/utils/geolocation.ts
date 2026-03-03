export interface UserLocation {
  city: string;
  state: string;
}

export const getUserCity = (): Promise<UserLocation> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalização não suportada pelo navegador'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=pt-BR`,
            {
              headers: {
                'User-Agent': 'MaternaAmiga/1.0',
              },
            }
          );

          if (!response.ok) {
            throw new Error('Erro ao buscar localização');
          }

          const data = await response.json();
          const address = data.address || {};

          const city =
            address.city ||
            address.town ||
            address.village ||
            address.municipality ||
            '';
          const state = address.state || '';

          if (city) {
            resolve({ city, state });
          } else {
            reject(new Error('Não foi possível determinar a cidade'));
          }
        } catch (error) {
          reject(error);
        }
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('Permissão de localização negada'));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error('Localização indisponível'));
            break;
          case error.TIMEOUT:
            reject(new Error('Tempo esgotado ao obter localização'));
            break;
          default:
            reject(new Error('Erro ao obter localização'));
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  });
};
