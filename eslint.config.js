const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  {
    // Default config for browser scripts
    files: ['*.js'],
    ignores: ['jest.config.js', 'eslint.config.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        ...globals.browser
      }
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'warn',
      'semi': ['error', 'always'],
      'quotes': ['error', 'single', { avoidEscape: true }]
    }
  },
  {
    // sorter.js uses globals from lib files
    files: ['sorter.js'],
    languageOptions: {
      globals: {
        MALE_TERMS: 'readonly',
        FEMALE_TERMS: 'readonly',
        isMale: 'readonly',
        isFemale: 'readonly',
        parseDate: 'readonly',
        extractYear: 'readonly'
      }
    }
  },
  {
    // Lib files need to export for Node.js testing
    files: ['lib/*.js'],
    languageOptions: {
      globals: {
        module: 'readonly'
      }
    }
  },
  {
    // Test files and Node.js configs
    files: ['tests/**/*.js', 'jest.config.js', 'eslint.config.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.jest
      }
    }
  },
  {
    ignores: ['node_modules/', 'dist/', 'build/']
  }
];
