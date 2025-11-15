export default function KpiCard({ title, value, icon: Icon }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
        </div>

        <div className="p-4 rounded-full bg-gray-100">
          <Icon className="h-8 w-8 text-gray-600" />
        </div>
      </div>
    </div>
  );
}
