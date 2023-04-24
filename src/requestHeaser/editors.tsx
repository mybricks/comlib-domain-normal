export default {
  ':root': [
    {
		  title: '获取Header名称',
		  type: 'text',
		  value: {
			  get({ data }) {
				  return data.headerName;
			  },
			  set({ data }, value) {
				  data.headerName = value;
			  }
		  }
	  },
  ]
}



