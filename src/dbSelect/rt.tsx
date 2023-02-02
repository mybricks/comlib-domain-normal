import {spliceSelectSQLByConditions, spliceWhereSQLByConditions} from "../_utils/sql";

export default function ({env, data, outputs, inputs, onError}) {
	const entities = data.selector?.entities ?? [];
	
  if (data.autoRun) {
		const sql = spliceSelectSQLByConditions({
			conditions: data.selector.conditions || [],
			entities,
			params: {},
			limit: data.selector.limit
		});
		
    if (sql) {
      env.executeSql(sql).then(data => {
        outputs['rtn'](data.rows)
      }).catch(ex => {
        onError(`执行SQL发生错误,${ex?.message}`)
      })
    }
  }

  inputs['params']((val, relOutpus) => {
    let sql = spliceSelectSQLByConditions({
	    conditions: data.selector.conditions || [],
	    entities,
	    params: val,
	    limit: data.selector.limit
    });
		
    if (sql) {
      env.executeSql(sql).then(data => {
        outputs['rtn'](data.rows)
      }).catch(ex => {
        onError(`执行SQL发生错误,${ex?.message}`)
      })
    }
  })
}