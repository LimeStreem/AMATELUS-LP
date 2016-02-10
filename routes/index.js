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
    defer.resolve(result);
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
  var templateContent = [{
    name: "MailAddr",
    content: mail
  }];
  var message = {
    to: [{
      email: mail
    }]
  };
  client.messages.sendTemplate({
    template_name: "lp-register-confirm",
    template_content: templateContent,
    message: message
  }, (result) => {
    console.info(result);
    defer.resolve();
  }, (err) => {
    console.warn(err);
    defer.resolve();
  });
  return defer.promise;
}

module.exports = {
  index: function(req, res) {
    var mail = req.body.mail;
    if (!email_validator.validate(mail)) {
      res.json({
        status: "invalid"
      });
      return;
    }
    checkDupelicate(res, mail).then(() => {
        return recordMail(mail);
      },
      () => {
        return;
      }).then(() => {
      return sendConfirmMail(mail);
    }).then(( => {
      res.json({
        status: "success"
      })
    }));

  },
  detail: function(req, res) {
    recordDetail(req.body).then(() => {
      res.json({
        status: "success"
      });
    });
  }
};
