export default function ({env, data, outputs, inputs, onError}) {
  inputs['params']((val, relOutpus) => {
    let sql = data.rules?.sql
    if (sql) {
      data.rules.conAry.forEach(con => {
        const tv = getValInFrom(val, con.from)
        sql = sql.replaceAll(`{${con.from}}`, tv)
      })

      env.executeSql(sql).then(data => {
        outputs['rtn'](data.insertId)
      }).catch(ex => {
        onError(`执行SQL发生错误,${ex?.message}`)
      })
    }
  })
}

function getValInFrom(fromVal, xpath) {
  const ary = xpath.split('/')
  let tv = fromVal
  ary.forEach(now => {
    if (now !== '') {
      if (tv === void 0 || typeof tv !== 'object' || Array.isArray(tv)) {
        throw new Error('Invalid datasource type in ' + xpath)
      }
      tv = tv[now]
    }
  })

  return tv
}