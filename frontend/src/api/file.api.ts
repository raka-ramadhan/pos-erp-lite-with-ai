import apiClient from './client';

export interface FileResponse {
  id: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  url: string;
  storagePath: string;
  createdAt: string;
}

export interface UploadFileParams {
  file: File;
  entityType: string;
  entityId?: string;
}

export const uploadFile = async (params: UploadFileParams): Promise<FileResponse> => {
  const formData = new FormData();
  formData.append('file', params.file);
  formData.append('entityType', params.entityType);
  if (params.entityId) {
    formData.append('entityId', params.entityId);
  }

  const response = await apiClient.post<FileResponse>('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const deleteFile = async (fileId: string): Promise<void> => {
  await apiClient.delete(`/files/${fileId}`);
};
