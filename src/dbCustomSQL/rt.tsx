import { safeDecodeURIComponent } from '../_utils/util';

const getParams = (value, key) => {
	if (!key) {
		return undefined;
	}
	const keys = key.split('.');
	let curValue = value;

	while(keys.length && curValue) {
		curValue = curValue[keys.shift()];
	}

	return curValue;
};

export default function ({env, data, outputs, inputs, onError}) {
  inputs['params']((val) => {
	if (data.sql) {
		try {
			const errorParams: string[] = [];
			const curSQL = safeDecodeURIComponent(data.sql)
				.replace(/^\s+|\s+$/g, '')
				.replace(/{{.*}}/g, $0 => {
					const key = $0.replace(/^{{+|}}+$/g, '');
					const value = getParams({ params: val }, key);

					if (value === undefined) {
						errorParams.push(key);
					}

					return value;
				});

			if (errorParams.length) {
				throw new Error(`执行自定义SQL发生错误, ${errorParams.join('、')} 等参数值为 undefined`);

			}
			env.executeSql(curSQL, true)
				.then(data => outputs['rtn'](Array.from(data.rows)))
				.catch(ex => onError(`执行自定义SQL发生错误, ${ex?.message}`));
		} catch (error: any) {
			env.edit ? console.error('执行自定义SQL发生错误, ', error) : undefined;
			onError(`执行自定义SQL发生错误, ${error?.message}`);
		}
    }
  })
}
