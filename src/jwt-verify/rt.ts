export default function ({env, data, outputs, inputs, onError}) {
  inputs['params']((val, relOutpus) => {
		if (!!val) {
			try {
				const decodedToken = env.jwt.verify(val, data.secretKey)
				relOutpus['rtn'](decodedToken)
			} catch (error) {
				onError(`解析jwt出错：${error?.message ?? '未知错误'}`)
			}
		} else {
			onError('解析jwt的参数必须存在')
		}
  })
}