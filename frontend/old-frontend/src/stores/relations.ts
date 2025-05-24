import { defineStore } from 'pinia';
import { fetchGroupedRelations, fetchRelationExamples, fetchGroupedRelationExamples } from '@/services/api';
import type { GroupedRelations, RelationExample } from '@/types';

export const useRelationsStore = defineStore('relations', {
  state: () => ({
    groupedRelations: null as GroupedRelations | null,
    currentExamples: [] as RelationExample[],
    selectedSignalType: null as string | null,
    selectedSignalSubtype: null as string | null,
    selectedRelationName: null as string | null,
    isLoading: false,
    error: null as string | null
  }),
  
  getters: {
    signalTypes: (state) => {
      if (!state.groupedRelations) return [];
      return Object.keys(state.groupedRelations);
    },
    
    signalSubtypes: (state) => {
      if (!state.groupedRelations || !state.selectedSignalType) return [];
      return Object.keys(state.groupedRelations[state.selectedSignalType] || {});
    },
    
    relationNames: (state) => {
      if (
        !state.groupedRelations || 
        !state.selectedSignalType || 
        !state.selectedSignalSubtype
      ) return [];
      
      return Object.keys(
        state.groupedRelations[state.selectedSignalType]?.[state.selectedSignalSubtype] || {}
      );
    }
  },
  
  actions: {
    async fetchGroupedRelations() {
      this.isLoading = true;
      this.error = null;
      try {
        this.groupedRelations = await fetchGroupedRelations();
      } catch (e) {
        this.error = 'Failed to fetch grouped relations';
        console.error(e);
      } finally {
        this.isLoading = false;
      }
    },
    
    async fetchRelationExamples(relationType: string) {
      this.isLoading = true;
      this.error = null;
      try {
        this.currentExamples = await fetchRelationExamples(relationType);
      } catch (e) {
        this.error = 'Failed to fetch relation examples';
        console.error(e);
      } finally {
        this.isLoading = false;
      }
    },
    
    async fetchFilteredRelationExamples() {
      this.isLoading = true;
      this.error = null;
      try {
        this.currentExamples = await fetchGroupedRelationExamples(
          this.selectedSignalType || undefined,
          this.selectedSignalSubtype || undefined,
          this.selectedRelationName || undefined
        );
      } catch (e) {
        this.error = 'Failed to fetch filtered relation examples';
        console.error(e);
      } finally {
        this.isLoading = false;
      }
    },
    
    setSignalType(signalType: string | null) {
      this.selectedSignalType = signalType;
      this.selectedSignalSubtype = null;
      this.selectedRelationName = null;
    },
    
    setSignalSubtype(subtype: string | null) {
      this.selectedSignalSubtype = subtype;
      this.selectedRelationName = null;
    },
    
    setRelationName(name: string | null) {
      this.selectedRelationName = name;
    },
    
    clearSelections() {
      this.selectedSignalType = null;
      this.selectedSignalSubtype = null;
      this.selectedRelationName = null;
      this.currentExamples = [];
    }
  }
});
