export default function ({env, data, outputs, inputs, onError}) {
  if (data.autoRun) {
    if (data.selector?.sql) {
      env.executeSql(data.selector.sql).then(data => {
        outputs['rtn'](data.rows)
      }).catch(ex => {
        onError(`执行SQL发生错误,${ex?.message}`)
      })
    }
  }

  inputs['params']((val, relOutpus) => {
    let sql = data.selector?.sql
    if (sql) {
      sql = sql.replace(/\{([^\}]*)\}/gi,(ori,varName)=>{
        return val[varName.substring(varName.indexOf('.')+1)]
      })

      env.executeSql(sql).then(data => {
        outputs['rtn'](data.rows)
      }).catch(ex => {
        onError(`执行SQL发生错误,${ex?.message}`)
      })
    }
  })
}