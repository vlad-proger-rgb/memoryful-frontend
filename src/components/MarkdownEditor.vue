<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import Vditor from 'vditor'
import 'vditor/dist/index.css'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: 'Write your content here...',
  },
  minHeight: {
    type: Number,
    default: 200,
  },
})

const emit = defineEmits(['update:modelValue'])

const editorRef = ref<HTMLDivElement>()
let vditor: Vditor | null = null

onMounted(() => {
  if (!editorRef.value) return

  vditor = new Vditor(editorRef.value, {
    height: 'auto',
    minHeight: props.minHeight,
    theme: 'dark',
    placeholder: props.placeholder,
    value: props.modelValue,
    mode: 'ir', // Instant Rendering mode - WYSIWYG-like
    toolbar: [
      'headings',
      'bold',
      'italic',
      'strike',
      '|',
      'line',
      'quote',
      'code',
      'inline-code',
      '|',
      'list',
      'ordered-list',
      'check',
      '|',
      'link',
      'table',
      '|',
      'undo',
      'redo',
      '|',
      'edit-mode',
      'preview',
    ],
    cache: {
      enable: false,
    },
    after: () => {
      if (vditor) {
        vditor.setValue(props.modelValue)
      }
    },
    input: (value: string) => {
      emit('update:modelValue', value)
    },
  })
})

watch(
  () => props.modelValue,
  (newValue) => {
    if (vditor && vditor.getValue() !== newValue) {
      vditor.setValue(newValue)
    }
  },
)

onBeforeUnmount(() => {
  if (vditor) {
    vditor.destroy()
    vditor = null
  }
})
</script>

<template>
  <div ref="editorRef" class="markdown-editor"></div>
</template>

<style>
.markdown-editor {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

/* Dark theme customization */
.vditor {
  background-color: rgba(255, 255, 255, 0.05) !important;
  border: none !important;
}

.vditor-toolbar {
  background-color: rgba(255, 255, 255, 0.05) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.vditor-toolbar__item button {
  color: rgba(255, 255, 255, 0.7) !important;
}

.vditor-toolbar__item button:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

.vditor-ir {
  background-color: transparent !important;
}

.vditor-ir pre.vditor-reset {
  color: #e5e7eb !important;
  font-family: inherit !important;
}

.vditor-reset {
  color: #e5e7eb !important;
}

/* Placeholder styling */
.vditor-ir .vditor-reset:empty::before {
  color: rgba(255, 255, 255, 0.5) !important;
}

/* Panel backgrounds */
.vditor-panel {
  background-color: #1f2937 !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.vditor-panel--arrow {
  border-bottom-color: #1f2937 !important;
}

/* Tooltips */
.vditor-hint {
  background-color: #1f2937 !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.vditor-hint button {
  color: #e5e7eb !important;
}

.vditor-hint button:hover {
  background-color: rgba(59, 130, 246, 0.2) !important;
}

/* Resize handle */
.vditor-resize {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

/* Scrollbar styling for dark theme */
.vditor-ir::-webkit-scrollbar {
  width: 8px;
}

.vditor-ir::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.vditor-ir::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.vditor-ir::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
