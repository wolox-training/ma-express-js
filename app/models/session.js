module.exports = (sequelize, DataTypes) => {
  const Session = sequelize.define(
    'Session',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        autoIncrement: true,
        primaryKey: true
      },
      token: {
        type: DataTypes.STRING,
        allowNull: false
      },
      expiresIn: {
        type: DataTypes.DATE,
        allowNull: false
      }
    },
    {
      underscored: true,
      timestamps: true,
      tableName: 'sessions'
    }
  );

  Session.associate = models => {
    Session.belongsTo(models.User, { as: 'userLogged', foreignKey: 'userId' });
  };

  return Session;
};
