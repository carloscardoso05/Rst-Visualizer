<template>
  <div class="prose max-w-none">
    <p v-if="isHighlighting">
      <span v-for="(part, index) in textParts" :key="index" 
        :class="{ 
          'bg-teal-300/20 text-accent-content cursor-pointer': part.isHighlighted && part.relationId === selectedRelationId,
          'hover:bg-teal-300/30 transition-colors hover:text-accent-content hover:cursor-pointer': part.isHighlighted 
        }"
        @click="part.isHighlighted ? handleRelationClick(part.relationId) : null">
        {{ part.text }}
      </span>
    </p>
    <p v-else>{{ text }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { Node } from '@/types';

const props = defineProps<{
  text: string;
  relations: Node[];
}>();

const isHighlighting = ref(true);
const selectedRelationId = ref<number | null>(null);
const emit = defineEmits<{
  (e: 'scrollToRelation', relationId: number): void;
}>();

interface TextPart {
  text: string;
  isHighlighted: boolean;
  relationId?: number;
}

const textParts = computed(() => {
  if (!isHighlighting.value || !props.text || !props.relations?.length) {
    return [{ text: props.text || '', isHighlighted: false }];
  }
  
  // This is a simplified implementation and might need to be refined
  // based on how the actual text and relations match up in your data
  const parts: TextPart[] = [];
  let remainingText = props.text;
  
  // Sort relations by the position of their text in the full text
  const sortedRelations = [...props.relations].sort((a, b) => {
    return props.text.indexOf(a.text) - props.text.indexOf(b.text);
  });
  
  let lastIndex = 0;
  
  for (const relation of sortedRelations) {
    const relationText = relation.text;
    const startIndex = props.text.indexOf(relationText, lastIndex);
    
    if (startIndex === -1) continue;
    
    if (startIndex > lastIndex) {
      // Add text before the relation
      parts.push({
        text: props.text.substring(lastIndex, startIndex),
        isHighlighted: false
      });
    }
    
    // Add the highlighted relation text
    parts.push({
      text: relationText,
      isHighlighted: true,
      relationId: relation.id
    });
    
    lastIndex = startIndex + relationText.length;
  }
  
  // Add any remaining text
  if (lastIndex < props.text.length) {
    parts.push({
      text: props.text.substring(lastIndex),
      isHighlighted: false
    });
  }
  
  return parts;
});

function handleRelationClick(relationId?: number) {
  if (relationId !== undefined) {
    // Toggle the selection if clicking the same relation
    if (selectedRelationId.value === relationId) {
      selectedRelationId.value = null;
    } else {
      selectedRelationId.value = relationId;
    }
    scrollToRelation(relationId);
  }
}

function scrollToRelation(relationId?: number) {
  if (relationId !== undefined) {
    // Update the selected relation
    selectedRelationId.value = relationId;
    emit('scrollToRelation', relationId);
  }
}

function clearSelectedRelation() {
  selectedRelationId.value = null;
}

// Expose methods to parent components
defineExpose({
  scrollToRelation,
  clearSelectedRelation
});
</script>
