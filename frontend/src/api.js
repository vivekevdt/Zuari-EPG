const API_URL = import.meta.env.VITE_BACKEND_URL || "";

export const loginUser = async (email, password) => {
    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }
        return data.data; // Ensure this matches backend response structure
    } catch (error) {
        throw error;
    }
};

const getAuthHeaders = () => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
        const { token } = JSON.parse(userInfo);
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }
    return {
        'Content-Type': 'application/json'
    };
};

export const getConversations = async () => {
    try {
        const response = await fetch(`${API_URL}/api/chat/conversations`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch conversations');
        }
        return data.data;
    } catch (error) {
        throw error;
    }
};

export const getMessages = async (conversationId) => {
    try {
        const response = await fetch(`${API_URL}/api/chat/${conversationId}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch messages');
        }
        return data.data;
    } catch (error) {
        throw error;
    }
};

export const createConversation = async (title) => {
    try {
        const response = await fetch(`${API_URL}/api/chat/conversation`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ title }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to create conversation');
        }
        return data.data;
    } catch (error) {
        throw error;
    }
};

export const sendMessage = async (conversationId, content) => {
    try {
        const response = await fetch(`${API_URL}/api/chat/message`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ conversationId, content }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to send message');
        }
        return data.data;
    } catch (error) {
        throw error;
    }
};


export const deleteConversation = async (conversationId) => {
    try {
        const response = await fetch(`${API_URL}/api/chat/${conversationId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to delete conversation');
        }
        return data;
    } catch (error) {
        throw error;
    }
};

// Admin API Functions

export const getDashboardStats = async () => {
    try {
        const response = await fetch(`${API_URL}/api/admin/dashboard-stats`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch dashboard stats');
        }
        return data.data;
    } catch (error) {
        throw error;
    }
};

export const getAdminUsers = async () => {
    try {
        const response = await fetch(`${API_URL}/api/admin/users`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch users');
        }
        return data.data;
    } catch (error) {
        throw error;
    }
};

export const getAdminInteractions = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`${API_URL}/api/admin/interactions?${queryParams}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch interactions');
        }
        return data.data;
    } catch (error) {
        throw error;
    }
};

export const getEntities = async () => {
    try {
        const response = await fetch(`${API_URL}/api/admin/entities`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch entities');
        }
        return data.data;
    } catch (error) {
        throw error;
    }
};

export const createEntity = async (name) => {
    try {
        const response = await fetch(`${API_URL}/api/admin/entities`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ name }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to create entity');
        }
        return data.data;
    } catch (error) {
        throw error;
    }
};

export const updateEntity = async (id, name) => {
    try {
        const response = await fetch(`${API_URL}/api/admin/entities/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ name }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to update entity');
        }
        return data;
    } catch (error) {
        throw error;
    }
};

export const deleteEntity = async (id) => {
    try {
        const response = await fetch(`${API_URL}/api/admin/entities/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to delete entity');
        }
        return data;
    } catch (error) {
        throw error;
    }
};

export const getPolicies = async () => {
    try {
        const response = await fetch(`${API_URL}/api/admin/policies`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch policies');
        }
        return data.data;
    } catch (error) {
        throw error;
    }
};

// Publish policy
// Publish policy
export const publishPolicy = async (id) => {
    try {
        const response = await fetch(`${API_URL}/api/admin/policies/${id}/publish`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to publish policy');
        }
        return data;
    } catch (error) {
        throw error;
    }
};

export const uploadPolicy = async (formData) => {
    try {
        const userInfo = localStorage.getItem('userInfo');
        const token = userInfo ? JSON.parse(userInfo).token : null;

        const response = await fetch(`${API_URL}/api/admin/upload-policy`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData,
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to upload policy');
        }
        return data.data;
    } catch (error) {
        throw error;
    }
};

export const updatePolicy = async (id, formData) => {
    try {
        const userInfo = localStorage.getItem('userInfo');
        const token = userInfo ? JSON.parse(userInfo).token : null;

        const response = await fetch(`${API_URL}/api/admin/policies/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData,
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to update policy');
        }
        return data.data;
    } catch (error) {
        throw error;
    }
};

export const createUser = async (userData) => {
    try {
        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to create user');
        }
        return data.data;
    } catch (error) {
        throw error;
    }
};

export const updateUser = async (id, userData) => {
    try {
        const response = await fetch(`${API_URL}/api/admin/users/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(userData),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to update user');
        }
        return data;
    } catch (error) {
        throw error;
    }
};

export const deleteUser = async (id) => {
    try {
        const response = await fetch(`${API_URL}/api/admin/users/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to delete user');
        }
        return data;
    } catch (error) {
        throw error;
    }
};



export const getLogs = async (filters) => {
    try {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`${API_URL}/api/admin/logs?${queryParams}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch logs');
        }
        return data.data;
    } catch (error) {
        throw error;
    }
};

export const chunkPolicy = async (id) => {
    try {
        const response = await fetch(`${API_URL}/api/admin/policies/${id}/chunk`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to chunk policy');
        }
        return data;
    } catch (error) {
        throw error;
    }
};

export const deletePolicy = async (id) => {
    try {
        const response = await fetch(`${API_URL}/api/admin/policies/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to delete policy');
        }
        return data;
    } catch (error) {
        throw error;
    }
};

export const getVectorDbData = async (filters) => {
    try {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`${API_URL}/api/super-admin/vector-db?${queryParams}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch vector db data');
        }
        return data;
    } catch (error) {
        throw error;
    }
};

