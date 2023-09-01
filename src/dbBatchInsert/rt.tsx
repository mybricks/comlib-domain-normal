import { spliceInsertSQL, validateParams } from '../_utils/insertSQL';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AnyType } from '../_types';

export default function ({ env, data, outputs, inputs, onError }) {
	inputs['params'](val => {
	  const isEdit = env.runtime?.debug;
		
	  if (data.rules) {
		  try {
				if (!val || !Array.isArray(val) || !val.length) {
					throw new Error('输入数据错误，非数组或数字为空');
				}

				validateParams(val, data.rules.entities[0], data.rules.conAry);
			  const sql = spliceInsertSQL({
					entity: data.rules.entities[0],
					isEdit,
					data: val,
					batch: true,
					conAry: data.rules.conAry,
					genUniqueId: env.genUniqueId,
					encrypt: env.encrypt,
				});
			  env.executeSql(sql)
			    .then(data => outputs['rtn'](data.insertId || data.rows?.[0]?.insertId))
			    .catch(ex => onError(`执行SQL发生错误, ${ex?.message}`));
		  } catch (error: AnyType) {
			  isEdit ? console.error('执行SQL发生错误, ', error) : undefined;
			  onError(`执行错误, ${error?.message}`);
		  }
		}
	});
}
