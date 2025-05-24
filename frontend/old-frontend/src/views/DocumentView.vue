<template>
  <AppLayout>
    <template #sidebar>
      <DocumentsSidebar />
    </template>

    <div v-if="isLoading" class="flex items-center justify-center min-h-screen">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <div v-else-if="error" class="alert alert-error">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ error }}</span>
    </div>

    <div v-else-if="!document">
      <div class="alert alert-warning">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>Document not found.</span>
      </div>
    </div>

    <div v-else>
      <h1 class="text-3xl font-bold mb-6">{{ document.filename }}</h1>

      <div class="tabs mb-4">
        <a :class="['tab', 'tab-bordered', { 'tab-active': activeTab === 'full-text' }]"
          @click="setActiveTab('full-text')">Texto</a>
        <a :class="['tab', 'tab-bordered', { 'tab-active': activeTab === 'relations' }]"
          @click="setActiveTab('relations')">Relações</a>
      </div>
      <!-- Full Text View -->
      <div v-if="activeTab === 'full-text'" class="flex flex-col gap-8">
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <HighlightedText :text="document.full_text" :relations="document.intra_sentential_relations"
              @scroll-to-relation="scrollToRelation" ref="highlightedTextRef" />
          </div>
        </div>

        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <RelationsList :relations="document.intra_sentential_relations" @scroll-to-text="scrollToText"
              ref="relationsListRef" />
          </div>
        </div>
      </div>

      <!-- Relations View -->
      <div v-else-if="activeTab === 'relations'">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="relation in document.intra_sentential_relations" :key="relation.id"
            class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">
                <div class="badge badge-accent">{{ relation.relname || 'No relation name' }}</div>
              </h2>

              <p class="mt-2">{{ relation.text }}</p>

              <div v-if="relation.parent_text" class="mt-2 text-sm opacity-70">
                <strong>Parent:</strong> {{ relation.parent_text }}
              </div>

              <div class="mt-3">
                <div v-for="signal in relation.signals" :key="signal.id" class="mb-1">
                  <div class="badge badge-outline mr-1">{{ signal.type }}</div>
                  <div class="badge badge-outline mr-1">{{ signal.subtype }}</div>
                  <span>{{ signal.text }}</span>
                </div>
              </div>

              <div class="card-actions justify-end mt-4">
                <button @click="scrollToTextForRelation(relation)" class="btn btn-primary btn-sm">
                  Ver no texto
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useDocumentStore } from '@/stores/document';
import AppLayout from '@/components/layout/AppLayout.vue';
import DocumentsSidebar from '@/components/layout/DocumentsSidebar.vue';
import HighlightedText from '@/components/document/HighlightedText.vue';
import RelationsList from '@/components/document/RelationsList.vue';
import type { Node } from '@/types';

const route = useRoute();
const documentStore = useDocumentStore();
const filename = computed(() => route.params.filename as string);

const document = computed(() => documentStore.currentDocument);
const isLoading = computed(() => documentStore.isLoading);
const error = computed(() => documentStore.error);
const activeTab = ref('full-text');
const relationsListRef = ref(null);
const highlightedTextRef = ref(null);

function setActiveTab(tab: string) {
  activeTab.value = tab;
}

function scrollToRelation(relationId: number) {
  if (activeTab.value !== 'full-text') {
    setActiveTab('full-text');
    nextTick(() => {
      if (relationsListRef.value) {
        (relationsListRef.value as any).scrollToRelation(relationId);
      }
    });
  } else {
    if (relationsListRef.value) {
      (relationsListRef.value as any).scrollToRelation(relationId);
    }
  }
}

function scrollToText(relation: Node) {
  // Implement scrolling to the text that contains the relation
  const text = relation.text;
  if (text) {
    // First, make sure we're in the full text view
    setActiveTab('full-text');

    // Then find and scroll to the text in the document
    nextTick(() => {
      // Set the selected relation in the HighlightedText component
      if (highlightedTextRef.value && relation.id) {
        (highlightedTextRef.value as any).scrollToRelation(relation.id);
      }

      const textElement = window.document.querySelector('.prose p');
      if (textElement) {
        textElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }
}

function scrollToTextForRelation(relation: Node) {
  setActiveTab('full-text');
  nextTick(() => {
    scrollToText(relation);
  });
}

onMounted(async () => {
  if (filename.value) {
    await documentStore.fetchDocument(filename.value);
  }
});

watch(
  () => filename.value,
  async (newFilename) => {
    if (newFilename) {
      await documentStore.fetchDocument(newFilename);
      activeTab.value = 'full-text';
    }
  }
);
</script>
