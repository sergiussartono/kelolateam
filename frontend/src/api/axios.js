import axios from 'axios';

const axiosInstance = axios.create({
    // Mengambil http://127.0.0.1:8000 dari file .env secara otomatis
    baseURL: import.meta.env.VITE_API_URL, 
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    // Wajib aktif jika nanti kalian pakai Laravel Sanctum untuk cookies/session Auth
    withCredentials: true, 
});

export default axiosInstance;