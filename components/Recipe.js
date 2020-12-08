Vue.component('recipe-form', {
  props: ['bus', 'id'],
  template: `
    <div>
      <div class="flex">
        <p class="text-form">Recipe Name:</p>
        <div class="input-name-div"><input class="input-name" v-model="name"></div>
      </div>
      <div>
        <p class="text-form">Assign Label:</p>
        <input v-model="label">
      </div>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Label</th>
            <th>Amount</th>
            <th>Include in Recipe</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="i in sortedRecipeForm">
            <th>{{ i.name }}</th>
            <th>{{ i.label }}</th>
            <th><input type="number" v-model="i.amount"></th>
            <th><input type="checkbox" v-model="i.selected"></th>
          </tr>
        </tbody>
      </table>
      <br>
      <button @click="submitData">Add/Update Recipe</button>
      <br><br><br>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Label</th>
            <th>Load Recipe</th>
            <th>Delete Recipe</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="i in sortedRecipes">
            <th>{{ i.name }}</th>
            <th>{{ i.label }}</th>
            <th><button @click="loadData(i)">Load Recipe</button></th>
            <th><button @click="deleteData(i)">Delete</button></th>
          </tr>
        </tbody>
      </table>
      
    </div>`,
  data: function () {
    return {
      name: '',
      label: '',
      items: [],
      recipeForm: [],
      recipes: []
    }
  },
  computed: {
    sortedItems () {
      return this.items.sort((a, b) => {
        return ('' + a.name).localeCompare(b.name);
      });
    },
    sortedRecipeForm () {
      return this.recipeForm.sort((a, b) => {
        return ('' + a.name).localeCompare(b.name);
      });
    },
    sortedRecipes () {
      return this.recipes.sort((a, b) => {
        return ('' + a.name).localeCompare(b.name);
      });
    },
  },
  mounted () {
    this.getData();
    this.bus.$on('update', this.getData);
  },
  methods: {
    resetFields () {
      this.name = '';
      this.label = '';
      this.getData();
    },
    getData () {
      const data = {
        action: 'get',
        type: 'items',
        id: this.id
      };
      this.$http.post('/api/data', data).then(response => {
        this.items = response.body;
        this.recipeForm = this.items.map(i => ({
          name: i.name,
          label: i.label,
          checked: i.checked,
          amount: 0,
          selected: false
        }));        
      });
      data.type = "recipes";
      this.$http.post('/api/data', data).then(response => {
        this.recipes = response.body;
      });
    },
    loadData (input) {
      this.name = input.name;
      this.label = input.label;
      input.recipeForm.forEach(r => {
        const item = this.recipeForm.find(other => other.name === r.name);
        if (!item) return;
        item.amount = r.amount;
        item.selected = r.selected;
      });
    },
    deleteData (input) {
      const data = {
        action: 'delete',
        type: 'recipes',
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
        action: 'edit',
        type: 'recipes',
        id: this.id,
        data: {
          name: this.name,
          label: this.label,
          recipeForm: this.recipeForm.filter(r => r.selected),
        }
      };
      data.data.recipeForm.forEach(r => {
        r.amount -= 0;
      })

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