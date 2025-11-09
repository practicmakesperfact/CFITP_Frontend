import { Download } from "lucide-react";
import { utils, writeFile } from "xlsx";

export default function CSVExport({ data, filename = "report" }) {
  const exportCSV = () => {
    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Report");
    writeFile(wb, `${filename}.xlsx`);
  };

  return (
    <button onClick={exportCSV} className="flex items-center gap-2 btn-primary">
      <Download className="h-4 w-4" />
      Export CSV
    </button>
  );
}
