export default function ({ env, data, outputs, inputs, _notifyBindings }) {
	inputs['get']((val, relOutpus) => {
		const nowVal = data.val !== void 0 ? data.val : data.initValue;
		const cv = clone(nowVal);

		relOutpus['return'](cv);
	});

	inputs['set']((val, relOutpus) => {
		data.val = val;
		const cVal = clone(val);
		outputs['changed'](cVal, true);//notify all forked coms
		_notifyBindings(cVal);

		relOutpus['return'](cVal);
	});

	inputs['reset'](() => {
		const val = data.initValue;
		data.val = val;
		const cVal = clone(val);

		outputs['changed'](cVal, true);//notify all forked coms
		_notifyBindings(cVal);
	});

	// outputs['changed'](data.val)
}

function clone(val) {
	if (val && typeof val === 'object') {
		try {
			if (val instanceof FormData) {
				return val;
			}
			return JSON.parse(JSON.stringify(val));
		} catch (ex) {
			return val;
		}
	}
	return val;
}