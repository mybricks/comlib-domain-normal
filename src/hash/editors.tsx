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
			title: '算法',
			type: 'select',
			options: [
				{
					label: 'md5',
					value: 'md5'
				},
				{
					label: 'sha1',
					value: 'sha1'
				},
				{
					label: 'sha256',
					value: 'sha256'
				}
			],
			value: {
				get({ data }) {
					return data.algorithm
				},
				set({ data }, value) {
					data.algorithm = value;
				}
			}
		},
		{
			title: '盐',
			desc: "哈希算法使用的盐，空则不使用",
			type: 'text',
			value: {
				get({ data }) {
					return data.salt
				},
				set({ data }, value) {
					data.salt = value;
				}
			}
		},
  ]
}



