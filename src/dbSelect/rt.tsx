import { spliceSelectSQLByConditions } from "../_utils/sql";

export default function ({ env, data, outputs, inputs, onError }) {
  const entities = data.selector?.entities ?? [];
  if (!data.selector) {
    return;
  }

  let script = data.rules?.script;
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