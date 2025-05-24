<template>
  <div :id="`relation-${relation.id}`" class="collapse collapse-arrow bg-base-200 mb-2">
    <input type="checkbox" :checked="isOpen" @change="toggleOpen" />
    <div class="collapse-title text-xl font-medium flex items-center gap-2">
      <span class="badge badge-accent">{{ relation.relname || 'No relation name' }}</span>
      {{ getTruncatedText(relation.text) }}
    </div>
    <div class="collapse-content">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 class="font-bold">Texto:</h3>
          <p>{{ relation.text }}</p>
        </div>
        <div>
          <h3 class="font-bold">Texto do nó pai:</h3>
          <p>{{ relation.parent_text || 'No parent text' }}</p>
        </div>
      </div>
      
      <div class="mt-4">
        <h3 class="font-bold">Sinais:</h3>
        <div v-if="relation.signals && relation.signals.length > 0">
          <div v-for="signal in relation.signals" :key="signal.id" class="mt-2">
            <div class="badge badge-outline mr-2">{{ signal.type || 'No type' }}</div>
            <div class="badge badge-outline mr-2">{{ signal.subtype || 'No subtype' }}</div>
            <span>{{ signal.text || 'No text' }}</span>
          </div>
        </div>
        <p v-else>Sem sinais</p>
      </div>
      
      <div class="mt-4">
        <button @click="scrollToTextPosition" class="btn btn-sm btn-primary">
          Ver no texto
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Node } from '@/types';

const props = defineProps<{
  relation: Node;
  index: number;
}>();

const emit = defineEmits<{
  (e: 'scrollToText', relation: Node): void;
}>();

const isOpen = ref(false);

function toggleOpen() {
  isOpen.value = !isOpen.value;
}

function getTruncatedText(text?: string): string {
  if (!text) return '';
  return text.length > 50 ? text.substring(0, 50) + '...' : text;
}

function scrollToTextPosition() {
  emit('scrollToText', props.relation);
}
</script>
