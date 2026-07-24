<script setup lang="ts">
import { onMounted } from 'vue'
import AiChatInterface from '@/components/ai/AiChatInterface.vue'
import useAiChatStore from '@/stores/aiChat'

const store = useAiChatStore()

onMounted(() => {
  if (!store.chatModels.length) store.fetchChatModels()
  if (!store.chats.length) store.fetchChats()
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4 pb-10 bg-black/30">
    <AiChatInterface full-page />
  </div>
</template>
