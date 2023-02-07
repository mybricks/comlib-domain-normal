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
      title: '编辑',
      type: 'domain.dbDelete',
      options({data, input, output}) {
        return {
          get paramSchema() {
            return input.get('params').schema;
          }
        };
      },
      value: {
        get({data, input, output}) {
          return data.selector
        },
        set({data, setDesc, outputs}, val) {
          data.selector = val

          if (data.selector) {
            setDesc(`已选择 ${data.selector.desc}`)
          } else {
            setDesc(`未完成选择`)
          }
        }
      }
    }
  ]
}



