<!-- web/src/components/home/ShowcaseSection.vue -->
<template>
  <section class="showcase-section">
    <v-container>
      <div class="showcase-section__header text-center mb-6">
        <h2 class="showcase-section__title">精选作品</h2>
        <p class="showcase-section__subtitle">
          看看其他用户如何用AI创作出精彩的漫画作品
        </p>
      </div>
      
      <v-row>
        <v-col
          v-for="comic in comics"
          :key="comic.id"
          cols="12"
          sm="6"
          md="3"
        >
          <div class="showcase-card" @click="$emit('comic-click', comic)">
            <div class="showcase-card__image">
              <v-img
                :src="comic.cover"
                :alt="comic.title"
                height="240"
                position="center"
                class="showcase-card__img"
              >
                <template #placeholder>
                  <div class="showcase-card__placeholder">
                    <v-icon size="48" color="grey-lighten-1">mdi-book-open-variant</v-icon>
                  </div>
                </template>
              </v-img>
              
              <div class="showcase-card__overlay">
                <v-btn
                  icon
                  variant="text"
                  color="white"
                  size="large"
                >
                  <v-icon size="32">mdi-play-circle</v-icon>
                </v-btn>
              </div>
              
              <div class="showcase-card__badge">
                <v-chip
                  size="small"
                  color="primary"
                  variant="flat"
                >
                  {{ comic.style }}
                </v-chip>
              </div>
            </div>
            
            <div class="showcase-card__content">
              <h3 class="showcase-card__title">{{ comic.title }}</h3>
              
              <div class="showcase-card__meta">
                <div class="showcase-card__author">
                  <v-avatar size="24" color="primary">
                    <v-icon color="white" size="14">mdi-account</v-icon>
                  </v-avatar>
                  <span>{{ comic.author }}</span>
                </div>
                
                <div class="showcase-card__stats">
                  <v-icon size="16" color="grey">mdi-heart</v-icon>
                  <span>{{ comic.likes }}</span>
                </div>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
      
      <div class="showcase-section__action text-center mt-4">
        <v-btn
          variant="outlined"
          color="primary"
          size="large"
          class="showcase-section__btn"
          @click="$emit('view-all')"
        >
          查看更多作品
          <v-icon right>mdi-arrow-right</v-icon>
        </v-btn>
      </div>
    </v-container>
  </section>
</template>

<script setup>
const comics = [
  {
    id: 1,
    title: '星际冒险记',
    author: '创意大师',
    style: '科幻',
    likes: 1234,
    cover: '/images/comics/demo1.jpg',
  },
  {
    id: 2,
    title: '校园日常',
    author: '漫画达人',
    style: '日常',
    ends: 892,
    cover: '/images/comics/demo2.jpg',
  },
  {
    id: 3,
    title: '古代传说',
    author: '故事大王',
    style: '古风',
    likes: 1567,
    cover: '/images/comics/demo3.jpg',
  },
  {
    id: 4,
    title: '未来都市',
    author: '科幻迷',
    style: '赛博朋克',
    likes: 2341,
    cover: '/images/comics/demo4.jpg',
  },
]

defineEmits(['comic-click', 'view-all'])
</script>

<style scoped>
.showcase-section {
  padding: 48px 0;
  background: linear-gradient(180deg, var(--color-surface) 0%, var(--color-surface-variant) 100%);
}

.showcase-section__title {
  font-family: var(--font-family-display);
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-on-surface);
  margin-bottom: 12px;
}

.showcase-section__subtitle {
  font-size: 1.125rem;
  color: var(--color-on-surface-variant);
  max-width: 600px;
  margin: 0 auto;
}

.showcase-card {
  background: var(--color-surface);
  border-radius: var(--border-radius-xl);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--color-outline);
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.showcase-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
  border-color: transparent;
}

.showcase-card__image {
  position: relative;
  overflow: hidden;
  background: var(--color-surface-variant);
}

.showcase-card__img {
  transition: transform 0.3s ease;
}

.showcase-card:hover .showcase-card__img {
  transform: scale(1.05);
}

.showcase-card__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: var(--color-surface-variant);
}

.showcase-card__overlay {
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

.showcase-card:hover .showcase-card__overlay {
  opacity: 1;
}

.showcase-card__badge {
  position: absolute;
  top: 12px;
  right: 12px;
}

.showcase-card__content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.showcase-card__title {
  font-family: var(--font-family-display);
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-on-surface);
  margin-bottom: 12px;
  line-height: 1.4;
}

.showcase-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}

.showcase-card__author {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: var(--color-on-surface-variant);
}

.showcase-card__stats {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.875rem;
  color: var(--color-on-surface-variant);
}

.showcase-section__btn {
  text-transform: none;
  font-weight: 500;
  border-radius: var(--border-radius-xl);
  padding: 0 24px;
}

/* 响应式调整 */
@media (max-width: 960px) {
  .showcase-section {
    padding: 36px 0;
  }
  
  .showcase-section__title {
    font-size: 2rem;
  }
}

@media (max-width: 600px) {
  .showcase-section {
    padding: 24px 0;
  }
  
  .showcase-section__title {
    font-size: 1.75rem;
  }
}

/* 深色主题调整 */
[data-theme="dark"] .showcase-card {
  background: var(--color-surface-variant);
  border-color: var(--color-outline);
}

[data-theme="dark"] .showcase-card:hover {
  background: var(--color-surface);
}
</style>
