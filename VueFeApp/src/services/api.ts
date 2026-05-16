import axios from 'axios';
import { message } from 'ant-design-vue';

const API_URL = 'http://10.0.2.2:3000'; // Dùng 10.0.2.2 cho Android Emulator

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;

// Phim ảnh
export const fetchTopLikedFilms = () => api.get('/films/top-liked?limit=10').then(res => res.data);
export const fetchHotCategories = () => api.get('/types/hot').then(res => res.data);
export const fetchTypes = () => api.get('/types').then(res => res.data);
export const fetchCountries = () => api.get('/films/countries').then(res => res.data).catch(() => []);
export const fetchNewFilms = (limit: number = 12) => 
  api.get(`/films?limit=${limit}`).then(res => res.data.data);
export const fetchTopSeries = (limit: number = 10) => 
  api.get(`/films/top-series?limit=${limit}`).then(res => res.data);

export const fetchFilmsByFilter = (params: any) => {
  const queryParams = new URLSearchParams();
  
  if (params.type === 'phim-le') queryParams.append('isSeries', 'false');
  else if (params.type === 'phim-bo') queryParams.append('isSeries', 'true');
  else if (params.type) queryParams.append('category', params.type);
  
  if (params.category) queryParams.append('category', params.category);
  if (params.country) queryParams.append('country', params.country);
  if (params.year) queryParams.append('year', params.year);
  if (params.keyword) queryParams.append('keyword', params.keyword);
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.sort) queryParams.append('sort', params.sort);
  if (params.actors) queryParams.append('actors', params.actors);

  return api.get(`/films?${queryParams.toString()}`).then(res => res.data);
};

export const fetchFilmBySlug = (slug: string) => api.get(`/films/${slug}`).then(res => res.data);

// Diễn viên
export const fetchActors = () => api.get('/actors').then(res => res.data);
export const fetchActorById = (id: string) => api.get(`/actors/${id}`).then(res => res.data);

// Auth
export const login = (data: any) => api.post('/auth/login', data).then(res => res.data);
export const register = (data: any) => api.post('/auth/register', data).then(res => res.data);

// Social & Interaction
export const fetchComments = (filmId: string) => api.get(`/social/comments/${filmId}`).then(res => res.data);
export const postComment = (filmId: string, content: string, parentCommentId?: string) => 
  api.post('/social/comments', { filmId, content, parentCommentId }).then(res => res.data);
export const voteComment = (commentId: string, type: 'up' | 'down') => 
  api.post(`/social/comments/${commentId}/vote?type=${type}`).then(res => res.data);
export const toggleLike = (filmId: string) => api.post(`/social/like/${filmId}`).then(res => res.data);
export const fetchBookmarks = () => api.get('/users/bookmarks').then(res => res.data);
export const toggleBookmark = (filmId: string) => api.post(`/users/bookmarks/film/${filmId}`).then(res => res.data);

// History
export const saveWatchHistory = (data: any) => api.post('/users/watch-history', data).then(res => res.data);
export const fetchWatchHistory = () => api.get('/users/watch-history').then(res => res.data);
export const deleteWatchHistory = (filmId: string) => api.delete(`/users/watch-history/${filmId}`).then(res => res.data);

// User Profile & Settings
export const updateAvatar = (avatar: string) => api.put('/users/avatar', { avatar }).then(res => res.data);
export const changePassword = (data: any) => api.put('/users/change-password', data).then(res => res.data);
export const createCollection = (name: string) => api.post('/users/collections', { name }).then(res => res.data);
export const addFilmToCollections = (filmId: string, collectionNames: string[]) => 
  api.post('/users/collections/add-film', { filmId, collectionNames }).then(res => res.data);
export const removeFilmFromCollection = (filmId: string, collectionName: string) => 
  api.post('/users/collections/remove-film', { filmId, collectionName }).then(res => res.data);

// Payment
export const createPaymentUrl = (pack: 'premium' | 'promax', billing: 'monthly' | 'yearly' = 'monthly') =>
  api.post('/payment/create-payment-url', { pack, billing }).then(res => res.data);
export const verifyPayment = (params: any) => api.post('/payment/verify', params).then(res => res.data);
