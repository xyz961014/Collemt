const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

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

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

module.exports = {
  formatTime: formatTime,
  timestring: timestring
}
