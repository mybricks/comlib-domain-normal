/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mybricks@126.com
 */

const template = (question: string, dbDefine: string, contextDefine: string) => `请你根据下面的数据库定义，用MYSQL语句按照回答格式描述我的需求

#数据库定义
现在有一个数据库，部分表名或字段名用中文表示，例如「名称」，信息如下。
${dbDefine}

#请求参数定义，具体变量在MYSQL中用{变量}表示
${contextDefine}

#需求
${question}

注意，中文表名字段直接用中文表示，不要带符号

#回答格式
具体语句
`;

const getDBDefined = (domainModel) => {
	if (!Array.isArray(domainModel?.entityAry)) {
		return '';
	}

	const fieldArray = domainModel.entityAry.map(entity => {
		const fields = entity.fieldAry.reduce((acc, cur, curIndex) => {
			if (cur.bizType === 'mapping' && cur?.mapping?.entity) {
				return acc + `「${cur.name}」(${cur.dbType})是「${cur?.mapping?.entity?.name}」表的「${cur?.mapping?.entity?.field?.name}」字段的映射` + (curIndex === entity.fieldAry.length - 1 ? '。' : '，');
			}

			return acc + `「${cur.name}」(${cur.dbType})` + (curIndex === entity.fieldAry.length - 1 ? '。' : '，');
		}, '');

		return `「${entity.name}」表，别名为「${entity.name}」，${fields}`;
	});

	const relationArray = domainModel.entityAry.map(entity => {
		const getPrimaryKey = (entity) => {
			return entity?.fieldAry?.find?.(f => f.isPrimaryKey)?.name;
		};

		const fields = entity.fieldAry.filter(f => f.bizType === 'relation').reduce((acc, cur) => {
			return acc + `「${entity.name}」表的外键「${cur.name}」字段为「${cur?.relationEntity?.name} 」表的「${getPrimaryKey(cur?.relationEntity)}」字段。`;
		}, '');

		return fields;
	});

	return [ ...fieldArray, ...relationArray].join('\n');
};

const getParamsDefined = (paramsSchema) => {
	return JSON.stringify(paramsSchema);
};

export default {
  ':root': [
    {
      title: '',
      type: 'domain.aisql',
      options({data, input, output}) {
        return {
          get paramSchema() {
            return input.get('params').schema || {};
          },
          suggestions: [
            '找到姓李的前三个用户',
            '找到邮箱和请求参数user中email相同的用户，并计算总数',
          ],
          getSql: ({ naturalString, domainModel, paramsSchema }) => {
            return template(naturalString, getDBDefined(domainModel), getParamsDefined(paramsSchema))
          }
        }
      },
      value: {
        get({data, input, output}) {
          return {
            sql: data.sqlString,
            description: data.description,
          }
        },
        set({data, setDesc, outputs}, { sql, sqlType, description }) {
          data.sqlString = sql;
          data.description = description;

          switch (true) {
            case sqlType === 'SELECT': {
              outputs.get('rtn').setSchema({
                type: 'array'
              })
              break;
            }
            case sqlType === 'UPDATE': {
              outputs.get('rtn').setSchema({
                type: 'number'
              })
              break;
            }
            case sqlType === 'INSERT': {
              outputs.get('rtn').setSchema({
                type: 'number'
              })
              break;
            }
            case sqlType === 'DELETE': {
              outputs.get('rtn').setSchema({
                type: 'any'
              })
              break;
            }
            default: {
              outputs.get('rtn').setSchema({
                type: 'any'
              })
            }
          }
          setDesc(description)
        }
      }
    }
  ]
}



