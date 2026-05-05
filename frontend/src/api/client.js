import axios from 'axios';

// API Gateway - Central entry point for all backend services
const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:5000';

const client = axios.create({
    baseURL: API_GATEWAY_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default client;
export { API_GATEWAY_URL };
