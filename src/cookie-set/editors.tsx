export default {
  ':root': [
    {
		  title: 'cookie名称',
		  type: 'text',
		  value: {
			  get({ data }) {
				  return data.keyName;
			  },
			  set({ data }, value) {
				  data.keyName = value;
			  }
		  }
	  },
		{
			title: '仅http可获取',
			type: 'switch',
			value: {
				get({ data }) {
					return data.httpOnly
				},
				set({ data }, value) {
					data.httpOnly = value;
				}
			}
		},
		{
			title: '过期时间（秒）',
			type: 'text',
			value: {
				get({ data }) {
					return data.maxAge;
				},
				set({ data }, value) {
					data.maxAge = value;
				}
			}
		},
		{
			title: '域名',
			type: 'text',
			value: {
				get({ data }) {
					return data.domain;
				},
				set({ data }, value) {
					data.domain = value;
				}
			}
		},
		{
			title: '路径',
			type: 'text',
			value: {
				get({ data }) {
					return data.path;
				},
				set({ data }, value) {
					data.path = value;
				}
			}
		},
  ]
}



