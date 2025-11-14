// import { useQuery } from "@tanstack/react-query";
// import { authApi } from "../api/authApi.js";

// export default function ProfilePage() {
//   const { data: user } = useQuery({
//     queryKey: ["profile"],
//     queryFn: () => authApi.me(),
//   });

//   return (
//     <div className="max-w-4xl mx-auto">
//       <h1 className="text-3xl font-bold mb-8">My Profile</h1>
//       <div className="bg-white dark:bg-gray-800 rounded-xl p-8">
//         <div className="flex items-center gap-6 mb-8">
//           <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-bold">
//             {user?.data?.first_name?.[0]}
//           </div>
//           <div>
//             <h2 className="text-2xl font-semibold">
//               {user?.data?.first_name} {user?.data?.last_name}
//             </h2>
//             <p className="text-gray-600">{user?.data?.email}</p>
//             <p className="text-sm text-primary capitalize">
//               {user?.data?.role}
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// src/pages/ProfilePage.jsx
export default function ProfilePage() {
  const profile = JSON.parse(localStorage.getItem("user_profile") || "{}");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-text">Profile</h1>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center">
            <span className="text-3xl font-bold text-primary">
              {profile.first_name?.[0]}{profile.last_name?.[0]}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text">
              {profile.first_name} {profile.last_name}
            </h2>
            <p className="text-gray-500">{profile.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
              {profile.role?.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Email</label>
            <p className="text-lg text-text">{profile.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Role</label>
            <p className="text-lg text-text capitalize">{profile.role}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Member Since</label>
            <p className="text-lg text-text">November 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
}