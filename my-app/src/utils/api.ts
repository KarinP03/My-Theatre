const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";


export const apiFetch = async (endpoint: string, options?: RequestInit) => {
    
  const formattedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;
  const url = `${BASE_URL}${formattedEndpoint}`;

  return fetch(url, options);
};
