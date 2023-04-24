export default function ({env, data, outputs, inputs, onError}) {
  inputs['params']((val, relOutpus) => {
		if(data.headerName) {
			outputs['rtn'](env?.headers?.[data.headerName])
		} else {
			outputs['rtn'](env?.headers)
		}
  })
}