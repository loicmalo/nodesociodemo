/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
const Sequelize = require('sequelize');
const sequelize = require('../db/dbConnection').sociodemo_app;
const queryInterface = sequelize.getQueryInterface();

const Sociodemo = sequelize.define('sociodemo', {
    id: {
        type: Sequelize.BIGINT,
        primaryKey: true
    },

    themes: {
        type: Sequelize.STRING(80)
    },

    sous_themes: {
        type: Sequelize.STRING(80)
    },

    code_geo: {
        type: Sequelize.STRING(9)
    },

    niveau_geo: {
        type: Sequelize.STRING(11)
    },

    annee_data: {
        type: Sequelize.INTEGER
    },

    annee_pub: {
        type: Sequelize.INTEGER
    },

    data: {
        type: Sequelize.JSONB
    }

},
        {
            freezeTableName: true,
            timestamps: false
        }
);

module.exports = Sociodemo;

