<template>
  <ul class="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
    <li>
      <RouterLink to="/">Voltar para documentos</RouterLink>
    </li>
    <li class="menu-title">Tipos de sinais</li>
    
    <template v-if="isLoading">
      <li><span class="loading loading-spinner"></span> Carregando...</li>
    </template>
    
    <template v-else-if="error">
      <li class="text-error">{{ error }}</li>
    </template>
    
    <template v-else>
      <li v-for="signalType in signalTypes" :key="signalType">
        <a @click="selectSignalType(signalType)" 
           :class="{ 'active': selectedSignalType === signalType }">
          {{ signalType }}
        </a>
        
        <!-- Subtypes submenu -->
        <ul v-if="selectedSignalType === signalType">
          <li v-for="subtype in signalSubtypes" :key="subtype">
            <a @click="selectSubtype(subtype)"
               :class="{ 'active': selectedSignalSubtype === subtype }">
              {{ subtype }}
            </a>
            
            <!-- Relations submenu -->
            <ul v-if="selectedSignalSubtype === subtype">
              <li v-for="relation in relationNames" :key="relation">
                <a @click="selectRelation(relation)"
                   :class="{ 'active': selectedRelationName === relation }">
                  {{ relation }}
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </template>
  </ul>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useRelationsStore } from '@/stores/relations';

const relationsStore = useRelationsStore();

const isLoading = computed(() => relationsStore.isLoading);
const error = computed(() => relationsStore.error);
const signalTypes = computed(() => relationsStore.signalTypes);
const signalSubtypes = computed(() => relationsStore.signalSubtypes);
const relationNames = computed(() => relationsStore.relationNames);
const selectedSignalType = computed(() => relationsStore.selectedSignalType);
const selectedSignalSubtype = computed(() => relationsStore.selectedSignalSubtype);
const selectedRelationName = computed(() => relationsStore.selectedRelationName);

onMounted(async () => {
  if (!relationsStore.groupedRelations) {
    await relationsStore.fetchGroupedRelations();
  }
});

function selectSignalType(type: string) {
  if (selectedSignalType.value === type) {
    relationsStore.setSignalType(null);
  } else {
    relationsStore.setSignalType(type);
  }
}

function selectSubtype(subtype: string) {
  if (selectedSignalSubtype.value === subtype) {
    relationsStore.setSignalSubtype(null);
  } else {
    relationsStore.setSignalSubtype(subtype);
  }
}

function selectRelation(relation: string) {
  if (selectedRelationName.value === relation) {
    relationsStore.setRelationName(null);
  } else {
    relationsStore.setRelationName(relation);
    relationsStore.fetchFilteredRelationExamples();
  }
}

watch(
  [selectedSignalType, selectedSignalSubtype], 
  () => {
    if (selectedSignalType.value && selectedSignalSubtype.value && selectedRelationName.value) {
      relationsStore.fetchFilteredRelationExamples();
    }
  }
);
</script>
