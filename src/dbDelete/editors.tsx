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
	'@envChanged'({ data, env, type, throwError }) {
		const error = validateEntityForDelete(data.rules.entities, env.entity, data.rules.conditions);
		
		error && throwError(error);
	},
  ':root': [
    {
      title: '编辑',
      type: 'domain.dbDelete',
      options({data, input, output}) {
        return {
          get paramSchema() {
            return input.get('params').schema;
          }
        };
      },
      value: {
        get({data, input, output}) {
          return data.rules
        },
        set({data, setDesc, outputs}, val) {
          data.rules = val

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



