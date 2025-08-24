/**
 * Webpack Configuration
 * @file webpack.config.js
 * @description Production-ready webpack configuration with development and production environments
 * @version 1.0.0
 */

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

/**
 * @typedef {import('webpack').Configuration} WebpackConfig
 * @typedef {import('webpack-dev-server').Configuration} DevServerConfig
 */

/**
 * Environment-specific configuration generator
 * @param {Object} env - Environment variables
 * @param {Object} argv - CLI arguments
 * @returns {WebpackConfig} Webpack configuration
 */
module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const isDevelopment = !isProduction;

  /**
   * @type {WebpackConfig}
   */
  const config = {
    // Set the mode explicitly
    mode: isProduction ? 'production' : 'development',

    // Entry point of the application
    entry: {
      main: path.resolve(__dirname, 'src/index.js'),
    },

    // Output configuration
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction
        ? 'js/[name].[contenthash].js'
        : 'js/[name].bundle.js',
      publicPath: '/',
      // Clean the output directory before emit
      clean: true,
    },

    // Enable source maps for debugging
    devtool: isProduction ? 'source-map' : 'eval-source-map',

    // Module resolution and loading
    resolve: {
      extensions: ['.js', '.jsx', '.json'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },

    // Module rules for different file types
    module: {
      rules: [
        // JavaScript/JSX processing
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
            },
          },
        },
        // CSS processing
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            'postcss-loader',
          ],
        },
        // Asset handling
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 8 * 1024, // 8kb
            },
          },
        },
      ],
    },

    // Development server configuration
    devServer: {
      historyApiFallback: true,
      hot: true,
      open: true,
      port: 3000,
      client: {
        overlay: {
          errors: true,
          warnings: false,
        },
      },
      /**
       * @type {DevServerConfig}
       */
      static: {
        directory: path.join(__dirname, 'public'),
      },
    },

    // Optimization configuration
    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: isProduction,
            },
          },
        }),
        new CssMinimizerPlugin(),
      ],
      splitChunks: {
        chunks: 'all',
        name: false,
      },
    },

    // Plugins configuration
    plugins: [
      // Generate HTML file
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'public/index.html'),
        favicon: path.resolve(__dirname, 'public/favicon.ico'),
        inject: true,
      }),

      // Clean build directory
      new CleanWebpackPlugin(),

      // ESLint integration
      new ESLintPlugin({
        extensions: ['js', 'jsx'],
        emitWarning: isDevelopment,
        emitError: isProduction,
      }),

      // Environment variables
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify(isProduction ? 'production' : 'development'),
        },
      }),
    ],
  };

  // Production-specific plugins
  if (isProduction) {
    config.plugins.push(
      new MiniCssExtractPlugin({
        filename: 'css/[name].[contenthash].css',
        chunkFilename: 'css/[id].[contenthash].css',
      }),
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: false,
      })
    );
  }

  // Development-specific plugins
  if (isDevelopment) {
    config.plugins.push(
      new webpack.HotModuleReplacementPlugin()
    );
  }

  return config;
};