export default {
  ':root': [
    {
		  title: 'cookie名称',
		  type: 'text',
		  value: {
			  get({ data }) {
				  return data.keyName;
			  },
			  set({ data }, value) {
				  data.keyName = value;
			  }
		  }
	  },
  ]
}



