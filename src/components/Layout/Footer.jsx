
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <motion.footer
      className="bg-background border-t border-gray-200 dark:border-gray-700 p-4 text-center text-sm text-text"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      © 2025 CFITP Portal. All rights reserved.
    </motion.footer>
  );
}
