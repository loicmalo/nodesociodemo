const Sequelize = require('sequelize');
const sequelize = require('../db/dbConnection').sequelize_users;
const queryInterface = sequelize.getQueryInterface();

const Users = sequelize.define('users', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true
  },
  username: {
    type: Sequelize.STRING(180)
  },
  username_canonical: {
    type: Sequelize.STRING(180)
  },
  email: {
    type: Sequelize.STRING(180)
  },
  email_canonical: {
    type: Sequelize.STRING(180)
  },
  enabled: {
    type: Sequelize.BOOLEAN
  },
  salt: {
    type: Sequelize.STRING(255)
  },
  password: {
    type: Sequelize.STRING(255)
  },
  last_login: {
    type: Sequelize.DATE //Warning - this is timestamp with timezone / can't do timestamp without time zone.
  },
  confirmation_token: {
    type: Sequelize.STRING(180)
  },
  password_requested_at: {
    type: Sequelize.DATE
  },
  roles: {
    type: Sequelize.TEXT
  },
  portail_id: {
    type: Sequelize.STRING(255)
  },
  portail_access_token: {
    type: Sequelize.STRING(255)
  }
},
  {
    freezeTableName: true,
    timestamps: false
  }
);


module.exports = Users;
