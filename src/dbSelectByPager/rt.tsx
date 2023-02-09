import {spliceSelectSQLByConditions, spliceSelectCountSQLByConditions} from "../_utils/sql";

export default function ({env, data, outputs, inputs, onError}) {
	const entities = data.selector?.entities ?? [];
	if (!data.selector) {
		return;
	}
	
  let script = data.selector?.script;
  if (!script) {
    return
  }

  if (data.autoRun) {
		const sql = eval(script.list)({})
		const countSql = eval(script.total)({})
		
    if (sql) {
      Promise.all([env.executeSql(sql), env.executeSql(countSql)])
	      .then(([data, countData]) => {
	        outputs['rtn']({
		        list: data.rows,
		        total: countData.rows[0].total
	        })
	      })
        .catch(ex => {
	        onError(`执行SQL发生错误,${ex?.message}`)
	      });
    }
  }

  inputs['params']((val) => {
		const sql = eval(script.list)(val)
		const countSql = eval(script.total)(val)
		
	  console.log('executeSql 执行前传入的 SQL: ', sql);
		
    if (sql) {
	    Promise.all([env.executeSql(sql), env.executeSql(countSql)])
	    .then(([data, countData]) => {
		    outputs['rtn']({
			    list: data.rows,
			    total: countData.rows[0]?.total
		    })
	    })
	    .catch(ex => {
		    onError(`执行SQL发生错误,${ex?.message}`)
	    });
    }
  })
}