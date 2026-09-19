import { api } from './axiosClient';

export interface CreateGroupRequest {
    name: string;
    description?: string;
    privacy: 'PUBLIC' | 'PRIVATE';
}

export interface GroupResponse {
    id: string;
    name: string;
    description: string;
    privacy: string;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
}

export const groupService = {
    createGroup: async (request: CreateGroupRequest): Promise<GroupResponse> => {
        const response = await api.post('/groups', request);
        return response.data?.data || response.data;
    },

    getGroupById: async (id: string): Promise<GroupResponse> => {
        const response = await api.get(`/groups/${id}`);
        return response.data?.data || response.data;
    }
};
