/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mybricks@126.com
 */

import selectDef from './sqlSelect/com.json'
import selectRt from './sqlSelect/rt'
import selectEditors from './sqlSelect/editors'

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