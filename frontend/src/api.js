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

export const activateAccount = async (email, currentPassword, newPassword) => {
    try {
        const response = await fetch(`${API_URL}/api/auth/activate-account`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, currentPassword, newPassword }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Activation failed');
        }
        return data.data;
    } catch (error) {
        throw error;
    }
};

export const forgotPassword = async (email) => {
    try {
        const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Forgot password failed');
        }
        return data;
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

export const sendMessage = async (conversationId, content, selectedPolicy = null) => {
    try {
        const response = await fetch(`${API_URL}/api/chat/message`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ conversationId, content, selectedPolicy }),
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


export const getAvailableEmployeePolicies = async () => {
    try {
        const response = await fetch(`${API_URL}/api/chat/policies`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch available policies');
        }
        return data.data;
    } catch (error) {
        throw error;
    }
};

export const getDynamicFAQs = async (policies) => {
    try {
        const response = await fetch(`${API_URL}/api/chat/faqs`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ policies }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch dynamic FAQs');
        }
        return data.data; // This returns the array of 4 JSON FAQ objects
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

export const getArchivedPolicies = async () => {
    try {
        const response = await fetch(`${API_URL}/api/admin/policies/archived`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch archived policies');
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

export const generatePolicyFaqs = async (id) => {
    try {
        const response = await fetch(`${API_URL}/api/admin/policies/${id}/faqs/generate`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to generate FAQs');
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
export const playgroundChat = async (message, entity, policies) => {
    try {
        const response = await fetch(`${API_URL}/api/admin/playground/chat`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ message, entity, policies }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to get AI response');
        }
        return data.data.content;
    } catch (error) {
        throw error;
    }
};

export const resetPlaygroundChat = async () => {
    try {
        const response = await fetch(`${API_URL}/api/admin/playground/chat/reset`, {
            method: 'POST',
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to reset chat memory');
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

export const downloadEmployeeTemplate = async () => {
    try {
        const response = await fetch(`${API_URL}/api/admin/download-template`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            throw new Error('Failed to download template');
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'employee_template.xlsx';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        throw error;
    }
};

export const previewEmployeesCsv = async (file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const userInfo = localStorage.getItem('userInfo');
        const token = userInfo ? JSON.parse(userInfo).token : null;

        const response = await fetch(`${API_URL}/api/admin/preview-employees-csv`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData,
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to preview CSV');
        }
        return data.data;
    } catch (error) {
        throw error;
    }
};

export const bulkCreateEmployees = async (employees) => {
    try {
        const response = await fetch(`${API_URL}/api/admin/bulk-upload-employees`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ employees }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to bulk create employees');
        }
        return data;
    } catch (error) {
        throw error;
    }
};

// ─── Config API ──────────────────────────────────────────────────────────────

// Entities (Config)
export const getConfigEntities = async () => {
    const r = await fetch(`${API_URL}/api/admin/config/entities`, { headers: getAuthHeaders() });
    const d = await r.json();
    if (!r.ok) throw new Error(d.message || 'Failed to fetch entities');
    return d.data;
};
export const createConfigEntity = async (payload) => {
    const r = await fetch(`${API_URL}/api/admin/config/entities`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload) });
    const d = await r.json();
    if (!r.ok) throw new Error(d.message || 'Failed to create entity');
    return d.data;
};
export const updateConfigEntity = async (id, payload) => {
    const r = await fetch(`${API_URL}/api/admin/config/entities/${id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(payload) });
    const d = await r.json();
    if (!r.ok) throw new Error(d.message || 'Failed to update entity');
    return d.data;
};
export const deleteConfigEntity = async (id) => {
    const r = await fetch(`${API_URL}/api/admin/config/entities/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    const d = await r.json();
    if (!r.ok) throw new Error(d.message || 'Failed to delete entity');
    return d;
};

// Impact Levels
export const getImpactLevels = async (entityId) => {
    const q = entityId ? `?entity=${entityId}` : '';
    const r = await fetch(`${API_URL}/api/admin/config/impact-levels${q}`, { headers: getAuthHeaders() });
    const d = await r.json();
    if (!r.ok) throw new Error(d.message || 'Failed to fetch impact levels');
    return d.data;
};
export const createImpactLevel = async (payload) => {
    const r = await fetch(`${API_URL}/api/admin/config/impact-levels`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload) });
    const d = await r.json();
    if (!r.ok) throw new Error(d.message || 'Failed to create impact level');
    return d.data;
};
export const updateImpactLevel = async (id, payload) => {
    const r = await fetch(`${API_URL}/api/admin/config/impact-levels/${id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(payload) });
    const d = await r.json();
    if (!r.ok) throw new Error(d.message || 'Failed to update impact level');
    return d.data;
};
export const deleteImpactLevel = async (id) => {
    const r = await fetch(`${API_URL}/api/admin/config/impact-levels/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    const d = await r.json();
    if (!r.ok) throw new Error(d.message || 'Failed to delete impact level');
    return d;
};

// Employee Categories
export const getEmployeeCategories = async () => {
    const r = await fetch(`${API_URL}/api/admin/config/employee-categories`, { headers: getAuthHeaders() });
    const d = await r.json();
    if (!r.ok) throw new Error(d.message || 'Failed to fetch employee categories');
    return d.data;
};
export const createEmployeeCategory = async (payload) => {
    const r = await fetch(`${API_URL}/api/admin/config/employee-categories`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload) });
    const d = await r.json();
    if (!r.ok) throw new Error(d.message || 'Failed to create employee category');
    return d.data;
};
export const updateEmployeeCategory = async (id, payload) => {
    const r = await fetch(`${API_URL}/api/admin/config/employee-categories/${id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(payload) });
    const d = await r.json();
    if (!r.ok) throw new Error(d.message || 'Failed to update employee category');
    return d.data;
};
export const deleteEmployeeCategory = async (id) => {
    const r = await fetch(`${API_URL}/api/admin/config/employee-categories/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    const d = await r.json();
    if (!r.ok) throw new Error(d.message || 'Failed to delete employee category');
    return d;
};

// Policy Categories
export const getPolicyCategories = async () => {
    const r = await fetch(`${API_URL}/api/admin/config/policy-categories`, { headers: getAuthHeaders() });
    const d = await r.json();
    if (!r.ok) throw new Error(d.message || 'Failed to fetch policy categories');
    return d.data;
};
export const createPolicyCategory = async (payload) => {
    const r = await fetch(`${API_URL}/api/admin/config/policy-categories`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload) });
    const d = await r.json();
    if (!r.ok) throw new Error(d.message || 'Failed to create policy category');
    return d.data;
};
export const updatePolicyCategory = async (id, payload) => {
    const r = await fetch(`${API_URL}/api/admin/config/policy-categories/${id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(payload) });
    const d = await r.json();
    if (!r.ok) throw new Error(d.message || 'Failed to update policy category');
    return d.data;
};
export const deletePolicyCategory = async (id) => {
    const r = await fetch(`${API_URL}/api/admin/config/policy-categories/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    const d = await r.json();
    if (!r.ok) throw new Error(d.message || 'Failed to delete policy category');
    return d;
};

export const submitFeedback = async ({ queryId, responseId, userQuestion, aiResponse, thumbs, description }) => {
    try {
        const response = await fetch(`${API_URL}/api/chat/feedback`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ queryId, responseId, userQuestion, aiResponse, thumbs, description }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to submit feedback');
        }
        return data.data;
    } catch (error) {
        throw error;
    }
};

export const submitGeneralFeedback = async ({ rating, category, improvementAreas, successAreas, comment }) => {
    try {
        const response = await fetch(`${API_URL}/api/chat/user-feedback`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ rating, category, improvementAreas, successAreas, comment }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to submit general feedback');
        }
        return data.data;
    } catch (error) {
        throw error;
    }
};

export const getFeedbacksAdmin = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`${API_URL}/api/super-admin/feedbacks/queries?${queryParams}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch query feedbacks');
        }
        return data;
    } catch (error) {
        throw error;
    }
};

export const getUserFeedbacksAdmin = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`${API_URL}/api/super-admin/feedbacks/users?${queryParams}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch user feedbacks');
        }
        return data;
    } catch (error) {
        throw error;
    }
};

export const getInteractionsAdmin = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`${API_URL}/api/super-admin/interactions?${queryParams}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch interactions');
        }
        return data;
    } catch (error) {
        throw error;
    }
};

// ── Insights API ──────────────────────────────────────────────────────────────

export const getInsightsEntities = async () => {
    const res = await fetch(`${API_URL}/api/admin/insights/entities`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch entities');
    return data.data;
};

export const getInsightsAdoption = async ({ entity = 'all', period = '30' } = {}) => {
    const res = await fetch(`${API_URL}/api/admin/insights/adoption?entity=${entity}&period=${period}`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch adoption data');
    return data.data;
};

export const getInsightsThematicClusters = async ({ entity = 'all', period = '30' } = {}) => {
    const res = await fetch(`${API_URL}/api/admin/insights/thematic-clusters?entity=${entity}&period=${period}`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch thematic clusters');
    return data.data;
};

export const getInsightsFeedbackAnalysis = async ({ entity = 'all', level = 'all', search = '' } = {}) => {
    const res = await fetch(`${API_URL}/api/admin/insights/feedback-analysis?entity=${entity}&level=${level}&search=${search}`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch feedback analysis');
    return data.data;
};

export const exportInsightsFeedbackAnalysisCSV = async ({ entity = 'all', level = 'all', search = '' } = {}) => {
    const res = await fetch(`${API_URL}/api/admin/insights/feedback-analysis/export?entity=${entity}&level=${level}&search=${search}`, { headers: getAuthHeaders() });
    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to export CSV');
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user_feedback_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
};
