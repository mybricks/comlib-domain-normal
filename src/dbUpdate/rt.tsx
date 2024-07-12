// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AnyType } from '../_types';
import { validateParams } from '../_utils/insertSQL';
import { spliceUpdateSQLByConditions } from '../_utils/updateSQL';

export default function ({ env, data, outputs, inputs, onError }) {
	inputs['params'](val => {
	  const isEdit = env.runtime?.debug;
		
	  if (data.rules) {
		  try {
				validateParams(val, data.rules.entities[0], data.rules.conAry, false);
				env.collect('更新数据 params: ', val)
			  const sql = spliceUpdateSQLByConditions({
					conditions: data.rules.conditions,
					connectors: data.rules.conAry,
					entities: data.rules.entities,
					params: val,
					isEdit,
					encrypt: env.encrypt,
				});
				env.collect('更新数据 sql: ', sql)

	      env.executeSql(sql)
	        .then(() => outputs['rtn']())
	        .catch(ex => onError(`执行SQL发生错误,${ex?.message}`));
		  } catch (error: AnyType) {
			  isEdit ? console.error('执行SQL发生错误, ', error) : undefined;
			  onError(`执行错误, ${error?.message}`);
		  }
		}
	});
}
