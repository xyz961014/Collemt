const app = getApp();
const util = require('../../utils/util.js')
//计时函数
var Timerstart = function(){
  var curP = getCurrentPages();
  var thisp = curP[curP.length - 1];//获取当前页面
  var timerID = setInterval(function () {
    thisp.setData({
      'view.ms': thisp.data.view.ms + 10
    });//每隔10ms更新数据
    if (thisp.data.view.ms === 1000) {
      thisp.setData({
        'view.second': thisp.data.view.second + 1,
        'view.ms': 0
      })
    }
    thisp.setData({
      'view.durstring': util.timestring(thisp.data.view.second, thisp.data.view.ms)
    });//得到输出的时间字符串
  }, 10);
  thisp.setData({
    'view.TimerID': timerID
  })//存储计时器ID，之后停的时候用
};

Page({

  /**
   * 页面的初始数据
   */
  data: {
    text:{
      text: "",//文本
      textID: 0,//文本ID
      textdur: 0,//文本建议时长
      uploadurl: "" //上传路径
    },
    record: {
      time: "", // 录制时间
      duration: 0, //录制时长
      score: 0, //得分
      savepath: "", //录音文件的保存路径
    },
    view: {
      second: 0, // 秒数
      ms: 0, //毫秒数
      TimerID: 0, //计时器ID
      durstring: "0.000" //计时字符串
    },
    hasUserInfo: false, //是否获取用户信息
    recordingbool: false //是否正在录音
  },
  recordbuttontap: function(){
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.record']) {
          wx.authorize({
            scope: 'scope.record',
            success() {
              // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
              var curP = getCurrentPages();
              var thisp = curP[curP.length - 1];
              wx.startRecord({
                success: function(res) {
                  
                  wx.saveFile({
                    tempFilePath: res.tempFilePath,
                    success: function (res) {
                      //成功调用时保存文件路径
                      thisp.setData({
                        'record.savepath': res.savedFilePath
                      })
                    }
                  });
                }
              });
              thisp.setData({
                recordingbool: true
              });
              Timerstart();                       
            }
          })
        } else {
          var curP = getCurrentPages();
          var thisp = curP[curP.length - 1];
          wx.startRecord({
            success: function (res) {
              wx.saveFile({
                tempFilePath: res.tempFilePath,
                success: function(res) {
                  //成功调用时保存文件路径
                  thisp.setData({
                    'record.savepath': res.savedFilePath,
                  })
                }
              });
            }
          });
          thisp.setData({
            recordingbool: true
          });
          Timerstart();
        }
      }
    });
    this.setData({
      recordingbool: true
    });
  },
  stopbuttontap: function() {
    wx.stopRecord()
    clearInterval(this.data.view.TimerID);//停止计时
    //保存本次数据
    this.setData({
      recordingbool: false,
      'record.duration': this.data.view.second + this.data.view.ms / 1000,
      'record.time': util.formatTime(new Date(Date.now())),
      'record.score': this.data.text.textdur - Math.abs(1000 * this.data.view.second + this.data.view.ms -this.data.text.textdur) * 0.8     
    })
    /*wx.getFileInfo({
      filePath: this.data.record.savepath,
      success: function(res) {
        console.log(res.size)
      }
    })*/
    if (this.data.record.score < 0.6 * this.data.text.textdur){
      //录音时长不符合要求打回去,目前设置的要求是0.5-1.5倍文本建议时长
      wx.showModal({
        title: 'Warn',
        content: 'out of range(0.5dur~1.5dur)',
        showCancel: false,
        success: function() {
          var curP = getCurrentPages();
          var thisp = curP[curP.length - 1];
          wx.removeSavedFile({
            filePath: thisp.data.record.savepath,
          })
          thisp.setData({
            'record.time': "",
            'record.savepath': "",
            'record.duration': 0,
            'record.score': 0,
            'view.TimerID': 0,
            'view.second': 0,
            'view.ms': 0,
            'view.durstring': "0.000"
          })
        }
      })
    } 

  },
  playvoice: function() {
    wx.playVoice({
      filePath: this.data.record.savepath
    })
  },
  pausevoice: function () {
    wx.pauseVoice();
  },
  stopvoice: function () {
    wx.stopVoice();
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
        'text.text': "我爱语音翻译我爱语音翻译我爱语音翻译我爱语音翻译我爱语音翻译我爱语音翻译我爱语音翻译我爱语音翻译",
        'text.textID': 1,
        'text.textdur': 10000,
        'text.uploadurl': "null"
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