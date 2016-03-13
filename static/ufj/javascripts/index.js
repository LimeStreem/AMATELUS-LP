var apiRoot = "https://demo-ap08-prod.apigee.net/v1";

function apiGet(addr) {
  return superagent
    .get(apiRoot + addr)
    .set('Authorization', 'Bearer ' + window.apiToken)
}

function apiPost(addr) {
  return superagent
    .post(apiRoot + addr)
    .set('Authorization', 'Bearer ' + window.apiToken)
}

api = {

};

if (window.location.hash) {
  var regex = /access_token=([^&]+)/;
  var token = regex.exec(window.location.hash)[1];
  window.apiToken = token;
} else {
  throw new Error("Token was not found in header");
}

api.users = function(id) {
  return new Primise((request, reject) => {
    if (!id) {
      apiGet("/users").end((err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(JSON.parse(res.text));
        }
      });
    } else {
      apiGet("/users/" + id).end((err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(JSON.parse(res.text));
        }
      });
    }
  });
}

api.users.__proto__.me = function() {
  return new Promise((resolve, reject) => {
    apiGet("/users/me").end((err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(res.text));
      }
    });
  });
}

api.accounts = function(id) {
  return new Promise((resolve, reject) => {
    if (!id) {
      apiGet("/accounts").end((err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(JSON.parse(res.text));
        }
      });
    } else {
      apiGet("/accounts/" + id).end((err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(JSON.parse(res.text));
        }
      });
    }
  });
}

api.accounts.__proto__.transactions = function(id) {
  return new Promise((resolve, reject) => {
    apiGet("/accounts/" + id + "/transactions").end((err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(res.text));
      }
    });
  });
}

api.accounts.__proto__.transfers = function(id) {
  return new Promise((resolve, reject) => {
    apiGet("/accounts/" + id + "/transfers").end((err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(res.text));
      }
    });
  });
}

api.accounts.__proto__.sendTransfers = function(id, params) {
  return new Promise((resolve, reject) => {
    apiPost("/accounts/" + id + "/transfers", params).end((err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(res.text));
      }
    });
  });
}

api.accounts.__proto__.acceptTransfers = function(id, transferId, params) {
  return new Promise((resolve, reject) => {
    apiPost("/accounts/" + id + "/transfers/" + transferId, params).end((err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(res.text));
      }
    });
  });
}

api.users.__proto__.transfer_patterns = {
  get: function(id, templateId) {
    return new Promise((resolve, reject) => {
      if (!templateId) {
        apiGet("/users/" + id + "/transfer-patterns").end((err, res) => {
          if (err) {
            reject(err);
          } else {
            resolve(JSON.parse(res.text));
          }
        });
      } else {
        apiGet("/users/" + id + "/transfer-patterns/"+templateId).end((err, res) => {
          if (err) {
            reject(err);
          } else {
            resolve(JSON.parse(res.text));
          }
        });
      }
    });
  }
};

APIWrapper = function () {};

APIWrapper.prototype.setToken = function (token, me) {
  this.token = token;
  this.cb(me);
};

/**
 * APIが使えるようになった時に呼ばれるコールバックを登録します
 * コールバックは自分自身のユーザー情報を第1引数にとって呼ばれます
 * @param  {Function} cb コールバック
 * @return {[type]}      [description]
 */
APIWrapper.prototype.load = function (cb) {
  this.cb = cb;
};

/**
 * 振り込みを行います
 * @param  {[type]}   account_id        振込元の自分のアカウントid
 * @param  {[type]}   target_account_id 振込先のアカウントid
 * @param  {[type]}   amount            振込金額
 * @param  {Function} cb                取得終わったらここが実行されるよ
 * @return {[type]}                     もろもろオブジェクト
 */
APIWrapper.prototype.transfer = function (account_id, target_account_id, amount, cb) {
  cb = cb || function () {};
  console.log('req');
  superagent
    .post('/ufj/transfer')
    .send({
      account_id: account_id,
      target_account_id: target_account_id,
      amount: amount,
      token: this.token,
    })
    .end(function (err, res) {
      if (err) {
        console.error(err);
        cb(err, res.body);
      } else {
        cb(null, res.body);
      }
    });
};

/**
 * アカウントidを指定して残額を取得する
 * @param  {number|string} account_id アカウントid
 * @param  {Function} cb              取得終わったらここが実行されるよ
 * @return {number}                   残額(数値)
 */
APIWrapper.prototype.rest = function (account_id, cb) {
  cb =  cb || function () {};
  api.users.me().then(function(data) {
    data.my_accounts.forEach(function(v) {
      if (v === account_id.toString()) {
        cb(null, v.balance);
      }
    });
  }).catch(function(err) {
    console.error(err);
    cb(err, null);
  });
};

api.users.me().then(function (m) {
  console.log(m);
  UFJAPI.setToken(window.apiToken, m);
});

// expose
window.UFJAPI = new APIWrapper();

// test
// UFJAPI.load(function() {
//   console.log('load');
//   // UFJAPI.transfer(123, 123, 1000, function (err, res) {
//   //   console.log(err, res);
//   // });
//   UFJAPI.rest(1111111, function (err, res) {
//     console.log(err, res);
//   });
// });
