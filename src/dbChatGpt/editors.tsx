/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mybricks@126.com
 */

export default {
  ':root': [
    {
      title: '',
      type: 'domain.aisql',
      options({data, input, output}) {
        return {
          get paramSchema() {
            return input.get('params').schema || {};
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
            case sqlType === 'DELETE': {
              outputs.get('rtn').setSchema({
                type: 'number'
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



