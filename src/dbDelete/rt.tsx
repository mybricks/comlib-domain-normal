import {safeDecodeURIComponent} from "../_utils/util";

export default function ({env, data, outputs, inputs, onError}) {
  inputs['params']((val, relOutpus) => {
	  let script = safeDecodeURIComponent(data.rules?.script);
		
	  if (script) {
		  try {
			  const sql = eval(script)(val)
	      env.executeSql(sql)
	        .then(() => outputs['rtn']())
	        .catch(ex => onError(`执行SQL发生错误,${ex?.message}`));
		  } catch (error: any) {
			  onError(`执行错误, ${error?.message}`);
		  }
    }
  })
}