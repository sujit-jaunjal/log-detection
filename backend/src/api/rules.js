const express = require('express');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const router = express.Router();
const RULES_FILE = path.join(__dirname, '../../config/rules/apache-rules.yaml');

// GET /api/rules — list all rules
router.get('/', (req, res) => {
  try {
    const rules = yaml.load(fs.readFileSync(RULES_FILE, 'utf8')) || [];
    res.json(rules);
  } catch (e) {
    res.status(500).json({ error: 'Failed to load rules.' });
  }
});

// POST /api/rules — add a new rule
router.post('/', (req, res) => {
  try {
    const rules = yaml.load(fs.readFileSync(RULES_FILE, 'utf8')) || [];
    const newRule = req.body;
    rules.push(newRule);
    fs.writeFileSync(RULES_FILE, yaml.dump(rules));
    res.status(201).json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to add rule.' });
  }
});

module.exports = router; 