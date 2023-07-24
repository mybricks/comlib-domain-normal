import { spliceSelectSQLByConditions } from '../_utils/selectSQL';
import { spliceDataFormat } from '../_utils/format';

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
		showPager: false,
		selectCount: false,
		orders: data.selector.orders,
		pageNum: data.selector.pageNum,
		isEdit,
	};
	
	const select = async (params) => {
		const [sql] = spliceSelectSQLByConditions(params) || [];
		let { rows } = await env.executeSql(sql);

		rows = Array.from(rows || []);
		spliceDataFormat(params.fields || [], params.entities, rows);

		return rows;
	};

	if (data.autoRun) {
		select(baseParams)
			.then(data => outputs['rtn'](data))
			.catch(ex => {
				isEdit ? console.error('执行SQL发生错误, ', ex) : undefined;
				onError(`执行SQL发生错误, ${ex?.message}`);
			});
	}

	inputs['params']((val) => {
		select({
			...baseParams,
			params: val,
			orders: (val.orders && Array.isArray(val.orders)) ? val.orders : baseParams.orders
		})
			.then(data => outputs['rtn'](data))
			.catch(ex => {
				isEdit ? console.error('执行SQL发生错误, ', ex) : undefined;
				onError(`执行SQL发生错误, ${ex?.message}`);
			});
	});
}
