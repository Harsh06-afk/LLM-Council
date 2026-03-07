const express = require('express');
const { askCouncil } = require('../controllers/council.controller');

const router = express.Router();

router.post('/ask', askCouncil);

module.exports = router;
