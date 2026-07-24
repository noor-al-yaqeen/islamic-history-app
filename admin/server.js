require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4000;

app.set('trust proxy', 1);
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? true : '*',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// ─── JSON File-based DB (fallback when MongoDB is unavailable) ─────
class JsonDB {
  constructor(name, defaults = []) {
    this.file = path.join(DATA_DIR, `${name}.json`);
    this.name = name;
    if (!fs.existsSync(this.file)) {
      fs.writeFileSync(this.file, JSON.stringify(defaults, null, 2));
    }
  }

  read() {
    try { return JSON.parse(fs.readFileSync(this.file, 'utf8')); }
    catch { return []; }
  }

  write(data) {
    fs.writeFileSync(this.file, JSON.stringify(data, null, 2));
  }

  nextId() {
    const items = this.read();
    return items.length > 0 ? Math.max(...items.map(i => i._id || 0)) + 1 : 1;
  }

  findAll(filter = {}) {
    let items = this.read();
    for (const [key, val] of Object.entries(filter)) {
      if (key === 'isActive') items = items.filter(i => i.isActive === val);
      else if (key === 'category') items = items.filter(i => String(i.category) === String(val));
    }
    return items;
  }

  findById(id) {
    return this.read().find(i => String(i._id) === String(id)) || null;
  }

  insertOne(data) {
    const items = this.read();
    const doc = { _id: this.nextId(), ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    items.push(doc);
    this.write(items);
    return doc;
  }

  updateById(id, data) {
    const items = this.read();
    const idx = items.findIndex(i => String(i._id) === String(id));
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...data, _id: items[idx]._id, updatedAt: new Date().toISOString() };
    this.write(items);
    return items[idx];
  }

  deleteById(id) {
    const items = this.read();
    const idx = items.findIndex(i => String(i._id) === String(id));
    if (idx === -1) return false;
    items.splice(idx, 1);
    this.write(items);
    return true;
  }

  countDocuments(filter = {}) {
    return this.findAll(filter).length;
  }

  search(query) {
    const items = this.read();
    const q = query.toLowerCase();
    return items.filter(i =>
      (i.title && i.title.toLowerCase().includes(q)) ||
      (i.summary && i.summary.toLowerCase().includes(q)) ||
      (i.name && i.name.toLowerCase().includes(q)) ||
      (i.description && i.description.toLowerCase().includes(q)) ||
      (i.tags && i.tags.some(t => t.toLowerCase().includes(q)))
    );
  }
}

// ─── Initialize DB ──────────────────────────────────────────────────
const useMongo = process.env.USE_MONGO === 'true';

const db = {
  categories: new JsonDB('categories', [
    { _id: 1, name: 'النبي محمد ﷺ', slug: 'prophet', description: 'سيرة خاتم الأنبياء والمرسلين', icon: '🕊️', color: '#2E7D32', order: 1, isActive: true },
    { _id: 2, name: 'الصحابة الكرام', slug: 'sahaba', description: 'أصحاب النبي وخير القرون', icon: '🤝', color: '#1565C0', order: 2, isActive: true },
    { _id: 3, name: 'الغزوات النبوية', slug: 'ghazwat', description: 'غزوات النبي وبطولات الصحابة', icon: '⚔️', color: '#C62828', order: 3, isActive: true },
    { _id: 4, name: 'أمهات المؤمنين', slug: 'ummahat', description: 'زوجات النبي الطاهرات', icon: '👑', color: '#7B1FA2', order: 4, isActive: true },
    { _id: 5, name: 'قصص الأنبياء', slug: 'prophet-stories', description: 'قصص الأنبياء والمرسلين', icon: '📖', color: '#E65100', order: 5, isActive: true },
    { _id: 6, name: 'الأماكن المقدسة', slug: 'holy-places', description: 'المساجد والأماكن الإسلامية', icon: '🕌', color: '#00695C', order: 6, isActive: true },
  ]),
  stories: new JsonDB('stories', []),
  videos: new JsonDB('videos', []),
};

// ─── Try MongoDB connection ──────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/islamic-history-app';

mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 })
  .then(async () => {
    console.log('✓ متصل بقاعدة البيانات MongoDB');
    db.mongo = true;
    db.Category = require('./models/Category');
    db.Story = require('./models/Story');
    db.Video = require('./models/Video');
    const count = await db.Category.countDocuments();
    if (count === 0) {
      await db.Category.insertMany(db.categories.read());
      console.log('✓ تم إضافة البيانات الافتراضية');
    }
  })
  .catch(err => {
    db.mongo = false;
    console.log('  ✓ تم التبديل إلى التخزين المحلي (JSON files)');
    console.log('  📁 البيانات تُحفظ في: admin/data/');
  });

// ─── Helper: pick DB ────────────────────────────────────────────────
function getDB(type) {
  if (db.mongo) {
    const models = { categories: db.Category, stories: db.Story, videos: db.Video };
    return models[type];
  }
  return db[type];
}

// ─── CRUD Routes ────────────────────────────────────────────────────
function createCrudRoutes(basePath, dbType, name) {
  const router = express.Router();

  router.get('/', async (req, res) => {
    try {
      const D = getDB(dbType);
      if (db.mongo) {
        const filter = req.query.active === 'true' ? { isActive: true } : {};
        const items = await D.find(filter).sort({ order: 1, createdAt: -1 });
        return res.json({ success: true, data: items, count: items.length });
      }
      const items = D.findAll(req.query.active === 'true' ? { isActive: true } : {});
      res.json({ success: true, data: items, count: items.length });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const D = getDB(dbType);
      const item = db.mongo ? await D.findById(req.params.id) : D.findById(req.params.id);
      if (!item) return res.status(404).json({ success: false, message: `${name} غير موجود` });
      res.json({ success: true, data: item });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  router.post('/', async (req, res) => {
    try {
      const D = getDB(dbType);
      let item;
      if (db.mongo) {
        item = new D(req.body);
        await item.save();
      } else {
        item = D.insertOne(req.body);
      }
      res.status(201).json({ success: true, data: item, message: `✓ تم إضافة ${name} بنجاح` });
    } catch (e) {
      res.status(400).json({ success: false, message: e.message });
    }
  });

  router.put('/:id', async (req, res) => {
    try {
      const D = getDB(dbType);
      let item;
      if (db.mongo) {
        item = await D.findByIdAndUpdate(req.params.id, req.body, { new: true });
      } else {
        item = D.updateById(req.params.id, req.body);
      }
      if (!item) return res.status(404).json({ success: false, message: `${name} غير موجود` });
      res.json({ success: true, data: item, message: `✓ تم تحديث ${name} بنجاح` });
    } catch (e) {
      res.status(400).json({ success: false, message: e.message });
    }
  });

  router.delete('/:id', async (req, res) => {
    try {
      const D = getDB(dbType);
      let deleted;
      if (db.mongo) {
        deleted = await D.findByIdAndDelete(req.params.id);
      } else {
        deleted = D.deleteById(req.params.id);
      }
      if (!deleted) return res.status(404).json({ success: false, message: `${name} غير موجود` });
      res.json({ success: true, message: `✓ تم حذف ${name} بنجاح` });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  return router;
}

app.use('/api/categories', createCrudRoutes('/api/categories', 'categories', 'القسم'));
app.use('/api/stories', createCrudRoutes('/api/stories', 'stories', 'القصة'));
app.use('/api/videos', createCrudRoutes('/api/videos', 'videos', 'الفيديو'));

// ─── Stats ───────────────────────────────────────────────────────────
app.get('/api/stats', async (req, res) => {
  try {
    if (db.mongo) {
      const [categories, stories, videos] = await Promise.all([
        db.Category.countDocuments(),
        db.Story.countDocuments(),
        db.Video.countDocuments(),
      ]);
      return res.json({ success: true, data: { categories, stories, videos } });
    }
    res.json({
      success: true,
      data: {
        categories: db.categories.countDocuments(),
        stories: db.stories.countDocuments(),
        videos: db.videos.countDocuments(),
      }
    });
  } catch {
    res.json({ success: true, data: { categories: 0, stories: 0, videos: 0 } });
  }
});

// ─── Export ──────────────────────────────────────────────────────────
app.get('/api/export', async (req, res) => {
  try {
    if (db.mongo) {
      const [categories, stories, videos] = await Promise.all([
        db.Category.find().lean(),
        db.Story.find().lean(),
        db.Video.find().lean(),
      ]);
      return res.json({ success: true, data: { categories, stories, videos, exportedAt: new Date().toISOString() } });
    }
    res.json({
      success: true,
      data: {
        categories: db.categories.read(),
        stories: db.stories.read(),
        videos: db.videos.read(),
        exportedAt: new Date().toISOString(),
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ─── Login ───────────────────────────────────────────────────────────
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const adminUser = process.env.ADMIN_USERNAME || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
  if (username === adminUser && password === adminPass) {
    res.json({ success: true, message: '✓ تم تسجيل الدخول بنجاح' });
  } else {
    res.status(401).json({ success: false, message: '✗ اسم المستخدم أو كلمة المرور غير صحيحة' });
  }
});

// ─── App API Bridge ─────────────────────────────────────────────────
app.get('/api/app/categories', (req, res) => {
  try {
    const cats = db.mongo
      ? db.Category.find({ isActive: true }).sort({ order: 1 })
      : db.categories.findAll({ isActive: true }).sort((a, b) => a.order - b.order);
    if (cats.then) cats.then(data => res.json({ success: true, data, count: data.length }));
    else res.json({ success: true, data: cats, count: cats.length });
  } catch { res.json({ success: false, data: [] }); }
});

app.get('/api/app/stories', (req, res) => {
  try {
    const { category } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    let items = db.mongo
      ? db.Story.find(filter).sort({ order: 1 })
      : db.stories.findAll(filter).sort((a, b) => (a.order || 0) - (b.order || 0));
    if (items.then) items.then(data => res.json({ success: true, data, count: data.length }));
    else res.json({ success: true, data: items, count: items.length });
  } catch { res.json({ success: false, data: [] }); }
});

app.get('/api/app/videos', (req, res) => {
  try {
    const { category } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    let items = db.mongo
      ? db.Video.find(filter).sort({ createdAt: -1 })
      : db.videos.findAll(filter).reverse();
    if (items.then) items.then(data => res.json({ success: true, data, count: data.length }));
    else res.json({ success: true, data: items, count: items.length });
  } catch { res.json({ success: false, data: [] }); }
});

app.get('/api/app/search', (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ success: true, data: { stories: [], videos: [] } });
    if (db.mongo) {
      const regex = new RegExp(q, 'i');
      Promise.all([
        db.Story.find({ isActive: true, $or: [{ title: regex }, { summary: regex }, { tags: regex }] }).limit(10),
        db.Video.find({ isActive: true, $or: [{ title: regex }, { description: regex }] }).limit(10),
      ]).then(([stories, videos]) => res.json({ success: true, data: { stories, videos } }));
    } else {
      const stories = db.stories.search(q).filter(s => s.isActive !== false).slice(0, 10);
      const videos = db.videos.search(q).filter(v => v.isActive !== false).slice(0, 10);
      res.json({ success: true, data: { stories, videos } });
    }
  } catch { res.json({ success: true, data: { stories: [], videos: [] } }); }
});

app.get('/api/app/status', (req, res) => {
  res.json({
    success: true,
    data: {
      dbConnected: !!db.mongo,
      storage: db.mongo ? 'MongoDB Atlas' : 'JSON Files (محلي)',
      version: '2.0.0',
      name: 'التاريخ الإسلامي API',
      dataDir: DATA_DIR,
    }
  });
});

// ─── Serve Admin Panel ──────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n╔══════════════════════════════════════╗`);
  console.log(`║   📚 لوحة تحكم التاريخ الإسلامي     ║`);
  console.log(`╠══════════════════════════════════════╣`);
  console.log(`║  🚀 http://localhost:${PORT}              ║`);
  console.log(`║  📁 التخزين: JSON Files (محلي)      ║`);
  console.log(`║  👤 admin / admin123                ║`);
  console.log(`╚══════════════════════════════════════╝\n`);
});