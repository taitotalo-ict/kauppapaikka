module.exports = (sequelize, DataTypes) => sequelize.define('tuote', {
  nimi: DataTypes.STRING(100),
  lisätiedot: DataTypes.TEXT,
  hinta: DataTypes.DECIMAL(6,2),
  määrä: DataTypes.INTEGER,
  kuva: DataTypes.STRING(100)
},{
  tableName: 'Tuotteet'
});
