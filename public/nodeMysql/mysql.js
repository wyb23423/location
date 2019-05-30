const mysql = require("mysql");

var msyqlJson = [
  ['FFFFFFFF', 0, 4, 4, '测试', null, '192.168.1.111', 1, 1837, 2114, 230, '测试', null, null, 22, '测试', 1, 0, 0, 1, '0.00050025463366155432', null, null, null, null, null]
  , ['0A000032', 0, 4, 4, '测试', null, '192.168.1.21', 0, 503, 1722, 230, '测试', null, null, 22, '测试', 1, 0, 0, 1, '0.00000000329521064623', null, null, null, null, null]
  , ['A0000026', 0, 4, 4, '测试', null, '192.168.1.26', 0, 503, 2114, 230, '测试', null, null, 22, '测试', 1, 0, 0, 1, '0.00000000329521064623', null, null, null, null, null]
  , ['0A000038', 0, 4, 4, '测试', null, '192.168.1.22', 0, 1795, 1722, 230, '测试', null, null, 22, '测试', 1, 0, 0, 1, '0.00000000329521064623', null, null, null, null, null]

]
var mapsqljson = [
  ['办公室', "[[0,0],[0,2800],[3000,2800],[3000,0]]",0,"/image/dae460ed45794249bac9ba5c789132e7.fmap", '测试', null, '测试',null]
]
var mysqlArr=[],maparr;

function SELECTweb(){
    var connection = mysql.createConnection({     
      host: "localhost",
      user: 'root',
      port: "13306",
      password: "root",
      database: "pos"
    }); 
    
    connection.connect();
    
    var  sql = 'SELECT * FROM pos_base_station';
    //查
    connection.query(sql,function (err, result) {
            var num=(result.length/4)-1;
            num=num.toString(16);
            var s=nums(num);
            for(var a=0;a<msyqlJson.length;a++){
               msyqlJson[a][1]=s;
               mapsqljson[0][2]=s;
               maparr=mapsqljson[0]
               mysqlArr.push(msyqlJson[a])
            }
            fos()
});
    
    connection.end();
}

var addSql = 'INSERT INTO pos_base_station(id,base_no,group_code,min_base_size,group_base_size,name,description,ip,main,coordx,coordy,coordz,location,upload_type,install_time,zone,owner,work,lose_rate,alarm,algorithm_type,time_correction_value,create_user,create_time,update_user,update_time) VALUES(0,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ';
var addSql2 = 'INSERT INTO pos_map(id,name,margin,group_code,filepath,create_user,create_time,update_user,update_time) VALUES(0,?,?,?,?,?,?,?,?) ';

function addanchor(i,arr,sql) {
  var connection = mysql.createConnection({
    host: "localhost",
    user: 'root',
    port: "13306",
    password: "root",
    database: "pos"
  })
  connection.connect();
  // console.log(arr)
  connection.query(addSql,arr, function (err, result) {
    if (err) {
      console.log('[SELECT ERROR] - ', err.message);
      return;
    }
    // console.log('--------------------------SELECT----------------------------');
    // console.log(result);
    // console.log('------------------------------------------------------------\n\n');
  });
  connection.end();
}
function addmap(i,arr) {
  var connection = mysql.createConnection({
    host: "localhost",
    user: 'root',
    port: "13306",
    password: "root",
    database: "pos"
  })
  connection.connect();
  console.log(arr,addSql2)
  connection.query(addSql2,arr, function (err, result) {
    if (err) {
      console.log('[SELECT ERROR] - ', err.message);
      return;
    }
    console.log('--------------------------SELECTMAP----------------------------');
    console.log(result);
    console.log('------------------------------------------------------------\n\n');
  });
  connection.end();
}
var num = 1;
function nums(con) {
  var len = 4;//显示的长度
  var a=parseInt(con,16);
  num = parseInt( a, 10) + 1;
  num = num.toString(16);
  while (num.length < len) {
    num = '0' + num+"";
  }
  return  num
}
function init() {
  var c = 0
  for (let j = 0; j < mysqlArr.length; j++) {
    mysqlArr[j][1] =nums(mysqlArr[j][1]).toString(16);
    addanchor(c,mysqlArr[j],addSql)
  }
  mapsqljson[0][2]=nums(mapsqljson[0][2]).toString(16);
  addmap(0,mapsqljson[0])
}
function fos(){
  for (let a = 0; a <400; a++) {
    setTimeout(function(){
        init(a) 
       
    },100*a)
  }
}

SELECTweb()