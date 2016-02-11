var mandrill = require('mandrill-api/mandrill');
var client = new mandrill.Mandrill(process.env.MANDRILL);
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
      defer.reject();
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
    defer.resolve(result.insertedIds[0]);
  });
  return defer.promise;
}

function recordDetail(body) {
  var defer = Q.defer();
  var token = body.token;
  var setRequest = {};
  for (var key in body) {
    if (key !== "token") {
      setRequest[key] = body[key];
    }
  }
  mongo.update("mails", {
    _id: ObjectId(token)
  }, {
    $set: setRequest
  }, {}, (r) => {
    defer.resolve();
  });
  return defer.promise;
}

function sendConfirmMail(mail) {
  var defer = Q.defer();
  var message = {
    to: [{
      email: mail
    }]
  };
  client.messages.sendTemplate({
    template_name: "lp-register-confirm",
    template_content: [
    ],
    message: message,
  }, (result) => {
    console.info(result);
    defer.resolve();
  }, (err) => {
    console.warn(err);
    defer.reject();
  });
  return defer.promise;
}

var fs = require('fs');

module.exports = {
  index: function(req, res) {
    var indexPageHTML = fs.readFileSync('./index.html').toString();
    res.send(indexPageHTML);
  },
  apiIndex: function(req, res) {
    var mail = req.body.mail;
    if (!email_validator.validate(mail)) {
      res.json({
        status: "invalid"
      });
      return;
    }
    checkDupelicate(res, mail).then(() => {
      var id;
      recordMail(mail).then((_id) => {
        id = _id;
        return sendConfirmMail(mail);
      }).then(() => {
        res.json({
          status: "success",
          token: id
        })
      });
    }).catch((err) => {
      console.error(err);
    });
  },
  apiDetail: function(req, res) {
    recordDetail(req.body).then(() => {
      res.json({
        status: "success"
      });
    });
  }
};
