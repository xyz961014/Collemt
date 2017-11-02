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
    if (thisp.data.view.second === 60) {
      thisp.stopbuttontap();
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
    datatext: [],
    text:{
      text: "",//文本
      textID: 0,//文本ID
      textdur: 0,//文本建议时长
    },
    record: {
      time: "", // 录制时间
      duration: 0, //录制时长
      score: 0, //得分
      savepath: "", //录音文件的保存路径
      size: 0, //文件大小
      uploaded: false // 是否已经上传
    },
    view: {
      second: 0, // 秒数
      ms: 0, //毫秒数
      TimerID: 0, //计时器ID
      durstring: "0.000" //计时字符串
    },
    hasUserInfo: false, //是否获取用户信息
    recordingbool: false, //是否正在录音
    saved: false  //是否已经保存
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
                      wx.getFileInfo({
                        filePath: res.savedFilePath,
                        success: function (e) {
                          thisp.setData({
                            'record.size': e.size / 1024
                          })
                        }
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
                  //得到录音文件大小
                  wx.getFileInfo({
                    filePath: res.savedFilePath,
                    success: function(e) {
                      thisp.setData({
                        'record.size': e.size / 1024
                      })
                    }
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
      'record.duration': (this.data.view.second + this.data.view.ms / 1000).toFixed(2),
      'record.time': util.formatTime(new Date(Date.now())),
      'record.score': this.data.text.textdur - Math.abs(1000 * this.data.view.second + this.data.view.ms -this.data.text.textdur) * 0.8   
    })
    /*wx.getFileInfo({
      filePath: this.data.record.savepath,
      success: function(res) {
        console.log(res.size)
      }
    })*/
    if (this.data.record.duration > 30000){
      //录音时长不符合要求打回去,目前设置的要求30s内
      wx.showModal({
        title: '警告',
        content: '录制时长不符合要求，要求为30s以内',
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
  resetbuttontap: function() {
    if (this.data.recordingbool) {
      wx.stopRecord();
      clearInterval(this.data.view.TimerID);
      this.setData({
        recordingbool: false
      })
    }
    wx.removeSavedFile({
      filePath: this.data.record.savepath,
    })
    this.setData({
      'record.time': "",
      'record.savepath': "",
      'record.duration': 0,
      'record.score': 0,
      'record.uploaded': false,
      'view.TimerID': 0,
      'view.second': 0,
      'view.ms': 0,
      'view.durstring': "0.000"
    })

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
  savebuttontap: function() {
  var history = wx.getStorageSync('history') || [];
  if (this.data.record.duration !== 0) {
      var dellist = [];
      for (var i = history.length - 1; i >= 0; i--) {
        //console.log(history.length);
        if (history[i].text.textID === this.data.text.textID) {
          //删除文件
          history.splice(i, 1);
        }
      }
      history.unshift({
          text: this.data.text,
          record: this.data.record
      });


      wx.setStorageSync('history', history);
      wx.showToast({
        title: '保存成功',
      });
      wx.setStorageSync('saved', true);
      this.setData({
        saved: true
      })
    }
    else {
      wx.showModal({
        title: '错误',
        content: '尚未录音，不能保存',
        showCancel: false
      })
    }
    console.log(history.length);
    /*var saveinfo = {
      text: this.data.text,
      record: this.data.record
    };
    //saveinfo.text = this.data.text;
    //saveinfo.record = this.data.record;
    console.log(saveinfo);
    app.globalData.history.unshift(saveinfo);
    console.log(app.globalData.history);*/
  },
  /*uploadbuttontap: function () {
    //上传录音资料，包括globaldata中的code来获取用户的openid
    //首先判断是否存在录音
    var history = wx.getStorageSync('history') || [];
    if (this.data.record.duration !== 0) {
      //判断用户网络状况
      //在这里上传
      wx.showToast({
        title: '假的上传成功',
      });
      var curP = getCurrentPages();
      var thisp = curP[curP.length - 1];
      thisp.setData({
        'record.uploaded': true
      });
      var dellist = [];
      for (var i = history.length - 1; i >= 0; i--) {
        //console.log(history.length);
        if (history[i].text.textID === this.data.text.textID) {
          history.splice(i, 1);
        }
      }
      //上传后保存到本地
      history.unshift({
        text: this.data.text,
        record: this.data.record
      });
      wx.setStorageSync('history', history);
    }
    else {
      wx.showModal({
        title: '错误',
        content: '尚未录音，不能上传',
        showCancel: false
      })
    }

  },*/
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setStorageSync('saved', true);
    var textdata = wx.getStorageSync('data');
    this.setData({
      'datatext': textdata.packages
    });
    
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
    var textdata = wx.getStorageSync('data');
    this.setData({
      'datatext': textdata.packages
    });
    if (!this.data.hasUserInfo) {
      wx.showModal({
        title: '用户信息错误',
        content: '请先登录后再录音',
        showCancel: false,
        success: function(){
          wx.switchTab({
            url: '/pages/index/index'
          })
        }
      })
    } else {
      //判断是否是重录
      if (wx.getStorageSync('rerecordbool')) {
        //加载重录信息
        var textinfo = wx.getStorageSync('textinfo');
          this.setData({
            text: textinfo,
            saved: false
          })
          this.setData({
            'record.time': "",
            'record.savepath': "",
            'record.duration': 0,
            'record.score': 0,
            'record.uploaded': false,
            'view.TimerID': 0,
            'view.second': 0,
            'view.ms': 0,
            'view.durstring': "0.000"
          });
          wx.setStorageSync('rerecordbool', false)
      }
      else {
        if (wx.getStorageSync('saved')) {
          this.setData({
            'record.time': "",
            'record.savepath': "",
            'record.duration': 0,
            'record.score': 0,
            'record.uploaded': false,
            'view.TimerID': 0,
            'view.second': 0,
            'view.ms': 0,
            'view.durstring': "0.000"
          });
          if (!wx.getStorageSync('pkgon')) {
            wx.showModal({
              title: '没有正在执行的任务包',
              content: '请先获取任务包',
              showCancel: false,
              success: function () {
                wx.switchTab({
                  url: '/pages/index/index'
                })
              }
            });
            return;
          }
          var i = wx.getStorageSync('history').length
          if (i < 5) {
            this.setData({
              'text': this.data.datatext[i]
            })
            wx.setStorageSync('saved', false);
            this.setData({
              saved: false
            })
          }
          else {
            wx.showModal({
              title: '没有新任务',
              content: '请上传任务包后获取新任务包',
              showCancel: false,
              success: function () {
                wx.switchTab({
                  url: '/pages/index/index'
                })
              }
            })
          }
        }
      }
    }
  },
  
  nextbuttontap: function() {
    this.onShow();
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