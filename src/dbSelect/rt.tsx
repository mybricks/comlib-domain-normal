import {safeDecodeURIComponent} from "../_utils/util";

export default function ({ env, data, outputs, inputs, onError }) {
  let script = safeDecodeURIComponent(data.selector?.script);
  if (!script) {
    return
  }

  if (data.autoRun) {
	  eval(script)({}, env.executeSql).then(data => {
      outputs['rtn'](data);
    }).catch(ex => {
      onError(`执行SQL发生错误,${ex?.message}`);
    })
  }

  inputs['params']((val) => {
    eval(script)(val, env.executeSql).then(data => {
      outputs['rtn'](data);
    }).catch(ex => {
      onError(`执行SQL发生错误,${ex?.message}`);
    })
  })
}