const Sequelize = require('sequelize');
const sequelize = require('../db/dbConnection').sequelize_description;
const queryInterface = sequelize.getQueryInterface();

const Completion = sequelize.define('completion', {
  col_name: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  col_value: {
    type: Sequelize.STRING
  }

},
  {
    freezeTableName: true,
    timestamps: false

  }
);


module.exports = Completion;
