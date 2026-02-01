const express = require('express');
const router = express.Router();
const { Ticket, Activity } = require('../db');

// Create ticket
router.post('/', async (req, res) => {
  try {
    const { customerName, email, phone, type, price, ticketCategory, rideId } = req.body;

    // validate required fields
    if (!customerName || !type || !price || !ticketCategory) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let rideRef = null;
    if (ticketCategory === 'Ride') {
      const rid = rideId ? Number(rideId) : null;
      if (!rid) return res.status(400).json({ error: 'rideId is required for Ride tickets' });
      rideRef = await Activity.findByPk(rid);
      if (!rideRef) return res.status(400).json({ error: 'Invalid rideId' });
    }

    const ticket = await Ticket.create({
      customerName,
      email,
      phone,
      type,
      price,
      ticketCategory,
      rideId: rideRef ? rideRef.id : null
    });

    // include ride info in response
    const created = await Ticket.findByPk(ticket.id, { include: [{ model: Activity, as: 'ride' }] });

    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List tickets 
router.get('/', async (req, res) => {
  try {
    const { date } = req.query;
    let where = {};
    if (date) {
      const start = new Date(date);
      start.setHours(0,0,0,0);
      const end = new Date(date);
      end.setHours(23,59,59,999);
      where.issuedAt = { [require('sequelize').Op.between]: [start, end] };
    }
    const tickets = await Ticket.findAll({ where, order: [['issuedAt','DESC']], include: [{ model: Activity, as: 'ride' }] });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single ticket
router.get('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id, { include: [{ model: Activity, as: 'ride' }] });
    if (!ticket) return res.status(404).json({ error: 'Not found' });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;