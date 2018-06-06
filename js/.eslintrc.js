module.exports = {
  "env": {
    "browser": true,
    "commonjs": true,
    "es6": true,
  },
  "parser": "babel-eslint",
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaFeatures": {
      "experimentalObjectRestSpread": true,
      "jsx": true
    },
    "sourceType": "module"
  },
  "globals": {
    "__": true,
    process: true,
  },
  "plugins": [
    "react"
  ],
  "rules": {
    "no-warning-comments": ["warn", { "terms": ["todo", "fixme"] }],
    "block-scoped-var": "error",
    "no-console": [ "error", { allow: ["info",  "warn", "error"] }],
    "no-alert": "error",
    "no-caller": "error",
    "require-await": "error",
    "no-constant-condition": ["error", { "checkLoops": false }],
    "no-empty": ["error", { "allowEmptyCatch": true }],
    "no-unused-vars": ["error", { "vars": "all", "args": "none", "ignoreRestSiblings": true }],
    "react/jsx-uses-react": "error",
    "react/jsx-uses-vars": "error",
    "react/no-string-refs": "error",
    "react/jsx-key": "error",
    "react/jsx-no-duplicate-props": "error",
    "react/no-children-prop": "error",
    "react/no-deprecated": "error",
    "react/no-did-mount-set-state": "error",
    "react/no-did-update-set-state": "error",
    "react/no-redundant-should-component-update": "error",
    "react/no-render-return-value": "error",
    "react/no-unescaped-entities": "error",
    "react/no-unknown-property": "error",
    "react/prefer-es6-class": "error",
    "react/require-render-return": "error",
    "react/style-prop-object": "error",
    "indent": [
      "error",
      2,
      {
        SwitchCase: 1
      }
    ],
    "no-useless-escape": "off",
    "linebreak-style": [
      "error",
      "unix"
    ],
    "semi": [
      "error",
      "always"
    ]
  }
};
