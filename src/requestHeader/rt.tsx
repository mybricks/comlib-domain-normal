export default function ({env, data, outputs, inputs, onError}) {
  inputs['params']((val, relOutpus) => {
		env.collect('获取请求头 val: ', env?.headers)
		if(data.headerName) {
			outputs['rtn'](env?.headers?.[data.headerName])
		} else {
			outputs['rtn'](env?.headers)
		}
  })
}