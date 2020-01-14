module.exports = {
    presets: [
        '@vue/app'
    ],
    plugins: [
        ["@babel/syntax-dynamic-import"],
        ["@babel/plugin-proposal-nullish-coalescing-operator"],
        ["@babel/plugin-proposal-optional-chaining"]
    ]
}
