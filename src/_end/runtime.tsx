export default function ({ env, inputs, data }) {
	inputs['customResponse'](response => {
		env.collect('结束 response: ', response)
		env.hooks?.onFinished?.(response, !data.useRegular);
	});
}
