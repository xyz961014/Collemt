const app = getApp();
const util = require('../../utils/util.js')
var Timerstart = function(){
  var curP = getCurrentPages();
  var thisp = curP[curP.length - 1];
  var timerID = setInterval(function () {
    thisp.setData({
      ms: thisp.data.ms + 10
    })
    if (thisp.data.ms === 1000) {
      thisp.setData({
        second: thisp.data.second + 1,
        ms: 0
      })
    }
    thisp.setData({
      durstring: util.timestring(thisp.data.second, thisp.data.ms)
    })
  }, 10);
  thisp.setData({
    TimerID: timerID
  })
};

Page({

  /**
   * 页面的初始数据
   */
  data: {
    text: "hahaha",
    textID: 0,
    time: "",
    duration: 0,
    TimerID: 0,
    textdur: 0,
    score: 0,
    savepath: "",
    uploadurl: "",
    hasUserInfo: false,
    second: 0,
    ms: 0,
    durstring: "0.000",
    recordingbool: false
  },
  recordbuttontap: function(){
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.record']) {
          wx.authorize({
            scope: 'scope.record',
            success() {
              // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问

              wx.startRecord({
                success: function(res) {
                  var curP = getCurrentPages();
                  var thisp = curP[curP.length - 1];
                  wx.saveFile({
                    tempFilePath: res.tempFilePath,
                    success: function (res) {
                      thisp.setData({
                        savepath: res.savedFilePath
                      })
                    }
                  });
                }
              });
              var TimerID = Timerstart();                           
            }
          })
        } else {
          wx.startRecord({
            success: function (res) {
              var curP = getCurrentPages();
              var thisp = curP[curP.length - 1];
              wx.saveFile({
                tempFilePath: res.tempFilePath,
                success: function(res) {
                  thisp.setData({
                    savepath: res.savedFilePath
                  })
                }
              });
            }
          });
          var timerID = Timerstart();
        }
      }
    });
    this.setData({
      recordingbool: true
    });
  },
  stopbuttontap: function() {
    wx.stopRecord()
    clearInterval(this.data.TimerID);//停止计时
    //保存本次数据
    this.setData({
      recordingbool: false,
      duration: this.data.second + this.data.ms / 1000,
      time: util.formatTime(new Date(Date.now())),
      score: this.data.textdur - Math.abs(1000 * this.data.second + this.data.ms -this.data.textdur) * 0.8     
    })
    wx.getFileInfo({
      filePath: this.data.savepath,
      success: function(res) {
        console.log(res.size)
      }
    })
    if (this.data.score < 0.6 * this.data.textdur){
      //录音时长不符合要求打回去
      wx.showModal({
        title: 'Warn',
        content: 'out of range(0.5dur~1.5dur)',
        showCancel: false,
        success: function() {
          var curP = getCurrentPages();
          var thisp = curP[curP.length - 1];
          wx.removeSavedFile({
            filePath: thisp.data.savepath,
          })
          thisp.setData({
            time: "",
            savepath: "",
            duration: 0,
            TimerID: 0,
            score: 0,
            second: 0,
            ms: 0,
            durstring: "0.000"
          })
        }
      })
    } 

  },
  playvoice: function() {
    wx.playVoice({
      filePath: this.data.savepath
    })
  },
  pausevoice: function () {

  },
  stopvoice: function () {

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    }
    if (!this.data.hasUserInfo) {
      this.setData({
        text: "45121"
      })
      wx.showModal({
        title: 'UserInfoErr',
        content: 'pls login first',
        showCancel: false,
        success: function(){
          wx.switchTab({
            url: '/pages/index/index'
          })
        }
      })
    } else {
      //加载语料信息
      this.setData({
        text: "我爱语音翻译我爱语音翻译我爱语音翻译我爱语音翻译我爱语音翻译我爱语音翻译我爱语音翻译我爱语音翻译",
        textID: 1,
        textdur: 10000,
        uploadurl: "null"
      });
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})