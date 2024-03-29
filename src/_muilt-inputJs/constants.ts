export const CODE_TEMPLATE = `({ outputs, inputs, env }) => {
  const [ inputValue0 ] = inputs;
  const [ output0 ] = outputs;
  output0(inputValue0);
}`;

export const IMMEDIATE_CODE_TEMPLATE = `({ outputs, env }) => {
  const [ output0 ] = outputs;
  output0(0);
}`;

export const COMMENTS = `/**
* @parma inputs: any[] 输入项
* @parma outputs: any[] 输出项
* @parma env: {
*   executeSql: ( sql: string) => { rows: any[] | any }, // 执行 SQL
*   genUniqueId: () => number, // 生成递增的唯一 ID
*   getEntityName: (entityName: string) => string, // 获取实体表名，生成 SQL 语句时需要
* } 环境变量
*
* 例子
* ({ inputs, outputs, env }) => {
*   const [ inputValue0, inputValue1 ] = inputs;
*   const [ output0, output1, output2 ] = outputs;
*   const res = '该值输出给下一个组件使用' + inputValue0
*   
*   // 向输出项 (output0) 输出结果
*   output0(res); 

*   // 多输出的情况
*   // 向输出项 (output1) 输出输入项0的值
*   // output1(inputValue0); 
*   // 向输出项 (output2) 输出输入项1的值
*   // output2(inputValue1);
*
*   // 调用环境变量上方法查询数据库
*   // 请注意: INSERT 语句返回类型为 { rows: object }; SELECT 语句返回类型为 { rows: object[] }
*   // const data = env.executeSql('SELECT * FORM ' + env.getEntityName(table_name)); 
* }
*/`;

export interface Data {
  transformCode: string;
  fnParams: string[];
  fnBody: string;
  fns: any;
  runImmediate: boolean;
}
