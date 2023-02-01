/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mybricks@126.com
 */

import selectDef from './dbSelect/com.json'
import selectRt from './dbSelect/rt'
import selectEditors from './dbSelect/editors'

import insertDef from './dbInsert/com.json'
import insertRt from './dbInsert/rt'
import insertEditors from './dbInsert/editors'

import updateDef from './dbUpdate/com.json'
import updateRt from './dbUpdate/rt'
import updateEditors from './dbUpdate/editors'

const lib = {
  id: 'mybricks.comlib.domain',
  title: '领域模型组件库',
  author: 'CheMingjun',
  icon: '',
  version: '1.0.1',
  comAray: [
    merge({
      comDef: selectDef,
      rt: selectRt,
      editors: selectEditors
    }),
    merge({
      comDef: insertDef,
      rt: insertRt,
      editors: insertEditors
    }),
    merge({
      comDef: updateDef,
      rt: updateRt,
      editors: updateEditors
    })
  ],
  //visible: true,
  visible: false//TODO
}

export default lib

export function getCom(namespace: string) {
  return lib.comAray.find(com => com.namespace === namespace)
}

function merge({
                 comDef,
                 icon,
                 rt,
                 rtEdit,
                 data,
                 editors,
                 assistence
               }: { comDef, icon?, rt?, data?, editors?, assistence? }) {
  return Object.assign(comDef, {
    runtime: rt,
    icon: icon,
    'runtime.edit': rtEdit,
    data,
    editors,
    assistence
  })
}