module.exports = (sequelize, DataTypes) => sequelize.define('asiakas', {
  käyttäjätunnus: DataTypes.STRING(50),
  etunimi: DataTypes.STRING(50),
  sukunimi: DataTypes.STRING(50),
  email: DataTypes.STRING(50),
  salasana: DataTypes.STRING(100),
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  }
},{
  tableName: 'asiakkaat'
});
