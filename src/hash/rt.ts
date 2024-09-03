export default function ({env, data, outputs, inputs, onError}) {
  inputs['params']((val, relOutpus) => {
		if (!!val && typeof val === 'string') {
			try {
				const hasSaltValue = val + data.salt;
				const hashValue = env.crypto.createHash(data?.algorithm ?? 'md5').update(hasSaltValue).digest('hex');
				relOutpus['rtn'](hashValue)
			} catch (error) {
				relOutpus['rtn_error'](error);
			}
		} else {
			relOutpus['rtn_error'](new Error('哈希函数的入参必须为字符串'));
		}
  })
}