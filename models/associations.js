const User = require('./User');
const Exchange = require('./Exchange');
const ExchangeObject = require('./ExchangeObject');
const Object = require('./Object');
const Category = require('./Category');
const Report = require('./Report');
const TypeReport = require('./TypeReport');

function defineAssociations() {
    User.hasMany(Exchange, { foreignKey: 'proposer_user_id' });
    User.hasMany(Exchange, { foreignKey: 'receiver_user_id' });
    User.hasMany(ExchangeObject, { foreignKey: 'user_id' });
    User.hasMany(Report, { foreignKey: 'reporter_user_id' });

    Exchange.belongsTo(User, { foreignKey: 'proposer_user_id' });
    Exchange.belongsTo(User, { foreignKey: 'receiver_user_id' });
    Exchange.hasMany(ExchangeObject, { foreignKey: 'exchange_id' });

    ExchangeObject.belongsTo(Exchange, { foreignKey: 'exchange_id' });
    ExchangeObject.belongsTo(Object, { foreignKey: 'object_id' });
    ExchangeObject.belongsTo(User, { foreignKey: 'user_id' });

    Object.belongsTo(User, { foreignKey: 'user_id' });
    Object.belongsTo(Category, { foreignKey: 'category_id' });
    Object.hasMany(ExchangeObject, { foreignKey: 'object_id' });

    Category.hasMany(Object, { foreignKey: 'category_id' });

    Report.belongsTo(Object, { foreignKey: 'object_id' });
    Report.belongsTo(User, { foreignKey: 'reporter_user_id' });
    Report.belongsTo(TypeReport, { foreignKey: 'type_report_id' });

    TypeReport.hasMany(Report, { foreignKey: 'type_report_id' });
}

module.exports = defineAssociations;
