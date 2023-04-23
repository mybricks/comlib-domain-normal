/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mybricks@126.com
 */
import {validateEntityForDelete} from "../_utils/validate";

export default {
	/** 环境发生变化 */
	'@envChanged'({ data, env, cancelError, throwError }) {
		const error = validateEntityForDelete(data.rules.entities, env.entity, data.rules.conditions);
		
		error ? throwError(error) : cancelError();
		data.errorMessage = error;
	},
  ':root': [
    {
      title: '编辑',
      type: 'domain.dbDelete',
      options({data, input, output}) {
        return {
          get paramSchema() {
            return input.get('params').schema;
          },
          get errorMessage() {
            return data.errorMessage;
          },
        };
      },
      value: {
        get({data, input, output}) {
          return data.rules
        },
        set({data, setDesc, outputs, cancelError}, val) {
          data.rules = val
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



