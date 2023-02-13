import {safeDecodeURIComponent} from "../_utils/util";

export default function ({ env, data, outputs, inputs, onError }) {
  let script = safeDecodeURIComponent(data.selector?.script);
  if (!script) {
    return
  }

  if (data.autoRun) {
    const sql = eval(script)({})
    env.executeSql(sql).then(data => {
      outputs['rtn']()
    }).catch(ex => {
      onError(`执行SQL发生错误,${ex?.message}`)
    })
  }

  inputs['params']((val) => {
    const sql = eval(script)(val)
    env.executeSql(sql).then(data => {
      outputs['rtn']()
    }).catch(ex => {
      onError(`执行SQL发生错误,${ex?.message}`)
    })
  })
}