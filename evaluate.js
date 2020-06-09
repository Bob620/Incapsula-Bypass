//All code to async
//Report Bad Config

const {injectCode, insertData} = require('./inject.js');
const b64 = require('./base64.js');
const configReader = require('./configReader.js');

const injectOptions = {
	//bindThisLastIIFE: true,
	bindThisToEvalInsideDOMFunc: true,
	bindThisToDOMFunc: true,
	//custom: [['(function(){','(()=>{']],
	allFunctionToArrow: true
};

const btoa = b64.btoa;

const dummyWindow = {
	btoa: b64.btoa,
	atob: b64.atob,
	Date: Date,
	Array: global.Array,
	RegExp: global.RegExp,
	eval: global.eval,
	encodeURIComponent: global.encodeURIComponent,

	process: {version: undefined},
	_phantom: undefined,
	callPhantom: undefined,
	__nightmare: undefined,
	domAutomation: undefined,
	domAutomationController: undefined,
	_Selenium_IDE_Recorder: undefined
};

function Window(options) {
	const {config, customDocument} = options;
	let configBuild = Object.assign({}, config.window);
	configBuild.screen = config['window.screen'];
	configBuild.navigator.plugins = config['window.navigator.plugins'];
	configBuild.navigator.mimeTypes = config['window.navigator.mimeTypes'];
	configBuild.outerWidth = configBuild.screen.width;
	configBuild.outerHeight = configBuild.screen.height;

	Object.assign(this, configBuild, customDocument, dummyWindow);

	this.window = this;
}

//create dummyDocument
function Document(options) {
	const {cookie} = options;
	this.cookieStr = cookie;
	this.documentMode = undefined;
	this.__webdriver_script_fn = undefined;
	this.$cdc_asdjflasutopfhvcZLmcfl_ = undefined;

	Object.defineProperty(this, 'cookie', {
		set: newCookie => {
			!this.cookieStr ?
				(this.cookieStr = newCookie.split(';')[0]) :
				(this.cookieStr += '; ' + newCookie.split(';')[0]);
		},
		get: () => {
			return this.cookieStr;
		}
	});

	const self = this;
	this.createElement = function () {
		const fakeDoc = {};
		Object.defineProperty(fakeDoc, 'src', {
			set: function (data) {
				self.imgSrc = data;
			}
		});
		return fakeDoc;
	};
}

function evaluateWithConfig(code, config, cookie) {
	const document = new Document({cookie});

	const window = new Window({
		config,
		customDocument: {document}
	});

	code = code.replace('return z', ';z=injectCode(z,injectOptions); return z');
	code = insertData(code, code.lastIndexOf(')()'), '.bind(window)');

	eval(code);

	return {
		cookies: document.cookieStr,
		imageSrc: document.imgSrc,
		userAgent: window.navigator.userAgent
	};
}

async function evaluate(code, cookie) {
	const configObj = await configReader();
	let {config, folder} = configObj;
	let result = evaluateWithConfig(code, config, cookie);

	return Object.assign(result, {configName: folder});
}

module.exports = {evaluate};