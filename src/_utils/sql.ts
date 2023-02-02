import { Condition, Entity } from '../_types/domain';
import { SQLWhereJoiner } from '../_constants/field';
import { getValueByOperatorAndFieldType } from './field';

/** 根据条件拼接 where sql */
export const spliceWhereSQLByConditions = (fnParams: {
	conditions: Condition[];
	entities: Entity[];
	params: Record<string, unknown>;
	whereJoiner?: SQLWhereJoiner;
}) => {
	const { conditions, entities, params, whereJoiner } = fnParams;
	const curConditions = conditions
		.filter(condition => condition.fieldId)
		/** 筛选使用变量时，变量不存在的条件 */
		.filter(condition => {
			if (condition.conditions) {
				return true;
			} else {
				/** 变量 */
				if (condition.checkExist && condition.value.startsWith('{') && condition.value.endsWith('}')) {
					const curValue = condition.value.substr(1, condition.value.length - 2);
					
					/** 非实体字段，即使用的变量，如 params.id */
					if (!new RegExp(`^${entities.map(e => e.name).join('|')}\\.`).test(curValue)) {
						return params[curValue.substring(curValue.indexOf('.')+1)] !== undefined;
					}
				}
			}
			
			return true;
		});
	
	/** 只有多个条件才需要括号拼接 */
	let sql = curConditions.length > 1 ? '(' : '';
	
	curConditions.forEach((condition, index) => {
		/** 非第一个条件 */
		if (index > 0) {
			sql += ` ${whereJoiner ?? ''} `;
		}
		
		if (condition.conditions) {
			sql += spliceWhereSQLByConditions({ conditions: condition.conditions, entities, whereJoiner: condition.whereJoiner, params });
		} else {
			const field = entities.find(e => e.id === condition.entityId)?.fieldAry.find(f => f.id === condition.fieldId);
			
			if (field) {
				let value = condition.value || '';
				let isEntityField = false;
				/** 支持直接使用数据库字段，如 文件表.id = 用户表.文件id */
				if (condition.value.startsWith('{') && condition.value.endsWith('}')) {
					const curValue = condition.value.substr(1, condition.value.length - 2);
					
					if (new RegExp(`^${entities.map(e => e.name).join('|')}\\.`).test(curValue)) {
						value = curValue;
						isEntityField = true;
					} else {
						value = params[curValue.substring(curValue.indexOf('.')+1)] as string;
					}
				}
				
				sql += `${condition.fieldName} ${condition.operator} ${isEntityField ? value : getValueByOperatorAndFieldType(field.dbType, condition.operator!, value)}`;
			}
		}
	});
	
	sql += curConditions.length > 1 ? ')' : '';
	
	return (!whereJoiner ? 'WHERE ' : '') +  sql;
};

/** 根据规则以及实体拼接 select 语句 */
export const spliceSelectSQLByConditions = (fnParams: {
	conditions: Condition;
	entities: Entity[];
	params: Record<string, unknown>;
	limit: number;
}) => {
	const { conditions, entities, params, limit } = fnParams;
	
	if (entities.length) {
		const sql: string[] = [];
		let fieldList: string[] = [];
		/** 字段列表 */
		entities.forEach((entity) => {
			fieldList.push(...entity.fieldAry.map(field => `${entity.name}.${field.name}`));
		}, []);
		
		/** 前置 sql */
		sql.push(`SELECT ${fieldList.join(', ')} FROM ${entities.map(entity => entity.name).join(', ')}`);
		sql.push(spliceWhereSQLByConditions({
			conditions: [conditions],
			entities,
			params,
		}));
		sql.push(`LIMIT ${limit}`);
		
		return sql.join(' ');
	}
};