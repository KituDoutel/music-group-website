import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import axios from 'axios';

const AdminLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        await axios.get('/api/admin/verify');
      } catch (err) {
        navigate('/login');
      }
    };
    checkAdmin();
  }, [navigate]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">Music Admin</h1>
        </div>
        <nav className="p-2">
          <Link to="/admin/dashboard" className="block py-2 px-4 rounded hover:bg-gray-700">
            Dashboard
          </Link>
          <Link to="/admin/users" className="block py-2 px-4 rounded hover:bg-gray-700">
            User Management
          </Link>
          <Link to="/admin/tracks" className="block py-2 px-4 rounded hover:bg-gray-700">
            Music Tracks
          </Link>
          <Link to="/admin/products" className="block py-2 px-4 rounded hover:bg-gray-700">
            Products
          </Link>
          <Link to="/admin/payments" className="block py-2 px-4 rounded hover:bg-gray-700">
            Payments
          </Link>
          <Link to="/admin/settings" className="block py-2 px-4 rounded hover:bg-gray-700">
            Settings
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Admin Panel</h2>
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              navigate('/login');
            }}
            className="text-red-600 hover:text-red-800"
          >
            Logout
          </button>
        </header>
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;