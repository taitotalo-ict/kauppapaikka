const { Sequelize, Model, DataTypes } = require('sequelize');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite'
});

Tuote = require('./tuote')(sequelize, DataTypes);
Asiakas = require('./asiakas')(sequelize, DataTypes);

sequelize.sync({alter: true});

module.exports = { Tuote, Asiakas };