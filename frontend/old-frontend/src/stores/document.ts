import { defineStore } from 'pinia';
import { fetchDocumentsList, fetchDocumentByFilename } from '@/services/api';
import type { Document } from '@/types';

export const useDocumentStore = defineStore('document', {
  state: () => ({
    documents: [] as string[],
    currentDocument: null as Document | null,
    isLoading: false,
    error: null as string | null
  }),
  
  getters: {
    hasDocuments: (state) => state.documents.length > 0,
    documentRelations: (state) => state.currentDocument?.intra_sentential_relations || []
  },
  
  actions: {
    async fetchDocuments() {
      this.isLoading = true;
      this.error = null;
      try {
        this.documents = await fetchDocumentsList();
      } catch (e) {
        this.error = 'Failed to fetch documents list';
        console.error(e);
      } finally {
        this.isLoading = false;
      }
    },
    
    async fetchDocument(filename: string) {
      this.isLoading = true;
      this.error = null;
      try {
        this.currentDocument = await fetchDocumentByFilename(filename);
      } catch (e) {
        this.error = 'Failed to fetch document';
        console.error(e);
      } finally {
        this.isLoading = false;
      }
    },
    
    clearCurrentDocument() {
      this.currentDocument = null;
    }
  }
});
