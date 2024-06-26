module.exports = {
  env: {
    node: true,
    es2021: true
  },
  extends: "eslint:recommended",
  overrides: [
    {
      env: {
        node: true
      },
      files: [".eslintrc.{js,cjs}"],
      parserOptions: {
        sourceType: "script"
      }
    }
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  rules: {
    indent: ["error", 2,  { "SwitchCase": 1 }],
    "linebreak-style": ["error", "unix"],
    quotes: ["error", "double"]
  }
};
