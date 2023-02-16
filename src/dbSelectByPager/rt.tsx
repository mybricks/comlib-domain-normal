import {safeDecodeURIComponent} from "../_utils/util";

export default function ({env, data, outputs, inputs, onError}) {
  let script = data.selector?.script;
  if (!script) {
    return
  }

  if (data.autoRun) {
    if (script.list) {
      Promise.all([
				eval(safeDecodeURIComponent(script.list))({}, env.executeSql),
	      eval(safeDecodeURIComponent(script.total))({}, env.executeSql)
      ])
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
			
		  if (script.list) {
			  Promise.all([
				  eval(safeDecodeURIComponent(script.list))(values, env.executeSql),
				  eval(safeDecodeURIComponent(script.total))(values, env.executeSql)
			  ])
			  .then(([data, countData]) => {
				  outputs['rtn']({
					  list: data,
					  total: countData[0]?.total
				  });
			  })
			  .catch(ex => {
				  onError(`执行SQL发生错误,${ex?.message}`);
			  });
		  }
	  })
	}
}