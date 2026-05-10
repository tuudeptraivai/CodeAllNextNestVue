import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import AdminLayout from './components/Layout/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FilmList from './pages/Film/FilmList';
// import FilmForm from './pages/Film/FilmForm';
import CategoryList from './pages/Category/CategoryList';
import ActorList from './pages/Actor/ActorList';
import CrawlerPage from './pages/Crawler/CrawlerPage';
import UserList from './pages/User/UserList';
import RoleList from './pages/User/RoleList';
import PermissionList from './pages/User/PermissionList';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="films" element={<FilmList />} />
          {/* <Route path="films/create" element={<FilmForm />} /> */}
          {/* <Route path="films/edit/:id" element={<FilmForm />} /> */}
          <Route path="categories" element={<CategoryList />} />
          <Route path="actors" element={<ActorList />} />
          <Route path="crawler" element={<CrawlerPage />} />
          <Route path="users" element={<UserList />} />
          <Route path="roles" element={<RoleList />} />
          <Route path="permissions" element={<PermissionList />} />
          <Route path="*" element={<div>Coming Soon</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
