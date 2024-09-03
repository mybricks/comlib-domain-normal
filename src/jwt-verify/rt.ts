export default function ({env, data, outputs, inputs, onError}) {
  inputs['params']((val, relOutpus) => {
		if (!!val || typeof val !== 'string') {
			try {
				const decodedToken = env.jwt.verify(val, data.secretKey)
				relOutpus['rtn'](decodedToken)
			} catch (error) {
				if (error?.message?.indexOf('expired') > -1) {
					onError(`token已过期`)
				} else {
					onError(`解析token出错，${error?.message ?? '未知错误'}`)
				}
			}
		} else {
			onError('解析token的参数不存在或者格式有误')
		}
  })
}