export default function KpiCard({ title, value, icon: Icon, color = "teal" }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div
          className={`p-4 rounded-full bg-${color}-100 dark:bg-${color}-900/20`}
        >
          <Icon className={`h-8 w-8 text-${color}-600`} />
        </div>
      </div>
    </div>
  );
}
