const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // This is important to avoid SSL certificate errors
    },
    charset: 'utf8',
  },
  define: {
    charset: 'utf8',
    collate: 'utf8_general_ci'
  }
});

module.exports = sequelize;
