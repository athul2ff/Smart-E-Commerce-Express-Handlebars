const dotenv = require('dotenv');
dotenv.config();

module.exports ={
    accountsid:process.env.accountsid,
    authtoken:process.env.authtoken,
    serviceid:process.env.serviceid
}