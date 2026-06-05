const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const hostsRoutes = require('./routes/hosts');
const dashboardRoutes = require('./routes/dashboard');
const perfRoutes = require('./routes/perf');
const userRoutes = require('./routes/users');

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
app.use('/api', userRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`SHM Server running on http://localhost:${PORT}`);
});

module.exports = app;
