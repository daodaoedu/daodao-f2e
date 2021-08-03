module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'react',
  ],
  rules: {
    'react/prop-types': [0],
    'react/jsx-props-no-spreading': [0],
    'arrow-body-style': 0,
    'no-console': 0,
    'max-len': 0,
    'react/react-in-jsx-scope': 0,
    'no-underscore-dangle': 0,
  },
};
