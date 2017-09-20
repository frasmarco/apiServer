// Utility functions for file analysis and persistence.
var db = require("../db");

/**
 * Handle file upload
 * 
 * @param {function} [cb]
 */
const handleFile = function(file, cb) {
    // req.file is the file
    // req.body will hold the text fields, if there were any
    console.log(file);
};

/**
 * Find a file knowing his md5 (UUID)
 *
 * @param {UUID} [md5]
 * @param {function} [cb]
 */
const findByMd5 = function(md5, cb) {
    db.query("SELECT * FROM file WHERE md5 = $1", [md5], function(err, result) {
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


// Create file 
const createFile = function(email, firstName, lastName, cb) {
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



module.exports = {
    handleFile: handleFile,
    findByMd5: findByMd5,
    createFile: createFile
};
