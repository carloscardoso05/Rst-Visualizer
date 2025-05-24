<template>
  <div class="relations-list">
    <h2 class="text-2xl font-bold mb-4">Relações ({{ relations.length }})</h2>
    
    <div v-if="relations.length === 0" class="alert alert-info">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      <span>No relations found in this document.</span>
    </div>
    
    <div v-else>
      <RelationAccordion 
        v-for="(relation, index) in relations" 
        :key="relation.id"
        :relation="relation"
        :index="index"
        ref="relationRefs"
        @scroll-to-text="handleScrollToText"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Node } from '@/types';
import RelationAccordion from './RelationAccordion.vue';

const props = defineProps<{
  relations: Node[];
}>();

const relationRefs = ref<any[]>([]);

const emit = defineEmits<{
  (e: 'scrollToText', relation: Node): void;
}>();

function handleScrollToText(relation: Node) {
  emit('scrollToText', relation);
}

// Public method to scroll to a specific relation
function scrollToRelation(relationId: number) {
  const element = document.getElementById(`relation-${relationId}`);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Find the index of the relation to open its accordion
    const index = props.relations.findIndex(r => r.id === relationId);
    if (index !== -1 && relationRefs.value[index]) {
      // Set it to open
      relationRefs.value[index].isOpen = true;
    }
  }
}

// Expose the scrollToRelation function to parent components
defineExpose({
  scrollToRelation
});
</script>
