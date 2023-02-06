export default function ({env, data, outputs, inputs, onError}) {
  inputs['params']((val, relOutpus) => {
    if (data.sqlString) {
      env.executeSql(data.sqlString).then(data => {
        outputs['rtn'](data.insertId)
      }).catch(ex => {
        onError(`执行SQL发生错误,${ex?.message}`)
      })
    }
  })
}