import config from './webpack.config.common';

export default {
  ...config,
  output: {
    ...config.output,
    filename: 'main.[chunkhash].js',
  },
};
