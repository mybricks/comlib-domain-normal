/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mybricks@126.com
 */

export default {
  '@init'({data, setDesc}) {
    if (!data.table) {
      setDesc(`未选择表`)
    }
  },
  ':root': [
    {
      title: '表',
      type: 'domain.entitySelector',
      value: {
        get({data, input, output}) {
          return data.table
        },
        set({data, setDesc}, val) {
          data.table = val

          setDesc(`${val.name}`)
        }
      }
    },
    {
      title: '数据处理',
      type: 'domain.sqlSelect',
      value: {
        get({data, input, output}) {
          return data.table
        },
        set({data, setDesc}, val) {
          data.table = val

          setDesc(`${val.name}`)
        }
      }
    }
  ]
}



