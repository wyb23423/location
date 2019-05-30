var  libpath="../../node_modules/";
var config = require('../config');
var mongoose = require(libpath + 'mongoose');
mongoose.Promise = global.Promise;
mongoose.connect(config.dbPath);
module.exports = mongoose;
