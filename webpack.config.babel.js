import config from './webpack.config.common';

export default {
  ...config,
  entry: [
    ...config.entry,
    'webpack-dev-server/client?http://localhost:8080'
  ]
};
