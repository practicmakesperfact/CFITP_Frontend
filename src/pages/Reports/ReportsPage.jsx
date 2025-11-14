
import { useState } from "react";
import { motion } from "framer-motion";
import ChartCard from "../../components/Dashboard/ChartCard.jsx";
import { Download, FileText } from "lucide-react";
import toast from "react-hot-toast";

export default function ReportsPage() {
  const [generating, setGenerating] = useState(false);

  const generatePDF = () => {
    setGenerating(true);
    setTimeout(() => {
      toast.success("PDF report is ready! (Mock download)");
      setGenerating(false);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-text">Reports</h1>
        <div className="flex gap-3">
          <button className="bg-primary hover:bg-accent text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Download className="w-5 h-5" /> Export CSV
          </button>
          <button
            onClick={generatePDF}
            disabled={generating}
            className="bg-accent hover:bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FileText className="w-5 h-5" />{" "}
            {generating ? "Generating..." : "Generate PDF"}
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <ChartCard
          title="Issues by Status"
          type="pie"
          data={[12, 8, 5]}
          categories={["Open", "In Progress", "Closed"]}
        />
        <ChartCard
          title="Feedback Trend"
          type="line"
          data={[3, 5, 2, 8, 6]}
          categories={["Mon", "Tue", "Wed", "Thu", "Fri"]}
        />
      </div>
    </motion.div>
  );
}
