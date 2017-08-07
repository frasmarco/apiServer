module.exports = {
    db: {
        user: "api",
        host: "localhost",
        database: "dev",
        password: "Password01",
        port: 5432,
        ssl: true
    },
    google: {
        clientID: "xxxx",
        clientSecret: "xxxx",
        callbackURL: "http://localhost/auth/google/callback"
    },
    facebook: {
        clientID: "xxxx",
        clientSecret: "xxxx",
        callbackURL: "http://localhost/auth/facebook/callback",
        profileFields: ["id", "first_name", "last_name", "email"]
    },
    linkedin: {
        consumerKey: "xxxx",
        consumerSecret: "xxx",
        callbackURL: "http://localhost/auth/linkedin/callback",
        profileFields: ['id', 'first-name', 'last-name', 'email-address']
    },
    graphQl: {
        dynamicJson: true,
        graphiql: true,
        pgDefaultRole: "anonymous",
        jwtPgTypeIdentifier: "public.jwt_token",
        jwtSecret: "xxx",
        watchPg: true
    },
    sessionSecret: "xxx"
};
