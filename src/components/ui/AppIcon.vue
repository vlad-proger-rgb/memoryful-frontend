<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import type { IconDefinition, IconLookup } from '@fortawesome/fontawesome-svg-core'
import {
  FontAwesomeIcon,
  findIcon,
  isLoadablePrefix,
  loadIconPack,
  toLookup,
} from '@/plugins/fontawesome'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  icon: string | readonly string[] | IconLookup | IconDefinition
}>()

const lookup = computed<IconLookup | null>(() => {
  const { icon } = props
  if (typeof icon === 'string') return icon ? toLookup(icon) : null
  if (Array.isArray(icon)) return icon[1] ? toLookup(icon[1], icon[0]) : null
  return icon as IconLookup
})

const definition = computed(() => (lookup.value ? findIcon(lookup.value) : null))

watchEffect(() => {
  const target = lookup.value
  if (!target || definition.value || !isLoadablePrefix(target.prefix)) return
  loadIconPack(target.prefix).then(() => {
    if (!findIcon(target)) console.warn(`Unknown icon: ${target.prefix} ${target.iconName}`)
  })
})
</script>

<template>
  <FontAwesomeIcon v-if="definition" v-bind="$attrs" :icon="definition" />
  <span v-else v-bind="$attrs" class="svg-inline--fa w-[1em]" aria-hidden="true" />
</template>
