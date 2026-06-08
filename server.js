/**
 * 福州信霖管理咨询有限公司官网 - 后台服务
 * Express server: static file serving + admin API
 * 启动方式: node server.js
 * 访问地址: http://localhost:3000
 * 后台地址: http://localhost:3000/admin.html
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
const UPLOAD_DIR = path.join(__dirname, 'images', 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Middleware
app.use(express.json({ limit: '20mb' }));
app.use(express.static(__dirname));

// Session tokens (simple in-memory storage)
const sessions = new Set();

// Multer config for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_DIR);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const name = Date.now() + '-' + crypto.randomBytes(4).toString('hex') + ext;
        cb(null, name);
    }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: function (req, file, cb) {
        const allowed = /\.(jpg|jpeg|png|gif|svg|webp|ico)$/i;
        if (allowed.test(path.extname(file.originalname))) {
            cb(null, true);
        } else {
            cb(new Error('只允许上传图片文件 (jpg/png/gif/svg/webp/ico)'));
        }
    }
});

// ==================== Mimo Vision API (食物分析) ====================
const MIMO_API_KEY = process.env.MIMO_API_KEY || 'sk-ch9nur2xquyaxggrbd3akpzd4w6b0m3kc1laj8cd3e5j00gd';
const MIMO_BASE = 'https://api.xiaomimimo.com/anthropic';
const MIMO_MODEL = 'mimo-v2.5';

const NUTRITION_PROMPT = `你是一个专业的营养师AI。请仔细查看这张食物图片，识别图中所有食物，估算其重量和营养成分。

请严格按照以下JSON格式返回（只返回JSON，不要任何其他文字）：
{
  "foodName": "食物名称（中文）",
  "weight": 重量克数,
  "calories": 卡路里千卡,
  "protein": 蛋白质克数,
  "fat": 脂肪克数,
  "carbs": 碳水克数,
  "ingredients": "主要成分简述"
}

注意事项：
1. 中式餐点请用中文准确命名
2. 重量按正常成人一份估算
3. 数值参考中国食物成分表
4. 多种食物请合并计算`;

// ==================== API Routes ====================

// Login
app.post('/api/login', function (req, res) {
    const { password } = req.body;
    const data = readData();

    if (password === data.password) {
        const token = crypto.randomBytes(32).toString('hex');
        sessions.add(token);
        res.json({ success: true, token: token });
    } else {
        res.status(401).json({ success: false, message: '密码错误' });
    }
});

// Auth middleware
function checkAuth(req, res, next) {
    const token = req.headers['x-auth-token'] || req.query.token;
    if (token && sessions.has(token)) {
        next();
    } else {
        res.status(401).json({ success: false, message: '未登录或登录已过期' });
    }
}

// Logout
app.post('/api/logout', checkAuth, function (req, res) {
    const token = req.headers['x-auth-token'];
    sessions.delete(token);
    res.json({ success: true, message: '已退出登录' });
});

// Get all data (requires auth)
app.get('/api/data', checkAuth, function (req, res) {
    const data = readData();
    // Don't send password back
    const { password, ...safeData } = data;
    res.json({ success: true, data: safeData });
});

// Get public data (no auth required - for frontend)
app.get('/api/public-data', function (req, res) {
    const data = readData();
    // Don't send password back
    const { password, ...safeData } = data;
    res.json(safeData);
});

// Save data (requires auth)
app.post('/api/save', checkAuth, function (req, res) {
    try {
        const newData = req.body;
        const currentData = readData();

        // Merge new data, preserve password
        const merged = Object.assign({}, currentData, newData, { password: currentData.password });

        fs.writeFileSync(DATA_FILE, JSON.stringify(merged, null, 2), 'utf-8');
        res.json({ success: true, message: '保存成功！前台页面已自动更新。' });
    } catch (err) {
        res.status(500).json({ success: false, message: '保存失败：' + err.message });
    }
});

// Change password
app.post('/api/change-password', checkAuth, function (req, res) {
    const { oldPassword, newPassword } = req.body;
    const data = readData();

    if (oldPassword !== data.password) {
        return res.status(400).json({ success: false, message: '原密码错误' });
    }

    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ success: false, message: '新密码不能少于6位' });
    }

    data.password = newPassword;
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    res.json({ success: true, message: '密码修改成功！' });
});

// Upload image (requires auth)
app.post('/api/upload', checkAuth, upload.single('image'), function (req, res) {
    if (!req.file) {
        return res.status(400).json({ success: false, message: '请选择文件' });
    }
    const url = 'images/uploads/' + req.file.filename;
    res.json({ success: true, url: url, message: '上传成功！' });
});

// Upload logo (requires auth, overwrites the logo file)
app.post('/api/upload-logo', checkAuth, upload.single('logo'), function (req, res) {
    if (!req.file) {
        return res.status(400).json({ success: false, message: '请选择文件' });
    }
    // Save to images/uploads/ with timestamp
    const url = 'images/uploads/' + req.file.filename;

    // Update data.json logo field
    const data = readData();
    data.site.logo = url;
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');

    res.json({ success: true, url: url, message: 'Logo更换成功！' });
});

// Delete uploaded image
app.post('/api/delete-image', checkAuth, function (req, res) {
    const { imagePath } = req.body;
    if (!imagePath || !imagePath.startsWith('images/uploads/')) {
        return res.status(400).json({ success: false, message: '无效的文件路径' });
    }
    const fullPath = path.join(__dirname, imagePath);
    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        res.json({ success: true, message: '文件已删除' });
    } else {
        res.json({ success: true, message: '文件不存在（已跳过）' });
    }
});

// 食物热量分析 (无需登录)
app.post('/api/analyze', async function (req, res) {
    try {
        const { image } = req.body;
        if (!image) return res.status(400).json({ error: '请提供食物图片' });

        console.log('🔍 分析食物...');
        const pureBase64 = image.replace(/^data:image\/\w+;base64,/, '');

        const body = {
            model: MIMO_MODEL, max_tokens: 1024,
            messages: [{ role: 'user', content: [
                { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: pureBase64 }},
                { type: 'text', text: NUTRITION_PROMPT }
            ]}]
        };

        const resp = await fetch(`${MIMO_BASE}/v1/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'api-key': MIMO_API_KEY, 'anthropic-version': '2023-06-01' },
            body: JSON.stringify(body)
        });

        if (!resp.ok) throw new Error('Mimo API error ' + resp.status);

        const data = await resp.json();
        const text = data.content?.find(c => c.type === 'text')?.text || '';
        const m = text.match(/\{[\s\S]*\}/);
        if (!m) throw new Error('未能解析营养数据');

        const n = JSON.parse(m[0]);
        res.json({
            foodName: n.foodName, weight: Math.round(n.weight || 0),
            calories: Math.round(n.calories || 0),
            protein: Math.round((n.protein || 0) * 10) / 10,
            fat: Math.round((n.fat || 0) * 10) / 10,
            carbs: Math.round((n.carbs || 0) * 10) / 10,
            ingredients: n.ingredients || ''
        });
    } catch (err) {
        console.error('分析失败:', err.message);
        res.status(500).json({ error: err.message || '分析失败' });
    }
});

// Check auth status
app.get('/api/check-auth', checkAuth, function (req, res) {
    res.json({ success: true, authenticated: true });
});

// ==================== Helper ====================
function readData() {
    try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(raw);
    } catch (err) {
        console.error('Failed to read data.json:', err.message);
        return {};
    }
}

// ==================== Start Server ====================
app.listen(PORT, function () {
    console.log('');
    console.log('  ╔══════════════════════════════════════╗');
    console.log('  ║  福州信霖管理咨询有限公司 - 网站管理系统  ║');
    console.log('  ╚══════════════════════════════════════╝');
    console.log('');
    console.log('  前台页面: http://localhost:' + PORT);
    console.log('  管理后台: http://localhost:' + PORT + '/admin.html');
    console.log('  默认密码: admin123');
    console.log('');
    console.log('  按 Ctrl+C 停止服务器');
    console.log('');
});
