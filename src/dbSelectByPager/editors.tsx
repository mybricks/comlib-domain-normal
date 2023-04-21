/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mybricks@126.com
 */
import {depValidateEntity} from "../_utils/validate";

export default {
	/** 环境发生变化 */
	'@envChanged'({ data, env, cancelError, throwError }) {
		const error = depValidateEntity({
			entities: data.selector.entities,
			newEntity: env.entity,
			fields: data.selector.fields,
			orders: data.selector.orders,
			conditions: data.selector.conditions
		});
		
		error ? throwError(error) : cancelError();
	},
  '@init': ({data, isAutoRun, output, setDesc}) => {
    const autoRun = isAutoRun ? isAutoRun() : false;
    if (autoRun) {
      data.autoRun = true;
    } else {
      data.autoRun = false
    }

    setDesc(`未选择数据`)
  },
  ':root': [
    {
      title: '选择',
      type: 'domain.dbSelect',
      options({data, input, output}) {
        return {
          get paramSchema() {
						const computedParams = JSON.parse(JSON.stringify(input.get('params.params')?.schema ?? {}))
	          computedParams.properties = {
		          ...JSON.parse(JSON.stringify(input.get('params.pageParams')?.schema?.properties ?? {})),
							...computedParams.properties,
	          }
						
            return computedParams || {};
          },
	        showPager: true
        }
      },
      value: {
        get({data, input, output}) {
          return data.selector
        },
        set({data, setDesc, outputs, cancelError}, val) {
          data.selector = val;
	        cancelError();

          if (data.selector) {
            setDesc(`已选择 ${data.selector.desc}`)

            outputs.get('rtn').setSchema({
              type: 'object',
	            properties: {
								total: { type: 'number' },
								list: { type: 'array' },
	            },
            })
          } else {
            setDesc(`未完成选择`)
          }
        }
      }
    },
  ]
}



