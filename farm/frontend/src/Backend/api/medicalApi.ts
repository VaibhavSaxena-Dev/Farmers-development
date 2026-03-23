// Medical/Doctor/Clinic API
const API_BASE = '/api'; // Use proxy for development

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Get headers with auth token
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Doctor API
export const doctorApi = {
  // Create new doctor
  createDoctor: async (doctorData: any) => {
    const response = await fetch(`${API_BASE}/medical/doctors`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(doctorData),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Server could not find the request. Ensure the backend is running (cd farm/backend && npm run dev).');
      }
      if (response.status === 401) {
        throw new Error('Session expired. Please sign in again.');
      }
      if (response.status >= 502 && response.status <= 504) {
        throw new Error('Backend server is not responding. Please start it (cd farm/backend && npm run dev).');
      }
      throw new Error(data.error || data.details?.[0] || response.statusText || 'Failed to create doctor');
    }
    return data;
  },

  // Get all registered vet doctors for map (Find Vet page)
  getDoctorsForMap: async () => {
    const response = await fetch(`${API_BASE}/medical/doctors/map`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      return { doctors: [] };
    }
    return response.json();
  },

  // Get all doctors
  getDoctors: async (params: {
    specialization?: string;
    city?: string;
    state?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE}/medical/doctors?${queryParams}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch doctors: ${response.statusText}`);
    }
    return response.json();
  },

  // Get doctor by ID
  getDoctor: async (id: string) => {
    const response = await fetch(`${API_BASE}/medical/doctors/${id}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch doctor: ${response.statusText}`);
    }
    return response.json();
  },

  // Update doctor
  updateDoctor: async (id: string, updateData: any) => {
    const response = await fetch(`${API_BASE}/medical/doctors/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    });
    if (!response.ok) {
      throw new Error(`Failed to update doctor: ${response.statusText}`);
    }
    return response.json();
  },

  // Delete doctor
  deleteDoctor: async (id: string) => {
    const response = await fetch(`${API_BASE}/medical/doctors/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to delete doctor: ${response.statusText}`);
    }
    return response.json();
  },

  // Get nearby doctors
  getNearbyDoctors: async (latitude: number, longitude: number, maxDistance: number = 10, specialization?: string) => {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      maxDistance: maxDistance.toString(),
      ...(specialization && { specialization })
    });

    const response = await fetch(`${API_BASE}/medical/doctors/nearby?${params}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch nearby doctors: ${response.statusText}`);
    }
    return response.json();
  }
};

// Clinic API
export const clinicApi = {
  // Create new clinic
  createClinic: async (clinicData: any) => {
    const response = await fetch(`${API_BASE}/medical/clinics`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(clinicData),
    });
    if (!response.ok) {
      throw new Error(`Failed to create clinic: ${response.statusText}`);
    }
    return response.json();
  },

  // Get all clinics
  getClinics: async (params: {
    city?: string;
    state?: string;
    type?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE}/medical/clinics?${queryParams}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch clinics: ${response.statusText}`);
    }
    return response.json();
  },

  // Get nearby clinics
  getNearbyClinics: async (latitude: number, longitude: number, maxDistance: number = 10, type?: string) => {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      maxDistance: maxDistance.toString(),
      ...(type && { type })
    });

    const response = await fetch(`${API_BASE}/medical/clinics/nearby?${params}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch nearby clinics: ${response.statusText}`);
    }
    return response.json();
  }
};

// Patient API
export const patientApi = {
  // Create new patient
  createPatient: async (patientData: any) => {
    const response = await fetch(`${API_BASE}/medical/patients`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(patientData),
    });
    if (!response.ok) {
      throw new Error(`Failed to create patient: ${response.statusText}`);
    }
    return response.json();
  },

  // Get all patients
  getPatients: async (params: {
    search?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE}/medical/patients?${queryParams}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch patients: ${response.statusText}`);
    }
    return response.json();
  },

  // Get patients near location
  getPatientsNearLocation: async (latitude: number, longitude: number, maxDistance: number = 10) => {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      maxDistance: maxDistance.toString()
    });

    const response = await fetch(`${API_BASE}/medical/patients/nearby?${params}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch patients near location: ${response.statusText}`);
    }
    return response.json();
  }
};

// Appointment API
export const appointmentApi = {
  // Create new appointment
  createAppointment: async (appointmentData: any) => {
    const response = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(appointmentData),
    });
    if (!response.ok) {
      throw new Error(`Failed to create appointment: ${response.statusText}`);
    }
    return response.json();
  },

  // Get all appointments
  getAppointments: async (params: {
    status?: string;
    date?: string;
    page?: number;
    limit?: number;
    patientId?: string;
    doctorId?: string;
  } = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE}/appointments?${queryParams}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch appointments: ${response.statusText}`);
    }
    return response.json();
  },

  // Get appointment by ID
  getAppointment: async (id: string) => {
    const response = await fetch(`${API_BASE}/appointments/${id}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch appointment: ${response.statusText}`);
    }
    return response.json();
  },

  // Update appointment
  updateAppointment: async (id: string, updateData: any) => {
    const response = await fetch(`${API_BASE}/appointments/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    });
    if (!response.ok) {
      throw new Error(`Failed to update appointment: ${response.statusText}`);
    }
    return response.json();
  },

  // Delete appointment
  deleteAppointment: async (id: string) => {
    const response = await fetch(`${API_BASE}/appointments/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to delete appointment: ${response.statusText}`);
    }
    return response.json();
  },

  // Get upcoming appointments
  getUpcomingAppointments: async () => {
    const response = await fetch(`${API_BASE}/appointments/upcoming`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch upcoming appointments: ${response.statusText}`);
    }
    return response.json();
  },

  // Get today's appointments
  getTodayAppointments: async () => {
    const response = await fetch(`${API_BASE}/appointments/today`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch today appointments: ${response.statusText}`);
    }
    return response.json();
  },

  // Confirm appointment
  confirmAppointment: async (id: string) => {
    const response = await fetch(`${API_BASE}/appointments/${id}/confirm`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to confirm appointment: ${response.statusText}`);
    }
    return response.json();
  },

  // Cancel appointment
  cancelAppointment: async (id: string, reason: string) => {
    const response = await fetch(`${API_BASE}/appointments/${id}/cancel`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason })
    });
    if (!response.ok) {
      throw new Error(`Failed to cancel appointment: ${response.statusText}`);
    }
    return response.json();
  },

  // Complete appointment
  completeAppointment: async (id: string, completionData: any) => {
    const response = await fetch(`${API_BASE}/appointments/${id}/complete`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(completionData)
    });
    if (!response.ok) {
      throw new Error(`Failed to complete appointment: ${response.statusText}`);
    }
    return response.json();
  },

  // Get appointment statistics
  getAppointmentStats: async () => {
    const response = await fetch(`${API_BASE}/appointments/stats`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch appointment statistics: ${response.statusText}`);
    }
    return response.json();
  }
};
