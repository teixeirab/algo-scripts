module.exports = function(Configs, Sequelize, utils) {
    //database configs
    var params = utils.getSequezlieParams(Configs, true);
    var userDB = new Sequelize('userinfo', Configs.user, Configs.password, params);

    return userDB;
};
