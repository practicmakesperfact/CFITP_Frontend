
import { Download } from "lucide-react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export default function CSVExport({
  data,
  filename = "report",
  columns = [],
  sheetName = "Report",
}) {
  const exportToExcel = async () => {
    try {
      // Create a new workbook
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "CFITP System";
      workbook.created = new Date();

      // Add a worksheet
      const worksheet = workbook.addWorksheet(sheetName);

      // Add headers if columns provided
      if (columns.length > 0) {
        worksheet.columns = columns.map((col) => ({
          header: col.header,
          key: col.key,
          width: col.width || 20,
        }));

        // Add data rows
        data.forEach((row) => {
          worksheet.addRow(row);
        });

        // Style the header row
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
        headerRow.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF0EA5A4" }, // Teal color
        };
        headerRow.alignment = { vertical: "middle", horizontal: "center" };
      } else {
        // Auto-detect columns if not provided
        if (data.length > 0) {
          const firstRow = data[0];
          const headers = Object.keys(firstRow);

          worksheet.columns = headers.map((header) => ({
            header:
              header.charAt(0).toUpperCase() +
              header.slice(1).replace(/_/g, " "),
            key: header,
            width: 20,
          }));

          // Add all rows
          data.forEach((row) => {
            worksheet.addRow(row);
          });

          // Style the header
          const headerRow = worksheet.getRow(1);
          headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
          headerRow.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF0EA5A4" },
          };
          headerRow.alignment = { vertical: "middle", horizontal: "center" };
        }
      }

      // Style all rows
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          // Skip header
          row.alignment = { vertical: "middle", horizontal: "left" };

          // Alternate row colors
          if (rowNumber % 2 === 0) {
            row.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFF8FAFC" }, // Light gray
            };
          }
        }
      });

      // Auto-fit columns
      worksheet.columns.forEach((column) => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = Math.min(maxLength + 2, 50);
      });

      // Generate Excel file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Save the file
      saveAs(
        blob,
        `${filename}_${new Date().toISOString().split("T")[0]}.xlsx`
      );

      return true;
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      throw error;
    }
  };

  return (
    <button
      onClick={exportToExcel}
      disabled={!data || data.length === 0}
      className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Download className="h-4 w-4" />
      Export to Excel
    </button>
  );
}
