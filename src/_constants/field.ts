/** 字段类型 */
export enum FieldBizType {
	STRING = 'string',
	NUMBER = 'number',
	DATETIME = 'datetime',
	/** 超链接 */
	JSON = 'json',
	/** 枚举 */
	ENUM = 'enum',
	/** 外键，关联其他表 */
	RELATION = 'relation',
	/** 映射其他表 */
	MAPPING = 'mapping',
	/** 系统表 */
	SYS_USER = 'SYS_USER',
	SYS_ROLE = 'SYS_ROLE',
	SYS_ROLE_RELATION = 'SYS_ROLE_RELATION',
	/** 计算字段 */
	CALC = 'calc'
}

/** 数据库字段类型 */
export enum FieldDBType {
	VARCHAR = 'varchar',
	BIGINT = 'bigint',
	MEDIUMTEXT = 'mediumtext',
}

export enum SQLWhereJoiner {
	AND = 'AND',
	OR = 'OR',
}

export enum SQLOperator {
	/** 等于 */
	EQUAL = '=',
	/** 不等于 */
	NOT_EQUAL = '<>',
	/** 匹配 */
	LIKE = 'LIKE',
	/** 不匹配 */
	NOT_LIKE = 'NOT LIKE',
	/** 包含 */
	IN = 'IN',
	/** 不包含 */
	NOT_IN = 'NOT IN',
	/** 大于等于 */
	GE = '>=',
	/** 小于等于 */
	LE = '<=',
	/** 包含 */
	IS_NULL = 'IS NULL',
	/** 不包含 */
	IS_NOT_NULL = 'IS NOT NULL',
}

/** sql 排序规则 */
export enum SQLOrder {
	ASC = 'ASC',
	DESC = 'DESC',
}

/** select 查询 limit 设置值类型 */
export enum SQLLimitType {
	/** 枚举值，20、50、100 等 */
	ENUM = 'ENUM',
	/** 自定义 */
	CUSTOM = 'CUSTOM',
}

/** 默认值 */
export enum DefaultValueWhenCreate {
	/** 当前时间 */
	CURRENT_TIME = '$currentTime'
}
