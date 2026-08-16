<!-- web/src/views/ComicDetail.vue -->
<template>
  <div class="comic-detail">
    <v-container>
      <!-- 加载状态 -->
      <div v-if="loading" class="comic-detail__loading">
        <v-progress-circular indeterminate color="primary" size="64" />
        <p class="mt-4">加载中...</p>
      </div>
      
      <template v-else-if="comic">
        <!-- 页面头部 -->
        <div class="comic-detail__header">
          <v-btn
            variant="text"
            to="/comics"
            class="comic-detail__back-btn"
          >
            <v-icon left>mdi-arrow-left</v-icon>
            返回列表
          </v-btn>
          
          <div class="comic-detail__title-container">
            <h1
              v-if="!editingTitle"
              class="comic-detail__title"
              @click="startEditTitle"
            >
              {{ comic.title }}
              <v-icon size="small" class="ml-2" color="grey">mdi-pencil</v-icon>
            </h1>
            
            <v-text-field
              v-else
              ref="titleInput"
              v-model="editTitleValue"
              variant="outlined"
              density="compact"
              hide-details
              :loading="savingTitle"
              @blur="saveTitle"
              @keyup.enter="saveTitle"
              @keyup.escape="cancelEditTitle"
              class="comic-detail__title-input"
            />
          </div>
        </div>
        
        <!-- 内容区域 -->
        <v-row>
          <v-col cols="12" md="4">
            <comic-info
              :comic="comic"
              :has-novel="hasNovel"
              :exporting="exporting"
              :generating-cover="generatingCover"
              @edit-title="startEditTitle"
              @edit-style="openStyleDialog"
              @view-novel="openNovelDialog"
              @preview="openPreview"
              @export="exportPdf"
              @generate-cover="generateCover"
            />
          </v-col>
          
          <v-col cols="12" md="8">
            <chapter-list
              :chapters="comic.chapters || []"
              @add-chapter="openCreateChapterDialog"
              @chapter-click="goToCreate"
              @delete-chapter="confirmDeleteChapter"
            />
          </v-col>
        </v-row>
        
        <!-- 创建章节对话框 -->
        <v-dialog v-model="createChapterDialog" max-width="500">
          <v-card class="comic-detail__dialog">
            <v-card-title class="comic-detail__dialog-title">
              创建新章节
            </v-card-title>
            
            <v-card-text class="comic-detail__dialog-content">
              <v-form @submit.prevent="createChapter">
                <v-text-field
                  v-model="chapterForm.title"
                  label="章节标题（可选）"
                  hint="留空将自动生成"
                  variant="outlined"
                  class="mb-4"
                />
                
                <v-select
                  v-model="chapterForm.layoutType"
                  :items="layoutOptions"
                  label="分镜布局"
                  variant="outlined"
                />
              </v-form>
            </v-card-text>
            
            <v-card-actions class="comic-detail__dialog-actions">
              <v-spacer />
              <v-btn @click="createChapterDialog = false">取消</v-btn>
              <v-btn
                color="primary"
                @click="createChapter"
                :loading="creating"
              >
                创建
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        
        <!-- 删除章节确认对话框 -->
        <v-dialog v-model="deleteChapterDialog" max-width="400">
          <v-card class="comic-detail__dialog">
            <v-card-title class="comic-detail__dialog-title">
              确认删除
            </v-card-title>
            
            <v-card-text class="comic-detail__dialog-content">
              确定要删除「{{ deleteChapterTarget?.title }}」吗？此操作不可撤销。
            </v-card-text>
            
            <v-card-actions class="comic-detail__dialog-actions">
              <v-spacer />
              <v-btn @click="deleteChapterDialog = false">取消</v-btn>
              <v-btn
                color="error"
                @click="deleteChapter"
                :loading="deleting"
              >
                删除
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        
        <!-- 编辑风格对话框 -->
        <v-dialog 
          v-model="styleDialog" 
          max-width="800"
          :fullscreen="$vuetify.display.smAndDown"
        >
          <v-card class="comic-detail__dialog">
            <v-card-title class="comic-detail__dialog-title">
              修改风格
            </v-card-title>
            
            <v-card-text class="comic-detail__dialog-content">
              <StylePresetSelector
                v-model:style-prompt="editStyleValue"
                v-model:style-preset-id="editStylePresetId"
                :auto-select-default="false"
              />
            </v-card-text>
            
            <v-card-actions class="comic-detail__dialog-actions">
              <v-spacer />
              <v-btn @click="styleDialog = false">取消</v-btn>
              <v-btn
                color="primary"
                @click="saveStyle"
                :loading="savingStyle"
              >
                保存
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        
        <!-- 漫画预览 -->
        <ComicPreview
          v-model="showPreview"
          :chapters="comic?.chapters || []"
        />
        
        <!-- 无图片提示 -->
        <v-snackbar
          v-model="showNoImageHint"
          :timeout="2000"
          color="warning"
        >
          暂无漫画图片
        </v-snackbar>
        
        <!-- 小说查看弹窗 -->
        <v-dialog v-model="novelDialog" max-width="800">
          <v-card class="comic-detail__dialog">
            <v-card-title class="comic-detail__dialog-title">
              {{ novelTitle }}
            </v-card-title>
            
            <v-card-text class="comic-detail__dialog-content">
              <v-progress-circular v-if="loadingNovel" indeterminate color="primary" />
              <pre v-else class="comic-detail__novel-content">{{ novelContent }}</pre>
            </v-card-text>
            
            <v-card-actions class="comic-detail__dialog-actions">
              <v-spacer />
              <v-btn @click="novelDialog = false">关闭</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </template>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { jsPDF } from 'jspdf'
import comicApi from '../api/comic'
import chapterApi from '../api/chapter'
import novelApi from '../api/novel'
import ComicPreview from '../components/ComicPreview.vue'
import ComicInfo from '../components/business/ComicInfo.vue'
import ChapterList from '../components/business/ChapterList.vue'
import StylePresetSelector from '../components/style/StylePresetSelector.vue'

const route = useRoute()
const router = useRouter()

// 状态
const loading = ref(true)
const comic = ref(null)
const hasNovel = ref(false)
const createChapterDialog = ref(false)
const deleteChapterDialog = ref(false)
const deleteChapterTarget = ref(null)
const creating = ref(false)
const deleting = ref(false)
const showPreview = ref(false)
const showNoImageHint = ref(false)
const exporting = ref(false)
const generatingCover = ref(false)
const editingTitle = ref(false)
const editTitleValue = ref('')
const savingTitle = ref(false)
const titleInput = ref(null)
const styleDialog = ref(false)
const editStyleValue = ref('')
const editStylePresetId = ref(null)
const savingStyle = ref(false)
const novelDialog = ref(false)
const novelContent = ref('')
const novelTitle = ref('')
const loadingNovel = ref(false)

// 分镜布局选项
const layoutOptions = [
  { title: '4 格分镜', value: 4 },
  { title: '6 格分镜', value: 6 },
  { title: '8 格分镜', value: 8 },
]

// 章节表单
const chapterForm = ref({
  title: '',
  layoutType: 4,
})

// 加载漫画数据，并探测是否关联小说
async function loadComic() {
  loading.value = true
  hasNovel.value = false
  try {
    const res = await comicApi.getComic(route.params.id)
    comic.value = res.comic
    try {
      const novelRes = await novelApi.getNovelByComicId(route.params.id)
      hasNovel.value = !!(novelRes.novel && novelRes.novel.id)
    } catch {
      hasNovel.value = false
    }
  } catch (e) {
    console.error('加载漫画失败', e)
    router.push('/comics')
  } finally {
    loading.value = false
  }
}

// 打开小说对话框（无关联小说时不打开）
async function openNovelDialog() {
  if (!hasNovel.value) return

  loadingNovel.value = true
  novelDialog.value = true
  novelContent.value = ''
  novelTitle.value = '小说原文'
  try {
    const data = await novelApi.getNovelByComicId(route.params.id)
    if (data.novel) {
      novelContent.value = data.novel.content || ''
      novelTitle.value = data.novel.title || '小说原文'
    } else {
      novelDialog.value = false
      hasNovel.value = false
    }
  } catch (e) {
    console.error('加载小说失败', e)
    novelDialog.value = false
    hasNovel.value = false
  } finally {
    loadingNovel.value = false
  }
}

// 打开创建章节对话框
function openCreateChapterDialog() {
  chapterForm.value = { title: '', layoutType: 4 }
  createChapterDialog.value = true
}

// 创建章节
async function createChapter() {
  creating.value = true
  try {
    const res = await chapterApi.createChapter(route.params.id, chapterForm.value)
    comic.value.chapters.push(res.chapter)
    createChapterDialog.value = false
    router.push(`/create/${route.params.id}/${res.chapter.id}`)
  } catch (e) {
    console.error('创建章节失败', e)
    alert('创建章节失败：' + (e.response?.data?.error || e.message))
  } finally {
    creating.value = false
  }
}

// 跳转到创作页面
function goToCreate(chapter) {
  router.push(`/create/${route.params.id}/${chapter.id}`)
}

// 打开预览
function openPreview() {
  const chaptersWithImages = comic.value.chapters?.filter(ch => ch.page_image) || []
  if (chaptersWithImages.length === 0) {
    showNoImageHint.value = true
    return
  }
  showPreview.value = true
}

// 导出PDF
async function exportPdf() {
  const chaptersWithImages = comic.value.chapters?.filter(ch => ch.page_image) || []
  if (chaptersWithImages.length === 0) {
    showNoImageHint.value = true
    return
  }

  exporting.value = true
  try {
    const sortedChapters = [...chaptersWithImages].sort((a, b) => a.chapter_number - b.chapter_number)

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    for (let i = 0; i < sortedChapters.length; i++) {
      const chapter = sortedChapters[i]

      if (i > 0) {
        pdf.addPage()
      }

      try {
        const imgData = await loadImage(`/images/comics/${chapter.page_image}`)
        const imgRatio = imgData.width / imgData.height
        const pageWidth = 190
        const pageHeight = 277
        let drawWidth, drawHeight, x, y

        if (imgRatio > pageWidth / pageHeight) {
          drawWidth = pageWidth
          drawHeight = pageWidth / imgRatio
        } else {
          drawHeight = pageHeight
          drawWidth = pageHeight * imgRatio
        }
        x = (pageWidth - drawWidth) / 2 + 10
        y = (pageHeight - drawHeight) / 2 + 10
        pdf.addImage(imgData.dataUrl, 'JPEG', x, y, drawWidth, drawHeight)
      } catch (e) {
        console.error(`加载图片失败: ${chapter.page_image}`, e)
      }
    }

    const today = new Date().toISOString().split('T')[0]
    pdf.save(`${comic.value.title}-${today}.pdf`)
  } catch (e) {
    console.error('导出 PDF 失败', e)
    alert('导出失败，请重试')
  } finally {
    exporting.value = false
  }
}

// 生成漫画封面（复用后端 aiImage.generateFromPrompt）
async function generateCover() {
  if (generatingCover.value || !comic.value) return

  generatingCover.value = true
  try {
    const res = await comicApi.generateCover(comic.value.id)
    if (res.comic) {
      comic.value = { ...comic.value, ...res.comic }
    }
  } catch (e) {
    console.error('生成封面失败', e)
    alert('生成封面失败：' + (e.response?.data?.error || e.message))
  } finally {
    generatingCover.value = false
  }
}

// 加载图片
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      resolve({
        dataUrl: canvas.toDataURL('image/jpeg', 0.95),
        width: img.width,
        height: img.height
      })
    }
    img.onerror = reject
    img.src = url
  })
}

// 确认删除章节
function confirmDeleteChapter(chapter) {
  deleteChapterTarget.value = chapter
  deleteChapterDialog.value = true
}

// 删除章节
async function deleteChapter() {
  if (!deleteChapterTarget.value) return

  deleting.value = true
  try {
    await chapterApi.deleteChapter(deleteChapterTarget.value.id)
    comic.value.chapters = comic.value.chapters.filter(c => c.id !== deleteChapterTarget.value.id)
    deleteChapterDialog.value = false
    deleteChapterTarget.value = null
  } catch (e) {
    console.error('删除章节失败', e)
    alert('删除章节失败：' + (e.response?.data?.error || e.message))
  } finally {
    deleting.value = false
  }
}

// 开始编辑标题
function startEditTitle() {
  editTitleValue.value = comic.value.title
  editingTitle.value = true
  nextTick(() => {
    titleInput.value?.focus()
  })
}

// 保存标题
async function saveTitle() {
  if (!editTitleValue.value.trim()) {
    editTitleValue.value = comic.value.title
    editingTitle.value = false
    return
  }

  if (editTitleValue.value === comic.value.title) {
    editingTitle.value = false
    return
  }

  savingTitle.value = true
  try {
    await comicApi.updateComic(comic.value.id, { title: editTitleValue.value })
    comic.value.title = editTitleValue.value
    editingTitle.value = false
  } catch (e) {
    console.error('保存标题失败', e)
    alert('保存失败：' + (e.response?.data?.error || e.message))
    editTitleValue.value = comic.value.title
  } finally {
    savingTitle.value = false
  }
}

// 取消编辑标题
function cancelEditTitle() {
  editTitleValue.value = comic.value.title
  editingTitle.value = false
}

// 打开风格对话框
function openStyleDialog() {
  editStyleValue.value = comic.value.style_prompt || ''
  editStylePresetId.value =
    comic.value.stylePresetId ??
    comic.value.style_preset_id ??
    comic.value.stylePreset?.id ??
    null
  styleDialog.value = true
}

// 保存风格
async function saveStyle() {
  savingStyle.value = true
  try {
    const res = await comicApi.updateComic(comic.value.id, {
      stylePrompt: editStyleValue.value,
      stylePresetId: editStylePresetId.value,
    })
    if (res.comic) {
      comic.value = { ...comic.value, ...res.comic }
    } else {
      // 后端应始终返回 comic；兜底时同步清空/设置 stylePreset 嵌套
      comic.value.style_prompt = editStyleValue.value
      comic.value.style_preset_id = editStylePresetId.value
      comic.value.stylePresetId = editStylePresetId.value
      if (editStylePresetId.value == null) {
        comic.value.stylePreset = null
      }
    }
    styleDialog.value = false
  } catch (e) {
    console.error('保存风格失败', e)
    alert('保存失败：' + (e.response?.data?.error || e.message))
  } finally {
    savingStyle.value = false
  }
}

onMounted(() => {
  loadComic()
})
</script>

<style scoped>
.comic-detail {
  min-height: 100vh;
  background: var(--color-background);
  padding: 24px 0;
}

.comic-detail__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.comic-detail__header {
  margin-bottom: 32px;
}

.comic-detail__back-btn {
  text-transform: none;
  font-weight: 500;
  color: var(--color-on-surface-variant);
  margin-bottom: 16px;
}

.comic-detail__back-btn:hover {
  color: var(--color-primary);
}

.comic-detail__title-container {
  display: flex;
  align-items: center;
}

.comic-detail__title {
  font-family: var(--font-family-display);
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-on-surface);
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: color 0.2s ease;
  margin: 0;
}

.comic-detail__title:hover {
  color: var(--color-primary);
}

.comic-detail__title-input {
  max-width: 600px;
}

.comic-detail__dialog {
  border-radius: var(--border-radius-xl);
}

.comic-detail__dialog-title {
  font-family: var(--font-family-display);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-on-surface);
  padding: 24px 24px 16px;
}

.comic-detail__dialog-content {
  padding: 0 24px 24px;
}

.comic-detail__dialog-actions {
  padding: 16px 24px;
  border-top: 1px solid var(--color-outline-variant);
  background: linear-gradient(180deg, var(--color-surface-variant) 0%, var(--color-surface) 100%);
}

.comic-detail__novel-content {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: var(--font-family-sans);
  font-size: 0.9375rem;
  line-height: 1.7;
  color: var(--color-on-surface);
  max-height: 400px;
  overflow-y: auto;
}

/* 响应式调整 */
@media (max-width: 960px) {
  .comic-detail {
    padding: 16px 0;
  }
  
  .comic-detail__title {
    font-size: 1.5rem;
  }
}

@media (max-width: 600px) {
  .comic-detail__title {
    font-size: 1.25rem;
  }
}

/* 深色主题调整 */
[data-theme="dark"] .comic-detail {
  background: var(--color-background);
}
</style>
