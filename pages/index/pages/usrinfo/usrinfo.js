//usrinfo.js
//获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: {},
    gender: '',
    birthplace: '',
    mobile: '',
    cur_pkg: 0,
    completed: 0,
    unpaid: 0
    
  },
  
  onLoad:function(){
    var userInfo = app.globalData.userInfo

    this.setData({
      userInfo: userInfo
    })
    var that = this;
    wx.getStorage({
      key: 'MyOpenid',
      success: function (res) {
        wx.request({
          url: 'https://60755112.collemt.club/onGetinfo',
          method: 'GET',
          data: {
            openid: res.data.openid
          },
          header: {
            'content-type': 'application/json'
          },
          success: function (res2) {
            that.setData({

              gender: res2.data.gender,
              birthplace: res2.data.address,
              mobile: res2.data.phonenumber,
              cur_pkg: res2.data.cur_pkg,
              completed: res2.data.completed,
              unpaid: res2.data.unpaid
            })
            console.log(res2.data)
          },
          fail: function () {
            wx.showModal({
              title: '提醒',
              content: '请连接网络',
              success: function (res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                }
              }
            })
          }
        })
      },
    })
    
    
  },
onPullDownRefresh: function () {

  var that = this;
  wx.request({
    url: 'https://60755112.collemt.club/onGetinfo',
    data: {
      openid: wx.getStorageSync('MyOpenid').openid
    },
    header: {
      'content-type': 'application/json'
    },
    success: function (res2) {
      that.setData({
        gender: res2.data.gender,
        birthplace: res2.data.address,
        mobile: res2.data.phonenumber,
        cur_pkg: res2.data.cur_pkg,
        completed: res2.data.completed,
        unpaid: res2.data.unpaid
      })
      console.log(res2.data)
    },
    fail: function () {
      wx.showModal({
        title: '提醒',
        content: '请连接网络',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          }
        }
      })
    }
  })
    wx.stopPullDownRefresh()
  },
onLogin: function () {
  wx.navigateTo({
    url: '/pages/index/pages/register/register?modified=0',
  })
},

onModify: function () {
  wx.navigateTo({
    url: '/pages/index/pages/register/register?modified=1',
  })
},

  
})
