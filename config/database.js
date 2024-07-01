const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('postgres://postgres.ypltzdhbkbcflygsytuz:tpt-loic-jess-soa-nick@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres', {
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
