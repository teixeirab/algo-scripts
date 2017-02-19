module.exports = function(Configs, Sequelize, utils) {
    //database configs
    var params = utils.getSequezlieParams(Configs);
    var RawDB = new Sequelize('rawdata', Configs.user, Configs.password, params);

    return RawDB;
};
