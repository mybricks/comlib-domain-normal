export default function ({env, data, outputs, inputs, onError}) {
  inputs['params']((val, relOutpus) => {
		env.collect('获取cookie key: ', data.keyName)
		if(data.keyName) {
			relOutpus['rtn']?.(env?.cookies?.[data.keyName])
		} else {
			onError('获取cookies 必须配置 key')
		}
  })
}