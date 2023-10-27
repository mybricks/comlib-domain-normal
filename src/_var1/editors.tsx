/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mybricks@126.com
 */
import {uuid} from "../util";

interface Result {
  focusArea: any
  slot: any
  data: any
  output: any
  input: any
}

export default {
  // '@inputConnected': ({data, input, output, setAutoRun, isAutoRun}
  //   , from: { id, title, schema, parent }
  //   , to: { id, title, schema, parent }) => {
  //   if (to.id === 'set') {
  //     debugger
  //
  //     const returnPin = output.get('return')
  //     returnPin.setSchema(from.schema)//follow
  //
  //     const changedPin = output.get('changed')
  //     changedPin.setSchema(from.schema)//follow
  //   }
  // },
  '@inputUpdated': ({data, input, output, setAutoRun, isAutoRun}
    , {id, title, schema}) => {
    if (id === 'set') {
      const returnPin = output.get('return')
      returnPin.setSchema(schema)//follow

      const changedPin = output.get('changed')
      changedPin.setSchema(schema)//follow
    }
  },
  '@inputDisConnected': ({data, input, output, setAutoRun, isAutoRun}
    , from: { id, title, schema, parent }
    , to: { id, title, schema, parent }) => {
    if (to.id === 'set') {
      const returnPin = output.get('return')
      returnPin.setSchema({type: 'unknown'})

      const changedPin = output.get('changed')
      changedPin.setSchema({type: 'unknown'})
    }
  },
  ':root': [
    {
      title: '变量名称',
      type: 'text',
      value: {
        get({title}) {
          return title
        }, set({setTitle}, title) {
          setTitle(title)
        }
      }
    },
    null,
    {
      title: '类型',
      type: '_schema',
      value: {
        get({data, outputs}) {
          const returnPin = outputs.get('return')
          return returnPin.schema
        }, set({data, outputs}, schema) {
          const allPins = outputs.get()
          allPins.forEach(pin => {
            outputs.get(pin.id).setSchema(schema)
          })
        }
      }
    },
    // {
    //   title: '初始值',
    //   type: '_schemaValue',
    //   desc: `变量最初的取值`,
    //   options({outputs}) {
    //     const returnPin = outputs.get('return')
    //     return {
    //       schema: returnPin.schema
    //     }
    //   },
    //   value: {
    //     get({data}) {
    //       return data.initValue
    //     }, set({data}, tData) {
    //       data.initValue = tData
    //     }
    //   }
    // }
  ]
}



