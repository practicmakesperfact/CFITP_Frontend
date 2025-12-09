
import axiosClient from "./axiosClient.js";

export const reportsApi = {
  // Get reports with filters
  getReports: (params) => {
    return axiosClient.get("/reports/", { params });
  },

  // Generate PDF report
  generatePDFReport: (data) => {
    return axiosClient.post("/reports/generate-pdf/", data);
  },

  // Check report status
  checkReportStatus: (reportId) => {
    return axiosClient.get(`/reports/${reportId}/status/`);
  },

  // Download report
  downloadReport: (reportId) => {
    return axiosClient.get(`/reports/${reportId}/download/`, {
      responseType: "blob",
    });
  },

  // Get available report types
  getReportTypes: () => {
    return axiosClient.get("/reports/types/");
  },

  // Get export data
  getExportData: (params) => {
    return axiosClient.get("/reports/export-data/", { params });
  },

  // Get audit logs
  getAuditLogs: (params) => {
    return axiosClient.get("/reports/audit-logs/", { params });
  },

  // Get performance metrics
  getPerformanceMetrics: (params) => {
    return axiosClient.get("/reports/performance-metrics/", { params });
  },
};
