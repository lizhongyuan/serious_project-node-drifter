/**
 * Created by svenlee on 16/3/10.
 */

var request = require("request");

for(var i = 1; i <= 5; i++){
    (function(i){
        request.post({
            url: "http://127.0.0.1:6379",
            json: {
                "owner":"bottle" + i,
                "type":"male",
                "content":"content" + i
            }
        });
    })(i);
}

/*
for( var i = 6; i <=10; i++) {
    (function(i){
        request.post({
            url:"http://127.0.0.1:6379",
            json: {
                "owner":"bottle" + i,
                "type":"female",
                "content":"content" + i
            }
        })
    })(i);
}
*/
