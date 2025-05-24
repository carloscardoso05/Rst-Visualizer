<template>
  <AppLayout>
    <template #sidebar>
      <RelationsSidebar />
    </template>
    
    <div v-if="isLoading" class="flex items-center justify-center min-h-screen">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
    
    <div v-else-if="error" class="alert alert-error">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <span>{{ error }}</span>
    </div>
    
    <div v-else>
      <h1 class="text-3xl font-bold mb-6">Pesquisa de relações</h1>
      
      <div class="flex flex-col md:flex-row gap-4 mb-6">
        <div v-if="selectedSignalType" class="badge badge-lg p-4">
          Tipo: {{ selectedSignalType }}
          <button class="btn btn-xs btn-ghost" @click="clearSignalType">×</button>
        </div>
        
        <div v-if="selectedSignalSubtype" class="badge badge-lg p-4">
          Subtipo: {{ selectedSignalSubtype }}
          <button class="btn btn-xs btn-ghost" @click="clearSignalSubtype">×</button>
        </div>
        
        <div v-if="selectedRelationName" class="badge badge-lg p-4">
          Relação: {{ selectedRelationName }}
          <button class="btn btn-xs btn-ghost" @click="clearRelationName">×</button>
        </div>
      </div>
      
      <div v-if="hasSelection">
        <h2 class="text-2xl font-bold mb-4">Exemplos</h2>
        <RelationsGrid :examples="currentExamples" />
      </div>
      
      <div v-else class="card bg-base-200 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Get Started</h2>
          <p>Select a signal type, subtype, and relation from the sidebar to view examples.</p>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRelationsStore } from '@/stores/relations';
import AppLayout from '@/components/layout/AppLayout.vue';
import RelationsSidebar from '@/components/layout/RelationsSidebar.vue';
import RelationsGrid from '@/components/relations/RelationsGrid.vue';

const relationsStore = useRelationsStore();

const isLoading = computed(() => relationsStore.isLoading);
const error = computed(() => relationsStore.error);
const currentExamples = computed(() => relationsStore.currentExamples);
const selectedSignalType = computed(() => relationsStore.selectedSignalType);
const selectedSignalSubtype = computed(() => relationsStore.selectedSignalSubtype);
const selectedRelationName = computed(() => relationsStore.selectedRelationName);

const hasSelection = computed(() => {
  return !!(selectedSignalType.value || selectedSignalSubtype.value || selectedRelationName.value);
});

function clearSignalType() {
  relationsStore.setSignalType(null);
}

function clearSignalSubtype() {
  relationsStore.setSignalSubtype(null);
}

function clearRelationName() {
  relationsStore.setRelationName(null);
}
</script>
