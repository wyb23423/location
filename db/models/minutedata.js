var mongoose = require('../mongoose');
var Schema = mongoose.Schema;
var minutedataSchema = new Schema({
  param:Number
});

var minutedata = mongoose.model('Minutedata',minutedataSchema);
module.exports = minutedata;
