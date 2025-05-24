import axios from 'axios';
import type { Document, GroupedRelations, RelationExample } from '@/types';

const api = axios.create({
  baseURL: 'http://localhost:8000', // Adjust this URL to match your FastAPI backend
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchDocumentsList = async (): Promise<string[]> => {
  const response = await api.get('/files');
  return response.data;
};

export const fetchDocumentByFilename = async (filename: string): Promise<Document> => {
  const response = await api.get(`/files/${filename}`);
  return response.data;
};

export const fetchRelationTypes = async (): Promise<string[]> => {
  const response = await api.get('/files/relations/types');
  return response.data;
};

export const fetchGroupedRelations = async (): Promise<GroupedRelations> => {
  const response = await api.get('/files/relations/grouped');
  return response.data;
};

export const fetchRelationExamples = async (relationType: string): Promise<RelationExample[]> => {
  const response = await api.get(`/files/relations/examples/${relationType}`);
  return response.data;
};

export const fetchGroupedRelationExamples = async (
  signalType?: string,
  signalSubtype?: string,
  relationName?: string
): Promise<RelationExample[]> => {
  const params = new URLSearchParams();
  if (signalType) params.append('signal_type', signalType);
  if (signalSubtype) params.append('signal_subtype', signalSubtype);
  if (relationName) params.append('relation_name', relationName);
  
  const response = await api.get(`/files/relations/grouped/examples?${params.toString()}`);
  return response.data;
};
