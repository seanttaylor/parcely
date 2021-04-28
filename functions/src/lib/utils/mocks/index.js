module.exports = {
    mocks: {
        
    },
    mockImpl: {
        repo: require("./repo"),
        user: require("./user"),
        userService: require("./user-service"),
        cache: require("./cache"),
        console: require("./console")
    }
}