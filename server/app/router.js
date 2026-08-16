// server/app/router.js
module.exports = app => {
  const { router, controller } = app;

  // 数据库维护（token 保护，无需登录；须在 SPA fallback 之前）
  router.get('/api/maintain', controller.maintain.index);
  router.post('/api/maintain/:name', controller.maintain.run);

  // 认证相关（无需登录）
  router.post('/api/auth/register', controller.auth.register);
  router.post('/api/auth/login', controller.auth.login);
  router.post('/api/auth/logout', controller.auth.logout);

  // OIDC（无需业务登录；bind/register 依赖 oidc_pending Cookie）
  router.get('/api/auth/oidc/status', controller.auth.oidcStatus);
  router.get('/api/auth/oidc/login', controller.auth.oidcLogin);
  router.get('/api/auth/oidc/callback', controller.auth.oidcCallback);
  router.get('/api/auth/oidc/pending', controller.auth.oidcPending);
  router.post('/api/auth/oidc/bind', controller.auth.oidcBind);
  router.post('/api/auth/oidc/register', controller.auth.oidcRegister);

  // 需要登录的接口
  router.get('/api/auth/me', app.middleware.jwt(), controller.auth.me);

  // 风格预设相关
  require('./router/stylePreset')(app);

  // 角色相关（需要登录）
  router.get('/api/characters', app.middleware.jwt(), controller.character.index);
  router.post('/api/characters', app.middleware.jwt(), controller.character.create);
  router.get('/api/characters/:id', app.middleware.jwt(), controller.character.show);
  router.put('/api/characters/:id', app.middleware.jwt(), controller.character.update);
  router.delete('/api/characters/:id', app.middleware.jwt(), controller.character.destroy);
  router.post('/api/characters/:id/generate-reference', app.middleware.jwt(), controller.character.generateReference);

  // 漫画相关（需要登录）
  router.get('/api/comics', app.middleware.jwt(), controller.comic.index);
  router.post('/api/comics', app.middleware.jwt(), controller.comic.create);
  router.get('/api/comics/:id', app.middleware.jwt(), controller.comic.show);
  router.put('/api/comics/:id', app.middleware.jwt(), controller.comic.update);
  router.delete('/api/comics/:id', app.middleware.jwt(), controller.comic.destroy);
  router.post('/api/comics/:id/generate-cover', app.middleware.jwt(), controller.comic.generateCover);
  router.post('/api/comics/:id/chapters/batch', app.middleware.jwt(), controller.comic.createChapters);

  // 章节相关（需要登录）
  router.post('/api/comics/:id/chapters', app.middleware.jwt(), controller.chapter.create);
  router.get('/api/chapters/:id', app.middleware.jwt(), controller.chapter.show);
  router.put('/api/chapters/:id', app.middleware.jwt(), controller.chapter.update);
  router.delete('/api/chapters/:id', app.middleware.jwt(), controller.chapter.destroy);
  router.post('/api/chapters/:id/generate-script', app.middleware.jwt(), controller.chapter.generateScript);
  router.post('/api/chapters/:id/generate-image', app.middleware.jwt(), controller.chapter.generateImage);
  router.post('/api/chapters/:id/generate-prompt', app.middleware.jwt(), controller.chapter.generateChapterPrompt);

  // 小说相关（需要登录）
  router.post('/api/novels', app.middleware.jwt(), controller.novel.create);
  router.get('/api/novels/:id', app.middleware.jwt(), controller.novel.show);
  router.delete('/api/novels/:id', app.middleware.jwt(), controller.novel.destroy);
  router.post('/api/novels/:id/analyze-style', app.middleware.jwt(), controller.novel.analyzeStyle);
  router.post('/api/novels/:id/extract-characters', app.middleware.jwt(), controller.novel.extractCharacters);
  router.post('/api/novels/:id/generate-chapters', app.middleware.jwt(), controller.novel.generateChapters);
  router.get('/api/novels/by-comic/:comicId', app.middleware.jwt(), controller.novel.showByComicId);

  // 短篇漫画相关（需要登录）
  router.get('/api/short-comic/:id', app.middleware.jwt(), controller.shortComic.get);
  router.post('/api/short-comic', app.middleware.jwt(), controller.shortComic.create);
  router.put('/api/short-comic/:id', app.middleware.jwt(), controller.shortComic.update);
  router.post('/api/short-comic/optimize-prompt', app.middleware.jwt(), controller.shortComic.optimizePrompt);
  router.post('/api/short-comic/generate-script', app.middleware.jwt(), controller.shortComic.generateScript);
  router.post('/api/short-comic/generate-image', app.middleware.jwt(), controller.shortComic.generateImage);

  // AI 提供商（options 登录可读；CRUD 需管理员）
  router.get('/api/ai-providers/options', app.middleware.jwt(), controller.aiProvider.options);
  router.get('/api/ai-providers', app.middleware.jwt(), app.middleware.admin(), controller.aiProvider.index);
  router.get('/api/ai-providers/:id', app.middleware.jwt(), app.middleware.admin(), controller.aiProvider.show);
  router.post('/api/ai-providers', app.middleware.jwt(), app.middleware.admin(), controller.aiProvider.create);
  router.put('/api/ai-providers/:id', app.middleware.jwt(), app.middleware.admin(), controller.aiProvider.update);
  router.delete('/api/ai-providers/:id', app.middleware.jwt(), app.middleware.admin(), controller.aiProvider.destroy);
  router.post('/api/ai-providers/:id/set-default', app.middleware.jwt(), app.middleware.admin(), controller.aiProvider.setDefault);

  // 通用配置 API（需要管理员权限）
  router.get('/api/configs/:category/:key', app.middleware.jwt(), app.middleware.admin(), controller.configs.show);
  router.put('/api/configs/:category/:key', app.middleware.jwt(), app.middleware.admin(), controller.configs.update);

  // 管理员接口（需要管理员权限）
  router.get('/api/admin/users', app.middleware.jwt(), app.middleware.admin(), controller.admin.getUsers);
  router.put('/api/admin/users/:id/admin', app.middleware.jwt(), app.middleware.admin(), controller.admin.setUserAdmin);
  router.post('/api/admin/users/:id/oidc/unbind', app.middleware.jwt(), app.middleware.admin(), controller.admin.unbindUserOidc);
  router.post('/api/admin/oidc/test', app.middleware.jwt(), app.middleware.admin(), controller.admin.testOidc);

  // AI 辅助功能（需要登录）
  router.post('/api/ai-assist/fill-form', app.middleware.jwt(), controller.aiAssist.fillForm);

  // 图片访问（通过 token 认证，无需登录）
  router.get('/api/images/:type/:filename', controller.images.show);

  // 图片访问（通过 Cookie 认证，需要登录）
  router.get('/images/:type/:filename', app.middleware.jwt(), controller.images.showAuth);

  // SPA fallback（history 路由刷新兜底，需最后注册）
  router.get('/(.*)', controller.home.fallback);
};
