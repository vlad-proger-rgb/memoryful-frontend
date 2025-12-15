<template>
  <img
    v-if="resolvedSrc"
    :src="resolvedSrc"
    :alt="alt"
    :class="
      size === 'small'
        ? 'w-64 h-48 object-cover rounded-2xl'
        : 'w-128 h-96 object-cover rounded-2xl'
    "
  />
  <div v-else>
    <img
      src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
      :alt="alt"
      :class="
        size === 'small'
          ? 'w-64 h-48 object-cover rounded-2xl brightness-75'
          : 'w-128 h-96 object-cover rounded-2xl brightness-75'
      "
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import storageApi from '@/api/storage'

const props = defineProps<{ src: string | undefined; alt?: string; size?: 'small' | 'large' }>()

const resolvedSrc = ref<string | null>(null)

const isHttpUrl = computed(() => !!props.src && (props.src.startsWith('http://') || props.src.startsWith('https://')))
const isObjectKey = computed(() => !!props.src && props.src.startsWith('users/'))

watch(
  () => props.src,
  async (next) => {
    resolvedSrc.value = null
    if (!next) return

    if (isHttpUrl.value) {
      resolvedSrc.value = next
      return
    }

    if (isObjectKey.value) {
      try {
        const res = await storageApi.presignGet({ objectKey: next })
        resolvedSrc.value = res.data?.downloadUrl || null
      } catch {
        resolvedSrc.value = null
      }
      return
    }

    resolvedSrc.value = '/src/assets/img/' + next
  },
  { immediate: true },
)
</script>
