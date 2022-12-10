Vue.component('task-form', {
  props: ['bus', 'id'],
  template: `
    <div>
      <div class="flex">
        <p class="text-form">Task Name:</p>
        <div class="input-name-div"><input class="input-name" v-model="name"></div>
      </div>
      <br>
      Due Date:
      <table>
        <thead>
          <tr>
            <th>Year</th>
            <th>Month</th>
            <th>Day</th>
            <th v-if="$screen.lg == true">Hour</th>
            <th v-if="$screen.lg == true">Minute</th>
            <th v-if="$screen.lg == true">Second</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th><input class="short-width" type="number" v-model="dueDate.year"></th>
            <th><input class="short-width" type="number" v-model="dueDate.month"></th>
            <th><input class="short-width" type="number" v-model="dueDate.day"></th>
            <th v-if="$screen.lg == true"><input class="short-width" type="number" v-model="dueDate.hour"></th>
            <th v-if="$screen.lg == true"><input class="short-width" type="number" v-model="dueDate.minute"></th>
            <th v-if="$screen.lg == true"><input class="short-width" type="number" v-model="dueDate.second"></th>
          </tr>
        </tbody>
      </table>
      <table v-if="$screen.lg == false">
        <thead>
          <tr>
            <th>Hour</th>
            <th>Minute</th>
            <th>Second</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th><input class="short-width" type="number" v-model="dueDate.hour"></th>
            <th><input class="short-width" type="number" v-model="dueDate.minute"></th>
            <th><input class="short-width" type="number" v-model="dueDate.second"></th>
          </tr>
        </tbody>
      </table>
      <br>
      Make Cyclic: <input type="checkbox" v-model="isCyclic">
      <div v-if="isCyclic">
        Repeat task once every:
        <table>
          <thead>
            <tr>
              <th>Years</th>
              <th>Months</th>
              <th>Weeks</th>
              <th>Days</th>
              <th>Hours</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th><input class="short-width" type="number" v-model="cyclicDate.years"></th>
              <th><input class="short-width" type="number" v-model="cyclicDate.months"></th>
              <th><input class="short-width" type="number" v-model="cyclicDate.weeks"></th>
              <th><input class="short-width" type="number" v-model="cyclicDate.days"></th>
              <th><input class="short-width" type="number" v-model="cyclicDate.hours"></th>
            </tr>
          </tbody>
        </table>
      </div>

      <br><br>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Label</th>
            <th>Assign to Task</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="i in sortedRecipes">
            <th>{{ i.name }}</th>
            <th>{{ i.label }}</th>
            <th><input type="checkbox" v-model="i.selected"></th>
          </tr>
        </tbody>
      </table>
      <br>
      <button @click="submitData">Add Task</button>

      <br><br>

      <div v-for="task in sortedTasks">
        {{ task.name }} - {{ task.dueDate.getMonth() + 1 }}/{{ task.dueDate.getDate()}}/{{ task.dueDate.getFullYear() }} {{ padTime(task.dueDate.getHours()) }}:{{ padTime(task.dueDate.getMinutes()) }}:{{ padTime(task.dueDate.getSeconds()) }}
        <button v-if="task.cyclicDate" @click="completeTask(task)">Complete</button>
        <button @click="deleteData(task)">Delete</button>

        <div class="progress-bar-back">
          <div class="progress-bar-front" :style="{ width: Math.min(100, Math.max( (task.dueDate - currentDate) * 100 / Math.abs(task.dueDate - task.startDate), 0)) + '%' }">
          </div>
        </div>

        <i v-if="task.recipes.length > 0">From {{ task.recipes.map(r => r.name).join(', ') }}:</i>
        <div v-for="(item, index) in task.itemSums" :key="index">
          {{ index }}
          <ul>
            <li v-for="(subitem, subindex) in item" :key="subindex">
              <div v-if="!subitem.isComplete" style="display: inline-block">{{ subindex }}{{ subitem.lasting ? '?' : ''}} ({{ Object.entries(subitem.amounts).map(([unit, val]) => (unit !== '') ? (val + " " + unit) : val ).join(", ") }})</div>
              <s v-if="subitem.isComplete" style="display: inline-block">{{ subindex }}{{ subitem.lasting ? '?' : ''}} ({{ Object.entries(subitem.amounts).map(([unit, val]) => (unit !== '') ? (val + " " + unit) : val ).join(", ") }})</s>
              <input style="float: right; margin: 0px; margin-right: 20px" type="checkbox" v-model="subitem.isComplete" @change="saveTask(task)"></input>
            </li>
          </ul>
        </div>
        <br>

      </div>
    </div>`,
  data: function () {
    return {
      name: '',
      dueDate: {
        year: 0,
        month: 0,
        day: 0,
        hour: 0,
        minute: 0,
        second: 0
      },
      cyclicDate: {
        years: 0,
        months: 0,
        weeks: 0,
        days: 0,
        hours: 0,
      },
      recipes: [],
      tasks: [],
      isCyclic: false,
      currentDate: new Date()
    }
  },
  computed: {
    sortedRecipes () {
      return this.recipes.sort((a, b) => {
        if (a.label !== b.label) return ('' + a.label).localeCompare(b.label);
        return ('' + a.name).localeCompare(b.name);
      });
    },
    sortedTasks () {
      return this.tasks.sort((a, b) => {
        return a.dueDate > b.dueDate;
      });
    },
  },
  mounted () {
    this.getData();
    this.resetFields();
    this.bus.$on('update', this.getData);
    setInterval(() => {
      this.currentDate = new Date()
    }, 1000);
  },
  methods: {
    saveTask (task) {
      const data = {
        action: 'edit',
        type: 'tasks',
        id: this.id,
        data: task
      };
      this.$http.post('/api/data', data).then(response => {
        this.items = response.body;
        this.bus.$emit('trigger');
      });
    },
    generateItemSums (recipes) {
      const items = {};

      recipes.forEach(recipe => {
        const foundRecipe = this.recipes.find(r => r.name === recipe.name);
        if (!foundRecipe) {
          return items;
        }
        foundRecipe.recipeForm.forEach(item => {
          if (!items[item.label]) {
            items[item.label] = {};
          }
          if (!items[item.label][item.name]) {
            items[item.label][item.name] = {
              amounts: {},
              lasting: false
            };
          }
          if (!items[item.label][item.name].amounts[item.unit]) {
            items[item.label][item.name].amounts[item.unit] = 0;
          }
          items[item.label][item.name].amounts[item.unit] += item.amount;
          items[item.label][item.name].lasting = item.checked;
          items[item.label][item.name].isComplete = false;
        });
      });
      return items;
    },
    padTime (time) {
      return ('' + time).padStart(2, '0');
    },
    resetFields () {
      this.name = '';
      const currentDate = new Date();
      this.dueDate.year = currentDate.getFullYear();
      this.dueDate.month = currentDate.getMonth() + 1;
      this.dueDate.day = currentDate.getDate();
      this.dueDate.hour = 0;
      this.dueDate.minute = 0;
      this.dueDate.second = 0;
      this.cyclicDate.years = 0;
      this.cyclicDate.months = 0;
      this.cyclicDate.weeks = 0;
      this.cyclicDate.days = 0;
      this.cyclicDate.hours = 0;
      this.isCyclic = false;
      this.getData();
    },
    getData () {
      const data = {
        action: 'get',
        type: 'recipes',
        id: this.id
      };
      this.$http.post('/api/data', data).then(response => {
        this.recipes = response.body;
      });
      data.type = 'tasks';
      this.$http.post('/api/data', data).then(response => {
        for (let task of response.body) {
          task.dueDate = new Date(task.dueDate);
          task.startDate = new Date(task.startDate);
          if (!task.itemSums) { // if the database doesn't have this, generate it
            task.itemSums = this.generateItemSums(task.recipes)
          }
        }
        this.tasks = response.body;
      });
    },
    deleteData (input) {
      const data = {
        action: 'delete',
        type: 'tasks',
        id: this.id,
        data: input
      };
      this.$http.post('/api/data', data).then(response => {
        this.items = response.body;
        this.bus.$emit('trigger');
      });
    },
    completeTask (input) {
      input.startDate = input.dueDate;
      input.dueDate = new Date(input.startDate);
      input.dueDate.setFullYear(input.dueDate.getFullYear() + input.cyclicDate.years);
      input.dueDate.setMonth(input.dueDate.getMonth() + input.cyclicDate.months);
      input.dueDate.setDate(input.dueDate.getDate() + input.cyclicDate.weeks*7 + input.cyclicDate.days);
      input.dueDate.setHours(input.dueDate.getHours() + input.cyclicDate.hours);
      const data = {
        action: 'edit',
        type: 'tasks',
        id: this.id,
        data: input
      };
      this.$http.post('/api/data', data).then(response => {
        this.items = response.body;
        this.bus.$emit('trigger');
      });
    },
    submitData () {
      let selectedRecipes = this.sortedRecipes.filter(r => r.selected).map(r => ({
        name: r.name.trim(),
        label: r.label.trim(),
      }));

      const data = {
        action: 'add',
        type: 'tasks',
        id: this.id,
        data: {
          name: this.name,
          startDate: new Date().toUTCString(),
          dueDate: new Date(this.dueDate.year, this.dueDate.month - 1, this.dueDate.day, this.dueDate.hour, this.dueDate.minute, this.dueDate.second).toUTCString(),
          recipes: selectedRecipes,
          itemSums: this.generateItemSums(selectedRecipes),
        }
      };
      for (let key in this.cyclicDate) {
        this.cyclicDate[key] -= 0;
      }
      if (this.isCyclic) data.data.cyclicDate = this.cyclicDate;
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