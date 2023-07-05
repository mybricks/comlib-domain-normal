import { Data } from './constants';
import { convertObject2Array } from './util';

export default function ({ env, data, inputs, outputs, onError }: RuntimeParams<Data>) {
  const { fns, runImmediate } = data;

  const runJSParams = {
    outputs: convertObject2Array(outputs),
    env: { executeSql: sql => env.executeSql(sql, true) },
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
	    } catch (ex: any) {
		    onError?.(ex.message);
		    env.edit ? console.error('js计算组件运行错误.', ex) : env.logger?.error(`${ex}`);
	    }
    });
  } catch (ex: any) {
	  onError?.(ex.message);
	  env.edit ? console.error('js计算组件运行错误.', ex) : env.logger?.error(`${ex}`);
  }
}
