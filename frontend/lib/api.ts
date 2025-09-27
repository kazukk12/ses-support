const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  console.log('Making API request to:', url);
  console.log('Request config:', config);

  try {
    const response = await fetch(url, config);

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Error response text:', errorText);
      throw new ApiError(response.status, `HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log('Success response data:', data);
    return data;
  } catch (error) {
    console.log('Fetch error details:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, `Network error: ${error}`);
  }
}

export const api = {
  // Employee endpoints
  employees: {
    getAll: (params?: Record<string, string>) => {
      const query = params ? `?${new URLSearchParams(params)}` : '';
      return apiRequest<any[]>(`/api/employees${query}`);
    },
    getById: (id: number) => apiRequest<any>(`/api/employees/${id}`),
    search: (params: Record<string, string>) => {
      const query = new URLSearchParams(params);
      return apiRequest<any[]>(`/api/employees/search?${query}`);
    },
    create: (data: any) => apiRequest<any>('/api/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: number, data: any) => apiRequest<any>(`/api/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: number) => apiRequest<any>(`/api/employees/${id}`, {
      method: 'DELETE',
    }),
    matching: (data: any) => apiRequest<any[]>('/api/employees/matching', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },

  // Skill endpoints
  skills: {
    getAll: (params?: Record<string, string>) => {
      const query = params ? `?${new URLSearchParams(params)}` : '';
      return apiRequest<any[]>(`/api/skills${query}`);
    },
    getCategories: () => apiRequest<string[]>('/api/skills/categories'),
    create: (data: any) => apiRequest<any>('/api/skills', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    delete: (id: number) => apiRequest<any>(`/api/skills/${id}`, {
      method: 'DELETE',
    }),
  },

  // Project endpoints
  projects: {
    getAll: (params?: Record<string, string>) => {
      const query = params ? `?${new URLSearchParams(params)}` : '';
      return apiRequest<any[]>(`/api/projects${query}`);
    },
    getById: (id: number) => apiRequest<any>(`/api/projects/${id}`),
    create: (data: any) => apiRequest<any>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: number, data: any) => apiRequest<any>(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: number) => apiRequest<any>(`/api/projects/${id}`, {
      method: 'DELETE',
    }),
  },

  // Availability endpoints
  availability: {
    getAll: (params?: Record<string, string>) => {
      const query = params ? `?${new URLSearchParams(params)}` : '';
      return apiRequest<any[]>(`/api/availability${query}`);
    },
    getByEmployeeId: (employeeId: number) => apiRequest<any>(`/api/availability/${employeeId}`),
    create: (data: any) => apiRequest<any>('/api/availability', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (employeeId: number, data: any) => apiRequest<any>(`/api/availability/${employeeId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (employeeId: number) => apiRequest<any>(`/api/availability/${employeeId}`, {
      method: 'DELETE',
    }),
  },

  // One-on-one endpoints
  oneOnOnes: {
    getAll: (params?: Record<string, string>) => {
      const query = params ? `?${new URLSearchParams(params)}` : '';
      return apiRequest<any[]>(`/api/one-on-ones${query}`);
    },
    getById: (id: number) => apiRequest<any>(`/api/one-on-ones/${id}`),
    create: (data: any) => apiRequest<any>('/api/one-on-ones', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: number, data: any) => apiRequest<any>(`/api/one-on-ones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: number) => apiRequest<any>(`/api/one-on-ones/${id}`, {
      method: 'DELETE',
    }),
    getCompletionRate: (params?: Record<string, string>) => {
      const query = params ? `?${new URLSearchParams(params)}` : '';
      return apiRequest<any>(`/api/one-on-ones/stats/completion-rate${query}`);
    },
  },

  // Dashboard endpoints
  dashboard: {
    getStats: () => apiRequest<any>('/api/dashboard/stats'),
    getSkillDistribution: () => apiRequest<any[]>('/api/dashboard/skill-distribution'),
    getDetailedSkillDistribution: (category: string) =>
      apiRequest<any[]>(`/api/dashboard/skill-distribution/${encodeURIComponent(category)}`),
    getAvailabilityStatus: () => apiRequest<any[]>('/api/dashboard/availability-status'),
    getRecentOneOnOnes: (limit?: number) => {
      const query = limit ? `?limit=${limit}` : '';
      return apiRequest<any[]>(`/api/dashboard/recent-one-on-ones${query}`);
    },
  },
};