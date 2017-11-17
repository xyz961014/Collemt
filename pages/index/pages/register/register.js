// pages/index/pages/register/register.js
//获取应用实例
const app = getApp()
var registerInfo = {
  gender: '',
  mobile: '',

}


Page({

  data: {
    region:'',
    modified:0,
    userInfo: {},
    openID:'',
    registerInfo:[],
    genders: ["男性", "女性"],
    genderIndex: 0,
    statestr: '注册'
  },

  onLoad: function (res) {
    var userInfo = app.globalData.userInfo;
    this.setData({
      userInfo: userInfo,
      region: '北京市 北京市 海淀区'
    })
    console.log('res.modified',res.modified)
    if (res.modified == 1) {
      this.setData({
        modified: res.modified,
        statestr: '修改'
      })
    }
    console.log(this.data.modified);
  },

  onPickerChange:function(e)
  {
    var regionarr=e.detail.value
    this.setData({
      region: regionarr[0]+' '+regionarr[1]+' '+regionarr[2]
    })
    console.log(this.data.region)
  },

  formSubmit: function (e) {
    var phonereg = /^1[35784]\d{9}/;   /*定义验证表达式*/
    registerInfo=e.detail.value;
    var region = this.data.region;
    var gender = this.data.genders[this.data.genderIndex];
    console.log('提交'+region);
    var seturl;
    var that = this;
    if(this.data.modified == 0)
    {
      seturl='/onSignup'
    }
    else{
      seturl='/onModify'
    }
    if(phonereg.test(registerInfo.mobile))
    {
      wx.showModal({
        title: '提醒',
        content: '请核实信息后再提交',
        success: function (res) {
          if (res.confirm) {
            wx.getStorage({
              key: 'MyOpenid',
              success: function (res2) {
                console.log(res2.data.openid);
                wx.request({
                  url: 'https://' + app.config.host + seturl,
                  method: 'GET',
                  data: {
                    openid:res2.data.openid,
                    gender: gender,
                    address: region,
                    phonenumber: registerInfo.mobile
                  },
                  success: function (res3) {
                    console.log(seturl);
                    console.log(res3.data);
                    if (res3.data.stat === 1) { //这里注意不同的方式会返回什么样的stat值
                      
                      that.setData({
                        modified: 1
                      })
                      wx.showToast({
                        title: '注册成功',
                        success: function () {
                          console.log('res4用户点击确定')
                          setTimeout(function () {
                            wx.navigateBack({
                              delta: 2,
                            })
                          }, 1000);
                        }
                      })

                    }
                    else if (res3.data.stat === 2) {
                      console.log(res3.data);
                      that.setData({
                        modified: 1
                      })
                      wx.showToast({
                        title: '修改成功',
                        success: function () {
                          console.log('res4用户点击确定')
                          setTimeout(function () {
                            wx.navigateBack({
                              delta: 2,
                            })
                          },1000);
                        
                        }
                      })
                    }
                    else if (res3.data.stat === -1) {
                      wx.showModal({
                        content: '维护中请稍后再试',
                        showCancel: false,
                        success: function (res4) {
                          if (res4.confirm) {
                            console.log('res4用户点击确定')
                            wx.navigateBack({
                              delta: 2,
                            })
                          }
                        }
                      })
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
        content: '请填写正确的手机号码',
        showCancel:false,
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          }
        }
      })
    }   
  },
  bindgenderChange: function (e) {

    this.setData({
      genderIndex: e.detail.value
    })
  },

})