const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FileRecord = sequelize.define('FileRecord', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    club_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    player_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    uploaded_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    file_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    file_type: {
      type: DataTypes.ENUM('xray', 'mri', 'scan', 'report', 'contract', 'lab', 'other'),
      defaultValue: 'other',
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    file_path: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    mime_type: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_confidential: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    tags: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  }, {
    tableName: 'file_records',
    updatedAt: false,
  });

  return FileRecord;
};
