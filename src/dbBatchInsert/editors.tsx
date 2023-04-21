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
	'@envChanged'({ data, env, cancelError, throwError }) {
		const error = validateEntity(data.rules.entities, env.entity);
		
		error ? throwError(error) : cancelError();
	},
  ':root': [
    {
      title: '编辑',
      type: 'domain.dbInsert',
      options({data, input, output}) {
        return {
          get paramSchema() {
            return input.get('params').schema || {};
          }
        }
      },
      value: {
        get({data, input, output}) {
          return data.rules;
        },
        set({data, setDesc, outputs, cancelError}, val) {
          data.rules = val;
	        cancelError();

          if (data.rules) {
            setDesc(`已选择 ${data.rules.desc}`);
          } else {
            setDesc(`未完成选择`);
          }
        }
      }
    }
  ]
}



