const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
//输出计时字符串的函数
var timestring = function(sec,ms) {
  if(ms >= 100) {
    return sec.toString() + '.' + ms.toString();
  } 
  else if(ms < 100 && ms >= 10) {
    return sec.toString() + '.' + '0' + ms.toString();
  } 
  else if(ms < 10 && ms >= 0) {
    return sec.toString() + '.' + '00' + ms.toString();
  }
}
var randomWord = function(randomFlag, min, max) {
  var str = "",
    range = min,
    arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  // 随机产生
  if (randomFlag) {
    range = Math.round(Math.random() * (max - min)) + min;
  }
  for (var i = 0; i < range; i++) {
    var pos = Math.round(Math.random() * (arr.length - 1));
    str += arr[pos];
  }
  var num = parseInt(1000 * Math.random())
  return [str,num];
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

var characterStats = function (str) {
  var i = 0;
  var num = 0;
  var chn = /^[\u4e00-\u9fa5]/
  while (i < str.length) {
    var c = str.charAt(i);
    if (chn.test(c)) {
      num++;
    }
    else if (/^[a-zA-Z0-9]/.test(c)) {
      do
      {
        i++;
        c = str.charAt(i);
      } while (/^[a-zA-Z0-9]/.test(c));
      num++;
      continue;
    }
    i++;
  }
  return num;
}

module.exports = {
  formatTime: formatTime,
  timestring: timestring,
  randomWord: randomWord,
  characterStats: characterStats
}
