import { useQuery } from "@tanstack/react-query";
import { authApi } from "../api/authApi.js";

export default function ProfilePage() {
  const { data: user } = useQuery({
    queryKey: ["profile"],
    queryFn: () => authApi.me(),
  });

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {user?.data?.first_name?.[0]}
          </div>
          <div>
            <h2 className="text-2xl font-semibold">
              {user?.data?.first_name} {user?.data?.last_name}
            </h2>
            <p className="text-gray-600">{user?.data?.email}</p>
            <p className="text-sm text-primary capitalize">
              {user?.data?.role}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
