import { spliceInsertSQLByConditions } from '../_utils/sql';

export default function ({env, data, outputs, inputs, onError}) {
  inputs['params']((val, relOutpus) => {
	  if (data.rules) {
		  return;
	  }
		
	  const sql = spliceInsertSQLByConditions({
		  connectors: data.rules.conAry,
		  params: val,
		  entities: data.rules.entities,
	  })
	
	  if (sql) {
      env.executeSql(sql).then(data => {
        outputs['rtn'](data.insertId)
      }).catch(ex => {
        onError(`执行SQL发生错误,${ex?.message}`)
      })
    }
  })
}