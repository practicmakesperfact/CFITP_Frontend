import { motion } from "framer-motion";

export default function Footer() {
  return (
    <motion.footer
      className="bg-[#475569] text-white p-4 text-center rounded-t-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      © 2025 CFITP Portal. All rights reserved.
    </motion.footer>
  );
}
