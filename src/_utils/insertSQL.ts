import { Entity } from '../_types/domain';
import { DefaultValueWhenCreate, FieldBizType } from '../_constants/field';
import { getQuoteByFieldType } from './field';
import { get } from './util';
import { AnyType } from '../_types';

export const spliceInsertSQL = (params: {
	entity: Entity;
	conAry: Array<{ from: string; to: string }>;
	isEdit?: boolean;
	genUniqueId(): number;
	data: Record<string, AnyType> | Array<Record<string, AnyType>>;
	/** 批量插入 */
	batch?: boolean;
}) => {
	const { entity, conAry, isEdit, genUniqueId, data, batch } = params;
	const sql = `INSERT INTO ${entity.name}${isEdit ? '' : '__VIEW'} `;

	const res: string[][] = [];
	const fieldAry = entity.fieldAry.filter(field => field.bizType !== FieldBizType.MAPPING).map(field => field.name);

	(batch ? data : [data]).forEach(item => {
		const valueAry: string[] = [];

		entity.fieldAry.forEach(field => {
			if (field.bizType !== FieldBizType.MAPPING) {
				const con = conAry.find(con => con.to === `/${field.name}`);
				if (con) {
					/** 多级结构 */
					const fromNames = con.from.split('/').filter(Boolean);
					const value = get(item, fromNames.map(key => key));
					const q = getQuoteByFieldType(field.dbType);

					if (value === undefined || value === null) {
						valueAry.push('null');
					} else if (Array.isArray(value) || Object.prototype.toString.call(value) === '[object Object]') {
						valueAry.push(`${q}${JSON.stringify(value)}${q}`);
					} else {
						valueAry.push(`${q}${value}${q}`);
					}
				} else {
					if (field.isPrimaryKey) {
						valueAry.push(String(genUniqueId()));
					} else if (field.name === '_STATUS_DELETED') {
						valueAry.push('0');
					} else if (
						['_UPDATE_TIME', '_CREATE_TIME'].includes(field.name)
						|| (field.bizType === FieldBizType.DATETIME && field.defaultValueWhenCreate === DefaultValueWhenCreate.CURRENT_TIME)
					) {
						valueAry.push(String(Date.now()));
					} else if (field.defaultValueWhenCreate !== undefined && field.defaultValueWhenCreate !== null) {
						const q = getQuoteByFieldType(field.dbType);

						valueAry.push(`${q}${field.defaultValueWhenCreate}${q}`);
					} else {
						valueAry.push('null');
					}
				}
			}
		});

		res.push(valueAry);
	});

	return `${sql}(${fieldAry.join(',')}) VALUES ${res.map(valueAry => `(${valueAry.join(',')})`).join(', ')}`;
};