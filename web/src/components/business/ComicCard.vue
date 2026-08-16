<!-- web/src/components/business/ComicCard.vue -->
<template>
  <app-card
    class="comic-card"
    :class="cardClasses"
    hover
    clickable
    @click="$emit('click', comic)"
  >
    <div class="comic-card__image-container">
      <v-img
        v-if="comic.cover_image"
        :src="coverImage"
        :alt="comic.title"
        height="240"
        position="center"
        class="comic-card__image"
      >
        <template #placeholder>
          <div class="comic-card__placeholder">
            <v-icon size="48" color="grey-lighten-1">mdi-book-open-variant</v-icon>
          </div>
        </template>
      </v-img>
      
      <div v-else class="comic-card__no-image">
        <v-icon size="64" color="grey-lighten-1">mdi-book-open-variant</v-icon>
        <span class="text-caption text-grey mt-2">暂无封面</span>
      </div>
      
      <div class="comic-card__overlay">
        <v-btn
          icon
          variant="text"
          color="white"
          size="large"
          @click.stop="$emit('preview', comic)"
        >
          <v-icon size="32">mdi-eye</v-icon>
        </v-btn>
      </div>
      
      <div class="comic-card__badges">
        <v-chip
          v-if="comic.type === 'short'"
          size="small"
          color="orange"
          variant="flat"
          class="comic-card__badge"
        >
          短篇
        </v-chip>
        <v-chip
          v-if="comic.chapterCount && comic.type !== 'short'"
          size="small"
          color="primary"
          variant="flat"
          class="comic-card__badge"
        >
          {{ comic.chapterCount }} 章节
        </v-chip>
      </div>
    </div>
    
    <v-card-text class="comic-card__content">
      <h3 class="comic-card__title text-truncate">{{ comic.title }}</h3>
      
      <div class="comic-card__meta">
        <div class="comic-card__date">
          <v-icon size="14" color="grey">mdi-calendar</v-icon>
          <span>{{ formatDate(comic.created_at) }}</span>
        </div>
      </div>
      
      <p v-if="styleLabel" class="comic-card__description text-truncate-2">
        风格：{{ styleLabel }}
      </p>
    </v-card-text>
    
    <v-card-actions class="comic-card__actions">
      <v-btn
        size="small"
        color="primary"
        variant="text"
        class="comic-card__action-btn"
        @click.stop="$emit('view', comic)"
      >
        查看详情
      </v-btn>
      
      <v-spacer />
      
      <v-btn
        size="small"
        color="error"
        variant="text"
        class="comic-card__action-btn"
        @click.stop="$emit('delete', comic)"
      >
        删除
      </v-btn>
    </v-card-actions>
  </app-card>
</template>

<script setup>
import { computed } from 'vue'
import AppCard from '../base/AppCard.vue'

const props = defineProps({
  comic: {
    type: Object,
    required: true,
  },
  
  viewMode: {
    type: String,
    default: 'grid',
    validator: (value) => ['grid', 'list'].includes(value)
  }
})

defineEmits(['click', 'preview', 'view', 'delete'])

// 计算封面图片
const coverImage = computed(() => {
  if (props.comic.cover_image) {
    return `/images/comics/${props.comic.cover_image}`
  }
  return null
})

// 展示风格名：优先预设名称，避免把整段技术文案甩给用户
const styleLabel = computed(() => {
  if (props.comic.stylePreset?.name) return props.comic.stylePreset.name
  if (props.comic.style_prompt) {
    const text = props.comic.style_prompt
    return text.length > 36 ? `${text.slice(0, 36)}…` : text
  }
  return ''
})

// 计算卡片样式类
const cardClasses = computed(() => ({
  'comic-card--list': props.viewMode === 'list',
  'comic-card--grid': props.viewMode === 'grid',
}))

// 格式化日期
function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.comic-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.comic-card--list {
  flex-direction: row;
  height: auto;
}

.comic-card--list .comic-card__image-container {
  width: 200px;
  flex-shrink: 0;
}

.comic-card--list .comic-card__image {
  height: 100%;
}

.comic-card--list .comic-card__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.comic-card--list .comic-card__actions {
  border-top: none;
  border-left: 1px solid var(--color-outline);
}

.comic-card__image-container {
  position: relative;
  overflow: hidden;
  background: var(--color-surface-variant);
}

.comic-card__image {
  transition: transform 0.3s ease;
}

.comic-card:hover .comic-card__image {
  transform: scale(1.05);
}

.comic-card__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: var(--color-surface-variant);
}

.comic-card__no-image {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 240px;
  background: var(--color-surface-variant);
}

.comic-card__overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.comic-card:hover .comic-card__overlay {
  opacity: 1;
}

.comic-card__badges {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.comic-card__badge {
  align-self: flex-end;
}

.comic-card__content {
  flex: 1;
  padding: 20px;
}

.comic-card__title {
  font-family: var(--font-family-display);
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-on-surface);
  margin-bottom: 8px;
  line-height: 1.4;
}

.comic-card__meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.comic-card__date {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8125rem;
  color: var(--color-on-surface-variant);
}

.comic-card__description {
  font-size: 0.875rem;
  color: var(--color-on-surface-variant);
  line-height: 1.5;
  margin: 0;
}

.comic-card__actions {
  padding: 12px 20px;
  border-top: 1px solid var(--color-outline);
}

.comic-card__action-btn {
  text-transform: none;
  font-weight: 500;
}

/* 响应式调整 */
@media (max-width: 960px) {
  .comic-card--list {
    flex-direction: column;
  }
  
  .comic-card--list .comic-card__image-container {
    width: 100%;
  }
  
  .comic-card--list .comic-card__actions {
    border-top: 1px solid var(--color-outline);
    border-left: none;
  }
}

/* 深色主题调整 */
[data-theme="dark"] .comic-card__actions {
  border-top-color: var(--color-outline);
}

[data-theme="dark"] .comic-card--list .comic-card__actions {
  border-left-color: var(--color-outline);
}
</style>
