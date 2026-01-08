import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (cache time)
    },
    mutations: {
      retry: 0,
    },
  },
});

// Make queryClient globally available for axios interceptor
if (typeof window !== "undefined") {
  window.queryClient = queryClient;
}

// Cleanup function for logout
export const clearAllQueries = () => {
  queryClient.clear();
  queryClient.removeQueries();
};
