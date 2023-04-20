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
	'@envChanged'({ data, env, type, throwError }) {
		console.log('env', env.entity);
		const error = depValidateEntity({
			entities: data.selector.entities,
			newEntity: env.entity,
			fields: data.selector.fields,
			conditions: data.selector.conditions
		});
		
		error && throwError(error);
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
            return input.get('params').schema || {};
          },
	        showPager: false
        }
      },
      value: {
        get({data, input, output}) {
          return data.selector
        },
        set({data, setDesc, outputs}, val) {
          data.selector = val;
	        console.log(val);
	
	        if (data.selector) {
            setDesc(`已选择 ${data.selector.desc}`)

            outputs.get('rtn').setSchema({
              type: 'array'
            })
          } else {
            setDesc(`未完成选择`)
          }
        }
      }
    },
  ]
}



