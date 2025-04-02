const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Track = sequelize.define('Track', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  genre: {
    type: DataTypes.STRING
  },
  stream_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  file_path: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = Track;
