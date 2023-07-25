/** 根据规则以及实体拼接 delete 语句 */
import { Condition, Entity } from '../_types/domain';
import { getValueByOperatorAndFieldType } from './field';
import { SQLWhereJoiner } from '../_constants/field';
import { get } from './util';

/** 根据条件拼接 where sql */
export const spliceWhereSQLFragmentByConditions = (fnParams: {
	conditions: Condition[];
	/** entityMap 是全量实体表 map */
	entityMap: Record<string, Entity>;
	curEntity: Entity;
	params: Record<string, unknown>;
	whereJoiner?: SQLWhereJoiner;
}) => {
	const { conditions, params, whereJoiner, entityMap, curEntity } = fnParams;
	const curConditions = conditions.filter(condition => condition.fieldId);

	const conditionSqlList: string[] = [];

	curConditions.forEach(condition => {
		let curSQL = '';

		if (condition.conditions) {
			curSQL = spliceWhereSQLFragmentByConditions({
				conditions: condition.conditions,
				whereJoiner: condition.whereJoiner,
				params,
				entityMap,
				curEntity,
			});
		} else {
			const entityMapElement = entityMap[condition.entityId];
			const field = entityMapElement?.fieldAry.find(f => f.id === condition.fieldId);

			if (field) {
				let fieldName = `${field.name}`;
				let value = condition.value || '';

				/** mapping 字段映射的实体 */
				if (entityMapElement.id !== curEntity.id) {
					const mappingField = curEntity.fieldAry.find(f => f.mapping?.entity?.id === condition.entityId);
					const curField = mappingField?.mapping?.entity?.fieldAry.find(f => f.id === condition.fieldId);

					fieldName = `MAPPING_${mappingField?.name || entityMapElement.name}` + (curField?.isPrimaryKey ? `.MAPPING_${mappingField?.name || entityMapElement.name}_` : '.') + (curField?.name || field.name);
				}
				if (condition.value.startsWith('{') && condition.value.endsWith('}')) {
					value = get(params, condition.value.substr(1, condition.value.length - 2).split('.').slice(1));
				}

				curSQL = `${fieldName} ${condition.operator} ${getValueByOperatorAndFieldType(field.dbType, condition.operator!, value)}`;
			}
		}

		curSQL && conditionSqlList.push(curSQL);
	});

	/** 只有多个条件才需要括号拼接 */
	let sql = `${conditionSqlList.length > 1 ? '(' : ''}${conditionSqlList.join(` ${whereJoiner} `)}${conditionSqlList.length > 1 ? ')' : ''}`;
	let prefix = '';

	/** whereJoiner 不存在表示最外层 SQL */
	if (!whereJoiner) {
		/** 当 condition 存在时 */
		prefix = `WHERE _STATUS_DELETED = 0${sql ? ' AND ' : ''}`;
	}

	return prefix + sql;
};

export const spliceDeleteSQLByConditions = (fnParams: {
	conditions: Condition;
	entities: Entity[];
	params: Record<string, unknown>;
	isEdit?: boolean;
}) => {
	const { conditions, entities, params, isEdit } = fnParams;
	const entityMap = {};
	entities.forEach(e => entityMap[e.id] = e);
	const curEntity = entities.find(e => e.selected);

	if (curEntity) {
		const sql: string[] = [];

		/** 前置 sql */
		sql.push(`UPDATE ${curEntity.name}${isEdit ? '' : '__VIEW'} SET _STATUS_DELETED = 1, _UPDATE_USER_ID = "", _UPDATE_TIME = ${Date.now()}`);
		sql.push(spliceWhereSQLFragmentByConditions({
			conditions: [conditions],
			params,
			curEntity,
			entityMap,
		}));

		return sql.join(' ');
	}
};