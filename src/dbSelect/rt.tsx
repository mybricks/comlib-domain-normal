import {safeDecodeURIComponent} from "../_utils/util";

export default function ({ env, data, outputs, inputs, onError }) {
  let script = safeDecodeURIComponent(data.selector?.script);
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
  }

  inputs['params']((val) => {
    eval(script)(val, { ...env, isEdit }).then(data => {
      outputs['rtn'](data);
    }).catch(ex => {
	    isEdit ? console.error('执行SQL发生错误, ', ex) : undefined;
      onError(`执行SQL发生错误, ${ex?.message}`);
    })
  })
}
