var express = require('express');
var router = express.Router();

module.exports = function(app) {
  // GET, 捡一个漂流瓶，
  app.get('/', function (req, res) {
    //res.render('index', { title: 'Express' });  // old code
  });

  // POST,扔一个漂流瓶，返回JSON数据
  app.post("/", function(req, res) {
    if(!(req.body.owner && req.body.type && req.body.content)){
      if(req.body.type && (["male", "famle"].indexOf(req.body.type) === -1)){
        return res.json({code: 0, msg: "类型错误"});
      }
      else{
        return res.json({code: 0, msg: "信息不完整"});
      }
    }
    redis.throw(req.body, function(result){
      res.json(result);
    });
  });
}

/*
// GET home page.
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
module.exports = router;
*/
