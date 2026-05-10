import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  role?: string;
  favoriteFilms?: string[];
  bookmarkFilms?: string[];
  collections?: { name: string; films: any[] }[];
  membership?: string;
  membershipExpiresAt?: string;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  try {
    const savedUser = localStorage.getItem('user');
    if (savedUser) user.value = JSON.parse(savedUser);
  } catch (e) {
    console.error('Failed to parse user from localStorage', e);
    localStorage.removeItem('user');
  }
  const token = ref<string | null>(localStorage.getItem('token'));

  const isAuthenticated = computed(() => !!token.value && !!user.value);
  
  const userDisplayName = computed(() => user.value?.username || 'Khách');
  const userRole = computed(() => user.value?.role || 'Thành viên');

  function setCredentials(userData: User, userToken: string) {
    user.value = userData;
    token.value = userToken;
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  function updateUser(userData: User) {
    user.value = userData;
    localStorage.setItem('user', JSON.stringify(userData));
  }

  return {
    user,
    token,
    isAuthenticated,
    userDisplayName,
    userRole,
    setCredentials,
    logout,
    updateUser,
  };
});
