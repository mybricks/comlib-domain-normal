import { Data } from './constants';
import { convertObject2Array } from './util';
import { AnyType } from '../_types';

export default function ({ env, data, inputs, outputs, onError }: RuntimeParams<Data>) {
	const { fns, runImmediate } = data;
	const isDebug = env.runtime?.debug;

	const runJSParams = {
		outputs: convertObject2Array(outputs),
		env,
	};
	try {
		if (runImmediate) {
			if (env.runtime) {
	      eval(decodeURIComponent(fns))(runJSParams);
			}
		}
		inputs['input']((val) => {
	    try {
		    eval(decodeURIComponent(fns))({ ...runJSParams, inputs: convertObject2Array(val) });
	    } catch (ex: AnyType) {
		    onError?.(ex.message);
		    env.edit ? console.error('js计算组件运行错误.', ex) : env.logger?.error(`${ex}`);
	    }
		});
	} catch (ex: AnyType) {
	  onError?.(ex.message);
	  env.edit ? console.error('js计算组件运行错误.', ex) : env.logger?.error(`${ex}`);
	}
}
