/**
 * Created by svenlee on 16/3/10.
 */

var redis = require("redis");
var client = redis.createClient();
var client2 = redis.createClient();     //用来检查2号数据库，检查每个用户一天一共扔了几次
var client3 = redis.createClient();
//var client = redis.createClient("127.0.0.1", 6379, null);

/*
// 每天无限制扔瓶子
exports.throw = function(bottle, callback){
    console.log(typeof bottle);
    bottle.time = bottle.time || Date.now();
    // 为每个漂流瓶随机生成一个id
    var bottleId = Math.random().toString(16);
    var type = {male: 0, female: 1};    //male:数据库0, female:数据库1
    client.SELECT(type[bottle.type], function(){
        // hash 类型保存漂流瓶对象
        //client.HMSET(bottleId, bottle, function(){    // this is for test
        client.HMSET(bottleId, bottle, function(err, result){
            if(err) {
                return callback({code: 0, msg: "过会儿再试试吧! "});
            }
            // 成功时返回1,并返回结果
            callback({code:1, msg:result});
            //callback({code:1, msg:"test"});   // this is for test
            // 生存期为1天
            client.EXPIRE(bottleId, 86400);
        });
    });
}
*/

// 每天有限制次数的扔瓶子, 10次
exports.throw = function(bottle, callback) {
    client2.SELECT(2, function(){       // 0male, 1female
        client2.SELECT(bottle.owner, function(err, result){
            if(result >= 10) {
                return callback({code:0, msg:"今天扔瓶子的机会已经用完了"});
            }
            // 未满10次
            client2.INCR(bottle.owner, function(){
                client2.TTL(bottle.owner, function(err, ttl){
                    if(ttl == -1) {     // -1表示该用户今天第一个瓶子
                        client2.EXPIRE(bottle.owner, 86400);
                    }
                });
            });

            //原代码块
             bottle.time = bottle.time || Date.now();
             // 为每个漂流瓶随机生成一个id
             var bottleId = Math.random().toString(16);
             var type = {male: 0, female: 1};    //male:数据库0, female:数据库1
             client.SELECT(type[bottle.type], function(){
             // hash 类型保存漂流瓶对象
             //client.HMSET(bottleId, bottle, function(){    // this is for test
             client.HMSET(bottleId, bottle, function(err, result){
             if(err) {
             return callback({code: 0, msg: "过会儿再试试吧! "});
             }
             // 成功时返回1,并返回结果
             callback({code:1, msg:result});
             //callback({code:1, msg:"test"});   // this is for test
             // 生存期为1天
             client.EXPIRE(bottleId, 86400);
             });
             });
        });
    });
}

/*
//
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
*/

exports.pick = function(info, callback){
    client3.SELECT(3, function(){
        client3.GET(info.user, function(err, result){
            if(err){
                return callback(err);
            }
            if(result >= 10) {
                return callback({code:0, msg:"今天的机会都用完了"});
            }
            client3.INCR(info.user, function(){
                client3.TTL(info.user, function(err, ttl){
                    if(ttl == -1){
                        client3.EXPIRE(info.user, 86400);
                    }
                });
            });
            //原代码块

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
