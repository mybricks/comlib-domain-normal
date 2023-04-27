import {safeDecodeURIComponent} from "../_utils/util";
import {AnyType} from "../_types";

export default function ({env, data, outputs, inputs, onError}) {
  let script = data.selector?.script;
  if (!script) {
    return
  }

  if (data.autoRun) {
	  eval(script)({}, env.executeSql).then(data => {
		  outputs['rtn'](data);
	  }).catch(ex => {
		  onError(`执行SQL发生错误,${ex?.message}`);
	  })
  } else {
	  inputs['params'](async (val) => {
		  const values = { ...(val.pageParams || {}), ...(val.params || {}) };
		
		  try {
			  const data = await eval(safeDecodeURIComponent(script))(values, env.executeSql);
			
			  outputs['rtn'](data);
		  } catch (e: AnyType) {
			  onError(`执行SQL发生错误,${e?.message}`);
		  }
	  })
	}
}
