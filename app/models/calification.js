module.exports = (sequelize, DataTypes) => {
  const Calification = sequelize.define(
    'Calification',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        autoIncrement: true,
        primaryKey: true
      },
      score: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      underscored: true,
      timestamps: true,
      paranoid: true,
      tableName: 'califications'
    }
  );

  Calification.associate = models => {
    Calification.belongsTo(models.User, { as: 'ratingUser', foreignKey: 'ratingUserId' });
    Calification.belongsTo(models.Weet, { as: 'ratedWeet', foreignKey: 'weetId' });
  };

  return Calification;
};
