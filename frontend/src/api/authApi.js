import axios from 'axios';

const BASE = 'http://localhost:5050';
const authApi = axios.create({ baseURL: `${BASE}/api/auth`, timeout: 15000 });
const teacherApi = axios.create({ baseURL: `${BASE}/api/teacher`, timeout: 15000 });

const addToken = (config) => {
    const token = localStorage.getItem('eduguide_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
};

authApi.interceptors.request.use(addToken);
teacherApi.interceptors.request.use(addToken);

export const register = (data) => authApi.post('/register', data).then(r => r.data);
export const login = (data) => authApi.post('/login', data).then(r => r.data);
export const googleAuth = (credential) => authApi.post('/google', { credential }).then(r => r.data);
export const getMe = () => authApi.get('/me').then(r => r.data);

export const adminGetUsers = () => teacherApi.get('/users').then(r => r.data);
export const adminGetStats = () => teacherApi.get('/stats').then(r => r.data);
export const adminDeleteUser = (id) => teacherApi.delete(`/users/${id}`).then(r => r.data);
export const adminUpdateRole = (id, role) => teacherApi.patch(`/users/${id}/role`, { role }).then(r => r.data);
