<template>
  <ul class="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
    <!-- Collapsible Documents Section -->
    <li>
      <div class="flex justify-between items-center cursor-pointer" @click="toggleDocumentsVisible">
        <span class="menu-title font-bold">Documentos</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-4 h-4 transition-transform duration-200" :class="{ 'rotate-180': !documentsVisible }">
          <path fill="currentColor" d="M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z" />
        </svg>
      </div>
      <!-- Search input that's always visible -->
      <div class="my-2">
        <input type="text" placeholder="Pesquisa de documentos" class="input input-bordered input-sm w-full" 
               v-model="searchQuery" @input="filterDocuments" />
      </div>
      <ul v-show="documentsVisible" class="mt-2 transition-all duration-300">
        <li v-for="doc in filteredDocuments" :key="doc">
          <RouterLink :to="`/document/${encodeURIComponent(doc)}`" :class="{ 'active': isActive(doc) }">{{ doc }}</RouterLink>
        </li>
      </ul>
    </li>
    
    <li class="menu-title mt-4">Relações</li>
    <li>
      <RouterLink to="/relations">Pesquisa de relações</RouterLink>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useDocumentStore } from '@/stores/document';

const documentStore = useDocumentStore();
const route = useRoute();
const documentsVisible = ref(true);
const searchQuery = ref('');

const documents = computed(() => documentStore.documents);
const filteredDocuments = computed(() => {
  if (!searchQuery.value) return documents.value;
  const query = searchQuery.value.toLowerCase();
  return documents.value.filter(doc => doc.toLowerCase().includes(query));
});

onMounted(async () => {
  if (!documentStore.hasDocuments) {
    await documentStore.fetchDocuments();
  }
});

function toggleDocumentsVisible() {
  documentsVisible.value = !documentsVisible.value;
}

function filterDocuments() {
  // If the user is searching and documents are collapsed, expand them
  if (searchQuery.value && !documentsVisible.value) {
    documentsVisible.value = true;
  }
}

function isActive(doc: string): boolean {
  return route.params.filename === doc;
}
</script>

<style scoped>
.menu-title {
  opacity: 0.7;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>
