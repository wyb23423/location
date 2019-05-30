var mongoose = require('../mongoose');
var Schema = mongoose.Schema;
var dataSchema = new Schema({
  param:Number
});

var data = mongoose.model('Data',dataSchema);
module.exports = data;
