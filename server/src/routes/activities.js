const express = require('express');
const router = express.Router();
const { Activity } = require('../db');

// List activities
router.get('/', async (req, res) => {
  const activities = await Activity.findAll();
  res.json(activities);
});

// Create activity
router.post('/', async (req, res) => {
  try {
    const { name, description, capacity, durationMinutes } = req.body;
    const a = await Activity.create({ name, description, capacity, durationMinutes });
    res.status(201).json(a);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update activity
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, capacity, durationMinutes } = req.body;
    const [updated] = await Activity.update({ name, description, capacity, durationMinutes }, {
      where: { id: id }
    });
    if (updated) {
      const updatedActivity = await Activity.findOne({ where: { id: id } });
      return res.status(200).json(updatedActivity);
    }
    throw new Error('Activity not found');
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;