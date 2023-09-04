export default function ({ env, inputs, data }) {
	inputs['customResponse'](response => {
		env.context?.hooks?.onFinished?.(response, !data.useRegular);
	});
}
