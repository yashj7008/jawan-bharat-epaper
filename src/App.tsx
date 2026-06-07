import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import { CroppedImage } from './pages/CroppedImage';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { CloudinaryTest } from './components/CloudinaryTest';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './components/ui/toaster';
import { AdminLayout } from './pages/admin/AdminLayout';
import { NewspaperListPage } from './pages/admin/NewspaperListPage';
import { CreateNewspaperPage } from './pages/admin/CreateNewspaperPage';
import { ViewNewspaperPage } from './pages/admin/ViewNewspaperPage';
import { EditNewspaperPage } from './pages/admin/EditNewspaperPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<NewspaperListPage />} />
              <Route path="newspapers/new" element={<CreateNewspaperPage />} />
              <Route path="newspapers/:id" element={<ViewNewspaperPage />} />
              <Route path="newspapers/:id/edit" element={<EditNewspaperPage />} />
            </Route>
            <Route path="/cropped/:id" element={<CroppedImage />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
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
