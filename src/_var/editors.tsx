/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mybricks@126.com
 */

export default {
	'@inputUpdated': ({ output }
		, { id, schema }) => {
		if (id === 'set') {
			const returnPin = output.get('return');
			returnPin.setSchema(schema);//follow

			const changedPin = output.get('changed');
			changedPin.setSchema(schema);//follow
		}
	},
	'@inputDisConnected': ({ output }, from: { id, title, schema, parent }, to: { id, title, schema, parent }) => {
		if (to.id === 'set') {
			const returnPin = output.get('return');
			returnPin.setSchema({ type: 'unknown' });

			const changedPin = output.get('changed');
			changedPin.setSchema({ type: 'unknown' });
		}
	},
	':root': [
		{
			title: '变量名称',
			type: 'text',
			value: {
				get({ title }) {
					return title;
				},
				set({ setTitle }, title) {
					setTitle(title);
				}
			}
		},
		{
			title: '类型',
			type: '_schema',
			value: {
				get({ outputs }) {
					const returnPin = outputs.get('return');
					return returnPin.schema;
				},
				set({ outputs }, schema) {
					const allPins = outputs.get();
					allPins.forEach(pin => {
						outputs.get(pin.id).setSchema(schema);
					});
				}
			}
		}
	]
};



