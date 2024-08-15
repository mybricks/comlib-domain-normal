// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AnyType } from '../_types';
import { spliceDeleteSQLByConditions } from '../_utils/deleteSQL';

export default function ({ env, data, outputs, inputs, onError }) {
	inputs['params'](val => {
		const isEdit = env.runtime?.debug;

	  if (data.rules) {
		  try {
				env.collect('删除数据 val: ', val);
			  const sql = spliceDeleteSQLByConditions({
					conditions: data.rules.conditions,
					entities: data.rules.entities,
					params: val,
					isEdit,
				});
				env.collect('删除数据 sql: ', sql);
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
