/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mybricks@126.com
 */
export default {
	':root': [
		{
			title: '规范返回值',
			type: 'switch',
			desc: '规范即使用{ code: 1, data: xxx }的形式返回数据，否则代表数据值完全自定义',
			value: {
				get({ data }) {
					return data.useRegular;
				},
				set({ data }, use: boolean) {
					data.useRegular = use;
				}
			}
		}
	]
};



