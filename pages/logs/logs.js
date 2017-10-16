//logs.js
const util = require('../../utils/util.js')

Page({
  data: {
    info: {},
    num: null,
    infoout: {},
    isplay: false
  },
  onShow: function () {
    this.setData({
      num: wx.getStorageSync('num'),
      info: wx.getStorageSync('history')
    });
    this.setData({
      infoout: this.data.info[this.data.num]
    });
    wx.setStorageSync('rerecordbool', false);
  },
  playtap: function() {
    wx.playVoice({
      filePath: this.data.infoout.record.savepath,
    });
    this.setData({
      isplay: true
    });
  },
  stoptap: function() {
    wx.stopVoice();
    this.setData({
      isplay: false
    });
  },
  rerecordtap: function() {
    wx.switchTab({
      url: '/pages/studio/studio',
    });
    wx.setStorageSync('textinfo', this.data.infoout.text);
    wx.setStorageSync('rerecordbool', true);
  },
  uploadtap: function() {
    //上传录音文件
    wx.showToast({
      title: '假的上传成功',
    });
    this.setData({
      'infoout.record.uploaded': true
    });
    var history = wx.getStorageSync('history');
    history[this.data.num] = this.data.infoout;
    wx.setStorageSync('history', history);
  }
})
