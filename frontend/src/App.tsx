import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from './hooks/useAuth';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import WingPage from './pages/WingPage';
import PhotoGalleryPage from './pages/PhotoGalleryPage';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="wings/:slug" element={<WingPage />} />
            <Route path="wings/:slug/gallery" element={<PhotoGalleryPage />} />
          </Route>

          <Route path="/admin/login" element={<Login />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
