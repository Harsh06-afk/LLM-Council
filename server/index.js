require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

app.use(helmet());
app.use(cors());

app.use(express.json({limit : '1mb'}));

const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max : 50,
    message : "Too many requests slowing down for saving battery"
})
app.use('/api', limiter);

app.get('/api/health', (req, res) => {
    res.json({
        status : 'ok',
        memory: process.memoryUsage().rss / 1024 / 1024 + 'MB'
    });
});

const PORT = 3000;
app.listen(PORT, () =>
    console.log('Server running on port 3000, testing deployment'));