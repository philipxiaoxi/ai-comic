import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import AppLayout from './components/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AppList from './pages/AppList';
import AppCreate from './pages/AppCreate';
import AppEdit from './pages/AppEdit';

const { Content } = Layout;

function App() {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Login />;
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/apps" element={<AppList />} />
        <Route path="/apps/create" element={<AppCreate />} />
        <Route path="/apps/edit/:id" element={<AppEdit />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
