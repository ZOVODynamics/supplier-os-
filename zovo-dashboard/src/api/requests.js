import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 10000,
});

function normalizeResponse(response) {
  if (response.data?.error) {
    return {
      data: response.data.data ?? [],
      error: response.data.error,
    };
  }

  return {
    data: response.data?.data ?? [],
    error: null,
  };
}

function normalizeError(error) {
  const message =
    error.response?.data?.error ||
    error.response?.data?.message ||
    error.message ||
    'Request failed';

  return new Error(message);
}

export async function getRequests() {
  try {
    const response = await api.get('/requests');
    return normalizeResponse(response);
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function createRequest(data) {
  try {
    const response = await api.post('/request', data);
    return normalizeResponse(response);
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function deleteRequest(id) {
  try {
    const response = await api.delete(`/request/${encodeURIComponent(id)}`);
    return normalizeResponse(response);
  } catch (error) {
    throw normalizeError(error);
  }
}
