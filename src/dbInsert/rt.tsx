export default function ({env, data, outputs, inputs, onError}) {
  inputs['params']((val, relOutpus) => {
	  let script = data.rules?.script;
		
	  if (script) {
		  const sql = eval(script)(val)
      env.executeSql(sql).then(data => {
        outputs['rtn'](data.insertId)
      }).catch(ex => {
        onError(`执行SQL发生错误,${ex?.message}`)
      })
    }
  })
}