const dbFunctions = require('../db/sociodemoQueryExecutionner'); //DataBase functions.

/**
 * Checks through database that the given token and ips are in database.
 *  If not, throw error.
 * 
 * @param {string} token
 * @param {string} ip
 * @returns {Boolean}
 */
function checkToken(token, ip) {
  return dbFunctions.asyncCheckToken(token, ip).then(rows => {
    if (rows.length === 1) {
      return true;
    }
    return false;
  });
}

function verifyToken(req, res, next) {
  let token = req.query.token;
  console.log(token);

  if (!token) {
    return res.status(403).json({auth: false, message: 'No token provided.'});
  }
  else {
    let ip = req.connection.remoteAddress; //IP ? IPv4 ? IPv6 ?
    if (ip === '::1') { //Differentiate IPv4 / IPv6 (still a bit wip).
      ip = '127.0.0.1';
    }
    ip = '127.0.0.1';
    checkToken(token, ip).then(result => {
      if (result) {
        next();
      }
      else {
        return res.status(403).json({auth: false, message: 'Failed to authenticate token.'});
      }
    });

  }
}

module.exports = verifyToken;