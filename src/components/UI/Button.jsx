export default function Button({ children, variant = "primary", ...props }) {
  const base = "px-4 py-2 rounded-lg font-medium transition";
  const variants = {
    primary: "bg-primary text-white hover:bg-teal-600",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };
  return (
    <button className={`${base} ${variants[variant]}`} {...props}>
      {children}
    </button>
  );
}
