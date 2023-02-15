import {safeDecodeURIComponent} from "../_utils/util";

export default function ({env, data, outputs, inputs, onError}) {
  inputs['params']((val, relOutpus) => {
	  let script = safeDecodeURIComponent(data.rules?.script);
		
	  if (script) {
		  const sql = eval(script)(val)
      env.executeSql(sql).then(data => {
        outputs['rtn']()
      }).catch(ex => {
        onError(`执行SQL发生错误,${ex?.message}`)
      })
    }
  })
}

// import {spliceUpdateSQLByConditions} from "../_utils/sql";

// export default function ({env, data, outputs, inputs, onError}) {
//   inputs['params']((val, relOutpus) => {
// 		if (!data.rules) {
// 			return;
// 		}
// 	  const sql = spliceUpdateSQLByConditions({
// 		  conditions: data.rules.conditions,
// 		  connectors: data.rules.conAry,
// 		  params: val,
// 		  entities: data.rules.entities,
// 	  })
	  
//     if (sql) {
//       env.executeSql(sql).then(data => {
//         outputs['rtn']()
//       }).catch(ex => {
//         onError(`执行SQL发生错误,${ex?.message}`)
//       })
//     }
//   })
// }