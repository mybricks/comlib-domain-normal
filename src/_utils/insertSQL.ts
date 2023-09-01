import { Entity } from '../_types/domain';
import { DefaultValueWhenCreate, FieldBizType, FieldDBType } from '../_constants/field';
import { getQuoteByFieldType } from './field';
import { get } from './util';
import { AnyType } from '../_types';

export const spliceInsertSQL = (params: {
	entity: Entity;
	conAry: Array<{ from: string; to: string }>;
	isEdit?: boolean;
	genUniqueId(): number;
	encrypt(str: string): string;
	data: Record<string, AnyType> | Array<Record<string, AnyType>>;
	/** 批量插入 */
	batch?: boolean;
}) => {
	const { entity, conAry, isEdit, genUniqueId, encrypt, data, batch } = params;
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
						valueAry.push(`${q}${JSON.stringify(field.useEncrypt ? encrypt(value) : value)}${q}`);
					} else {
						valueAry.push(`${q}${field.useEncrypt ? encrypt(value) : value}${q}`);
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

						valueAry.push(`${q}${field.useEncrypt ? encrypt(field.defaultValueWhenCreate) : field.defaultValueWhenCreate}${q}`);
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

export const validateParams = (data: AnyType, entity: Entity, conAry: Array<{ from: string; to: string }>, isInsert = true) => {
	const values = Array.isArray(data) ? data : [data];
	const fieldAry = entity.fieldAry.filter(field => conAry.find(con => con.to === `/${field.name}`));

	for (let i = 0; i < values.length; i++) {
		const params = values[i];

		for (let j = 0; j < fieldAry.length; j++) {
			const field = fieldAry[j];
			const con = conAry.find(con => con.to === `/${field.name}`);
			if (!con) { continue; }

			const paramKeys = con.from.substring(con.from.indexOf('/') + 1).split('/');
			const curValue = get(params, paramKeys);
			if (curValue === undefined || curValue === null) {
				/** 新建场景下，字段设置不能为空，且没有默认值 */
				if (isInsert && field.notNull && !field.defaultValueWhenCreate) {
					throw new Error('请求参数字段 ' + paramKeys.join('.') + ' 不能未空');
				} else if (!isInsert && field.notNull && curValue === null) {
					/** 更新场景下，字段设置不能为空，且值为 null */
					throw new Error('请求参数字段 ' + paramKeys.join('.') + ' 不能未空');
				} else {
					continue;
				}
			}

			/** 字符类型校验 */
			if ((field.dbType === FieldDBType.VARCHAR || field.dbType === FieldDBType.MEDIUMTEXT)
				&& field.bizType !== FieldBizType.ENUM
				&& field.bizType !== FieldBizType.JSON
				&& typeof curValue !== 'string'
				&& typeof curValue !== 'number'
			) {
				throw new Error('请求参数字段 ' + paramKeys.join('.') + ' 必须为字符串或数字类型');
			}

			/** 数字类型校验 */
			if (field.dbType === FieldDBType.BIGINT && typeof curValue !== 'number' && parseInt(curValue) != curValue) {
				throw new Error('请求参数字段 ' + paramKeys.join('.') + ' 必须为数字类型');
			}

			/** 枚举值校验 */
			if (field.bizType === FieldBizType.ENUM) {
				const enumValues = field.enumValues ?? [];
				
				if (enumValues.length) {
					let parsedValue = curValue;

					try {
						parsedValue = JSON.parse(parsedValue);
					} catch (e) {}

					if (Array.isArray(parsedValue)) {
						for (let enumIndex = 0; enumIndex < parsedValue.length; enumIndex++) {
							if (!enumValues.includes(parsedValue[enumIndex])) {
								throw new Error('请求参数字段 ' + paramKeys.join('.') + ' 中每一项必须为枚举值 ' + enumValues.join('/') + ' 其中之一');
							}
						}
					} else if (!enumValues.includes(String(parsedValue))) {
						throw new Error('请求参数字段 ' + paramKeys.join('.') + ' 必须为枚举值 ' + enumValues.join('/') + ' 其中之一');
					}
				}
			}
		}
	}
};