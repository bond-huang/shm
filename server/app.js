const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const hostsRoutes = require('./routes/hosts');
const dashboardRoutes = require('./routes/dashboard');
const perfRoutes = require('./routes/perf');
const perfRealtimeRoutes = require('./routes/perf-realtime');
const perfHistoryRoutes = require('./routes/perf-history');
const reportRoutes = require('./routes/reports');
const scriptRoutes = require('./routes/scripts');
const standardCheckRoutes = require('./routes/standardCheck');
const analysisRoutes = require('./routes/analysis');
const userRoutes = require('./routes/users');
const aiRoutes = require('./routes/ai');
const authMiddleware = require('./middleware/auth');
const scheduler = require('./services/scheduler');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api', authRoutes);
app.use('/api', menuRoutes);
app.use('/api', hostsRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', perfRoutes);
app.use('/api', perfRealtimeRoutes);
app.use('/api', perfHistoryRoutes);
app.use('/api', reportRoutes);
app.use('/api', scriptRoutes);
app.use('/api', standardCheckRoutes);
app.use('/api', analysisRoutes);
app.use('/api', userRoutes);
app.use('/api', authMiddleware, aiRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`SHM Server running on http://localhost:${PORT}`);
  // 启动定时性能采集（每 10 分钟）
  scheduler.start();
});

module.exports = app;
