/**
 * 食物热量扫描仪 - 后端服务
 * Express + Mimo Vision API 代理
 */
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// 增大请求体积限制（base64 图片较大）
app.use(express.json({ limit: '20mb' }));
app.use(express.static(__dirname));

// ==================== Mimo Vision API ====================
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
1. 如果是中式餐点，请用中文准确命名
2. 重量按正常成人一份估算
3. 数值尽可能准确，参考中国食物成分表
4. 如果图片中有多种食物，请合并计算`;

async function analyzeFood(imageBase64) {
  // 去除可能的 data:image/...;base64, 前缀
  const pureBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

  const body = {
    model: MIMO_MODEL,
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/jpeg',
            data: pureBase64
          }
        },
        {
          type: 'text',
          text: NUTRITION_PROMPT
        }
      ]
    }]
  };

  const response = await fetch(`${MIMO_BASE}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': MIMO_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Mimo API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const text = data.content?.find(c => c.type === 'text')?.text || '';

  // 尝试从响应中提取JSON
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('未能解析AI返回的营养数据');
  }

  const nutrition = JSON.parse(jsonMatch[0]);

  // 验证必需字段
  if (!nutrition.foodName || !nutrition.calories) {
    throw new Error('AI返回的数据不完整');
  }

  return {
    foodName: nutrition.foodName,
    weight: Math.round(nutrition.weight || 0),
    calories: Math.round(nutrition.calories || 0),
    protein: Math.round((nutrition.protein || 0) * 10) / 10,
    fat: Math.round((nutrition.fat || 0) * 10) / 10,
    carbs: Math.round((nutrition.carbs || 0) * 10) / 10,
    ingredients: nutrition.ingredients || ''
  };
}

// ==================== API Routes ====================

// 食物分析接口
app.post('/api/analyze', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: '请提供食物图片' });
    }

    console.log('🔍 正在分析食物图片...');
    const startTime = Date.now();

    const result = await analyzeFood(image);

    console.log(`✅ 分析完成 (${Date.now() - startTime}ms): ${result.foodName} - ${result.calories}千卡`);
    res.json(result);
  } catch (err) {
    console.error('❌ 分析失败:', err.message);
    res.status(500).json({ error: err.message || '分析失败，请重试' });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ==================== Start ====================
app.listen(PORT, () => {
  console.log('');
  console.log('  🍔  食物热量扫描仪');
  console.log('  ═══════════════════');
  console.log(`  App:   http://localhost:${PORT}`);
  console.log(`  API:   http://localhost:${PORT}/api/analyze`);
  console.log('');
});
