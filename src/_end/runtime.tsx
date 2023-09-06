export default function ({ env, inputs, data }) {
	inputs['customResponse'](response => {
		env.hooks?.onFinished?.(response, !data.useRegular);
	});
}
