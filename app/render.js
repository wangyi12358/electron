const {ipcRenderer} = require('electron');


const exit = () => {
	ipcRenderer.send('close-main-window');
};
module.exports = {
  exit,
};