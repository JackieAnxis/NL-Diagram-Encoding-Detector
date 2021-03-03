module.exports = {
    extends: ['alloy'],
    env: {
        // Your environments (which contains several predefined global variables)
        //
        browser: true,
        es6: true
        // node: true,
        // mocha: true,
        // jquery: true
    },
    globals: {
        // Your global variables (setting to false means it's not allowed to be reassigned)
        //
        // myGlobal: false
    },
    rules: {
        // Customize your rules
        'guard-for-in': false
    },
    overrides: [
        {
            files: ['**/*.js'],
            extends: ['alloy'],
            parser: 'babel-eslint',
            rules: {
                strict: 0
            }
        }
    ]
}
