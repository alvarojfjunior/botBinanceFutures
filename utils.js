const minutesDiference = (d1, d2) => {
  var diff = d1.getTime() - d2.getTime();
  diff /= 60;
  return parseFloat(String(Math.abs(Math.round(diff))).slice(0, 2));
};

const secondsDiference = (d1, d2) => {
    var diff = d1.getTime() - d2.getTime();
    diff /= 1000;
    return parseFloat(String(Math.abs(Math.round(diff))).slice(0, 2));
  };


module.exports = {
    minutesDiference,
    secondsDiference
}
