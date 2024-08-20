export default function ({env, data, outputs, inputs, onError}) {
  inputs['params']((val, relOutpus) => {
		env.collect('设置cookies key: ', data?.keyName)
		if(data.keyName) {
			if (typeof val === 'string' || typeof val === 'number' || !val) {
				env.setCookie?.(data?.keyName, val, {
					httpOnly: !!data.httpOnly,
					path: data.path || '/',
					...(!!data.maxAge ? {} : { maxAge: data.maxAge }),
					...(!!data.domain ? {} : { domain: data.domain })
				});
				relOutpus['rtn'](val)
			} else {
				onError('设置cookies 入参格式错误')
			}
		} else {
			onError('设置cookies 必须配置 key')
		}
  })
}