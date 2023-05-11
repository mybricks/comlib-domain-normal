import {safeDecodeURIComponent} from "../_utils/util";

export default function ({env, data, outputs, inputs, onError}) {
  inputs['params']((val, relOutpus) => {
	  let script = safeDecodeURIComponent(data.rules?.script);
	  const isEdit = env.runtime?.debug;
		
	  if (script) {
		  try {
			  const sql = eval(script)(val, { ...env, isEdit })
	      env.executeSql(sql)
	        .then(() => outputs['rtn']())
	        .catch(ex => onError(`执行SQL发生错误,${ex?.message}`));
		  } catch (error: any) {
			  isEdit ? console.error('执行SQL发生错误, ', error) : undefined;
			  onError(`执行错误, ${error?.message}`);
		  }
    }
  })
}
