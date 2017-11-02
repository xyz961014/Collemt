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
      numpackage:wx.getStorageSync('data').packageID,
      numfinished: wx.getStorageSync('history').length,
      numall: (wx.getStorageSync('data').packages || []).length
    })
    var scor = 0;
    var usage = 0;
    var that = this;
    wx.getSavedFileList({
      success: function (res) {
        console.log(res.fileList);
        for (var i = 0;i < res.fileList.length;i++) {
          usage += res.fileList[i].size;
        }
        that.setData({
          percentage: (usage / 1024 / 102.4).toFixed(1)
        })
      }
    })
    for (var i of wx.getStorageSync('history')) {
      scor += i.record.score;
      
      /*if(i.record.savepath){
        usage += i.record.size;
      }*/
    }
    this.setData({
      score: scor
    })
  },
  getUserInfo: function(e) {
    app.globalData.userInfo = e.detail.userInfo;
    //假装在这里注册
    //判断是否注册
    wx.getStorage({
      key: 'MyOpenid',
      success: function (res) {
        console.log(res.data.phonenumber)
        if (res.data.phonenumber === "0") //注意返回什么
        {
          wx.navigateTo({
            url: 'pages/register/register',
          })
        }
      }
    })

    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
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
    else {
      var that = this;
      wx.getStorage({
        key: 'MyOpenid',
        success: res => {
          var history = wx.getStorageSync('history');
          for (var i = 0;i < history.length;i++) {
            console.log(history[i].record.savepath);
            wx.uploadFile({
              url: 'https://60755112.collemt.club/file_upload',
              filePath: history[i].record.savepath,
              name: 'voices',
              formData: {
                pkgid: wx.getStorageSync('data').packageID.toString(),
                line: history[i].text.textID.toString(),
                openid: res.data.openid,
                total: parseInt(i / (history.length -1)).toString()
              },
              success: function (res2) {
                console.log(res2.data);
                console.log(i)
                /*wx.removeSavedFile({
                  filePath: history[i].record.savepath,
                })*/
                wx.setStorageSync('history', []);
                wx.setStorageSync('pkgon', false);
                wx.setStorageSync('data', {})
                that.setData({
                  canNewpackage: true,
                  history: [],
                  numfinished: 0,
                  numpackage: "未获取",
                  numall: 0
                })
              }
            });
          }
        }
      });
    }
    //上传任务包

  },
  newpackage: function() {
    //清除缓存
    wx.getSavedFileList({
      success: function (res) {
        console.log(res.fileList);
        var l = res.fileList.length;
        for (var i = 0;i < l;i++) {
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
      success: function(res) {
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
              /*datastr = {
              'pkgid': 91,
              'text': '录一段话吧录一段话吧录一段话吧录一段话吧录一段话吧\n录两段话吧录两段话吧录两段话吧录两段话吧录两段话吧\n录三段话吧录三段话吧录三段话吧录三段话吧录三段话吧\n录四段话吧录四段话吧录四段话吧录四段话吧录四段话吧\n录五段话吧录五段话吧录五段话吧录五段话吧录五段话吧'
            };*/
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
                  textdur: textlist[n].length * 300
                };
                if (item.textdur) {
                  packages.push(item);
                }

              }
              textdata.packages = packages;
              wx.setStorageSync('data', textdata);
              wx.setStorageSync('pkgon', true)
              that.setData({
                canNewpackage: false,
                numpackage: textdata.packageID,
                numall: textdata.packages.length
              });
            }
          }
        });
      },
    })
    


  },
  usrinfo: function () {
    wx.navigateTo({
      url: 'pages/usrinfo/usrinfo',
    })
  }
})
