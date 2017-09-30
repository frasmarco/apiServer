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
        profileFields: ["id", "first-name", "last-name", "email-address"]
    },
    graphQl: {
        dynamicJson: true,
        graphiql: true,
        pgDefaultRole: "anonymous",
        jwtPgTypeIdentifier: "public.jwt_token",
        jwtSecret: "xxx",
        watchPg: true
    },
    aws: {
        bucketName: "speleowebgis",
        documentsPrefix: "documents/",
        thumbsPrefix: "thumbnails/",
        endpoint: "s3.eu-central-1.amazonaws.com",
        region: "eu-central-1"
    },
    fileTypes: {
        images: ["image/jpeg", "image/png", "image/tiff", "image/gif"],
        documents: [
            "application/msword",
            "application/pdf",
            "application/vnd.ms-excel",
            "application/vnd.ms-office",
            "application/xml",
            "text/html",
            "text/plain"
        ],
    },
    thumbnails: {
        dimensions: "100x100",
        maxWidht: 100,
        maxHeight: 100
    },
    miniatures: {
        dimensions: "1024x768",
        maxWidht: 1024,
        maxHeight: 768
    },
    sessionSecret: "xxx",
    sessionCookiePath: "/auth",
    loginTarget: "/web/home",
    jwtMaxAge: "60s",
};
