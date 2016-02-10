var mandrill = require('mandrill-api/mandrill');
var client = new mandrill.Mandrill('0sxAQ1bAhMZ6M2ixUMQZcA');
var mongo = require("../model/mongo.js");
var Q = require("q");
var ObjectId = require("mongodb").ObjectId;
var email_validator = require("email-validator");

function checkDupelicate(res, mail) {
  var defer = Q.defer();
  mongo.find("mails", {
    email: mail
  }, {}, (result) => {
    if (result.length) {
      res.json({
        status: "dupelicated"
      });
    } else {
      defer.resolve();
    }
  });
  return defer.promise;
}

function recordMail(mail) {
  var defer = Q.defer();
  mongo.insert("mails", {
    email: mail
  }, {}, (result) => {
    defer.resolve(result);
  });
  return defer.promise;
}

function recordDetail(body) {
  var defer = Q.defer();
  var token = body.token;
  var setRequest = {};
  for(var key in body){
    if(key!=="token"){
      setRequest[key] = body[key];
    }
  }
  mongo.update("mails", {
    _id: ObjectId(token)
  }, {
    $set: setRequest
  },{},(r)=>{
    defer.resolve();
  });
  return defer.promise;
}

module.exports = {
  index: function(req, res) {
    var mail = req.body.mail;
    if (!email_validator.validate(mail)) res.json({
      status: "invalid"
    });
    checkDupelicate(res, mail).then(() => {
        recordMail(mail).then((r) => {
          res.json({
            status: "success",
            token: r.ops[0]._id
          });
        });
      })
      //   var content =[
      //     {
      //       name:"MailAddr",
      //       content:"LimeStreem@gmail.com"
      //     }
      //   ];
      //   var message = {
      //     from_email : "support@amatelus.com",
      //     from_name: "AMATELUS.Inc",
      //     to:[
      //       {
      //         email:"LimeStreem@gmail.com",
      //         name:"Customer",
      //         type:"to"
      //       }
      //     ]
      //   };
      //   client.messages.sendTemplate({"template_name":"lp-register-confirm","template_content":content,message:message}, function(result) {
      //   console.log(result);
      //   }, function(e) {
      //   // Mandrill returns the error as an object with name and message keys
      //   console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
      //   // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
      // });
      // res.json({status:200});
  },
  detail: function(req, res) {
    recordDetail(req.body).then(()=>{
      res.json({
        status:"success"
      });
    });
  }
};
