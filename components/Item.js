Vue.component('item-form', {
  props: ['bus', 'id'],
  template: `
    <div>
      <div class="flex">
        <p class="text-form">Item Name:</p>
        <div class="input-name-div"><input class="input-name" v-model="name"></div>
      </div>
      <div>
        <p class="text-form">Assign Label:</p>
        <input v-model="label">
      </div>
      <div>
        <p class="text-form">Long Lasting?</p> <input type="checkbox" v-model="checked">
      </div>

      <button @click="submitData">Add Item</button>
      <br><br><br>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Label</th>
            <th>Long Lasting?</th>
            <th>Delete Item</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="i in sortedItems">
            <th>{{ i.name }}</th>
            <th>{{ i.label }}</th>
            <th>{{ i.checked }}</th>
            <th><button @click="deleteData(i)">Delete</button></th>
          </tr>
        </tbody>
      </table>
    </div>`,
  data: function () {
    return {
      name: '',
      label: '',
      checked: false,
      items: [],
    }
  },
  computed: {
    sortedItems () {
      return this.items.sort((a, b) => {
        return ('' + a.name).localeCompare(b.name);
      });
    }
  },
  mounted () {
    this.getData();
    this.bus.$on('update', this.getData);
  },
  methods: {
    resetFields () {
      this.name = '';
      this.label = '';
      this.checked = false;
    },
    getData () {
      const data = {
        action: 'get',
        type: 'items',
        id: this.id
      };
      this.$http.post('/api/data', data).then(response => {
        this.items = response.body;
      });
    },
    deleteData (input) {
      const data = {
        action: 'delete',
        type: 'items',
        id: this.id,
        data: input
      };
      this.$http.post('/api/data', data).then(response => {
        this.items = response.body;
        this.bus.$emit('trigger');
      });
    },
    submitData () {
      const data = {
        action: 'add',
        type: 'items',
        id: this.id,
        data: {
          name: this.name,
          label: this.label,
          checked: this.checked,
        }
      };
      this.$http.post('/api/data', data).then(response => {
        this.resetFields();
        this.items = response.body;
        this.bus.$emit('trigger');
      }, response => {
        alert('You need a unique name');
      });
    }
  }
});