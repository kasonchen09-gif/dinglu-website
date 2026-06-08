/**
 * LocalStorage 封装 - 食物记录存储
 * 数据结构: { "2026-06-08": [{ id, foodName, calories, protein, fat, carbs, time }, ...] }
 */
const FoodStorage = {
  STORAGE_KEY: 'food-scanner-logs',

  /** 获取所有数据 */
  getAll() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  },

  /** 获取今日记录 */
  getToday() {
    const today = this.getDateKey();
    const all = this.getAll();
    return all[today] || [];
  },

  /** 添加一条记录 */
  add(item) {
    const today = this.getDateKey();
    const all = this.getAll();
    if (!all[today]) all[today] = [];

    const record = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      foodName: item.foodName,
      calories: item.calories,
      protein: item.protein,
      fat: item.fat,
      carbs: item.carbs,
      weight: item.weight || 0,
      time: new Date().toISOString()
    };

    all[today].push(record);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
    return record;
  },

  /** 删除一条记录 */
  remove(id) {
    const today = this.getDateKey();
    const all = this.getAll();
    if (all[today]) {
      all[today] = all[today].filter(r => r.id !== id);
      if (all[today].length === 0) delete all[today];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
    }
  },

  /** 获取今日营养总计 */
  getTodayTotals() {
    const records = this.getToday();
    return {
      calories: records.reduce((s, r) => s + r.calories, 0),
      protein: records.reduce((s, r) => s + r.protein, 0),
      fat: records.reduce((s, r) => s + r.fat, 0),
      carbs: records.reduce((s, r) => s + r.carbs, 0),
      count: records.length
    };
  },

  /** 获取日期键 YYYY-MM-DD */
  getDateKey() {
    const d = new Date();
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }
};
