const App = require('../models/App');
const path = require('path');
const fs = require('fs');
const AdmZip = require('adm-zip');

exports.getApps = async (req, res) => {
  try {
    const { category, search, status = 'published' } = req.query;
    const query = { status };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const apps = await App.find(query)
      .sort({ downloadCount: -1 })
      .select('-__v');

    res.json(apps);
  } catch (error) {
    res.status(500).json({ message: '获取应用列表失败', error: error.message });
  }
};

exports.getAppById = async (req, res) => {
  try {
    const app = await App.findById(req.params.id).select('-__v');
    if (!app) {
      return res.status(404).json({ message: '应用不存在' });
    }
    res.json(app);
  } catch (error) {
    res.status(500).json({ message: '获取应用详情失败', error: error.message });
  }
};

exports.createApp = async (req, res) => {
  try {
    const { name, description, version, developer, category } = req.body;
    const packageFile = req.files?.package?.[0];
    const iconFile = req.files?.icon?.[0];

    if (!packageFile) {
      return res.status(400).json({ message: '请上传应用包' });
    }

    // Extract manifest from zip
    let manifest = {};
    try {
      const zip = new AdmZip(packageFile.path);
      const manifestEntry = zip.getEntry('manifest.json');
      if (manifestEntry) {
        manifest = JSON.parse(manifestEntry.getData().toString('utf8'));
      }
    } catch (e) {
      console.warn('Failed to extract manifest:', e.message);
    }

    const app = new App({
      name: name || manifest.name || 'Untitled',
      description: description || manifest.description || '',
      version: version || manifest.version || '1.0.0',
      icon: iconFile ? `/uploads/icons/${iconFile.filename}` : (manifest.icon || ''),
      packageUrl: `/uploads/packages/${packageFile.filename}`,
      packageSize: packageFile.size,
      developer,
      category: category || '其他',
      manifest,
      status: 'draft'
    });

    await app.save();
    res.status(201).json(app);
  } catch (error) {
    res.status(500).json({ message: '创建应用失败', error: error.message });
  }
};

exports.updateApp = async (req, res) => {
  try {
    const { name, description, version, developer, category, status } = req.body;
    const app = await App.findById(req.params.id);

    if (!app) {
      return res.status(404).json({ message: '应用不存在' });
    }

    if (name) app.name = name;
    if (description) app.description = description;
    if (version) app.version = version;
    if (developer) app.developer = developer;
    if (category) app.category = category;
    if (status) app.status = status;

    // Handle icon update
    if (req.files?.icon?.[0]) {
      // Delete old icon
      if (app.icon && app.icon.startsWith('/uploads/')) {
        const oldIconPath = path.join(__dirname, '../../', app.icon);
        fs.unlinkSync(oldIconPath);
      }
      app.icon = `/uploads/icons/${req.files.icon[0].filename}`;
    }

    // Handle package update
    if (req.files?.package?.[0]) {
      // Delete old package
      if (app.packageUrl && app.packageUrl.startsWith('/uploads/')) {
        const oldPackagePath = path.join(__dirname, '../../', app.packageUrl);
        fs.unlinkSync(oldPackagePath);
      }
      app.packageUrl = `/uploads/packages/${req.files.package[0].filename}`;
      app.packageSize = req.files.package[0].size;

      // Update manifest
      try {
        const zip = new AdmZip(req.files.package[0].path);
        const manifestEntry = zip.getEntry('manifest.json');
        if (manifestEntry) {
          app.manifest = JSON.parse(manifestEntry.getData().toString('utf8'));
        }
      } catch (e) {
        console.warn('Failed to extract manifest:', e.message);
      }
    }

    await app.save();
    res.json(app);
  } catch (error) {
    res.status(500).json({ message: '更新应用失败', error: error.message });
  }
};

exports.deleteApp = async (req, res) => {
  try {
    const app = await App.findById(req.params.id);
    if (!app) {
      return res.status(404).json({ message: '应用不存在' });
    }

    // Delete files
    if (app.icon && app.icon.startsWith('/uploads/')) {
      const iconPath = path.join(__dirname, '../../', app.icon);
      fs.unlinkSync(iconPath);
    }
    if (app.packageUrl && app.packageUrl.startsWith('/uploads/')) {
      const packagePath = path.join(__dirname, '../../', app.packageUrl);
      fs.unlinkSync(packagePath);
    }

    await App.findByIdAndDelete(req.params.id);
    res.json({ message: '应用已删除' });
  } catch (error) {
    res.status(500).json({ message: '删除应用失败', error: error.message });
  }
};

exports.downloadApp = async (req, res) => {
  try {
    const app = await App.findById(req.params.id);
    if (!app) {
      return res.status(404).json({ message: '应用不存在' });
    }

    const packagePath = path.join(__dirname, '../../', app.packageUrl);
    if (!fs.existsSync(packagePath)) {
      return res.status(404).json({ message: '应用包文件不存在' });
    }

    // Increment download count
    app.downloadCount += 1;
    await app.save();

    res.download(packagePath, `${app.name}-${app.version}.zip`);
  } catch (error) {
    res.status(500).json({ message: '下载失败', error: error.message });
  }
};
