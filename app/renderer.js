/*
 * @Author: your name
 * @Date: 2020-01-18 18:37:18
 * @LastEditTime: 2020-03-31 19:28:09
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \SFL-cloudc:\Users\Administrator\Desktop\renderer(1).js
 */
var SerialPort = require('serialport');
// var port = new SerialPort('COM1', {baudRate: 115200});

// port COM1
// time 500\
// const Infrared = new Infrared({port: 'COM', time: 500}) 
class Infrared {
  constructor(props) {
    this.props = props;
    this.timer = null;
    this.port = null;
    this.init();
  }

  init() {
    const {port} = this.props;
    this.port = new SerialPort(port, {baudRate: 115200});
    this.port.on('open', function () {});

  }

  on(cb = () => {}) {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null;
    }
    this.timer = setInterval(() => {
      this.port.get((err, data) => {
        cb(data);
      });
    }, this.props.time);
  }

  destroy() {
    // 
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null;
    }
  }

  error() {
    this.port.on('error', function (err) {
      console.log('Error: ', err.message);
    });
  }

}

module.exports = Infrared;