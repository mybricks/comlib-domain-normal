/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mybricks@126.com
 */

const setOutputSchema = ({ data, input, output, schema = null }) => {
	const inputSchema = schema || input.get('inputValue').schema;
	if (data.merge && inputSchema && inputSchema.type === 'object') {
		output.get('rtn').setSchema({ ...inputSchema, properties: { ...inputSchema.properties, userId: { type: 'number' } } });
	} else {
		output.get('rtn').setSchema({ type: 'object', properties: { userId: { type: 'number' } } });
	}
};

export default {
	'@inputConnected'({ data, output, input }, { schema }) {
		setOutputSchema({ data, input, output, schema });
	},
	':root': [
		{
			title: '合并输入',
			type: 'switch',
			desc: '当输入值为对象时合并输入值',
			value: {
				get({ data }) {
					return data.merge;
				},
				set({ data, input, outputs }, use: boolean) {
					data.merge = use;
					setOutputSchema({ data, input, output: outputs });
				}
			}
		}
	]
};



