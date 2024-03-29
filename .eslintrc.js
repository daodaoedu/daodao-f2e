module.exports = {
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['react', 'import', 'react-hooks'],
  extends: ['plugin:prettier/recommended', 'airbnb'],
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  settings: {
    'import/resolver': {
      alias: {
        extensions: ['.js', '.jsx'],
        map: [['@', '.']],
      },
    },
  },
  rules: {
    'react/no-unescaped-entities': 'off',
    '@next/next/no-page-custom-font': 'off',
    'react/prop-types': [0],
    'react/jsx-props-no-spreading': [0],
    'arrow-body-style': 0,
    'no-console': 0,
    'max-len': 0,
    'react/react-in-jsx-scope': 0,
    'no-underscore-dangle': 0,
    'no-nested-ternary': 0,
    'no-else-return': 0,
    'import/prefer-default-export': 0,
    quotes: 0,
    'comma-dangle': 0,
    'object-curly-newline': 0,
    'implicit-arrow-linebreak': 0,
    'operator-linebreak': 0,
    'function-paren-newline': 0,
    'jsx-a11y/click-events-have-key-events': 0,
    'jsx-a11y/control-has-associated-label': 0,
    'jsx-a11y/no-noninteractive-element-interactions': 0,
    'react/jsx-one-expression-per-line': 0,
    'no-confusing-arrow': 0,
    indent: 0,
    'no-restricted-globals': 0,
    'react/jsx-curly-newline': 0,
    camelcase: 0,
    'no-unused-vars': 0,
    'react/function-component-definition': 0,
    'react/jsx-no-useless-fragment': 0,
    'react/no-unknown-property': 0,
    'no-unsafe-optional-chaining': 0,
    'react/no-invalid-html-attribute': 0,
  },
};
