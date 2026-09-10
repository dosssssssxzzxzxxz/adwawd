/// <reference types="vite/client" />
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const client = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

export const login = async (username: string, password: string) => {
  const response = await client.post('/auth/login', { username, password });
  return response.data;
};

export const startCheck = async (data: {
  playerName: string;
  helperAvailable: boolean;
}) => {
  const response = await client.post('/check/start', data);
  return response.data;
};

export const getCheckStatus = async (scanId: string) => {
  const response = await client.get(`/check/status/${scanId}`);
  return response.data;
};

export const getSignatures = async () => {
  const response = await client.get('/signatures');
  return response.data;
};

export const getDashboardScans = async (filter = 'ALL', token: string) => {
  const response = await client.get(`/dashboard/scans?filter=${filter}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getDashboardStats = async (token: string) => {
  const response = await client.get('/dashboard/stats', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getScanDetail = async (scanId: string, token: string) => {
  const response = await client.get(`/dashboard/scans/${scanId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
