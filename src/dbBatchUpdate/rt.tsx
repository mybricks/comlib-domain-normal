// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AnyType } from '../_types';
import { validateParams } from '../_utils/insertSQL';
import { spliceUpdateSQLByConditions } from '../_utils/updateSQL';

export default function ({ env, data, outputs, inputs, onError }) {
	inputs['params'](async val => {
	  const isEdit = env.runtime?.debug;
		
	  if (data.rules) {
		  try {
				if (!val || !Array.isArray(val) || !val.length) {
					throw new Error('输入数据错误，非数组或数字为空');
				}

				for (const item of val) {
					validateParams(item, data.rules.entities[0], data.rules.conAry);
					const sql = spliceUpdateSQLByConditions({
						conditions: data.rules.conditions,
						connectors: data.rules.conAry,
						entities: data.rules.entities,
						params: item,
						isEdit,
						encrypt: env.encrypt,
					});

					await env.executeSql(sql);
				}

				outputs['rtn']();
		  } catch (error: AnyType) {
			  isEdit ? console.error('执行SQL发生错误, ', error) : undefined;
			  onError(`执行错误, ${error?.message}`);
		  }
		}
	});
}
