const app = getApp(); 
const util = require('../../utils/util.js');
const recorderManager = wx.getRecorderManager();
const innerAudioContext = wx.createInnerAudioContext();
innerAudioContext.obeyMuteSwitch = false;
const options = {
  sampleRate: 16000,
  numberOfChannels: 1,
  format: 'mp3'
};
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
      textlen: 0,//文本字数
    },
    record: {
      //recorded:false, //是否录制,使用cur_pkg来代替
      time: "", // 录制时间
      duration: 0, //录制时长
      score: 0, //得分
      savepath: "", //录音文件的保存路径
      size: 0, //文件大小\
      saved: false
    },

    view: {
      second: 0, // 秒数
      ms: 0, //毫秒数
      TimerID: 0, //计时器ID
      durstring: "0.000", //计时字符串
      Isplay: false
    },
    hasUserInfo: false, //是否获取用户信息
    recordingbool: false, //是否正在录音
    saved: false, //是否已经保存
    numall: 0,    //总长度
    cur_text:0,   //当前文本指针
    pkgon: false, //当前任务包状态
    cur_pkg: -1,
    myopenid: '',
    numfinished: 0,
    numpackage: '未获取',
    percentage: 0,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canupload: false,
  },

  recordbuttontap: function(){
    if (wx.canIUse('getRecorderManager')) {
      recorderManager.start(options);
    }
    else
    {
      wx.getSetting({
        success(res) {
          if (!res.authSetting['scope.record']) {
            wx.authorize({
              scope: 'scope.record',
              success() {
                // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
                var curP = getCurrentPages();
                var thisp = curP[curP.length - 1];
                //console.log("开始录音")
                wx.startRecord({
                  success: function (res1) {
                    /*wx.showToast({
                      title: 'L0ading',
                      icon: "loading",
                      duration: 500
                    })*/
                    wx.saveFile({
                      tempFilePath: res1.tempFilePath,
                      success: function (res2) {
                        //成功调用时保存文件路径
                        thisp.setData({
                          'record.savepath': res2.savedFilePath
                        })
                        wx.getFileInfo({
                          filePath: res2.savedFilePath,
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
            //console.log("开始录音")
            wx.startRecord({
              success: function (res1) {
                //console.log("开始录音")
                wx.saveFile({
                  tempFilePath: res1.tempFilePath,
                  success: function (res2) {
                    //console.log("成功调用保存文件路径")
                    //成功调用时保存文件路径
                    thisp.setData({
                      'record.savepath': res2.savedFilePath,
                    })

                    //得到录音文件大小
                    wx.getFileInfo({
                      filePath: res2.savedFilePath,
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
        }
      });
    }
  },
  stopbuttontap: function() {
    if (wx.canIUse('getRecorderManager')) {
      recorderManager.stop();
      //console.log('STOP');
    } 
    else{
      wx.stopRecord()
      clearInterval(this.data.view.TimerID);//停止计时

      //保存本次数据
      this.setData({
        recordingbool: false,
        'record.duration': (this.data.view.second + this.data.view.ms / 1000).toFixed(3),
        'record.time': util.formatTime(new Date(Date.now())),
        'record.score': this.data.text.textdur - Math.abs(1000 * this.data.view.second + this.data.view.ms - this.data.text.textdur) * 0.8
      })
      if (this.data.record.duration > 30) {
        //录音时长不符合要求打回去,目前设置的要求30s内
        wx.showModal({
          title: '警告',
          content: '录制时长不符合要求，要求为30s以内',
          showCancel: false,
          success: function () {
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
              'record.size': 0,
              'record.saved': false,
              'view.TimerID': 0,
              'view.second': 0,
              'view.ms': 0,
              'view.durstring': "0.000"
            })
          }
        })
      }
    }

  },

  resetbuttontap: function() {
    if (wx.canIUse('getRecorderManager') && this.data.recordingbool) {
      wx.setStorageSync('reset', true);
      recorderManager.stop();
    }
    else 
    {
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
        'record.size': 0,
        'record.saved': false,
        'view.TimerID': 0,
        'view.second': 0,
        'view.ms': 0,
        'view.durstring': "0.000"
      });
      var history = wx.getStorageSync('history') || [];
      var cur_textID = wx.getStorageSync('cur_text');
      history[cur_textID].record = this.data.record;
      wx.setStorageSync('history', history);
      this.onShow();
    }
    
  },
  playvoice: function() {
    if (wx.canIUse('createInnerAudioContext')) {
      innerAudioContext.src = this.data.record.savepath;
      innerAudioContext.play();
    } 
    else {
      this.setData({
        Isplay: true
      });
      var that = this;
      wx.playVoice({
        filePath: this.data.record.savepath,
        complete: function () {
          that.setData({
            Isplay: false
          })
        }
      })
    }   
  },
  stopvoice: function () {
    if (wx.canIUse('createInnerAudioContext')) {
      innerAudioContext.stop();
    }
    else {
      this.setData({
        Isplay: false
      });
      wx.stopVoice();
    }
  },

  savebuttontap: function() {           
    //保存到历史缓存的时候有问题，k可以不用删除再来unshift
    //每录一次就自动保存，自动覆盖，不用提醒他们有没有保存
  var history = wx.getStorageSync('history') || [];
  var cur_textID = wx.getStorageSync('cur_text');
  this.setData({
    'record.saved': true
  })
  history[cur_textID].record=this.data.record;
      wx.setStorageSync('history', history);
      var saved = true;

      for (var i = 0; i < this.data.numall; i++) {
        if (history[i].record.duration == 0) {
          saved = false;
          break;
        }
      }
      this.setData({
        canupload: saved
      });
      var that = this;
      if (saved) {
        wx.showModal({
          title: '提醒',
          content: '恭喜您已完成本任务包的所有任务，是否现在上传？',
          success: function(res) {
            if (res.confirm) {
              that.uploadpackage();
            }
            that.onShow();
          }
        })
      }
      else {
        wx.showToast({
          title: '保存成功',
        });
        this.onShow();
      }
    console.log(history.length);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //console.log("测试")
    wx.setStorageSync('reset', false);
    recorderManager.onStart(() => {
      console.log('new API');
      var curP = getCurrentPages();
      var thisp = curP[curP.length - 1];
      thisp.setData({
        recordingbool: true
      });
      Timerstart();
    });
    recorderManager.onStop((res) => {
      var curP = getCurrentPages();
      var thisp = curP[curP.length - 1];
      var isreset = wx.getStorageSync('reset');
      if (isreset) {
        clearInterval(this.data.view.TimerID);
        thisp.setData({
          recordingbool: false
        })
        wx.removeSavedFile({
          filePath: this.data.record.savepath,
        })
        this.setData({
          'record.time': "",
          'record.savepath': "",
          'record.duration': 0,
          'record.score': 0,
          'record.size': 0,
          'record.saved': false,
          'view.TimerID': 0,
          'view.second': 0,
          'view.ms': 0,
          'view.durstring': "0.000"
        });
        var history = wx.getStorageSync('history') || [];
        var cur_textID = wx.getStorageSync('cur_text');
        history[cur_textID].record = this.data.record;
        wx.setStorageSync('history', history);
        this.onShow();
        wx.setStorageSync('reset', false);
      }
      else 
      {
        clearInterval(this.data.view.TimerID);//停止计时
        console.log('recorder stop', res);
        var tempFilePath = res.tempFilePath;
        thisp.setData({
          'record.savepath': tempFilePath,
          'record.size': res.fileSize / 1024
        });
        //保存本次数据
        this.setData({
          recordingbool: false,
          'record.duration': (res.duration / 1000).toFixed(3),
          'record.time': util.formatTime(new Date(Date.now())),
          'record.score': this.data.text.textdur - Math.abs(1000 * res.duration - this.data.text.textdur) * 0.8,
          'view.durstring': (res.duration / 1000).toFixed(3).toString()
        })
        if (this.data.record.duration > 30) {
          //录音时长不符合要求打回去,目前设置的要求30s内
          wx.showModal({
            title: '警告',
            content: '录制时长不符合要求，要求为30s以内',
            showCancel: false,
            success: function () {
              wx.removeSavedFile({
                filePath: thisp.data.record.savepath,
              })
              thisp.setData({
                'record.time': "",
                'record.savepath': "",
                'record.duration': 0,
                'record.score': 0,
                'record.size': 0,
                'record.saved': false,
                'view.TimerID': 0,
                'view.second': 0,
                'view.ms': 0,
                'view.durstring': "0.000"
              })
            }
          })
        }
      }
      
    });
    innerAudioContext.onPlay(() => {
      var curP = getCurrentPages();
      var thisp = curP[curP.length - 1];
      thisp.setData({
        Isplay: true
      });
    });
    innerAudioContext.onStop(() => {
      var curP = getCurrentPages();
      var thisp = curP[curP.length - 1];
      thisp.setData({
        Isplay: false
      });
    });
    innerAudioContext.onEnded(() => {
      var curP = getCurrentPages();
      var thisp = curP[curP.length - 1];
      thisp.setData({
        Isplay: false
      });
    })
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
    console.log(this.data.hasUserInfo);
    if (!this.data.hasUserInfo) {
      wx.showModal({
        title: '用户信息错误',
        content: '请先登录后再录音',
        showCancel: false,
        success: function(){
          wx.switchTab({
            url: '/pages/index/index'
          });
          return;
        }
      })
    } else {
      var textdata = wx.getStorageSync('data');
      var history = wx.getStorageSync('history') || [];
      this.setData({
        pkgon: wx.getStorageSync('pkgon')
      })
      if (textdata.packages) { // 如果已经获取了数据包，存到本地页面
        this.setData({
          'datatext': textdata.packages,
          'numall': textdata.packages.length,
          'cur_text': wx.getStorageSync('cur_text') || 0,
          'cur_pkg': textdata.packageID
        });
      }
      wx.setStorageSync('cur_text', this.data.cur_text)
      if (textdata.packages && history.length === 0) {          //当前有包，并且没有加载过才会预加载
        for (var i = 0; i < this.data.numall; i++) {
          console.log('预加载')
          history.push({
            text: textdata.packages[i],
            record: this.data.record
          });
        }
        wx.setStorageSync('history', history);
      }
      /*if (!wx.getStorageSync('pkgon')) {
            wx.showModal({
              title: '没有正在执行的任务包',
              content: '请先获取任务包',
              showCancel: false,
              success: function () {
                wx.switchTab({
                  url: '/pages/index/index'
                })
              }
            })
            return;
          }*/
          var i = wx.getStorageSync('cur_text')    
          if (i < this.data.numall) {
            this.setData({
              'text': history[i].text,
              'record':history[i].record,
              'view.TimerID': 0,
              'view.second': 0,
              'view.ms': 0,
              'view.durstring': (history[i].record.duration * 1.0).toFixed(3).toString(),
            });
            var n = util.characterStats(this.data.datatext[i].text); //字数统计
            console.log(n);
            /*wx.setStorageSync('saved', false);   //取消saved
            this.setData({
              saved: false
            })*/
          }
          var saved = true;
          var numf = 0;
          var history = wx.getStorageSync('history')
          for (var i = 0; i < this.data.numall; i++) {
            if (history[i].record.duration == 0) {
              saved = false;
            }
            else {
              numf++;
            }

          }
          if (history.length === 0)
            saved = false;
          this.setData({
            canupload: saved,
            numfinished: numf
          });
         /* else {       //如何判断所有包都做完?集成到上传里面去
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
          }*/
       // }
      
    }
  },
  lastbuttontap: function () { 
    var that = this;
    if (!this.data.record.saved && this.data.record.duration) {
      wx.showModal({
        title: '提醒',
        content: '当前录音尚未保存，是否继续？',
        success: function(res) {
          if (res.confirm) {
            var cur_textID = wx.getStorageSync('cur_text')
            if (cur_textID >= 1) {
              cur_textID--;
            }
            that.setData({
              cur_text: cur_textID
            })
            wx.setStorageSync('cur_text', that.data.cur_text)
            that.onShow();
          }
         
        }
      })
    } 
    else {
      var cur_textID = wx.getStorageSync('cur_text')
      if (cur_textID >= 1) {
        cur_textID--;
      }
      this.setData({
        cur_text: cur_textID
      })
      wx.setStorageSync('cur_text', this.data.cur_text)
      this.onShow();
    }  
    
  },

  nextbuttontap: function() {
    var that = this;
    if (!this.data.record.saved && this.data.record.duration) {
      wx.showModal({
        title: '提醒',
        content: '当前录音尚未保存，是否继续？',
        success: function(res) {
          if (res.confirm) {
            var cur_textID = wx.getStorageSync('cur_text')
            if (cur_textID < that.data.numall - 1) {
              cur_textID++;
            }
            that.setData({
              cur_text: cur_textID
            })
            wx.setStorageSync('cur_text', that.data.cur_text)
            that.onShow();
          }
          
        }
      })
    }
    else {
      var cur_textID = wx.getStorageSync('cur_text')
      if (cur_textID < this.data.numall - 1) {
        cur_textID++;
      }
      this.setData({
        cur_text: cur_textID
      })
      wx.setStorageSync('cur_text', this.data.cur_text)
      this.onShow();
    }
  },



  newpackage: function () {
    wx.getStorage({
      key: 'MyOpenid',
      success: function (res) {
        if (res.data.phonenumber === "0") //注意返回什么
        {
          wx.showToast({
            title: '尚未注册',
            icon: "loading",
            duration: 1000,
            complete: function () {
              wx.navigateTo({
                url: '/pages/index/pages/register/register?modified=0',
              })
            }
          })

        }
        else {
          //清除缓存
          wx.getSavedFileList({
            success: function (res) {
              console.log(res.fileList);
              var l = res.fileList.length;
              for (var i = 0; i < l; i++) {
                wx.removeSavedFile({
                  filePath: res.fileList[i].filePath,
                  complete: function (res) {
                    console.log(res)
                  }
                })
              }
            }
          })
          //获取新任务包
          var datastr = {};
          var that = this;
          wx.getStorage({
            key: 'MyOpenid',
            success: function (res) {
              wx.request({
                url: 'https://' + app.config.host + '/onFetch',
                method: 'GET',
                data: {
                  openid: res.data.openid
                },
                success: function (res) {
                  console.log(res.data);
                  datastr = res.data;
                  if (datastr.stat == -1) {
                    wx.showModal({
                      title: '错误',
                      content: datastr.msg,
                      showCancel: false
                    })
                  }
                  else {
                    //datastr = {
                    //'pkgid': 91,
                    //'text': '录一段话吧录一段话吧录一段话吧录一段话吧录一段话吧\n录两段话吧录两段话吧录两段话吧录两段话吧录两段话吧\n录三段话吧录三段话吧录三段话吧录三段话吧录三段话吧\n录四段话吧录四段话吧录四段话吧录四段话吧录四段话吧\n录五段话吧录五段话吧录五段话吧录五段话吧录五段话吧'

                    var textlist = datastr.text.split('\n');
                    var textdata = {
                      packageID: datastr.pkgid,
                      packages: []
                    }
                    var packages = [];
                    for (var n = 0; n < textlist.length; n++) {
                      var item = {
                        textID: n + 1,
                        text: textlist[n],
                        textdur: textlist[n].length * 300,
                        textlen: util.characterStats(textlist[n])
                      };
                      if (item.textdur) {
                        packages.push(item);
                      }

                    }
                    textdata.packages = packages;
                    wx.setStorageSync('data', textdata);
                    wx.setStorageSync('pkgon', true);
                    var curP = getCurrentPages();
                    var thisp = curP[curP.length - 1];//获取当前页面
                    thisp.setData({
                      canNewpackage: false,
                      numpackage: textdata.packageID,
                      numall: textdata.packages.length,
                    });
                    thisp.onShow();
                  }
                },
                /*complete: function() {
                  wx.switchTab({
                    url: '/pages/studio/studio',
                  })
                }*/
              });
            },
          });
        }
      }
    })
  },
  uploadpackage: function () {   //不能够再通过长度来判断
    if (!this.data.canupload) {
      wx.showModal({
        title: '错误',
        content: '有尚未完成的任务',
        showCancel: false
      });
      return;
    }
    else {
      var that = this;
      wx.showLoading({
        title: '上传中',
      })
      wx.getStorage({
        key: 'MyOpenid',
        success: res => {
          var history = wx.getStorageSync('history');
          for (var i = 0; i < history.length; i++) {
            console.log(history[i].record.savepath);
            wx.uploadFile({
              url: 'https://60755112.collemt.club/file_upload',
              filePath: history[i].record.savepath,
              name: 'voices',
              formData: {
                pkgid: wx.getStorageSync('data').packageID.toString(),
                line: history[i].text.textID.toString(),
                openid: res.data.openid,
                strlen: history[i].text.textlen.toString(),
                total: parseInt(i / (history.length - 1)).toString()
              },
              success: function (res2) {
                console.log(res2.data);
                console.log(i)
                var data = JSON.parse(res2.data);
                //wx.removeSavedFile({
                //  filePath: history[i].record.savepath,
                //})
                //上传成功
                if (data.stat == 2) {
                  wx.hideLoading();
                  wx.showToast({
                    title: '上传成功',
                  });
                  console.log(res2.data);
                  wx.setStorageSync('history', []);
                  wx.setStorageSync('pkgon', false);
                  wx.setStorageSync('data', {})
                  that.setData({
                    datatext: [],
                    'text.text': '',
                    'text.textID': 0,
                    'text.textdur': 0,
                    'text.textlen': 0,
                    'record.time': "",
                    'record.savepath': "",
                    'record.duration': 0,
                    'record.score': 0,
                    'record.size': 0,
                    'record.saved': false,
                    'view.TimerID': 0,
                    'view.second': 0,
                    'view.ms': 0,
                    'view.durstring': "0.000",
                    cur_text: 0,
                    numall: 0,
                    cur_pkg: -1,
                    canupload: false
                  });
                  wx.setStorageSync('cur_text', 0)
                  that.onShow();
                }

              }
            });
          }
        }
      });

    }
    //上传任务包

  },
})