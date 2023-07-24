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
						const computedParams = JSON.parse(JSON.stringify(input.get('params.params')?.schema ?? {}));
	          computedParams.properties = {
		          ...JSON.parse(JSON.stringify(input.get('params.pageParams')?.schema?.properties ?? {})),
							...computedParams.properties,
	          };
						
						return computedParams || {};
					},
					get errorMessage() {
						return data.errorMessage;
					},
	        showPager: true,
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

						outputs.get('rtn').setSchema(outputSchema);
					} else {
						setDesc('未完成选择');
					}
				}
			}
		},
	]
};



