// pages/index/pages/register/register.js
//获取应用实例
const app = getApp()
var registerInfo = {
  gender: '',
  birthplace: '',
  mobile: ''
}


Page({

  data: {
    userInfo: {},
    openID:'',
    registerInfo:[]
  },

  onLoad: function () {
    var userInfo = app.globalData.userInfo
    this.setData({
      userInfo: userInfo,
    })
  },

  formSubmit: function (e) {
    registerInfo=e.detail.value
    if(registerInfo.mobile!='')
    {
      wx.showModal({
        title: '提醒',
        content: '本信息一经填写即无法更改',
        success: function (res) {
          if (res.confirm) {
            wx.getStorage({
              key: 'MyOpenid',
              success: function (res2) {
                console.log(res2.data.openid);
                wx.request({
                  url: 'https://' + app.config.host + '/onSignup',
                  method: 'GET',
                  data: {
                    openid:res2.data.openid,
                    gender: registerInfo.gender,
                    address: registerInfo.birthplace,
                    phonenumber: registerInfo.mobile
                  },
                  success: function (res3) {
                    if (!res3.data.stat) {
                      wx.setStorageSync('MyOpenid', res3.data);
                      console.log(res3.data);
                      wx.showModal({
                        content: '注册成功',
                        showCancel: false,
                        success: function (res4) {
                          if (res4.confirm) {
                            console.log('用户点击确定')
                            wx.navigateBack({
                              delta: 1,
                            })
                          }
                        }
                      })

                    } else {
                      console.log(res3.data);
                    }
                  }
                })
              },
            })
           console.log('form发生了submit事件，携带数据为：', registerInfo)
          } 
          else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
     
    }
    else
    {
      wx.showModal({
        title: '提醒',
        content: '请填写电话号码',
        showCancel:false,
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          }
        }
      })
    }   
  },
  

})