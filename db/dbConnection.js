const Sequelize = require('sequelize');
const pwd = 'postgres';

const sociodemo_app = new Sequelize('sociodemo_app','postgres', pwd, {
  host: '127.0.0.1',
  dialect: 'postgres',
  operatorsAliases: false,
  port: 5433,
  
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});


const sequelize_datacompile = new Sequelize('datacompile', 'postgres', pwd, {
  host: '127.0.0.1',
  dialect: 'postgres',
  operatorsAliases: false,
  port: 5433,
  
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }

});

const sequelize_description = new Sequelize('datainfo', 'postgres', pwd, {
  host: '127.0.0.1',
  dialect: 'postgres',
  operatorsAliases: false,
  port: 5433,

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }

});

const sequelize_users = new Sequelize('fos_user', 'postgres', pwd, {
  host: '127.0.0.1',
  dialect: 'postgres',
  operatorsAliases: false,
  port: 5433,

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }

});

module.exports.sociodemo_app = sociodemo_app;
module.exports.sequelize_datacompile = sequelize_datacompile;
module.exports.sequelize_description = sequelize_description;
module.exports.sequelize_users = sequelize_users;