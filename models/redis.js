/**
 * Created by svenlee on 16/3/10.
 */

var redis = require("redis");
var client = redis.createClient();
//var client = redis.createClient("127.0.0.1", 6379, null);

exports.throw = function(bottle, callback){
    console.log(typeof bottle);
    bottle.time = bottle.time || Date.now();
    // 为每个漂流瓶随机生成一个id
    var bottleId = Math.random().toString(16);
    var type = {male: 0, female: 1};    //male:数据库0, female:数据库1
    client.SELECT(type[bottle.type], function(){
        // hash 类型保存漂流瓶对象
        client.HMSET(bottleId, bottle, function(err, result){
            if(err) {
                return callback({code: 0, msg: "过会儿再试试吧! "});
            }
            // 成功时返回1,并返回结果
            callback({code:1, msg:result});
            // 生存期为1天
            client.EXPIRE(bottleId, 86400);
        });
    });
}

exports.pick = function(info, callback) {
    // 20%概率捡到海星
    if( Math.random() <= 0.2 ) {
        return callback({code: 0, msg:"海星"});
    }
    var type = {all:Math.round(Math.random()), male:0, female: 1};
    info.type = info.type || "all";
    // 根据请求的瓶子类型到不同的数据库中取
    client.SELECT(type[info.type], function(){
        client.RANDOMKEY(function(err, bottleId){
            if(!bottleId){
                return callback({code:0, msg:"海星"});
            }
            // 根据漂流瓶ID取到漂流瓶完整信息
            client.HGETALL(bottleId, function(err, bottle){
                if(err) {
                    return callback({code:0, msg:"漂流瓶破损了..."});
                }
                callback({code:1, msg:bottle});
                client.DEL(bottleId);
            });
        });
    });
}

exports.throwback = function(bottle, callback){
    var type = {male:0, female:1};
    var bottleId = Math.random().toString(16);

    client.SELECT(type[bottle.type], function(){
        //以hash类型保存漂流瓶对象
        client.HMSET(bottleId, bottle, function(err, result){
            if(err) {
                return callback(err);
            }
            callback({code:1, msg:result});
            client.PEXPIRE(bottleId, bottle.time + 86400000 - Date.now());
        });
    })
}
