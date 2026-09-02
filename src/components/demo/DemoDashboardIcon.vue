<script setup lang="ts">
defineOptions({
  name: 'DemoDashboardIcon',
})
</script>

<template>
  <!-- Four panes of uneven height, the way a dashboard/app-grid glyph reads. Drawn here
       because Font Awesome's nearest matches are either three panes (table-columns) or
       four equal squares (table-cells-large). -->
  <svg
    class="dashboard-icon"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <rect x="2" y="2" width="8.4" height="12.2" rx="2.2" />
    <rect x="2" y="15.8" width="8.4" height="6.2" rx="2.2" />
    <rect x="13.6" y="2" width="8.4" height="6.2" rx="2.2" />
    <rect x="13.6" y="9.8" width="8.4" height="12.2" rx="2.2" />
  </svg>
</template>

<style scoped>
.dashboard-icon {
  width: 1em;
  height: 1em;
  display: inline-block;
  vertical-align: -0.125em;
}
</style>
