'use strict';

module.exports = {

  development: {
    enable: true,
    package: 'egg-development',
  },
  static: {
    enable: true,
    package: 'egg-static',
  },

  proxyworker : {
    enable: true,
    package: 'egg-development-proxyworker',
  },

  ejs : {
    enable: true,
    package: 'egg-view-ejs',
  },

  security: {
      enable: true,
      package: 'egg-security',
  },

  sessionRedis:{ 
    enable: true,
    package: 'egg-session-redis',
  },

  redis : {
    enable: true,
    package: 'egg-redis',
  },

  sequelize : {
    enable: true,
    package: 'egg-sequelize',
  },

  passport : {
    enable: true,
    package: 'egg-passport',
  },
  passportLocal: {
    enable: true,
    package:'egg-passport-local',
  }
}