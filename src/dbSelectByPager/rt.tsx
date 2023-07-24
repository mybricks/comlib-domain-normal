import { spliceSelectSQLByConditions } from '../_utils/selectSQL';
import { spliceDataFormat } from '../_utils/format';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AnyType } from '../_types';

export default function ({ env, data, outputs, inputs, onError }) {
	if (!data.selector) {
		return;
	}
	const isEdit = env.runtime?.debug;
	const baseParams = {
		params: {},
		fields: data.selector.fields || [],
		conditions: data.selector.conditions || [],
		entities: data.selector.entities || [],
		limit: data.selector.limit,
		showPager: true,
		selectCount: false,
		orders: data.selector.orders,
		pageNum: data.selector.pageNum,
		isEdit,
	};

	const select = async (params) => {
		const [sql, countSql] = spliceSelectSQLByConditions(params) || [];

		let { rows } = await env.executeSql(sql);
		rows = Array.from(rows || []);
		spliceDataFormat(params.fields || [], params.entities, rows);
		const { rows: countRows } = await env.executeSql(countSql);

		return {
			dataSource: rows,
			total: countRows[0] ? countRows[0].total : 0,
			pageNum: params.params.pageNum || 1,
			pageSize: params.params.pageSize || 50
		};
	};

	if (data.autoRun) {
		select(baseParams)
			.then(data => outputs['rtn'](data))
			.catch(ex => {
		  isEdit ? console.error('执行SQL发生错误, ', ex) : undefined;
		  onError(`执行SQL发生错误, ${ex?.message}`);
	  });
	} else {
	  inputs['params'](async (val) => {
		  const values = { ...(val.pageParams || {}), ...(val.params || {}) };
		
		  try {
			  const data = await select({
					...baseParams,
					params: values,
					orders: (values.orders && Array.isArray(values.orders)) ? values.orders : baseParams.orders
				});
			
			  outputs['rtn'](data);
		  } catch (e: AnyType) {
			  isEdit ? console.error('执行SQL发生错误, ', e) : undefined;
			  onError(`执行SQL发生错误, ${e?.message}`);
		  }
	  });
	}
}
