// src/api/reportsApi.js
import axiosClient from "./axiosClient.js";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";

export const reportsApi = {
  getAnalyticsData: (params = {}) => {
    return axiosClient.get("/reports/analytics/", { params });
  },

  getRealtimeMetrics: () => {
    return axiosClient.get("/reports/metrics/");
  },

  // Quick CSV Export (Frontend)
  exportCSV: async (params) => {
    const response = await reportsApi.getAnalyticsData(params);
    const data = response.data;

    let csv = "Metric,Value\n";
    Object.entries(data.summary).forEach(([k, v]) => {
      csv += `${k.replace(/_/g, " ")},${v}\n`;
    });

    csv += "\nStatus,Count\n";
    data.issues_by_status.forEach((item) => {
      csv += `${item.status.replace(/_/g, " ")},${item.count}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `report_${new Date().toISOString().split("T")[0]}.csv`);
  },

  // Quick Excel Export (Frontend) - FIXED
  exportExcel: async (params) => {
    const response = await reportsApi.getAnalyticsData(params);
    const data = response.data;

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Report");

    // Summary
    sheet.addRow(["CFITP Analytics Report"]);
    sheet.addRow([`Period: ${data.period_display}`]);
    sheet.addRow([]);
    sheet.addRow(["Metric", "Value"]);
    Object.entries(data.summary).forEach(([key, value]) => {
      sheet.addRow([key.replace(/_/g, " ").toUpperCase(), value]);
    });

    // Issues by Status
    sheet.addRow([]);
    sheet.addRow(["ISSUES BY STATUS"]);
    sheet.addRow(["Status", "Count"]);
    data.issues_by_status.forEach((item) => {
      sheet.addRow([item.status.replace(/_/g, " "), item.count]);
    });

    // Write buffer and download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, `CFITP_Report_${new Date().toISOString().split("T")[0]}.xlsx`);
  },
};
