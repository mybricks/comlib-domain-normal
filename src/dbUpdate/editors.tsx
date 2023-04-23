/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mybricks@126.com
 */
import {validateEntity} from "../_utils/validate";

export default {
	/** 环境发生变化 */
	'@envChanged'({ data, env, throwError, cancelError }) {
		const error = validateEntity(data.rules.entities, env.entity, { conAry: data.rules.conAry, conditions: data.rules.conditions });
		
		error ? throwError(error) : cancelError();
		data.errorMessage = error;
	},
  ':root': [
    {
      title: '编辑',
      type: 'domain.dbUpdate',
      options({ data, input }) {
        return {
          get paramSchema() {
            return input.get('params').schema;
          },
	        errorMessage: data.errorMessage
        };
      },
      value: {
        get({data, input, output}) {
          return data.rules
        },
        set({data, setDesc, outputs, cancelError}, val) {
          data.rules = val;
	        data.errorMessage = '';
	        cancelError();

          if (data.rules) {
            setDesc(`已选择 ${data.rules.desc}`)
          } else {
            setDesc(`未完成选择`)
          }
        }
      }
    }
  ]
}



