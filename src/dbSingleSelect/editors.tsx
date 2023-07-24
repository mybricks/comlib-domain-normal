/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mybricks@126.com
 */
import { depValidateEntity } from '../_utils/validate';

export default {
	/** 环境发生变化 */
	'@envChanged'({ data, env, cancelError, throwError }) {
		if (!data.selector) {
			return;
		}
		const error = depValidateEntity({
			entities: data.selector.entities,
			newEntity: env.entity,
			fields: data.selector.fields,
			orders: data.selector.orders,
			conditions: data.selector.conditions
		});
		
		error ? throwError(error) : cancelError();
		data.errorMessage = error;
	},
	'@init': ({ data, isAutoRun, setDesc }) => {
		data.autoRun = !!(isAutoRun ? isAutoRun() : false);

		setDesc('未选择数据');
	},
	':root': [
		{
			title: '选择',
			type: 'domain.dbSelect',
			options({ data, input }) {
				return {
					get paramSchema() {
						return input.get('params').schema || {};
					},
					get errorMessage() {
						return data.errorMessage;
					},
	        single: true,
				};
			},
			value: {
				get({ data }) {
					return data.selector;
				},
				set({ data, setDesc, outputs, cancelError }, val) {
					const { outputSchema, ...otherVal } = val;
					data.selector = otherVal;
	        data.errorMessage = '';
	        cancelError();
	
	        if (data.selector) {
						setDesc(`已选择 ${data.selector.desc}`);

						outputs.get('rtn').setSchema(outputSchema.items || { type: 'unknown' });
					} else {
						setDesc('未完成选择');
					}
				}
			}
		},
		{
			title: '空数据判断',
			type: 'switch',
			desc: '判断查询出的数据是否为空',
			value: {
				get({ data }) {
					return data.emptyCheck;
				},
				set({ data, output }, val) {
					data.emptyCheck = val;

					if (val) {
						output.add({
							id: 'empty',
							title: '空数据',
							schema: {
								type: 'unknown'
							},
							editable: true
						});
					} else {
						output.remove('empty');
					}
				},
			}
		}
	]
};



