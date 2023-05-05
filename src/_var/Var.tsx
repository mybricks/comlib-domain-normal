export default function ({env, data, outputs, inputs}) {
  inputs['get']((val, relOutpus) => {
    const nowVal = data.val !== void 0 ? data.val : data.initValue
    const cv = clone(nowVal)

    relOutpus['return'](cv)
  })

  inputs['set'](val => {
    data.val = val
    outputs['changed'](clone(val), true)//notify all forked coms
  })

  inputs['reset'](() => {
    const val = data.initValue
    data.val = val
    outputs['changed'](clone(val), true)//notify all forked coms
  })

  // outputs['changed'](data.val)
}

function clone(val) {
  if (val && typeof val === 'object') {
    try {
      return JSON.parse(JSON.stringify(val))
    } catch (ex) {
      return val
    }
  }
  return val
}