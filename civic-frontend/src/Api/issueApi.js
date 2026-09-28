import api from 'axios';
export const getIssues = async(filters) =>{
  try{
const response = await api.get('/issue',{params:filter});
return response.data;
  }catch(error){
    console.log(error);
    return{
        success:false,error: error.message
    };
}


  }  
  export const getIssueById = async (id) => {
  try {
    const response = await api.get(`/issues/${id}`);
    return response.data;
  } catch (error) {
    console.log(error);
    return { success: false, error: error.message };
  }
};
export const createIssue = async (data) => {
  try {
    const response = await api.post('/issues', data);
    return response.data;
  } catch (error) {
    console.log(error);
    return { success: false, error: error.message };
  }
};

export const updateIssue = async (id,data) => {
  try {
    const response = await api.patch('/issues/${id}', data);
    return response.data;
  } catch (error) {
    console.log(error);
    return { success: false, error: error.message };
  }
};
export const deleteIssue = async (id) => {
  try {
    const response = await api.delete('/issues/${id}', );
    return response.data;
  } catch (error) {
    console.log(error);
    return { success: false, error: error.message };
  }
};
export const verifyIssue = async (id) => {
  try {
    const response = await api.patch(`/issues/${id}/verify`);
    return response.data;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getIssueHistory = async (issueId) => {
  try {
    const response = await api.get(`/issues/${issueId}/history`);
    return response.data;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const assignIssue = async (issueId, data) => {
  try {
    const response = await api.post(`/issues/${issueId}/assign`, data);
    return response.data;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getMyAssignments = async (filters) => {
  try {
    const response = await api.get('/assignments/mine', { params: filters });
    return response.data;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const acceptAssignment = async (id) => {
  try {
    const response = await api.patch(`/assignments/${id}/accept`);
    return response.data;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const completeAssignment = async (id, data) => {
  try {
    const response = await api.patch(`/assignments/${id}/complete`, data);
    return response.data;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const rejectAssignment = async (id, data) => {
  try {
    const response = await api.patch(`/assignments/${id}/reject`, data);
    return response.data;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const addComment = async (issueId, data) => {
  try {
    const response = await api.post(`/issues/${issueId}/comments`, data);
    return response.data;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getComments = async (issueId) => {
  try {
    const response = await api.get(`/issues/${issueId}/comments`);
    return response.data;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getCategories = async () => {
  try {
    const response = await api.get('/categories');
    return response.data;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const createCategory = async (data) => {
  try {
    const response = await api.post('/categories', data);
    return response.data;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const uploadAttachment = async (issueId, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`/issues/${issueId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getAttachments = async (issueId) => {
  try {
    const response = await api.get(`/issues/${issueId}/attachments`);
    return response.data;
  } catch (error) {
    return { success: false, error: error.message };
  }
};