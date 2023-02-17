import {safeDecodeURIComponent} from "../_utils/util";
import {AnyType} from "../_types";

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
		        list: data,
		        total: countData[0]?.total
	        });
	      })
        .catch(ex => {
	        onError(`执行SQL发生错误,${ex?.message}`);
	      });
    }
  } else {
	  inputs['params'](async (val, outputRels) => {
		  const values = { ...(val.pageParams || {}), ...(val.params || {}) };
			
		  if (script.list) {
				try {
					const data = await eval(safeDecodeURIComponent(script.list))(values, env.executeSql);
					const countData = await eval(safeDecodeURIComponent(script.total))(values, env.executeSql);
					
					outputs['rtn']({ list: data, total: countData[0]?.total });
				} catch (e: AnyType) {
					onError(`执行SQL发生错误,${e?.message}`);
				}
		  }
	  })
	}
}