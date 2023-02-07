import {spliceSelectSQLByConditions, spliceSelectCountSQLByConditions} from "../_utils/sql";

export default function ({env, data, outputs, inputs, onError}) {
	const entities = data.selector?.entities ?? [];
	if (data.selector) {
		return;
	}
	
  if (data.autoRun) {
		const sql = spliceSelectSQLByConditions({
			conditions: data.selector.conditions || [],
			entities,
			params: {},
			limit: data.selector.limit,
			orders: data.selector.orders,
			originEntities: data.selector.originEntities,
		});
		const countSql = spliceSelectCountSQLByConditions({
			conditions: data.selector.conditions || [],
			entities,
			params: {},
			originEntities: data.selector.originEntities,
		});
		
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
    let sql = spliceSelectSQLByConditions({
	    conditions: data.selector.conditions || [],
	    entities,
	    params: val,
	    limit: data.selector.limit,
	    orders: data.selector.orders,
	    pageIndex: val.pageIndex,
	    originEntities: data.selector.originEntities,
    });
	  const countSql = spliceSelectCountSQLByConditions({
		  conditions: data.selector.conditions || [],
		  entities,
		  params: val,
		  originEntities: data.selector.originEntities,
	  });
		
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
  })
}