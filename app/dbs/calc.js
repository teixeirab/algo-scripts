module.exports = function(Configs, Sequelize, utils) {
    //database configs
    var params = utils.getSequezlieParams(Configs, false);
    var userDB = new Sequelize('calcdata', Configs.user, Configs.password, params);

    return userDB;
};
