// Utility functions for user persistence.
// In Db the user model is made by 3 tables, user_account, user_profile and user_login
var db = require("../db");

/**
 * Find a user knowing his primary id (UUID)
 *
 * @param {UUID} [id]
 * @param {function} [cb]
 */
const findById = function(id, cb) {
    db.query("SELECT user_profile.*,role FROM user_profile\
     INNER JOIN user_account ON user_id = id WHERE user_id = $1", [id], function(err, result) {
        if (err) {
            return cb(err);
        } else {
            if (result.rowCount == 0) {
                return cb(null, false);
            } else {
                return cb(null, result.rows[0]);
            }
        }
    });
};

/**
* Find a user given the oath provider specific identifier.
* As addictional security measure also checks the provider name
*/
const findByProviderId = function(provider, id, cb) {
    db.query(
        "SELECT * FROM user_login INNER JOIN user_profile \
        ON user_login.user_id = user_profile.user_id \
        WHERE provider = $1 AND key = $2",
        [provider.toLowerCase(), id],
        function(err, result) {
            if (err) {
                return cb(err);
            } else {
                if (result.rowCount == 0) {
                    return cb(null, false);
                } else {
                    return cb(null, result.rows[0]);
                }
            }
        }
    );
};

// Find a user knowing his mail address.
const findByEmail = function(email, cb) {
    const query =
        "SELECT user_profile.* FROM user_profile INNER JOIN user_account \
        ON user_id = id WHERE email = $1";
    db.query(query, [email], function(err, result) {
        if (err) {
            return cb(err);
        } else {
            if (result.rowCount == 0) {
                return cb(null, false);
            } else {
                return cb(null, result.rows[0]);
            }
        }
    });
};

// Update oath profile (user_login table)
const updateUserLogin = function(provider, id, user, accessToken, refreshToken, profileJson, cb) {
    db.query(
        "UPDATE user_login SET profile = $1, tokens = $2 \
        WHERE provider = $3 AND key = $4",
        [profileJson, { accessToken: accessToken, refreshToken: refreshToken }, provider, id],
        function(err, result) {
            if (err) {
                return cb(err);
            } else {
                if (result.rowCount == 0) {
                    return cb(null, false);
                } else {
                    return cb(null, user, result.rows[0]);
                }
            }
        }
    );
};

// Create oath profile (user_login table)
const createUserLogin = function(provider, id, user, accessToken, refreshToken, profileJson, cb) {
    db.query(
        "INSERT INTO user_login (provider, key, user_id, \
        tokens, profile) VALUES ($1, $2, $3, $4, $5);",
        [
            provider,
            id,
            user.user_id,
            { accessToken: accessToken, refreshToken: refreshToken },
            profileJson
        ],
        function(err, result) {
            if (err) {
                return cb(err);
            } else {
                if (result.rowCount == 0) {
                    return cb(null, false);
                } else {
                    return cb(null, user, result.rows[0]);
                }
            }
        }
    );
};

// Create user (user_account and user_profile table)
const createUser = function(email, firstName, lastName, cb) {
    const query =
        "WITH rows AS (\
          INSERT INTO user_account\
  	        (email, email_confirmed)\
          VALUES\
            ($1, true)\
        RETURNING id\
        )\
        INSERT INTO user_profile (user_id, first_name, last_name, display_name)\
        SELECT id, $2, $3, $4\
        FROM rows\
        RETURNING *";
    db.query(query, [email, firstName, lastName, firstName + " " + lastName], function(
        err,
        result
    ) {
        if (err) {
            return cb(err);
        } else {
            if (result.rowCount == 0) {
                return cb(null, false);
            } else {
                return cb(null, result.rows[0]);
            }
        }
    });
};

// Takes care of anyting needed to create a complete user profile.
// It also joins addictional logins to the user profile.
const findOrCreateByProviderID = function(
    provider,
    id,
    email,
    firstName,
    lastName,
    accessToken,
    refreshToken,
    profileJson,
    cb
) {
    findByProviderId(provider, id, function(err, user) {
        if (err) {
            return cb(err);
        } else {
            if (user) {
                updateUserLogin(
                    provider,
                    id,
                    user,
                    accessToken,
                    refreshToken,
                    profileJson,
                    function(err, user, userLogin) {
                        if (err) {
                            return cb(err);
                        } else {
                            return cb(null, user, userLogin);
                        }
                    }
                );
            } else {
                // Check if user already exist by email, need profileJson and email
                findByEmail(email, function(err, user) {
                    if (err) {
                        return cb(err);
                    } else {
                        if (user) {
                            createUserLogin(
                                provider,
                                id,
                                user,
                                accessToken,
                                refreshToken,
                                profileJson,
                                function(err, user, userLogin) {
                                    if (err) {
                                        return cb(err);
                                    } else {
                                        return cb(null, user, userLogin);
                                    }
                                }
                            );
                        } else {
                            createUser(email, firstName, lastName, function(err, user) {
                                if (err) {
                                    return cb(err);
                                } else {
                                    if (user) {
                                        createUserLogin(
                                            provider,
                                            id,
                                            user,
                                            accessToken,
                                            refreshToken,
                                            profileJson,
                                            function(err, user, userLogin) {
                                                if (err) {
                                                    return cb(err);
                                                } else {
                                                    return cb(null, user, userLogin);
                                                }
                                            }
                                        );
                                    } else {
                                        return cb(new Error("Failed to create user"));
                                    }
                                }
                            });
                        }
                    }
                });
            }
        }
    });
};

// Authenticate the user delegating password check to the db layer
// using the stored procedure "authenticate(email text, password text)".
const authenticate = function(username, password, cb) {
    db.query("SELECT * FROM authenticate($1,$2)", [username, password], function(err, result) {
        if (err) {
            return cb(err);
        } else {
            if (result.rows[0].user_id) {
                return cb(null, result.rows[0]);
            } else {
                //return cb(new Error('Authentication failure, username: ' + username));
                return cb(null, null);
            }
        }
    });
};

const findOrCreate = function() {
    // TODO: implement
};

module.exports = {
    findById: findById,
    findByProviderId: findByProviderId,
    findByEmail: findByEmail,
    updateUserLogin: updateUserLogin,
    createUser: createUser,
    createUserLogin: createUserLogin,
    findOrCreate: findOrCreate,
    findOrCreateByProviderID: findOrCreateByProviderID,
    authenticate: authenticate
};
