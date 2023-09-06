export default function ({ env, inputs, data }) {
	inputs['inputValue']((val, relOutpus) => {
		const id = env?.user?.id;
		relOutpus['rtn'](data.merge && Object.prototype.toString.call(val) === '[object Object]' ? { ...val, userId: id } : { userId: id });
	});
}
