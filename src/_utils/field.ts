/** 根据字段类型返回拼接 sql 的具体指 */
import { FieldDBType, SQLOperator } from '../_constants/field';

export const getValueByFieldType = (dbType: string, val: string) => {
	switch (dbType) {
	case 'varchar': return `'${val}'`;
	case 'bigint': return val;
	case 'mediumtext': return `'${val}'`;
	default: return val;
	}
};

/** 根据字段类型以及操作符号返回拼接 sql 的具体值 */
export const getValueByOperatorAndFieldType = (dbType: string, operator: string, val: string) => {
	if ([SQLOperator.LIKE, SQLOperator.NOT_LIKE].includes(operator as SQLOperator)) {
		return `'%${val}%'`;
	} else if ([SQLOperator.IN, SQLOperator.NOT_IN].includes(operator as SQLOperator)) {
		return `(${(Array.isArray(val) ? val : String(val).split(',')).map(item => getValueByFieldType(dbType, item)).join(',')})`;
	} else if ([SQLOperator.IS_NOT_NULL, SQLOperator.IS_NULL].includes(operator as SQLOperator)) {
		return '';
	}

	return getValueByFieldType(dbType, val);
};

/** 根据字段类型获取 sql 拼接时字段值的符号 */
export const getQuoteByFieldType = (dbType: string) => {
	switch (dbType) {
	case FieldDBType.VARCHAR: {
		return '\'';
	}
	case FieldDBType.BIGINT: {
		return '';
	}
	case FieldDBType.MEDIUMTEXT: {
		return '\'';
	}
	default: return '';
	}
};