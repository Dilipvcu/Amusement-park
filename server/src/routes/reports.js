const express = require('express');
const router = express.Router();
const { Ticket, Activity } = require('../db');
const { Op } = require('sequelize');

// Daily summary report with details
router.get('/daily', async (req, res) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const start = new Date(date);
    start.setHours(0,0,0,0);
    const end = new Date(date);
    end.setHours(23,59,59,999);

    const tickets = await Ticket.findAll({ where: { issuedAt: { [Op.between]: [start, end] } }, include: [{ model: Activity, as: 'ride' }], order: [['issuedAt','DESC']] });

    const totalRevenue = tickets.reduce((s, t) => s + Number(t.price), 0);

    const countsByType = tickets.reduce((acc, t) => { acc[t.type] = (acc[t.type] || 0) + 1; return acc; }, {});
    const countsByCategory = tickets.reduce((acc, t) => { acc[t.ticketCategory] = (acc[t.ticketCategory] || 0) + 1; return acc; }, {});

    const ridesTakenMap = {};
    tickets.forEach(t => {
      if (t.ride) {
        const key = t.ride.id;
        ridesTakenMap[key] = ridesTakenMap[key] || { id: t.ride.id, name: t.ride.name, count: 0 };
        ridesTakenMap[key].count += 1;
      }
    });
    const ridesTaken = Object.values(ridesTakenMap).sort((a,b)=>b.count-a.count);

    const topRide = ridesTaken.length ? ridesTaken[0] : null;

    res.json({ date: start.toISOString().slice(0,10), totalRevenue, countsByType, countsByCategory, ridesTaken, topRide, tickets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;