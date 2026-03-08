const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const councilRoutes = require('./routes/council.routes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 50,
    message: 'Too many requests, slowing down to save battery.',
});
app.use('/api', limiter);

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        memory: process.memoryUsage().rss / 1024 / 1024 + 'MB',
    });
});

app.use('/api/council', councilRoutes);

app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

module.exports = app;
