import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import { Admin } from './pages/Admin';
import { CroppedImage } from './pages/CroppedImage';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { CloudinaryTest } from './components/CloudinaryTest';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from './components/ui/toaster';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
                      <Route path="/" element={<Index />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } />
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
