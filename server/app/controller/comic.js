// server/app/controller/comic.js
const Controller = require('egg').Controller;

class ComicController extends Controller {
  async index() {
    const { ctx } = this;
    const comics = await ctx.service.comic.getComics(ctx.state.user.id);
    ctx.body = { comics };
  }

  async show() {
    const { ctx } = this;
    const { id } = ctx.params;
    const comic = await ctx.service.comic.getComic(parseInt(id), ctx.state.user.id);
    ctx.body = { comic };
  }

  async create() {
    const { ctx } = this;
    const { title, stylePrompt, stylePresetId } = ctx.request.body;

    if (!title || !title.trim()) {
      ctx.status = 400;
      ctx.body = { error: '漫画标题不能为空' };
      return;
    }

    try {
      const comic = await ctx.service.comic.createComic(
        ctx.state.user.id,
        title,
        stylePrompt,
        stylePresetId
      );
      ctx.status = 201;
      ctx.body = { comic };
    } catch (err) {
      ctx.status = err.status || 500;
      ctx.body = { error: err.message };
    }
  }

  async update() {
    const { ctx } = this;
    const { id } = ctx.params;
    const { title, stylePrompt, stylePresetId, status } = ctx.request.body;

    try {
      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (status !== undefined) updateData.status = status;
      if (stylePrompt !== undefined) updateData.style_prompt = stylePrompt;
      if (Object.prototype.hasOwnProperty.call(ctx.request.body, 'stylePresetId')) {
        updateData.style_preset_id = stylePresetId;
      }

      const comic = await ctx.service.comic.updateComic(
        parseInt(id),
        ctx.state.user.id,
        updateData
      );
      ctx.body = { comic };
    } catch (err) {
      ctx.status = err.status || 500;
      ctx.body = { error: err.message };
    }
  }

  async destroy() {
    const { ctx } = this;
    const { id } = ctx.params;

    try {
      await ctx.service.comic.deleteComic(parseInt(id), ctx.state.user.id);
      ctx.body = { message: '删除成功' };
    } catch (err) {
      ctx.status = err.status || 500;
      ctx.body = { error: err.message };
    }
  }

  async generateCover() {
    const { ctx } = this;
    const { id } = ctx.params;
    const { providerId, prompt, size } = ctx.request.body || {};

    try {
      const comic = await ctx.service.comic.generateCover(
        parseInt(id),
        ctx.state.user.id,
        { providerId, prompt, size }
      );

      ctx.body = { comic };
    } catch (err) {
      ctx.status = err.status || 500;
      ctx.body = { error: err.message };
    }
  }

  async createChapters() {
    const { ctx } = this;
    const { id: comicId } = ctx.params;
    const { chapters, novelId } = ctx.request.body;

    if (!chapters || !Array.isArray(chapters) || chapters.length === 0) {
      ctx.status = 400;
      ctx.body = { error: '请提供章节列表' };
      return;
    }

    try {
      const comic = await ctx.service.db.findComicByIdAndUserId(
        parseInt(comicId),
        ctx.state.user.id
      );

      if (!comic) {
        ctx.status = 404;
        ctx.body = { error: '漫画不存在' };
        return;
      }

      const createdChapters = [];
      for (const ch of chapters) {
        const chapterId = await ctx.service.db.createChapter(
          parseInt(comicId),
          ch.chapterNumber,
          ch.title,
          ch.layoutType
        );

        await ctx.service.db.updateChapter(chapterId, {
          chapter_prompt: ch.chapterPrompt,
          character_ids: JSON.stringify(ch.characterIds || []),
        });

        const chapter = await ctx.service.db.findChapterById(chapterId);
        createdChapters.push(chapter);
      }

      if (novelId) {
        await ctx.service.db.updateNovel(novelId, ctx.state.user.id, {
          comic_id: parseInt(comicId),
          status: 'completed',
        });
      }

      ctx.status = 201;
      ctx.body = { chapters: createdChapters };
    } catch (err) {
      ctx.status = err.status || 500;
      ctx.body = { error: err.message };
    }
  }
}

module.exports = ComicController;
