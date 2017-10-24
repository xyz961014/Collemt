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
    recordingdone: [],
    userInfo: {},
    hasUserInfo: false,
    history: [],
    percentage: 0,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),

  },
  //事件处理函数
  onLoad: function () {
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
    //从globalData同步历史数据
    this.setData({
      history: wx.getStorageSync('history')
    })
    var scor = 0;
    var usage = 0;
    for (var i of wx.getStorageSync('history')) {
      if(i.record.uploaded) {
        scor += i.record.score;
      }
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
  }
})
