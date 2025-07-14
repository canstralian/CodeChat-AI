import { useQuery } from '@tanstack/react-query';

export function useAuth() {
  return useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: async () => {
      const response = await fetch('/api/auth/user', {
        credentials: 'include' // Include cookies for session
      });
      if (response.status === 401) {
        // User is not authenticated, redirect to login
        window.location.href = '/api/login';
        throw new Error('Not authenticated');
      }
      if (!response.ok) {
        throw new Error('Authentication check failed');
      }
      return response.json();
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}