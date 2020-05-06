module.exports = {
    parser: '@typescript-eslint/parser', // 定义ESLint的解析器
    // 定义文件继承的子规范
    extends: [
        'plugin:@typescript-eslint/recommended',
        'prettier/@typescript-eslint',
        'plugin:prettier/recommended'
    ],
    plugins: ['@typescript-eslint'], // 定义了该eslint文件所依赖的插件
    env: {                          // 指定代码的运行环境
        browser: true,
        node: true,
    },
    rules: {
        "@typescript-eslint/explicit-member-accessibility": 2,
        "@typescript-eslint/no-non-null-assertion": 0
    }
}
