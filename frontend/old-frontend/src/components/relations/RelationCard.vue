<template>
  <div class="card bg-base-100 shadow-xl h-full">
    <div class="card-body">
      <h2 class="card-title">
        <div class="badge badge-accent">{{ relation.relname || 'No relation name' }}</div>
      </h2>
      
      <p class="truncate">{{ relation.text }}</p>
      
      <div class="mt-2">
        <div class="badge badge-outline mr-1" v-for="signal in relation.signals" :key="signal.id">
          {{ signal.type || 'No type' }}:{{ signal.subtype || 'No subtype' }}
        </div>
      </div>
      
      <div class="card-actions justify-end mt-4">
        <RouterLink :to="`/document/${encodeURIComponent(document)}`" class="btn btn-primary btn-sm">
          Ver documento
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Node } from '@/types';

const props = defineProps<{
  relation: Node;
  document: string;
}>();
</script>
