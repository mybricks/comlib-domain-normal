import { spliceDeleteSQLByConditions } from "../_utils/sql";

export default function ({env, data, outputs, inputs, onError}) {
  inputs['params']((val, relOutpus) => {
	  if (data.selector) {
		  return;
	  }
	  const sql = spliceDeleteSQLByConditions({
		  params: val,
		  entities: data.selector.entities,
		  conditions: data.selector.conditions,
	  })
	  
    if (sql) {
      env.executeSql(sql).then(() => {
        outputs['rtn']();
      }).catch(ex => {
        onError(`执行SQL发生错误,${ex?.message}`)
      })
    }
  })
}