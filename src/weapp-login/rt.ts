export default function ({env, data, outputs, inputs, onError}) {
  inputs['params']((val, relOutpus) => {
		if (!data.appId || !data.appSecret) {
			return onError('appID和appSecret是必填项，请检查配置')
		}
		if (!!!val || typeof val !== 'string') {
			return onError('小程序登录凭证不存在，请检查输入项')
		}
		try {
			env.services?.wechatMiniapp?.code2Session?.(val, data.appId, data.appSecret)?.then((result) => {
				if (result?.errcode) {
					return onError(`小程序登录失败[${result.errcode}]：${result.errmsg}`)
				}
				relOutpus['rtn'](result)
			})
		} catch (error) {
			onError(`小程序登录调用失败：${error?.message ?? '未知错误'}`)
		}
  })
}