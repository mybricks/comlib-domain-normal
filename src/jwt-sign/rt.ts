export default function ({env, data, outputs, inputs, onError}) {
  inputs['params']((val, relOutpus) => {
		if (!!val) {
			try {
				const token = env.jwt.sign(val, data.secretKey, {
					expiresIn: `${data.expiresIn}s` // 以秒计算
				})
				relOutpus['rtn'](token)
			} catch (error) {
				onError(`生成jwt出错：${error?.message ?? '未知错误'}`)
			}
		} else {
			onError('生成jwt的参数必须存在')
		}
  })
}