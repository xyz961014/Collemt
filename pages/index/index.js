//index.js
//获取应用实例
const app = getApp()
var recordingdone = {
  score: 0,
  time: new Date(),
  duration: 0,
  text: "",
  size: 0,
  url: "",
  textID: 0
}

Page({
  data: {
    score: 0,
    userInfo: {},
    hasUserInfo: false,
    history: [],
    myopenid:'',
    numfinished: 0,
    numall: 0,
    numpackage: '未获取',
    percentage: 0,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canNewpackage: true

  },
  //事件处理函数
  onLoad: function () {
    if (wx.getStorageSync('MyOpenid').openid) {
      this.setData({
        myopenid: wx.getStorageSync('MyOpenid').openid
      })
    } else {
      app.openidCallback = res => {
        this.setData({
          myopenid: res.openid
        })
      }
    }
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
    //匹配的用户信息向本地缓存中传入历史记录

  },
  historytap: function(e) {
    var num = wx.setStorageSync('num', e.currentTarget.dataset.num);
    wx.navigateTo({
      url: '/pages/logs/logs'
    })
  },
  onShow: function() {
    //从缓存同步历史数据
    if (!wx.getStorageSync('pkgon')) {
      this.setData({
        canNewpackage: true
      })
    }
    else {
      this.setData({
        canNewpackage: false
      })
    }
    this.setData({
      history: wx.getStorageSync('history'),
      numfinished: wx.getStorageSync('history').length,
      numall: (wx.getStorageSync('data').packages || []).length
    })
    var scor = 0;
    var usage = 0;
    for (var i of wx.getStorageSync('history')) {
        scor += i.record.score;
      
      if(i.record.savepath){
        usage += i.record.size;
      }
    }
    this.setData({
      score: scor,
      percentage: (usage / 102.4).toFixed(1)
    })
  },
  getUserInfo: function(e) {
    app.globalData.userInfo = e.detail.userInfo;
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
    //假装在这里注册
    wx.getStorage({
      key: 'MyOpenid',
      success: function (res) {
        wx.request({
          url: 'https://' + app.config.host + '/onSignup',
          method: 'GET',
          data: {
            openid: res.data.openid,
            gender: 'strange',
            address: 'Zhejiang-Hanzhou',
            phonenumber: '0'
          },
          success: function (res2) {
            if (!res2.data.stat) {
              wx.setStorageSync('MyOpenid', res2.data);
              console.log(res2.data);
            } else {
              console.log(res2.data);
            }
          }
        })
      },
    })
  },
  uploadpackage: function() {
    if (this.data.history.length !== 5) {
      wx.showModal({
        title: '错误',
        content: '有尚未完成的任务',
        showCancel: false
      });
      return;
    }
    //上传任务包
    this.setData({
      canNewpackage: true
    })
    wx.setStorageSync('history', []);
    wx.setStorageSync('pkgon', false);
    wx.setStorageSync('data', {})
    this.setData({
      history: [],
      numfinished: 0,
      numpackage: "未获取",
      numall: 0
    })
  },
  newpackage: function() {
    //获取新任务包
    var datastr = {};
    wx.request({
      url: 'https://' + app.config.host + '/onFetch',
      method: 'GET',
      data: {
        openid: this.data.myopenid
      },
      success: function (res) {
        console.log(res.data);
        datastr = res.data;
        
      }
    });

    datastr = {
      'pkgid': 91,
      'text': '录一段话吧录一段话吧录一段话吧录一段话吧录一段话吧\n录两段话吧录两段话吧录两段话吧录两段话吧录两段话吧\n录三段话吧录三段话吧录三段话吧录三段话吧录三段话吧\n录四段话吧录四段话吧录四段话吧录四段话吧录四段话吧\n录五段话吧录五段话吧录五段话吧录五段话吧录五段话吧'
    };
    var textlist = datastr.text.split('\n');
    var textdata = {
      packageID: datastr.pkgid,
      packages: []
    }
    var packages = [];
    for (var n = 0;n < textlist.length;n++) {
      var item = {
        textID: n + 1,
        text: textlist[n],
        textdur: textlist[n].length * 300
      };
      packages.push(item);
    }
    textdata.packages = packages;
    /*var data = {
      'packageID': 99,
      'packages': [
        {
          'textID': 1,
          'text': '录一段话吧录一段话吧录一段话吧录一段话吧录一段话吧',
          'textdur': 5000,
        },
        {
          'textID': 2,
          'text': '录两段话吧录两段话吧录两段话吧录两段话吧录两段话吧',
          'textdur': 5000
        },
        {
          'textID': 3,
          'text': '录三段话吧录三段话吧录三段话吧录三段话吧录三段话吧',
          'textdur': 5000
        },
        {
          'textID': 4,
          'text': '录四段话吧录四段话吧录四段话吧录四段话吧录四段话吧',
          'textdur': 5000
        },
        {
          'textID': 5,
          'text': '录五段话吧录五段话吧录五段话吧录五段话吧录五段话吧',
          'textdur': 5000
        },
      ]
    };*/
    wx.setStorageSync('data', textdata);
    wx.setStorageSync('pkgon', true)
    this.setData({
      canNewpackage: false,
      numpackage: textdata.packageID,
      numall: textdata.packages.length
    });
  }
})
