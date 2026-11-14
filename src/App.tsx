import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import { CroppedImage } from './pages/CroppedImage';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { ResetPassword } from './pages/ResetPassword';
import { CloudinaryTest } from './components/CloudinaryTest';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './components/ui/toaster';
import { AdminLayout } from './pages/admin/AdminLayout';
import { NewspaperListPage } from './pages/admin/NewspaperListPage';
import { CreateNewspaperPage } from './pages/admin/CreateNewspaperPage';
import { ViewNewspaperPage } from './pages/admin/ViewNewspaperPage';
import { EditNewspaperPage } from './pages/admin/EditNewspaperPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import './App.css';
import { NewspaperApp } from './components/NewspaperApp';

function RouteRobots() {
  const { pathname } = useLocation();
  useEffect(() => {
    const privateRoute = /^\/(admin|signin|signup|reset-password|test-cloudinary|cropped)(\/|$)/.test(pathname);
    let meta = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'robots'; document.head.appendChild(meta); }
    meta.content = privateRoute ? 'noindex,nofollow' : 'index,follow,max-image-preview:large';
  }, [pathname]);
  return null;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <RouteRobots />
        <div className="App">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/edition/:date" element={<NewspaperApp />} />
            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            {/* <Route path="/admin" element={<AdminLayout />}> */}

              <Route index element={<NewspaperListPage />} />
              <Route path="newspapers/new" element={<CreateNewspaperPage />} />
              <Route path="newspapers/:id" element={<ViewNewspaperPage />} />
              <Route path="newspapers/:id/edit" element={<EditNewspaperPage />} />
            </Route>
            <Route path="/cropped/:id" element={<CroppedImage />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/test-cloudinary" element={<CloudinaryTest />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}
export default App;
