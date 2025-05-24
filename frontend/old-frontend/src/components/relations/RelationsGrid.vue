<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <RelationCard 
      v-for="example in examples" 
      :key="`${example.relation.id}-${example.document}`"
      :relation="example.relation"
      :document="example.document"
    />
    
    <div v-if="examples.length === 0" class="col-span-full alert alert-info">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      <span>No examples found. Please select a relation type.</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import RelationCard from './RelationCard.vue';
import type { RelationExample } from '@/types';

defineProps<{
  examples: RelationExample[];
}>();
</script>
