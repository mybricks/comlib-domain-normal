export default {
  ':root': [
    // {
		// 	title: '动态配置',
		// 	type: 'switch',
		// 	value: {
		// 		get({ data }) {
		// 			return data.dynamic
		// 		},
		// 		set({ data }, value) {
		// 			data.dynamic = value;
		// 		}
		// 	}
		// },
		{
			title: '小程序AppID',
			desc: "请务必保持生成和解析使用同一个密钥",
			type: 'text',
			value: {
				get({ data }) {
					return data.appId
				},
				set({ data }, value) {
					data.appId = value;
				}
			}
		},
		{
			title: '小程序AppSecret',
			type: 'text',
			value: {
				get({ data }) {
					return data.appSecret
				},
				set({ data }, value) {
					data.appSecret = value;
				}
			}
		},
  ]
}



