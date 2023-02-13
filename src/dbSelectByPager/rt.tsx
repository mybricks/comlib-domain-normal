import {safeDecodeURIComponent} from "../_utils/util";

export default function ({env, data, outputs, inputs, onError}) {
  let script = data.selector?.script;
  if (!script) {
    return
  }

  if (data.autoRun) {
		const sql = eval(safeDecodeURIComponent(script.list))({})
		const countSql = eval(safeDecodeURIComponent(script.total))({})
		
    if (sql) {
      Promise.all([env.executeSql(sql), env.executeSql(countSql)])
	      .then(([data, countData]) => {
	        outputs['rtn']({
		        list: data.rows,
		        total: countData.rows[0].total
	        });
	      })
        .catch(ex => {
	        onError(`执行SQL发生错误,${ex?.message}`);
	      });
    }
  } else {
	  inputs['params']((val, outputRels) => {
		  const values = { ...(val.pageParams || {}), ...(val.params || {}) };
		  const sql = eval(safeDecodeURIComponent(script.list))(values);
		  const countSql = eval(safeDecodeURIComponent(script.total))(values);
		
		  console.log('executeSql 执行前传入的 SQL: ', sql);
		  if (sql) {
			  Promise.all([env.executeSql(sql), env.executeSql(countSql)])
			  .then(([data, countData]) => {
				  outputs['rtn']({
					  list: data.rows,
					  total: countData.rows[0]?.total
				  });
			  })
			  .catch(ex => {
				  onError(`执行SQL发生错误,${ex?.message}`);
			  });
		  }
	  })
	}
}