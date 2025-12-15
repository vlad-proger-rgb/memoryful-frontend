<script setup lang="ts">
const romanNumbers: Record<number, string> = {
  1: "I",
  2: "II",
  3: "III",
  4: "IV",
  5: "V",
  6: "VI",
  7: "VII",
  8: "VIII",
  9: "IX",
  10: "X",
  11: "XI",
  12: "XII",
}

defineProps<{
  selectedMonth: number
}>()

defineEmits(['click'])

</script>

<template>
  <div class="flex flex-col gap-0.5">
    <div
      v-for="(roman, number) in romanNumbers"
      :key="number"
      class="text-white text-xl font-semibold px-3 py-1.5 rounded-xl transition hover:bg-white/20 cursor-pointer"
      :class="{
        'bg-white/20': selectedMonth === Number(number)
      }"
      @click="$emit('click', Number(number))"
    >
      {{ roman }}
    </div>
  </div>
</template>
