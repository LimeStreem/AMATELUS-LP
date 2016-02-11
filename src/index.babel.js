import $ from 'jquery';

const PHRASES = [
  '創りたい',
  '逢いたい',
  '叶えたい',
  '見たい',
  '住みたい',
  '行きたい',
  '食べたい',
  '知りたい',
  '買いたい',
  '乗りたい',
  '飛びたい',
];

class Submit {
  constructor() {
    this.token = '';
    this.validation = {};
  }
  run() {
    $('.overlay-submit-button').bind('click', this.submitFuncOverlay.bind(this));
    $('.overlay-cancel-button').bind('click', () => {
      this.hideOverlay();
    });
    $('.subscription-button').bind('click', this.submitFunc.bind(this));
    $('.subscription-input').bind('change', this.subscriptionValidation.bind(this));
    $('.subscription-input').bind('keydown', (e) => {
      if (e.keyCode === 13) {
        this.submitFunc.bind(this)(e);
      }
    });
    $('.number-validation').bind('change', (e) => {
      const value = $(e.currentTarget).val();
      const name = $(e.currentTarget).attr('name');
      if ($.isNumeric(value) || value === '') {
        $(e.currentTarget).parent().find('.validation-text').text('');
        this.validation[name] = true;
      } else {
        $(e.currentTarget).parent().find('.validation-text').text('数値を入力してください');
        this.validation[name] = false;
      }
    });
  }
  subscriptionValidation(e) {
    const elem = $(e.currentTarget).parents('.subscription');
    const emailAdress = elem.find('.subscription-input').val();
    if (emailAdress.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)) {
      this.showValidationMessage(elem, '');
      return emailAdress;
    } else {
      this.showValidationMessage(elem, '無効なメールアドレスです');
      return null;
    }
  }
  submitFunc(e) {
    const elem = $(e.currentTarget).parents('.subscription');
    const emailAdress = this.subscriptionValidation(e);
    if (emailAdress) {
      this.showValidationMessage(elem, '');
      const button = $(e.currentTarget);
      this.blockForm(button, true);
      this.firstAjax(emailAdress)
        .then((res) => {
          const defer = new $.Deferred();
          this.blockForm(button, false);
          this.token = res.token;
          defer.resolve(res);
        }, (res) => {
          this.blockForm(button, false);
          this.firstAjaxErrorHandling(elem, res);
        })
        .then(this.showOverlay.bind(this));
    }
  }
  submitFuncOverlay(e) {
    const isValid = Object.keys(this.validation).map((k) => {
      const v = this.validation[k];
      return v === true || typeof v === 'undefined' ? true : false;
    }).every((v) => {
      return v;
    });
    if (isValid) {
      this.showOverlayMessage('');
      const obj = {};
      $('.default-overlay .textfield').each((i, el) => {
        obj[$(el).attr('name')] = $(el).val();
      });
      const button = $(e.currentTarget);
      this.blockForm(button, true);
      this.secondAjax(this.token, obj)
        .then((res) => {
          const defer = new $.Deferred();
          this.blockForm(button, false);
          defer.resolve(res);
        }, this.secondAjaxErrorHandling.bind(this))
        .then(this.showCompleted)
        .then(this.hideOverlay.bind(this));
    } else {
      this.showOverlayMessage('各フォームが適切に入力されていません');
    }
  }
  firstAjaxMock(emailAdress) {
    const defer = new $.Deferred();
    setTimeout(() => {
      let res = {};
      // res = {
      //   status: 'invalid',
      // };
      // res = {
      //   status: 'dupelicated',
      // };
      // res = {
      //   status: 'error',
      // };
      res = {
        status: 'success',
        token: 123456,
      };
      if (res.status === 'success') {
        defer.resolve(res);
      } else if (res.status === 'invalid' || res.status === 'dupelicated') {
        defer.reject(res);
      } else {
        defer.reject(res);
      }
    }, 1000);
    return defer.promise();
  }
  secondAjaxMock(token, obj) {
    const defer = new $.Deferred();
    setTimeout(() => {
      let res = {};
      // res = {
      //   status: 'error',
      // };
      res = {
        status: 'success',
      };
      if (res.status === 'success') {
        defer.resolve(res);
      } else {
        defer.reject(res);
      }
    }, 1000);
    return defer.promise();
  }
  firstAjax(emailAdress) {
    const defer = new $.Deferred();
    const formData = {
      mail: emailAdress,
    };
    $.ajax({
      url: '/api',
      type: 'post',
      data: formData,
      success: (data, s) => {
        if (data.status === 'success') {
          defer.resolve(data);
        } else if (data.status === 'invalid' || data.status === 'dupelicated') {
          defer.reject(data);
        } else {
          defer.reject(data);
        }
      },
      error: (err, s) => {
        console.error(s, err);
        defer.reject({
          status: 'error',
          message: s,
        });
      },
    });
    return defer.promise();
  }
  secondAjax(token, obj) {
    const defer = new $.Deferred();
    const formData = obj;
    formData.token = token;
    $.ajax({
      url: '/api/detail',
      type: 'post',
      data: formData,
      success: (data, s) => {
        if (data.status === 'success') {
          defer.resolve(data);
        } else {
          defer.reject(data);
        }
      },
      error: (err, s) => {
        console.error(s, err);
        defer.reject({
          status: 'error',
          message: s,
        });
      },
    });
    return defer.promise();
  }
  firstAjaxErrorHandling(elem, res) {
    let msg = '';
    switch (res.status) {
    case 'invalid':
      msg = '無効なメールアドレスです';
      break;
    case 'dupelicated':
      msg = '既に登録済みです';
      break;
    case 'error':
      msg = '通信エラーが発生しました';
      break;
    default:
      msg = '予期しないエラーが発生しました';
    }
    this.showValidationMessage(elem, msg);
  }
  secondAjaxErrorHandling(res) {
    let msg = '';
    switch (res.status) {
    case 'error':
      msg = '通信エラーが発生しました';
      break;
    default:
      msg = '予期しないエラーが発生しました';
    }
    this.showOverlayMessage(msg);
  }
  blockForm(jq, status) {
    if (status) {
      jq.parent().find('.button').addClass('blocked');
      jq.parent().find('.textfield').addClass('blocked');
    } else {
      jq.parent().find('.button').removeClass('blocked');
      jq.parent().find('.textfield').removeClass('blocked');
    }
  }
  showOverlay(res) {
    const defer = new $.Deferred();
    $('.default-overlay .textfield').val('');
    $('.default-overlay').show();
    $('.completed-overlay').hide();
    $('.overlay').fadeIn(500);
    $({
      radius: 0,
      _opacity: 0,
    }).animate({
      radius: 30,
      _opacity: 1,
    }, {
      duration: 500,
      easing: 'swing',
      progress: this.animationProgress,
      complete: () => {
        defer.resolve(res);
      },
    });
  }
  hideOverlay(res) {
    const defer = new $.Deferred();
    $('.subscription-input').val('');
    $('.overlay').fadeOut(500);
    $({
      radius: 30,
      _opacity: 1,
    }).animate({
      radius: 0,
      _opacity: 0,
    }, {
      duration: 500,
      easing: 'swing',
      progress: this.animationProgress,
      complete: () => {
        defer.resolve(res);
      },
    });
  }
  showCompleted(res) {
    const defer = new $.Deferred();
    $('.overlay-window').fadeOut(250, () => {
      $('.default-overlay').hide();
      $('.completed-overlay').show();
      $('.overlay-window').fadeIn(250);
    });
    $('.overlay-ok-button').one('click', () => {
      defer.resolve(res);
    });
    return defer.promise();
  }
  animationProgress(anim) {
    $('.wrapper').css({
      '-webkit-filter': `blur(${anim.elem.radius}px)`,
      '-moz-filter': `blur(${anim.elem.radius}px)`,
      filter: `blur(${anim.elem.radius}px)`,
    });
    $('.overlay').css({
      opacity: anim.elem._opacity,
    });
  }
  showValidationMessage(elem, msg) {
    elem.find('.subscription-validation-text').text(msg);
  }
  showOverlayMessage(msg) {
    $('.overlay-status-text').text(msg);
  }
}

$(() => {
  // phrase animation
  {
    const elem = $('.phrase-change-inside');
    let insideFirst = true;
    let phraseCount = 1;
    $(elem[1]).css('opacity', 0);
    setInterval(() => {
      $(elem[insideFirst ? 0 : 1]).animate({
        opacity: 0,
        top: '30px',
      });
      $(elem[!insideFirst ? 0 : 1])
        .text(PHRASES[phraseCount])
        .css({
          top: '-30px',
        })
        .animate({
          opacity: 1,
          top: '0px',
        });
      phraseCount += 1;
      if (phraseCount >= PHRASES.length) {
        phraseCount = 0;
      }
      insideFirst = !insideFirst;
    }, 4000);
  }

  // email
  (new Submit()).run();
});
