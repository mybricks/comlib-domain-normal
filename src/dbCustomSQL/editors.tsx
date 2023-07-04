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
      title: '编辑SQL',
      type: 'domain.dbCustomSQL',
      options({input}) {
        return {
          get paramSchema() {
            return input.get('params').schema || {};
          },
        }
      },
      value: {
        get({data}) {
          return data.sql;
        },
        set({data}, val) {
          data.sql = val;
        }
      }
    }
  ]
}



