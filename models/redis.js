/**
 * Created by svenlee on 16/3/10.
 */

var redis = require("redis");
var client = redis.createClient();
//var client = redis.createClient(port, host, options);

exports.throw = function(bottle, callback){
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
