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
			title: '密钥',
			desc: "请务必保持生成和解析使用同一个密钥",
			type: 'text',
			value: {
				get({ data }) {
					return data.secretKey
				},
				set({ data }, value) {
					data.secretKey = value;
				}
			}
		},
  ]
}



