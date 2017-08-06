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
        clientID: "533430902380-n4253pagu1flquphvvu01476ksm92815.apps.googleusercontent.com",
        clientSecret: "emKoDm4JsbXdp9cOLoz98Ru0",
        callbackURL: "http://localhost/auth/google/callback"
    },
    facebook: {
        clientID: "1816236898393920",
        clientSecret: "8f0b66d0926eb0507453dc89675d78c0",
        callbackURL: "http://localhost/auth/facebook/callback",
        profileFields: ["id", "first_name", "last_name", "email"]
    },
    linkedin: {
        consumerKey: "77t62mr12ezjmx",
        consumerSecret: "5Nk7zuHveQE5nN6b",
        callbackURL: "http://localhost/auth/linkedin/callback",
        profileFields: ['id', 'first-name', 'last-name', 'email-address']
    },
    graphQl: {
        dynamicJson: true,
        graphiql: true,
        pgDefaultRole: "anonymous",
        jwtPgTypeIdentifier: "public.jwt_token",
        jwtSecret: "pYXQiOjE1MDE0MTMzN",
        watchPg: true
    },
    sessionSecret: "pYXQiOjE1MDE0MTMzN"
};
