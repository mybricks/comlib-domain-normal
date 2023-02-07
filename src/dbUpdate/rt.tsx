import {spliceUpdateSQLByConditions} from "../_utils/sql";

export default function ({env, data, outputs, inputs, onError}) {
  inputs['params']((val, relOutpus) => {
	  const sql = spliceUpdateSQLByConditions({
		  conditions: data.rules.conditions,
		  connectors: data.rules.connectors,
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