var mysql = require('mysql');

// 数据库信息
var connection = mysql.createConnection({
    host     : 'localhost',
    port     :13306,
    user     : 'root',
    password : 'root',
    database : 'pos'
});
var values = [
    ["null","null",null,null,null],null,null,
    ["null","null",null,null,null],null,null,
];
var sql = "INSERT INTO url(name`,`position`, `enable`,`create_user`,`create_time`,`update_user`,`update_time`) VALUES ?";
connection.query(sql, [values], function (err, rows, fields) {
    if(err){
                console.log('INSERT ERROR - ', err.message);
                return;
            }
            console.log("INSERT SUCCESS");
});