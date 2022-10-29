require('dotenv').config();

const getDbConfig = (nodeEnv) => {
  const config = {
    development: {
      username: process.env['DB_USERNAME_DEV'],
      password: process.env['DB_PASSWORD_DEV'],
      database: process.env['DB_DATABASE_DEV'],
      host: process.env['DB_HOST_DEV'],
      dialect: 'mariadb',
      repositoryMode: false,
      autoLoadModels: true,
      synchronize: false,
    },
    migration: {
      dialect: 'mariadb',
      username: process.env['DB_USERNAME_MIGRATION'],
      password: process.env['DB_PASSWORD_MIGRATION'],
      database: process.env['DB_DATABASE_MIGRATION'],
      host: process.env['DB_HOST_MIGRATION'],
      port: process.env['DB_PORT_MIGRATION'],
    },
    test: {
      username: process.env['DB_USERNAME_TEST'],
      password: process.env['DB_PASSWORD_TEST'],
      database: process.env['DB_DATABASE_TEST'],
      host: process.env['DB_HOST_TEST'],
      dialect: 'mariadb',
      repositoryMode: false,
      autoLoadModels: true,
      synchronize: false,
    },
    production: {
      username: process.env['DB_USERNAME'],
      password: process.env['DB_PASSWORD'],
      database: process.env['DB_DATABASE'],
      host: process.env['DB_HOST'],
      dialect: 'mariadb',
      repositoryMode: false,
      autoLoadModels: true,
      synchronize: false,
    },
  };
  if (nodeEnv) return config[nodeEnv];
  return config;
};

module.exports = getDbConfig();
module.exports.getDbConfig = getDbConfig;
