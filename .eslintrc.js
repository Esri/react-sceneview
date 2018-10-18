module.exports = {
    "extends": "airbnb",
    "rules": {
      "react/forbid-prop-types": 0,
      "jsx-a11y/href-no-hash": 0,
      "import/no-named-as-default": 0,
      "no-param-reassign": ["error", { "props": false }],
      "no-return-assign": 0,
      "react/no-array-index-key": 0,
      "jsx-a11y/no-autofocus": 0,
    },
    "env": {
      "browser": true,
      "jest": true,
    },
    "settings": {
      "import/resolver": {
        "node": {
          "paths": ["src"]
        }
      }
    }
};
