const options = {
    dynamicJson: true,
    graphiql: true,
    pgDefaultRole: 'anonymous',
    jwtSecret: 'pYXQiOjE1MDE0MTMzN',
    jwtPgTypeIdentifier: 'public.jwt_token',
    watchPg: true
};

module.exports = { options };