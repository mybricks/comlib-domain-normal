/** 根据字段类型返回拼接 sql 的具体指 */
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
	if (operator === 'LIKE' || operator === 'NOT LIKE') {
		return `'%${val}%'`;
	} else if (operator === 'IN' || operator === 'NOT IN') {
		return `(${(Array.isArray(val) ? val : String(val).split(',')).map(item => getValueByFieldType(dbType, item)).join(',')})`;
	}

	return getValueByFieldType(dbType, val);
};