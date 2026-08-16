<!-- web/src/components/business/ComicInfo.vue -->
<template>
  <v-card class="comic-info" elevation="0">
    <div class="comic-info__image-container">
      <v-img
        v-if="comic.cover_image"
        :src="coverImage"
        :alt="comic.title"
        height="300"
        position="center"
        class="comic-info__image"
      >
        <template #placeholder>
          <div class="comic-info__placeholder">
            <v-icon size="64" color="grey-lighten-1">mdi-book-open-variant</v-icon>
          </div>
        </template>
      </v-img>
      
      <div v-else class="comic-info__no-image">
        <v-icon size="80" color="grey-lighten-1">mdi-book-open-variant</v-icon>
        <span class="text-body-1 text-grey mt-4">暂无封面</span>
      </div>

      <!-- 生成封面按钮（悬浮在封面右下角） -->
      <v-btn
        class="comic-info__generate-cover-btn"
        color="primary"
        :loading="generatingCover"
        :disabled="generatingCover"
        size="small"
        @click="$emit('generate-cover')"
      >
        <v-icon left size="small">mdi-auto-fix</v-icon>
        {{ comic.cover_image ? '重新生成封面' : '生成封面' }}
      </v-btn>
    </div>
    
    <v-card-text class="comic-info__content">
      <div class="comic-info__header">
        <h2 class="comic-info__title">{{ comic.title }}</h2>
        
        <v-btn
          icon
          variant="text"
          size="small"
          class="comic-info__edit-btn"
          @click="$emit('edit-title')"
        >
          <v-icon size="20">mdi-pencil</v-icon>
        </v-btn>
      </div>
      
      <div class="comic-info__meta">
        <div class="comic-info__meta-item">
          <v-icon size="16" color="grey">mdi-calendar</v-icon>
          <span>创建于 {{ formatDate(comic.created_at) }}</span>
        </div>
        
        <div class="comic-info__meta-item">
          <v-icon size="16" color="grey">mdi-book-open-page-variant</v-icon>
          <span>{{ comic.chapters?.length || 0 }} 个章节</span>
        </div>
      </div>
      
      <div class="comic-info__style">
        <div class="comic-info__style-header">
          <v-icon size="16" color="primary">mdi-palette</v-icon>
          <span class="font-weight-medium">风格设置</span>
        </div>
        
        <div class="comic-info__style-content">
          <span v-if="comic.style_prompt" class="comic-info__style-text">
            {{ comic.style_prompt }}
          </span>
          <span v-else class="comic-info__style-empty">
            未设置风格
          </span>
          
          <v-btn
            size="small"
            variant="text"
            color="primary"
            class="comic-info__style-edit"
            @click="$emit('edit-style')"
          >
            编辑
          </v-btn>
        </div>
      </div>
      
      <div class="comic-info__divider" />
      
      <div class="comic-info__actions">
        <v-btn
          v-if="hasNovel"
          variant="outlined"
          color="info"
          class="comic-info__action-btn"
          @click="$emit('view-novel')"
        >
          <v-icon left>mdi-book-open-variant</v-icon>
          查看小说
        </v-btn>
        
        <v-btn
          variant="outlined"
          color="primary"
          class="comic-info__action-btn"
          @click="$emit('preview')"
        >
          <v-icon left>mdi-book-open-page-variant</v-icon>
          预览漫画
        </v-btn>
        
        <v-btn
          variant="outlined"
          color="secondary"
          class="comic-info__action-btn"
          :loading="exporting"
          @click="$emit('export')"
        >
          <v-icon left>mdi-download</v-icon>
          导出漫画
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  comic: {
    type: Object,
    required: true,
  },

  /** 是否有关联小说（无则不展示「查看小说」） */
  hasNovel: {
    type: Boolean,
    default: false,
  },
  
  exporting: {
    type: Boolean,
    default: false,
  },

  /** 封面生成中（按钮 loading） */
  generatingCover: {
    type: Boolean,
    default: false,
  }
})

defineEmits(['edit-title', 'edit-style', 'view-novel', 'preview', 'export', 'generate-cover'])

// 计算封面图片
const coverImage = computed(() => {
  if (props.comic.cover_image) {
    return `/images/comics/${props.comic.cover_image}`
  }
  return null
})

// 格式化日期
function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.comic-info {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border-radius: var(--border-radius-xl);
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06);
}

.comic-info__image-container {
  position: relative;
  overflow: hidden;
  background: var(--color-surface-variant);
}

.comic-info__image {
  transition: transform 0.3s ease;
}

.comic-info:hover .comic-info__image {
  transform: scale(1.05);
}

.comic-info__generate-cover-btn {
  position: absolute;
  bottom: 12px;
  right: 12px;
  z-index: 1;
  text-transform: none;
  font-weight: 500;
  border-radius: var(--border-radius-lg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(4px);
}

.comic-info__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: var(--color-surface-variant);
}

.comic-info__no-image {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  background: var(--color-surface-variant);
}

.comic-info__content {
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.comic-info__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}

.comic-info__title {
  font-family: var(--font-family-display);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-on-surface);
  line-height: 1.4;
  margin: 0;
}

.comic-info__edit-btn {
  color: var(--color-on-surface-variant);
  flex-shrink: 0;
  margin-left: 8px;
}

.comic-info__edit-btn:hover {
  color: var(--color-primary);
}

.comic-info__meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.comic-info__meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: var(--color-on-surface-variant);
}

.comic-info__style {
  margin-bottom: 20px;
}

.comic-info__style-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: var(--color-on-surface);
}

.comic-info__style-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.comic-info__style-text {
  font-size: 0.9375rem;
  color: var(--color-on-surface-variant);
  line-height: 1.6;
  flex: 1;
}

.comic-info__style-empty {
  font-size: 0.9375rem;
  color: var(--color-on-surface-variant);
  font-style: italic;
}

.comic-info__style-edit {
  text-transform: none;
  font-weight: 500;
  flex-shrink: 0;
}

.comic-info__divider {
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--color-outline), transparent);
  margin: 16px 0;
}

.comic-info__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: auto;
}

.comic-info__action-btn {
  text-transform: none;
  font-weight: 500;
  border-radius: var(--border-radius-lg);
  flex: 1;
  min-width: 120px;
}

/* 响应式调整 */
@media (max-width: 960px) {
  .comic-info__content {
    padding: 20px;
  }
  
  .comic-info__title {
    font-size: 1.25rem;
  }
  
  .comic-info__actions {
    flex-direction: column;
  }
  
  .comic-info__action-btn {
    width: 100%;
  }
}

/* 深色主题调整 */
[data-theme="dark"] .comic-info {
  background: var(--color-surface-variant);
}
</style>
