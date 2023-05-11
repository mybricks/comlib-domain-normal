import {safeDecodeURIComponent} from "../_utils/util";
import {AnyType} from "../_types";

export default function ({env, data, outputs, inputs, onError}) {
  let script = data.selector?.script;
  if (!script) {
    return
  }
	const isEdit = env.runtime?.debug;

  if (data.autoRun) {
	  eval(script)({}, { ...env, isEdit }).then(data => {
		  outputs['rtn'](data);
	  }).catch(ex => {
		  isEdit ? console.error('执行SQL发生错误, ', ex) : undefined;
		  onError(`执行SQL发生错误, ${ex?.message}`);
	  })
  } else {
	  inputs['params'](async (val) => {
		  const values = { ...(val.pageParams || {}), ...(val.params || {}) };
		
		  try {
			  const data = await eval(safeDecodeURIComponent(script))(values, { ...env, isEdit });
			
			  outputs['rtn'](data);
		  } catch (e: AnyType) {
			  isEdit ? console.error('执行SQL发生错误, ', e) : undefined;
			  onError(`执行SQL发生错误, ${e?.message}`);
		  }
	  })
	}
}
