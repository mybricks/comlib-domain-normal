/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mybricks@126.com
 */
import { validateEntity } from '../_utils/validate';

export default {
	/** 环境发生变化 */
	'@envChanged'({ data, env, cancelError, throwError }) {
		if (!data.rules) {
			return;
		}
		const error = validateEntity(data.rules.entities, env.entity);
		
		error ? throwError(error) : cancelError();
		data.errorMessage = error;
	},
	':root': [
		{
			title: '编辑',
			type: 'domain.dbInsert',
			options({ data, input }) {
				return {
					get paramSchema() {
						return input.get('params').schema || {};
					},
					get errorMessage() {
						return data.errorMessage;
					},
	        batch: true,
				};
			},
			value: {
				get({ data }) {
					return data.rules;
				},
				set({ data, setDesc, cancelError }, val) {
					data.rules = val;
	        data.errorMessage = '';
	        cancelError();

					if (data.rules) {
						setDesc(`已选择 ${data.rules.desc}`);
					} else {
						setDesc('未完成选择');
					}
				}
			}
		}
	]
};



