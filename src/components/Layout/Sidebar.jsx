
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  MessageSquare, 
  Bell, 
  BarChart3, 
  User,
  Settings,
  Users,
  HelpCircle,
  Shield,
  Briefcase,
  Inbox
} from 'lucide-react';
import { useUIStore } from '../../app/store/uiStore';

// Menu items by role
const MENU_ITEMS = {
  client: [
    { path: '/app/client', label: 'Dashboard', icon: <Home size={20} /> },
    { path: '/issues', label: 'My Issues', icon: <FileText size={20} /> },
    { path: '/feedback', label: 'Give Feedback', icon: <MessageSquare size={20} /> },
    { path: '/notifications', label: 'Notifications', icon: <Bell size={20} /> },
    { path: '/profile', label: 'Profile', icon: <User size={20} /> },
  ],
  staff: [
    { path: '/app/staff', label: 'Dashboard', icon: <Home size={20} /> },
    { path: '/issues', label: 'Assigned Issues', icon: <Inbox size={20} /> },
    { path: '/notifications', label: 'Notifications', icon: <Bell size={20} /> },
    { path: '/profile', label: 'Profile', icon: <User size={20} /> },
    { path: '/help', label: 'Help Desk', icon: <HelpCircle size={20} /> },
  ],
  manager: [
    { path: '/app/manager', label: 'Dashboard', icon: <Home size={20} /> },
    { path: '/issues', label: 'All Issues', icon: <FileText size={20} /> },
    { path: '/feedback', label: 'Feedback', icon: <MessageSquare size={20} /> },
    { path: '/reports', label: 'Reports', icon: <BarChart3 size={20} /> },
    { path: '/notifications', label: 'Notifications', icon: <Bell size={20} /> },
    { path: '/profile', label: 'Profile', icon: <User size={20} /> },
    { path: '/team', label: 'Team', icon: <Users size={20} /> },
  ],
  admin: [
    { path: '/app/admin', label: 'Dashboard', icon: <Home size={20} /> },
    { path: '/issues', label: 'All Issues', icon: <FileText size={20} /> },
    { path: '/feedback', label: 'Feedback', icon: <MessageSquare size={20} /> },
    { path: '/reports', label: 'Reports', icon: <BarChart3 size={20} /> },
    { path: '/notifications', label: 'Notifications', icon: <Bell size={20} /> },
    { path: '/profile', label: 'Profile', icon: <User size={20} /> },
    { path: '/users', label: 'User Management', icon: <Users size={20} /> },
    { path: '/settings', label: 'System Settings', icon: <Settings size={20} /> },
    { path: '/audit', label: 'Audit Log', icon: <Shield size={20} /> },
  ]
};

export default function Sidebar() {
  const location = useLocation();
  const userRole = useUIStore((state) => state.userRole);
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  
  const storedRole = localStorage.getItem('user_role');
  const role = userRole || storedRole || 'client';
  const menuItems = MENU_ITEMS[role] || MENU_ITEMS.client;

  if (!sidebarOpen) return null;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-6">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-teal-600">CFITP Portal</h2>
        <p className="text-sm text-gray-500 capitalize mt-1">{role} Dashboard</p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              location.pathname === item.path
                ? 'bg-teal-50 text-teal-600 border-l-4 border-teal-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

   
    </aside>
  );
}