/** 根据规则以及实体拼接 update 语句 */
import { spliceWhereSQLFragmentByConditions } from './deleteSQL';
import { getQuoteByFieldType } from './field';
import { Condition, Entity } from '../_types/domain';
import { get } from './util';

/** 拼接 update 语句设置值的 sql */
export const spliceUpdateSQLFragmentByConditions = (fnParams: {
	connectors: Array<{ from: string; to: string }>;
	entity: Entity;
	params: Record<string, unknown>;
}) => {
	const { connectors, entity, params } = fnParams;
	return connectors
		.map(connector => {
			const { from, to } = connector;
			const toFieldName = to.replace('/', '');
			const field = entity.fieldAry.find(f => f.name === toFieldName);
			
			if (!field) {
				return undefined;
			}
			
			const fromNames = from.split('/').filter(Boolean);
			const value = get(params, fromNames);
			const q = getQuoteByFieldType(field.dbType as string);

			if (value === undefined) {
				return '';
			}

			return `, ${toFieldName} = ${value === null ? null : `${q}${Array.isArray(value) || Object.prototype.toString.call(value) === '[object Object]' ? JSON.stringify(value) : value}${q}`}`;
		})
		.filter(Boolean)
		.join('');
};

export const spliceUpdateSQLByConditions = (fnParams: {
	conditions: Condition;
	connectors: Array<{ from: string; to: string }>;
	entities: Entity[];
	params: Record<string, unknown>;
	isEdit?: boolean;
}) => {
	const { conditions, entities, params, connectors, isEdit } = fnParams;
	const entityMap = {};
	entities.forEach(e => entityMap[e.id] = e);
	const curEntity = entities.find(e => e.selected);

	if (curEntity) {
		const sql: string[] = [];

		/** 前置 sql */
		sql.push(`UPDATE ${curEntity.name}${isEdit ? '' : '__VIEW'} SET _UPDATE_USER_ID = "", _UPDATE_TIME = ${Date.now()}`);
		sql.push(spliceUpdateSQLFragmentByConditions({
			connectors,
			entity: curEntity,
			params,
		}));
		sql.push(spliceWhereSQLFragmentByConditions({
			conditions: [conditions],
			params,
			curEntity,
			entityMap,
		}));

		return sql.join(' ');
	}
};
