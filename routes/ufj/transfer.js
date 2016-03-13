var express = require('express');
var router = express.Router();
var request = require('superagent');

/* GET users listing. */
router.post('/', function(req, res, next) {
  request
    .post('http://demo-ap08-prod.apigee.net/v1/accounts/' + req.body.account_id + '/transfers')
    .set('Authorization', 'Bearer ' + req.body.token)
    .send({
      amount: req.body.amount,
      payee: {
        account_id: req.body.target_account_id,
      },
    })
    .end(function(err, res_) {
      if (err) {
        res.status(err.status).send(res_.body);
      } else {
        res.send(res_.body);
      }
    });
});

module.exports = router;

