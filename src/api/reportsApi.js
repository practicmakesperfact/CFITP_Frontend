import axiosClient from "./axiosClient.js";

export const reportsApi = {
  // Get analytics data for dashboard
  getAnalyticsData: (params = {}) => {
    return axiosClient
      .get("/reports/analytics/", { params })
      .then((response) => {
        // Handle response structure - data is in response.data.data
        if (response.data && response.data.data !== undefined) {
          return {
            ...response,
            data: response.data.data,
          };
        }
        return response;
      });
  },

  // Get real-time metrics
  getRealtimeMetrics: () => {
    return axiosClient.get("/reports/metrics/").then((response) => {
      if (response.data && response.data.data !== undefined) {
        return {
          ...response,
          data: response.data.data,
        };
      }
      return response;
    });
  },

  // Create a new report (store in database)
  createReport: (data) => {
    return axiosClient.post("/reports/", data);
  },

  // Get all reports for current user
  getReports: (params = {}) => {
    return axiosClient.get("/reports/", { params });
  },

  // Get a specific report by ID
  getReport: (id) => {
    return axiosClient.get(`/reports/${id}/`);
  },

  // Get report generation status
  getReportStatus: (id) => {
    return axiosClient.get(`/reports/${id}/status/`).then((response) => {
      if (response.data && response.data.data !== undefined) {
        return {
          ...response,
          data: response.data.data,
        };
      }
      return response;
    });
  },

  // Download a generated report
  downloadReport: (id) => {
    return axiosClient.get(`/reports/${id}/download/`, {
      responseType: "blob",
    });
  },

  // Delete a report
  deleteReport: (id) => {
    return axiosClient.delete(`/reports/${id}/`);
  },

  // Quick export (CSV, Excel, JSON)
  exportQuick: (format, params = {}) => {
    return axiosClient.get(`/reports/export/`, {
      params: { ...params, format },
      responseType: "blob",
    });
  },

  // Quick Excel export (frontend-based for immediate download)
  exportExcel: async (params = {}) => {
    try {
      // First get the data
      const response = await reportsApi.getAnalyticsData(params);
      const data = response.data;

      return {
        data: data,
        success: true,
      };
    } catch (error) {
      console.error("Excel export error:", error);
      throw error;
    }
  },

  // Quick CSV export (frontend-based)
  exportCSV: async (params = {}) => {
    try {
      const response = await reportsApi.getAnalyticsData(params);
      const data = response.data;

      // Convert to CSV string
      let csv = "CFITP Analytics Report\n";
      csv += `Period: ${data.period_display}\n`;
      csv += `Generated: ${new Date().toISOString().split("T")[0]}\n\n`;

      // Summary section
      csv += "Summary Metrics\n";
      csv += "Metric,Value\n";
      Object.entries(data.summary).forEach(([key, value]) => {
        csv += `${key.replace(/_/g, " ").toUpperCase()},${value}\n`;
      });

      // Issues by Status
      if (data.issues_by_status && data.issues_by_status.length > 0) {
        csv += "\nIssues by Status\n";
        csv += "Status,Count,Percentage\n";
        data.issues_by_status.forEach((item) => {
          csv += `${item.status.replace(/_/g, " ").toUpperCase()},${
            item.count
          },${item.percentage || 0}%\n`;
        });
      }

      // Issues by Priority
      if (data.issues_by_priority && data.issues_by_priority.length > 0) {
        csv += "\nIssues by Priority\n";
        csv += "Priority,Count,Percentage\n";
        data.issues_by_priority.forEach((item) => {
          csv += `${item.priority.toUpperCase()},${item.count},${
            item.percentage || 0
          }%\n`;
        });
      }

      return {
        data: csv,
        success: true,
      };
    } catch (error) {
      console.error("CSV export error:", error);
      throw error;
    }
  },

  // Quick JSON export
  exportJSON: async (params = {}) => {
    try {
      const response = await reportsApi.getAnalyticsData(params);
      const data = response.data;

      return {
        data: JSON.stringify(data, null, 2),
        success: true,
      };
    } catch (error) {
      console.error("JSON export error:", error);
      throw error;
    }
  },

  // Get team performance data
  getTeamPerformance: (params = {}) => {
    return axiosClient
      .get("/reports/analytics/", {
        params: { ...params, report_type: "team_performance" },
      })
      .then((response) => {
        if (response.data && response.data.data !== undefined) {
          return {
            ...response,
            data: response.data.data,
          };
        }
        return response;
      });
  },

  // Get feedback summary
  getFeedbackSummary: (params = {}) => {
    return axiosClient
      .get("/reports/analytics/", {
        params: { ...params, report_type: "feedback_summary" },
      })
      .then((response) => {
        if (response.data && response.data.data !== undefined) {
          return {
            ...response,
            data: response.data.data,
          };
        }
        return response;
      });
  },

  // Get report types metadata
  getReportTypes: () => {
    return Promise.resolve({
      data: {
        issues_by_status: {
          name: "Issues by Status",
          description: "Distribution of issues across different statuses",
          icon: "pie-chart",
          color: "teal",
          supported_formats: ["csv", "excel", "pdf", "json"],
        },
        issues_by_priority: {
          name: "Issues by Priority",
          description: "Issue distribution by priority levels",
          icon: "bar-chart",
          color: "orange",
          supported_formats: ["csv", "excel", "pdf", "json"],
        },
        issues_by_assignee: {
          name: "Issues by Assignee",
          description: "Issues assigned to team members",
          icon: "users",
          color: "blue",
          supported_formats: ["csv", "excel", "pdf", "json"],
        },
        feedback_summary: {
          name: "Feedback Summary",
          description: "Client feedback and satisfaction analysis",
          icon: "message-square",
          color: "purple",
          supported_formats: ["csv", "excel", "pdf", "json"],
        },
        team_performance: {
          name: "Team Performance",
          description: "Staff performance and efficiency metrics",
          icon: "activity",
          color: "green",
          supported_formats: ["csv", "excel", "pdf", "json"],
        },
      },
    });
  },
};

export default reportsApi;
