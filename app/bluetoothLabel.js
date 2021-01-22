
var SerialPort = require('serialport');

class BluetoothLabel {

    constructor() {}

    static async getPort() {
        let COM = null;
        await SerialPort.list().then( ports => ports.forEach((item) => {
            if (item.vendorId === '10C4' && item.productId === 'EA60' && item.manufacturer === 'Silicon Labs') {
                COM = item.path;
            }
        }), err => console.error(err));
        return COM;
    }

    // func(raw, scanJsonData)
    static async on(func, port) {
        const COM = await BluetoothLabel.getPort();
        if (!COM) {
        	return '请检查是否插上设备以及安装蓝牙驱动!';
        }
        let sp = new SerialPort(port || COM, {
            baudRate: 115200,
            dataBits: 8,    
            parity: 'none',   
            stopBits: 1,   
            flowControl: false
        });

        sp.on('error',function (error) {
            console.log('error: '+error)
        })

        let sbf = '';
        let content = "";
        sp.on( "data", function(data) {
            let bf = new Buffer(data);
            sbf = sbf + bf.toString();
            
            const handleContent = (content)=>{ // iterate each line and then parse to json without duplicate label
                let res = [];
                let ids = [];

                let strs = content.trim().split('\n');
                let alabel = {};
                for(let i = 0 ; i <strs.length; i++) {
                    let line = strs[i].trim();
                    if (line.indexOf(":") >-1 ){
                        let k = line.split(":")[0];
                        let v = line.split(":")[1];
                        if (line.indexOf("ID:")>-1) {
                            if (ids.indexOf(v) === -1) { //new label
                                alabel[k] = v;
                                ids.push(v);
                            } else {
                                // ignore
                            }
                        }else {
                            alabel[k] = v;
                        }
                    }
                    if (line.indexOf("SN:") > -1 && alabel.ID) { // check ID to ensure it's a valid(no-dup) label
                        res.push(alabel);
                        alabel = {}
                    }
                }
                if (res.length === 0) {
                    res = null;
                }
                return res;
            }

            let idx = sbf.indexOf("\n");
            if ( idx > -1) {
                let aline = sbf.substring(0,idx).trim();
                let json = null;
                content = content +"\n" +aline; 
                if(content.trim().endsWith("SCAN OVER")) {
                    json = handleContent(content);
                    content = ""
                }
                func(aline, json);
                sbf = sbf.substring(idx+1); // reserve the rest of the buffer line
            }
        });
    }
}

module.exports = BluetoothLabel;
