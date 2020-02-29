function insertData(str, index, data) {
	return str.slice(0, index) + data + str.slice(index);
}

String.prototype.replaceAll = function (target, replacement) {
	return this.split(target).join(replacement);
};

function injectCode(code, options) {
	const {bindThisLastIIFE, allFunctionToArrow, bindThisToEvalInsideDOMFunc, custom} = options;

	if (bindThisLastIIFE) {
		const lastiife = code.lastIndexOf(';}}());') + ';}}'.length;
		code = insertData(code, lastiife, '.bind(window)');
	}

	const testEvalType = code.match(/(\(eval,[0-9_xa-f]+\))/); // (eval, ....)
	const testEvalType2 = code.match(/(eval\([0-9_xa-f]+\))/); // eval(...)

	if (bindThisToEvalInsideDOMFunc && testEvalType !== null) {
		const goingToEval = code.match(/(\(eval,[0-9_xa-f]+\))/);
		const goodGoingToEval = goingToEval.map((val) => {
			const name = val.replace('(eval,', '').replace(')', '');
			return `.call(this,()=>eval('this.'+${name}))`;
		});

		for (let i = 0; i < goodGoingToEval.length; i++) {
			code = code.replace(goingToEval[i], goodGoingToEval[i]);
		}
	}

	if (bindThisToEvalInsideDOMFunc && testEvalType2 !== null) {
		// eval(_0x1a7ffa)
		const goingToEval = code.match(/(eval\([0-9_xa-f]+\))/);
		const goodGoingToEval = goingToEval.map((val) => {
			const name = val.replace('eval(', '').replace(')', '');
			return `eval('this.'+${name})`;
		});

		for (let i = 0; i < goodGoingToEval.length; i++) {
			code = code.replace(goingToEval[i], goodGoingToEval[i]);
		}
	}

/*
	if (bindThisToDOMFunc) {
		const iOfEndDOMFunc = code.lastIndexOf(')]();}var') + ')]();}'.length;
		const nameOfDomFunc = code.match(/function ([0-9a-f_x]+)\([0-9a-f_x]+\)\{var [0-9a-f_x]+='';var [0-9a-f_x]+=new Array\(\)/)[1];
		code = insertData(code, iOfEndDOMFunc, `;${nameOfDomFunc} = ${nameOfDomFunc}.bind(this);`);
	}
*/

	if (custom && custom.length !== 0) {
		custom.forEach(combination => {
			code = code.replaceAll(combination[0], combination[1]);
		});
	}

	if (allFunctionToArrow) {
		const regexp = /(\(function\(\)\{.*?\}\(\)\))/g;
		const defaultFunctions = code.match(regexp);
		const modifiedFunctions = defaultFunctions.map(val => {
			return val.replace(/^\(function\(\)\{/, '(()=>{').replace(/\}\(\)\)$/, '})()');
		});

		for (let i = 0; i < modifiedFunctions.length; i++) {
			code = code.replace(defaultFunctions[i], modifiedFunctions[i]);
		}
	}
	return code;
}

module.exports = {injectCode, insertData};