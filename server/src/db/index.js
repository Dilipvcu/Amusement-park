const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../data/amusent-park.db'),
  logging: false,
});

const Ticket = sequelize.define('Ticket', {
  customerName: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: true },
  phone: { type: DataTypes.STRING, allowNull: true },
  type: { type: DataTypes.ENUM('Adult', 'Child', 'Senior'), allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
  issuedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  ticketCategory: { type: DataTypes.ENUM('Admission','Ride','AllRides'), allowNull: false, defaultValue: 'Admission' },
  rideId: { type: DataTypes.INTEGER, allowNull: true }
});

const Activity = sequelize.define('Activity', {
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  capacity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  durationMinutes: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 30 }
});

// Association: a ticket may be for a specific ride
Ticket.belongsTo(Activity, { as: 'ride', foreignKey: 'rideId' });

module.exports = {
  sequelize,
  Ticket,
  Activity,
  authenticate: async () => sequelize.authenticate(),
  sync: async (opts) => sequelize.sync(opts)
};
