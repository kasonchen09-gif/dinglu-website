/**
 * 食物热量扫描仪 - 主逻辑
 */

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
  renderTodayLog();
  updateSummary();
});

// ==================== 相机 ====================
function triggerCamera() {
  const input = document.getElementById('cameraInput');
  input.click();
}

function handleImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    showError('请选择图片文件');
    return;
  }

  // 压缩并转 base64
  compressImage(file, 1200, 0.8, (base64) => {
    analyzeImage(base64);
  });

  // 清除 input，允许重复拍同一张照片
  event.target.value = '';
}

// ==================== 图片压缩 ====================
function compressImage(file, maxSize, quality, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      // 限制最大尺寸
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = (height / width) * maxSize;
          width = maxSize;
        } else {
          width = (width / height) * maxSize;
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const base64 = canvas.toDataURL('image/jpeg', quality);
      callback(base64);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// ==================== API 调用 ====================
async function analyzeImage(base64) {
  // 显示 loading
  document.getElementById('loadingOverlay').style.display = 'block';
  document.getElementById('resultCard').style.display = 'none';
  document.getElementById('errorMsg').style.display = 'none';

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64 })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || '分析失败');
    }

    const data = await response.json();
    showResult(data);

  } catch (err) {
    console.error('API error:', err);
    showError(err.message || '网络错误，请检查连接后重试');
  } finally {
    document.getElementById('loadingOverlay').style.display = 'none';
  }
}

// ==================== 结果展示 ====================
let pendingResult = null; // 暂存当前分析结果，等待用户确认

function showResult(data) {
  pendingResult = data;

  document.getElementById('rCal').textContent = data.calories;
  document.getElementById('rProtein').textContent = data.protein;
  document.getElementById('rFat').textContent = data.fat;
  document.getElementById('rCarbs').textContent = data.carbs;
  document.getElementById('resultFood').textContent =
    (data.weight ? data.weight + 'g ' : '') + data.foodName;

  document.getElementById('resultCard').style.display = 'block';
  document.getElementById('resultCard').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function closeResult() {
  document.getElementById('resultCard').style.display = 'none';
  pendingResult = null;
}

function addToLog() {
  if (!pendingResult) return;

  FoodStorage.add(pendingResult);
  pendingResult = null;

  document.getElementById('resultCard').style.display = 'none';
  renderTodayLog();
  updateSummary();

  // 轻震动反馈（支持设备的话）
  if (navigator.vibrate) {
    navigator.vibrate(15);
  }
}

// ==================== 错误提示 ====================
function showError(msg) {
  document.getElementById('errorText').textContent = msg;
  document.getElementById('errorMsg').style.display = 'flex';
}

function closeError() {
  document.getElementById('errorMsg').style.display = 'none';
}

// ==================== 今日记录渲染 ====================
function renderTodayLog() {
  const records = FoodStorage.getToday();
  const list = document.getElementById('logList');
  const empty = document.getElementById('logEmpty');
  const count = document.getElementById('logCount');

  count.textContent = records.length + '项';

  // 排序：最新的在上面
  records.sort((a, b) => b.id.localeCompare(a.id));

  if (records.length === 0) {
    list.innerHTML = '';
    list.appendChild(empty);
    return;
  }

  // 移除 empty 状态
  if (empty.parentNode) empty.remove();

  list.innerHTML = records.map(r => `
    <div class="log-item">
      <div class="log-item-info">
        <div class="log-item-name">${escHtml(r.foodName)}</div>
        <div class="log-item-macros">
          <span>🥩 ${r.protein}g</span>
          <span>🥑 ${r.fat}g</span>
          <span>🍚 ${r.carbs}g</span>
        </div>
      </div>
      <div class="log-item-cal">${r.calories}<span style="font-size:11px;font-weight:400;color:var(--text3)"> 千卡</span></div>
      <button class="log-item-del" onclick="deleteRecord('${r.id}')" title="删除">🗑</button>
    </div>
  `).join('');
}

function deleteRecord(id) {
  if (!confirm('确定删除这条记录吗？')) return;
  FoodStorage.remove(id);
  renderTodayLog();
  updateSummary();
}

// ==================== 汇总更新 ====================
function updateSummary() {
  const totals = FoodStorage.getTodayTotals();

  // 动画数字
  animateNumber('totalCal', totals.calories);
  document.getElementById('totalProtein').textContent = totals.protein;
  document.getElementById('totalFat').textContent = totals.fat;
  document.getElementById('totalCarbs').textContent = totals.carbs;
}

function animateNumber(elementId, target) {
  const el = document.getElementById(elementId);
  const start = parseInt(el.textContent) || 0;
  const duration = 400;
  const startTime = performance.now();

  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // ease out
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(start + (target - start) * eased);
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

// ==================== 工具函数 ====================
function escHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
