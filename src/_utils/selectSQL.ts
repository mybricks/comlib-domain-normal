/** 根据规则以及实体拼接 select 语句 */
import { Condition, Entity, Field, Order, SelectedField } from '../_types/domain';
import { AnyType } from '../_types';
import { getValueByOperatorAndFieldType } from './field';
import { FieldBizType, SQLOperator } from '../_constants/field';

/** 根据条件拼接 where sql */
const spliceWhereSQLFragmentByConditions = (fnParams: {
	conditions: Condition[];
	entities: Entity[];
	/** entityMap 是全量实体表 map */
	entityMap: Record<string, Entity>;
	entityFieldMap: Record<string, Field>;
	curEntity: Entity;
	params: Record<string, unknown>;
	whereJoiner?: AnyType;
}) => {
	const { conditions, entities, params, whereJoiner, entityMap, curEntity, entityFieldMap } = fnParams;

	const curConditions = conditions
		.filter(condition => condition.fieldId)
		/** 筛选条件对应值不存在的情况 */
		.filter(condition => {
			if (condition.conditions) {
				return true;
			} else {
				/** 变量 */
				if (condition.value?.startsWith('{') && condition.value?.endsWith('}')) {
					const curValue = condition.value.substr(1, condition.value.length - 2);

					/** 非实体字段，即使用的变量，如 params.id */
					if (!new RegExp(`^${entities.map(e => e.name).join('|')}\\.`).test(curValue)) {
						let valueKeys = curValue.split('.').slice(1);
						let preValue: AnyType = params;
						let value: AnyType = undefined;
						for (let idx = 0; idx < valueKeys.length; idx++){
							const key = valueKeys[idx];
							preValue = preValue[key];

							if (idx === valueKeys.length - 1) {
								value = preValue;
							} else if (typeof preValue !== 'object' || preValue === null) {
								break;
							}
						}
						if (condition.operator === 'IN' || condition.operator === 'NOT IN') {
							if (Array.isArray(value) && !value?.length) {
								return false;
							} else {
								return value !== undefined && value !== '';
							}
						}

						return value !== undefined;
					}
				} else {
					return [SQLOperator.IS_NOT_NULL, SQLOperator.IS_NULL].includes(condition?.operator as SQLOperator) ? true : condition?.value !== undefined;
				}
			}

			return true;
		});
	const conditionSqlList: string[] = [];

	curConditions.forEach(condition => {
		let curSQL;

		if (condition.conditions) {
			curSQL = spliceWhereSQLFragmentByConditions({
				conditions: condition.conditions,
				entities,
				whereJoiner: condition.whereJoiner,
				params,
				entityMap,
				curEntity,
				entityFieldMap,
			});
		} else {
			const field = entityFieldMap[condition.entityId + condition.fieldId];
			/** 变量名拼接 */
			let fieldName = field.name;

			if (condition.fromPath.length) {
				const lastPath = condition.fromPath[condition.fromPath.length - 1];
				const parentField = entityFieldMap[lastPath.entityId + lastPath.fieldId];
				const isCountCondition = parentField.mapping?.condition?.startsWith('count(') && parentField.mapping?.condition?.endsWith(')');

				fieldName = `MAPPING_${[...condition.fromPath.map(p => entityFieldMap[p.entityId + p.fieldId].name), isCountCondition ? '总数' : field.name].join('_')}`;
			}

			let value = condition.value || '';
			let isEntityField = false;
			/** 支持直接使用数据库字段，如 文件表.id = 用户表.文件id */
			if (condition.value.startsWith('{') && condition.value.endsWith('}')) {
				const curValue = condition.value.substr(1, condition.value.length - 2);

				if (new RegExp(`^${entities.map(e => e.name).join('|')}\\.`).test(curValue)) {
					value = curValue;
					isEntityField = true;
				} else {
					let valueKeys = curValue.split('.').slice(1);
					let preValue: AnyType = params;
					for (let idx = 0; idx < valueKeys.length; idx++){
						const key = valueKeys[idx];
						preValue = preValue[key];

						if (idx === valueKeys.length - 1) {
							value = preValue;
						} else if (typeof preValue !== 'object' || preValue === null) {
							// @ts-ignore
							value = undefined;
							break;
						}
					}
				}
			}

			curSQL = `${fieldName} ${condition.operator} ${isEntityField ? value : getValueByOperatorAndFieldType(field.dbType, condition.operator!, value)}`;
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

export const spliceSelectSQLByConditions = (fnParams: {
	orders: Order[];
	conditions: Condition;
	fields: SelectedField[];
	entities: Entity[];
	params: Record<string, unknown>;
	limit: { type: string; value: number | string };
	pageNum?: string;
	showPager?: boolean;
	selectCount?: boolean;
	isEdit?: boolean;
}) => {
	let { conditions, entities, params, limit, orders = [], pageNum, fields, showPager, selectCount, isEdit } = fnParams;
	const curEntity = entities.find(e => e.selected);

	if (curEntity && curEntity.fieldAry.length) {
		/** 实体 Map */
		const entityMap = {};
		/** 实体 + 字段的 Map */
		const entityFieldMap: Record<string, Field> = {};
		entities.forEach(entity => {
			entityMap[entity.id] = entity;
			entity.fieldAry.forEach(field => {
				entityFieldMap[entity.id + field.id] = field;

				if (entity.isSystem && !field.isPrivate) {
					entityFieldMap[entity.id + field.name] = field;
				}

				if (field.mapping?.entity?.fieldAry?.length) {
					field.mapping.entity.fieldAry
						.filter(f => f.bizType === FieldBizType.CALC)
						.forEach(f => entityFieldMap[field.mapping!.entity!.id + f.id] = f);
				}
			});
		});
		/** 数据查询语句 */
		const sql: string[] = [];
		/** 查询总数语句 */
		const countSql: string[] = [];
		const fieldList: string[] = [];
		const getTableName = table => isEdit ? table : `${table}__VIEW`;
		const entityNames: string[] = [getTableName(curEntity.name)];
		const conditionFields: SelectedField[] = [];
		const formatCondition = (condition: Condition[]) => {
			condition.forEach(con => {
				if (con.conditions) {
					formatCondition(con.conditions);
				} else if (con.fieldId) {
					conditionFields.push(con as AnyType);

					conditionFields.push(
						...con.fromPath.slice(1).map((path, index) => {
							return { ...path, fromPath: con.fromPath.slice(0, index + 1) };
						})
					);
				}
			});
		};
		formatCondition([conditions]);

		/** 排序可按照 fieldId 或 fieldName */
		orders = orders
			.map(order => {
				if (order.fieldId) {
					return { ...order, fromPath: order.fromPath || [] };
				} else if (order.fieldName) {
					/** 前端传入的排序，根据排序字段名称（如： 物料.物料ID）匹配出 Order 类型数据 */
					const names = String(order.fieldName).split('.');
					const fieldPath: SelectedField[] = [];
					let nowEntity: Entity | undefined = curEntity;
					while (names.length) {
						if (!nowEntity) {
							return;
						}

						const curName = names.shift();
						const curField = nowEntity.fieldAry.find(field => field.name === curName);

						if (!curField) {
							return;
						}
						fieldPath.push({ fieldId: curField.id, entityId: nowEntity.id, fieldName: curField.name, fromPath: [] });
						nowEntity = entityMap[curField.mapping?.entity?.id];
					}

					if (fieldPath.length) {
						return { ...fieldPath.pop(), order: order.order, fromPath: fieldPath };
					}
				}
			})
			.filter(Boolean)
			/** @ts-ignore */
			.reduce((pre, order: Order) => {
				return [
					...pre,
					order,
					...order.fromPath.slice(1).map((path, index) => {
						return { ...path, fromPath: order.fromPath.slice(0, index + 1) };
					})
				];
			}, []) as AnyType as Order[];
		/** 所有使用到的字段，类型定义为 SelectedField */
		let allFields: SelectedField[] = [...fields, ...(orders as AnyType), ...conditionFields]
			.reduce((pre, field) => {
				const entityField = entityFieldMap[field.entityId + field.fieldId] as Field & { sql: string, hasHandle?: boolean };
				/** 计算字段的前置路径，依赖于当前映射字段的 path */
				const fromPathPrefix = field.fromPath.slice(0, -1);

				if (entityField.bizType === FieldBizType.CALC) {
					if (!entityField.hasHandle && fromPathPrefix.length) {
						entityField.hasHandle = true;
						/** 处理字段前缀，依赖于当前映射字段的 path */
						entityField.sql = entityField.sql
							.replace(/MAPPING_/g, `MAPPING_${
								fromPathPrefix.map(f => entityFieldMap[f.entityId + f.fieldId].name)
							}_`);
					}
					return [
						...pre,
						field,
						...((entityField as AnyType).fields || []).map(f => {
							return { ...f, fromCalcField: field, fromPath: [...fromPathPrefix, ...f.fromPath] };
						})
					];
				} else {
					return [...pre, field];
				}
			}, []);
		/** 所有使用到的字段的 Map */
		const allFieldsMap: Record<string, SelectedField> = {};
		allFields.forEach(field => {
			const paths = [...(field.fromPath || []).map(p => p.fieldId), field.fieldId].join('.');

			if (!allFieldsMap[paths]) {
				allFieldsMap[paths] = field;
			} else {
				if (allFieldsMap[paths].fromCalcField && !field.fromCalcField) {
					allFieldsMap[paths].fromCalcField = undefined;
				}
			}
		});
		allFields = Object.values(allFieldsMap);
		/** 当前实体中被使用到的字段 ID */
		const curFieldIds = allFields
			.map(field => {
				if (field.entityId === curEntity.id && !field.fromPath?.length) {
					return field.fieldId;
				} else if (field.fromPath[0]?.entityId === curEntity.id) {
					return field.fromPath[0]?.fieldId;
				}
			})
			.filter(Boolean);

		/** 拼接 LEFT JOIN 语句 */
		const spliceLeftJoinSql = (mappingFields: Field[], depIndex: number, fromPath: Field[], parentEntity: Entity) => {
			const entityNames: string[] = [];
			mappingFields.forEach(parentField => {
				if (!parentField) {
					return;
				}
				/** 嵌套层级相匹配，且以当前 mapping 字段作为父字段的所有使用到的字段 */
				const depFields = allFields.filter(f => f.fromPath.length === depIndex && f.fromPath[f.fromPath.length - 1].fieldId === parentField.id);
				/** 不存在嵌套字段时，无需 join 表 */
				if (!depFields.length) {
					return;
				}
				const entity = parentField.mapping!.entity!;
				/** 连表的条件 */
				const condition = String(parentField.mapping!.condition!);
				/** 连表类型， primary - 主动关联，foreigner 被关联 */
				const type = parentField.mapping!.type!;
				/** 源实体，即实体面板中存在的实体 */
				const originEntity = entityMap[entity.id];

				/** 与主实体存在关联关系的外键字段 */
				let relationField: Field | null = null;
				if (type === 'primary') {
					relationField = originEntity.fieldAry.find(f => f.isPrimaryKey) ?? null;
				} else if (type === 'foreigner') {
					relationField = originEntity.fieldAry.find(f => f.bizType === 'relation' && f.relationEntityId === parentEntity.id) ?? null;
				}

				if (!relationField) {
					return;
				}

				const leftJoinSqlList = spliceLeftJoinSql(depFields.map(f => entityFieldMap[f.entityId + f.fieldId]), depIndex + 1, [...fromPath, parentField], originEntity);
				const isMaxCondition = condition.startsWith('max(') && condition.endsWith(')');
				const SEPARATOR = '$$';
				let entityName = '';

				/** 关联，当前实体主动关联另一个实体，即当前实体字段存在一个字段作为外键关联另一个实体的主键（id） */
				if (type === 'primary') {
					const relationField = parentEntity.fieldAry.find(f => ['relation', 'SYS_USER', 'SYS_ROLE', 'SYS_ROLE_RELATION'].includes(f.bizType) && f.relationEntityId === originEntity.id && (parentField.bizType === 'mapping' ? true : f.id === parentField.id));
					const mappingTableName = [...fromPath.map(p => p.name), parentField.name].join('_');
					/** 聚合为 json 的字段列表 */
					let jsonFieldNameList: string[] = [];
					/** 标识对应的 json 字段是否已被拼接 */
					const jsonMappingFieldMap = {};
					fields
						.filter(f => f.fromPath.find((path, idx) => path.fieldId === parentField.id && path.entityId === parentEntity.id && idx + 1 === depIndex))
						.forEach(f => {
							const currentField = entityFieldMap[f.entityId + f.fieldId];
							const index = f.fromPath.findIndex((path, idx) => path.fieldId === parentField.id && path.entityId === parentEntity.id && idx + 1 === depIndex);

							/** 字段来源于当前表中 */
							if (f.fromPath.length - 1 === index) {
								if (![FieldBizType.MAPPING].includes(currentField.bizType)) {
									/** 判断是否是映射字段，是则加 _ 标识 */
									const isMapping = fields.find(p => p.fromPath.length === f.fromPath.length + 1 && p.fromPath[p.fromPath.length - 1].fieldId === currentField.id);
									jsonFieldNameList.push(`'${isMapping ? '_' : ''}${currentField.name}', ${currentField.bizType === FieldBizType.CALC ? (currentField as AnyType).sql : currentField.name}`);
								}
							} else {
								const entityFieldMapElement = entityFieldMap[f.fromPath[index + 1].entityId + f.fromPath[index + 1].fieldId];
								/** 聚合为 JSON 时，字段取父字段的名称，如 MAPPING_A_B_C，取名称 B */
								if (!jsonMappingFieldMap[entityFieldMapElement.name]) {
									jsonFieldNameList.push(`'${entityFieldMapElement.name}', ${entityFieldMapElement.name}_JSON`);
									jsonMappingFieldMap[entityFieldMapElement.name] = 1;
								}
							}
						});

					/** 需要在子查询中返回的字段列表 */
					const extraFieldNames = allFields
						.filter(f => (f.fromCalcField ? f.fromCalcField.fromPath.length < depIndex : true) && f.fromPath.find((path, idx) => path.fieldId === parentField.id && path.entityId === parentEntity.id && idx + 1 === depIndex) && (f.entityId === originEntity.id ? !entityFieldMap[f.entityId + f.fieldId].isPrimaryKey : true))
						.map(f => {
							const currentField = entityFieldMap[f.entityId + f.fieldId];
							const index = f.fromPath.findIndex((path, idx) => path.fieldId === parentField.id && path.entityId === parentEntity.id && idx + 1 === depIndex);
							const mappingFieldName = `MAPPING_${
								[
									...(f.fromPath.map(path => entityFieldMap[path.entityId + path.fieldId].name)),
									/** 查询总数逻辑定制 */
									currentField.isPrimaryKey && f.fieldName === '总数' ? f.fieldName : currentField.name
								].join('_')
							}`;

							/** 字段来源于当前表中 */
							if (f.fromPath.length - 1 === index) {
								if (![FieldBizType.MAPPING].includes(currentField.bizType)) {
									return `${currentField.bizType === FieldBizType.CALC ? (currentField as AnyType).sql : currentField.name} AS ${mappingFieldName}`;
								}
							} else {
								/** 字段来源于子查询 */
								return mappingFieldName;
							}
						})
						.filter(Boolean);
					entityName = `LEFT JOIN (SELECT id AS MAPPING_${mappingTableName}_id${extraFieldNames.length ? `, ${extraFieldNames.join(', ')}` : ''}${jsonFieldNameList.length ? `, JSON_OBJECT(${jsonFieldNameList.join(', ')}) ${parentField.name}_JSON` : ''} FROM ${getTableName(originEntity.name)} ${leftJoinSqlList.join(' ')} WHERE _STATUS_DELETED = 0) MAPPING_${mappingTableName} ON MAPPING_${mappingTableName}.MAPPING_${mappingTableName}_id = ${getTableName(parentEntity.name)}.${(relationField?.name)}`;
				} else if (type === 'foreigner') {
					/** 被关联，当前实体被另一实体关联，即当前实体的主键（id）被另一个实体作为外键相互关联 */
					const mappingTableName = [...fromPath.map(p => p.name), parentField.name].join('_');
					/** 被关联的关系字段 */
					const curRelationFieldName = 'MAPPING_' + [mappingTableName, relationField?.name].join('_');
					/** 聚合为 json 的字段列表 */
					let jsonFieldNameList: string[] = [];
					/** 标识对应的 json 字段是否已被拼接 */
					const jsonMappingFieldMap = {};

					fields
						.filter(f => f.fromPath.find((path, idx) => path.fieldId === parentField.id && path.entityId === parentEntity.id && idx + 1 === depIndex))
						.forEach(f => {
							const currentField = entityFieldMap[f.entityId + f.fieldId];
							const index = f.fromPath.findIndex((path, idx) => path.fieldId === parentField.id && path.entityId === parentEntity.id && idx + 1 === depIndex);

							if (f.fromPath.length - 1 === index) {
								/** 判断是否是映射字段，是则加 _ 标识 */
								const isMapping = fields.find(p => p.fromPath.length === f.fromPath.length + 1 && p.fromPath[p.fromPath.length - 1].fieldId === currentField.id);
								jsonFieldNameList.push(`'${isMapping ? '_' : ''}${currentField.name}', ${currentField.bizType === FieldBizType.CALC ? (currentField as AnyType).sql : currentField.name}`);
							} else {
								/** 聚合为 JSON 时，字段取父字段的名称，如 MAPPING_A_B_C，取名称 B */
								const entityFieldMapElement = entityFieldMap[f.fromPath[index + 1].entityId + f.fromPath[index + 1].fieldId];
								if (!jsonMappingFieldMap[entityFieldMapElement.name]) {
									jsonFieldNameList.push(`'${entityFieldMapElement.name}', ${entityFieldMapElement.name}_JSON`);
									jsonMappingFieldMap[entityFieldMapElement.name] = 1;
								}
							}
						});

					/** 需要在子查询中返回的字段列表 */
					if (condition === '-1') {
						const extraFieldNames = allFields
							.filter(f => {
								const entityField = entityFieldMap[f.entityId + f.fieldId];

								return (f.fromCalcField ? f.fromCalcField.fromPath.length < depIndex : true) && f.fromPath.find((path, idx) => path.fieldId === parentField.id && path.entityId === parentEntity.id && idx + 1 === depIndex) && (f.entityId === originEntity.id ? !entityField.isPrimaryKey : true) && entityField.name !== relationField?.name;
							})
							.map(f => {
								const index = f.fromPath.findIndex((path, idx) => path.fieldId === parentField.id && path.entityId === parentEntity.id && idx + 1 === depIndex);
								const currentField = entityFieldMap[f.entityId + f.fieldId];
								const mappingFieldName = `MAPPING_${[...(f.fromPath.map(path => entityFieldMap[path.entityId + path.fieldId].name)), currentField.name].join('_')}`;

								if (f.fromPath.length - 1 === index) {
									return `GROUP_CONCAT(${currentField.bizType === FieldBizType.CALC ? (currentField as AnyType).sql : currentField.name} SEPARATOR \"${SEPARATOR}\") ${mappingFieldName}`;
								} else if (currentField.bizType !== FieldBizType.MAPPING) {
									/** GROUP_CONCAT 必须保留，因为外层 where 条件中会使用 */
									return `GROUP_CONCAT(${mappingFieldName} SEPARATOR \"${SEPARATOR}\") ${mappingFieldName}`;
								}
							})
							.filter(Boolean);

						entityName = `LEFT JOIN (SELECT GROUP_CONCAT(id SEPARATOR \"${SEPARATOR}\") MAPPING_${mappingTableName}_id, GROUP_CONCAT(${relationField?.name} SEPARATOR \"${SEPARATOR}\") ${curRelationFieldName}${extraFieldNames.length ? `, ${extraFieldNames.join(', ')}` : ''}${jsonFieldNameList.length ? `, JSON_ARRAYAGG(JSON_OBJECT(${jsonFieldNameList.join(', ')})) ${parentField.name}_JSON` : ''} FROM ${getTableName(originEntity.name)} ${leftJoinSqlList.join(' ')} WHERE _STATUS_DELETED = 0 GROUP BY ${relationField?.name}) MAPPING_${mappingTableName} ON MAPPING_${mappingTableName}.${curRelationFieldName} = ${getTableName(parentEntity.name)}.id`;
					} else if (isMaxCondition) {
						/** 从条件中提取字段 */
						const filedName = condition.substr(4, condition.length - 5);
						/** 需要在子查询中返回的字段列表 */
						const extraFieldNames = allFields
							.filter(f => {
								const entityField = entityFieldMap[f.entityId + f.fieldId];

								return (f.fromCalcField ? f.fromCalcField.fromPath.length < depIndex : true) && f.fromPath.find((path, idx) => path.fieldId === parentField.id && path.entityId === parentEntity.id && idx + 1 === depIndex) && (f.entityId === originEntity.id ? !entityField.isPrimaryKey : true) && entityField.name !== relationField?.name;
							})
							.map(f => {
								const index = f.fromPath.findIndex((path, idx) => path.fieldId === parentField.id && path.entityId === parentEntity.id && idx + 1 === depIndex);
								const currentField = entityFieldMap[f.entityId + f.fieldId];
								const mappingFieldName = `MAPPING_${[...(f.fromPath.map(path => entityFieldMap[path.entityId + path.fieldId].name)), currentField.name].join('_')}`;

								if (f.fromPath.length - 1 === index) {
									return `${currentField.bizType === FieldBizType.CALC ? (currentField as AnyType).sql : currentField.name} AS ${mappingFieldName}`;
								} else if (currentField.bizType !== FieldBizType.MAPPING) {
									return mappingFieldName;
								}
							})
							.filter(Boolean);

						entityName = `LEFT JOIN (SELECT GROUP_CONCAT(id SEPARATOR \"${SEPARATOR}\") MAPPING_${mappingTableName}_id, GROUP_CONCAT(${relationField?.name} SEPARATOR \"${SEPARATOR}\") ${curRelationFieldName}${extraFieldNames.length ? `, ${extraFieldNames.join(', ')}` : ''}${jsonFieldNameList.length ? `, JSON_ARRAYAGG(JSON_OBJECT(${jsonFieldNameList.join(', ')})) ${parentField.name}_JSON` : ''} FROM ${getTableName(originEntity.name)} ${leftJoinSqlList.join(' ')} WHERE _STATUS_DELETED = 0 AND ${filedName} IN (SELECT max(${filedName}) FROM ${getTableName(originEntity.name)} WHERE _STATUS_DELETED = 0 GROUP BY ${relationField.name})) MAPPING_${mappingTableName} ON MAPPING_${mappingTableName}.${curRelationFieldName} = ${getTableName(parentEntity.name)}.id`;
					} else if (condition.startsWith('count(') && condition.endsWith(')')) {
						entityName = `LEFT JOIN (SELECT ${relationField?.name} AS ${curRelationFieldName}, COUNT(id) AS MAPPING_${mappingTableName}_总数, JSON_OBJECT('总数', COUNT(id)) ${parentField.name}_JSON FROM ${getTableName(originEntity.name)} ${leftJoinSqlList.join(' ')} WHERE _STATUS_DELETED = 0 GROUP BY ${relationField?.name}) MAPPING_${mappingTableName} ON MAPPING_${mappingTableName}.${curRelationFieldName} = ${getTableName(parentEntity.name)}.id`;
					}
				}

				entityName && entityNames.push(entityName);
			});

			return entityNames;
		};

		/** mapping 字段，存在数据映射且实体存在 */
		entityNames.push(...spliceLeftJoinSql(curEntity.fieldAry
			.filter(field => {
				return curFieldIds.includes(field.id) && field.mapping?.entity?.fieldAry?.length && entityMap[field.mapping.entity.id];
			}), 1, [], curEntity));

		/** 字段去重 */
		const newFieldIds: string[] = [];
		const newFields = fields.map(field => {
			let curField: SelectedField = field;

			if (!field.fromPath.length) {
				const entityField = entityFieldMap[field.entityId + field.fieldId];

				/** 如果映射类型，没有选择内部的字段，则忽略映射类型字段 */
				if (entityField.bizType === 'mapping' && !fields.find(f => f.fromPath[0]?.fieldId === field.fieldId)) {
					return undefined;
				}
			} else {
				curField = field.fromPath[0];
			}

			if (newFieldIds.includes(curField.fieldId)) {
				return undefined;
			} else {
				newFieldIds.push(curField.fieldId);

				return curField;
			}
		}).filter(Boolean) as SelectedField[];
		/** 字段列表 */
		newFields
			.map(field => {
				const entityField = entityFieldMap[field.entityId + field.fieldId];
				if (entityField.bizType === 'mapping') {
					fieldList.push(`${entityField.name}_JSON AS ${entityField.name}`);
					return;
				}

				if (entityField.bizType === 'relation' && fields.find(p => p.fromPath[0]?.fieldId === field.fieldId)) {
					fieldList.push(`${entityField.name} AS _${entityField.name}`, `${entityField.name}_JSON AS ${entityField.name}`);
				} else {
					fieldList.push(entityField.name);
				}
			});

		const whereSql = spliceWhereSQLFragmentByConditions({
			conditions: [conditions],
			entities,
			params,
			entityMap,
			curEntity,
			entityFieldMap
		});
		/** 前置 sql */
		sql.push(`SELECT ${fieldList.join(', ')} FROM ${entityNames.join(' ')}`);
		sql.push(whereSql);

		if (showPager || selectCount) {
			countSql.push(`SELECT count(*) as total FROM ${entityNames.join(' ')}`);
			countSql.push(whereSql);
		}

		/** 单独查询总数 */
		if (selectCount) {
			return ['', countSql.join(' ')];
		}

		if (orders.length) {
			const orderList: string[] = [];
			orders.forEach(order => {
				const entityField = entityFieldMap[order.entityId + order.fieldId];
				if (!entityField) {
					return;
				}

				if (order.fromPath.length) {
					const lastPath = order.fromPath[order.fromPath.length - 1];
					const parentField = entityFieldMap[lastPath.entityId + lastPath.fieldId];
					const isCountCondition = parentField.mapping?.condition?.startsWith('count(') && parentField.mapping?.condition?.endsWith(')');

					orderList.push(`MAPPING_${[...order.fromPath.map(path => entityFieldMap[path.entityId + path.fieldId].name), isCountCondition ? '总数' : entityField.name].join('_')} ${order.order}`);
				} else {
					orderList.push(`${entityField.name} ${order.order}`);
				}
			});
			orderList.length && sql.push(`ORDER BY ${orderList.join(', ')}`);
		}

		let limitValue: AnyType = limit.value ? String(limit.value) :'';
		if (limitValue) {
			if (limitValue.startsWith('{') && limitValue.endsWith('}')) {
				limitValue = params[limitValue.slice(limitValue.indexOf('.') + 1, -1)] || 50;

				if (limitValue) {
					sql.push(`LIMIT ${limitValue}`);
				}
			} else {
				sql.push(`LIMIT ${limitValue}`);
			}
		}

		if (pageNum) {
			if (pageNum.startsWith('{') && pageNum.endsWith('}')) {
				const curValue = params[pageNum.slice(pageNum.indexOf('.') + 1, -1)];

				if (curValue) {
					sql.push(`OFFSET ${(Number(curValue) - 1) * Number(limitValue)}`);
				}
			} else if (!Number.isNaN(Number(pageNum))) {
				sql.push(`OFFSET ${(Number(pageNum) - 1) * Number(limitValue)}`);
			}
		}

		return [sql.join(' '), countSql.join(' ')];
	}
};