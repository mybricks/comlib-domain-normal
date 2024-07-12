import { Data } from './constants';
import { convertObject2Array } from './util';
import { AnyType } from '../_types';

export default function ({ env, data, inputs, outputs, onError }: RuntimeParams<Data>) {
	const { fns, runImmediate } = data;
	const isDebug = env.runtime?.debug;

	const runJSParams = {
		outputs: convertObject2Array(outputs),
		env: {
			executeSql: sql => env.executeSql(sql),
			genUniqueId: env.genUniqueId,
			getEntityName: isDebug ? _ => _ : env.getEntityName,
			encrypt: env.encrypt,
			decrypt: env.decrypt,
		},
	};
	try {
		if (runImmediate) {
			if (env.runtime) {
	      eval(decodeURIComponent(fns.transformCode || fns))(runJSParams);
			}
		}
		inputs['input']((val) => {
			env.collect('执行 JS计算: ', val);
	    try {
		    eval(decodeURIComponent(fns.transformCode || fns))({ ...runJSParams, inputs: convertObject2Array(val) });
				env.collect('执行 JS计算 结束: ', val);
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
