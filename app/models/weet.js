module.exports = (sequelize, DataTypes) => {
  const Weet = sequelize.define(
    'Weet',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        autoIncrement: true,
        primaryKey: true
      },
      content: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },
    {
      underscored: true,
      timestamps: true,
      paranoid: true,
      tableName: 'weets'
    }
  );

  Weet.associate = models => {
    Weet.belongsTo(models.User, { as: 'userCreator', foreignKey: 'creatorId' });
  };

  return Weet;
};
