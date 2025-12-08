
// import { motion } from "framer-motion";
// import { useEffect, useState } from "react";
// import { formatDistanceToNow } from "date-fns";
// import { MessageSquare, CheckCircle } from "lucide-react";
// import Lottie from "lottie-react";
// import emptyAnimation from "../../assets/illustrations/empty-state.json";

// export  default function ClientFeedbackList() {
//   const [feedback, setFeedback] = useState([]);

//   useEffect(() => {
//     const load = () => {
//       const data = JSON.parse(localStorage.getItem("cfitp_feedback") || "[]");
//       setFeedback(data.sort((a, b) => b.date.localeCompare(a.date)));
//     };
//     load();
//     window.addEventListener("storage", load);
//     return () => window.removeEventListener("storage", load);
//   }, []);

//   const markAsRead = (id) => {
//     const updated = feedback.map((f) =>
//       f.id === id ? { ...f, read: true } : f
//     );
//     localStorage.setItem("cfitp_feedback", JSON.stringify(updated));
//     setFeedback(updated);
//   };

//   const unreadCount = feedback.filter((f) => !f.read).length;

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       className="max-w-5xl mx-auto py-10"
//     >
//       <div className="flex items-center gap-4 mb-10">
//         <MessageSquare className="text-[#0EA5A4]" size={36} />
//         <h1 className="text-4xl font-bold text-slate-800">Client Feedback</h1>
//         {unreadCount > 0 && (
//           <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
//             {unreadCount} Unread
//           </span>
//         )}
//       </div>

//       <div className="bg-white rounded-3xl shadow-xl border border-gray-200">
//         {feedback.length === 0 ? (
//           <div className="text-center py-24">
//             <Lottie animationData={emptyAnimation} className="w-80 mx-auto" />
//             <p className="text-2xl text-slate-600 mt-8">
//               No feedback from clients yet
//             </p>
//           </div>
//         ) : (
//           <div className="divide-y divide-gray-200">
//             {feedback.map((item) => (
//               <div
//                 key={item.id}
//                 className={`p-8 ${
//                   item.read
//                     ? "bg-gray-50"
//                     : "bg-teal-50 border-l-4 border-[#0EA5A4]"
//                 }`}
//               >
//                 <div className="flex justify-between items-start mb-4">
//                   <div>
//                     <p className="font-bold text-xl text-slate-800">
//                       {item.author || "Client"}
//                     </p>
//                     <p className="text-sm text-slate-500">
//                       {formatDistanceToNow(new Date(item.date), {
//                         addSuffix: true,
//                       })}
//                     </p>
//                   </div>
//                   {!item.read && (
//                     <button
//                       onClick={() => markAsRead(item.id)}
//                       className="flex items-center gap-2 text-sm text-[#0EA5A4] hover:underline font-medium"
//                     >
//                       <CheckCircle size={18} /> Mark as read
//                     </button>
//                   )}
//                 </div>
//                 <p className="text-lg text-slate-700 leading-relaxed whitespace-pre-wrap">
//                   {item.text}
//                 </p>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </motion.div>
//   );
// }

// src/components/Layout/Sidebar.jsx
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