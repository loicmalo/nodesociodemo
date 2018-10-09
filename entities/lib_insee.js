/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
const Sequelize = require('sequelize');
const sequelize = require('../db/dbConnection').sociodemo_app;
const queryInterface = sequelize.getQueryInterface();

const Lib_insee = sequelize.define('lib_insee', {
    id:{
        type:Sequelize.BIGINT,
        primaryKey: true
    },
    
    id_indic: {
        type: Sequelize.STRING(80)
    },

    lib_indic: {
        type: Sequelize.STRING(250)
    },

    lib_indic_long: {
        type: Sequelize.STRING(250)
    },
    
    themes:{
        type: Sequelize.STRING(80)
    },
    
    sous_themes:{
        type: Sequelize.STRING(80)
    },
    
    annee_data:{
        type: Sequelize.INTEGER
    },
    
    annee_pub:{
        type: Sequelize.INTEGER
    }
},
        {
            freezeTableName: true,
            timestamps: false
        }
);

module.exports = Lib_insee;

