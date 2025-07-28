import Sidebar from '../components/UserSettings/Sidebar';
import { Outlet } from 'react-router-dom';

const UserSettingsDashboard = () => {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: '20px' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default UserSettingsDashboard;
