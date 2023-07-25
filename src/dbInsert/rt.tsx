import { spliceInsertSQL } from '../_utils/insertSQL';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AnyType } from '../_types';

export default function ({ env, data, outputs, inputs, onError }) {
	inputs['params'](val => {
	  const isEdit = env.runtime?.debug;
		
	  if (data.rules) {
		  try {
				const sql = spliceInsertSQL({
					entity: data.rules.entities[0],
					isEdit,
					data: val,
					batch: false,
					conAry: data.rules.conAry,
					genUniqueId: env.genUniqueId,
				});
			  env.executeSql(sql)
			    .then(data => outputs['rtn'](data.insertId || data.rows?.insertId))
			    .catch(ex => onError(`执行SQL发生错误, ${ex?.message}`));
		  } catch (error: AnyType) {
			  isEdit ? console.error('执行SQL发生错误, ', error) : undefined;
			  onError(`执行错误, ${error?.message}`);
		  }
		}
	});
}
