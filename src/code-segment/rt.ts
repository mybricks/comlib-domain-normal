// import { runJs } from '../com-utils';
import { Data } from './constants';

const getFnString = (fnBody: string, fnParams: string[]) => {
  return `function _RT_ ({${fnParams.join(',')}}) {${fnBody}}`;
};

export default function ({ env, data, inputs, outputs, logger, onError }: RuntimeParams<Data>) {
  const { fns, runImmediate } = data;

  const runJSParams = { outputs };
  
  try {
    if (runImmediate) {
      if (env.runtime) {
	      eval(decodeURIComponent(fns))(runJSParams);
      }
    }
    inputs.input0((val: any) => {
      try {
	      eval(decodeURIComponent(fns))({ ...runJSParams, inputValue: val });
      } catch (ex) {
        onError?.(ex);
        console.error('js计算组件运行错误.', ex);
        logger.error(`${ex}`);
      }
    });
  } catch (ex) {
    onError?.(ex);
    console.error('js计算组件运行错误.', ex);
    logger.error(`${ex}`);
  }
}
