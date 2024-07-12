import { spliceSelectSQLByConditions } from '../_utils/selectSQL';

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
		selectCount: true,
		orders: data.selector.orders,
		pageNum: data.selector.pageNum,
		isEdit,
	};

	const select = async (params) => {
		env.collect('查询数据总数 params: ', params)
		const [, countSql] = spliceSelectSQLByConditions(params) || [];
		env.collect('查询数据总数 countSql: ', countSql)
		const { rows: countRows } = await env.executeSql(countSql);
		env.collect('查询数据总数 res: ', { rows: countRows })

		return { total: countRows[0] ? countRows[0].total : 0 };
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
		select({ ...baseParams, params: val })
			.then(data => outputs['rtn'](data))
			.catch(ex => {
	      isEdit ? console.error('执行SQL发生错误, ', ex) : undefined;
				onError(`执行SQL发生错误, ${ex?.message}`);
			});
	});
}
