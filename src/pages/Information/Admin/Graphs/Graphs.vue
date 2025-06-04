<script>
import Graphic from "@/components/Graphic/Graphic.vue";
import VueDatePicker from "@vuepic/vue-datepicker";
import UButton from "@/components/_UIComponents/UButton/UButton.vue";
import {computed, ref} from "vue";
import {graphs} from "@/store/graphs.js";
import {Chart, Grid, Line, Tooltip} from "vue3-charts"

export default {
  components: {UButton, VueDatePicker, Graphic, Chart, Grid, Line, Tooltip},
  beforeCreate() {
    const {findMinDate} = graphs()
    findMinDate()
  },
  beforeUnmount() {
    const {resetGraphs} = graphs()
    resetGraphs()
  },
  setup() {
    const {getMinDate, findGraphs, getGraphs, resetGraphs} = graphs()
    const date = ref([])
    const shows = ref([])
    const direction = ref('horizontal')
    const margin = ref({
      left: 0,
      top: 20,
      right: 20,
      bottom: 0
    })

    const format = (date) => {
      let endString = ''

      if (date[0]) {
        endString += `${date[0].getDate().toString().padStart(2, '0')}.${(date[0].getMonth() + 1).toString().padStart(2, '0')}.${date[0].getFullYear()}`
      }

      if (date[1]) {
        endString += ` - ${date[1].getDate().toString().padStart(2, '0')}.${(date[1].getMonth() + 1).toString().padStart(2, '0')}.${date[1].getFullYear()}`
      }

      return endString
    }


    const findGraphic = () => {
      resetGraphs()
      if (date.value[0] && date.value[1]) {
        const minDate = `${date.value[0].getFullYear()}-${(date.value[0].getMonth() + 1).toString().padStart(2, '0')}-${date.value[0].getDate().toString().padStart(2, '0')}`
        const maxDate = `${date.value[1].getFullYear()}-${(date.value[1].getMonth() + 1).toString().padStart(2, '0')}-${date.value[1].getDate().toString().padStart(2, '0')}`
        findGraphs({minDate, maxDate})
        return
      }
      if (date.value[0] && !date.value[1]) {
        const minDate = `${date.value[0].getFullYear()}-${(date.value[0].getMonth() + 1).toString().padStart(2, '0')}-${date.value[0].getDate().toString().padStart(2, '0')}`
        findGraphs({minDate, maxDate: minDate})
        return;
      }
      alert('Выбери даты')
    }

    const finalArray = computed(() => {
      const arr = []

      Object.entries(getGraphs.value.days).forEach(([key, value]) => {
        const object = {name: key.split('-').reverse().join('.'), 'Заказы': value.orders_count}
        getGraphs.value.finalProducts.forEach(product => {
          if (shows.value.find(hide => hide === product)) {
            object[product] = value[product] ? value[product] : 0;
          }
        })
        arr.push(object)
      })

      return arr
    })

    const config = computed(() => {
      const object = {
        "Заказы": {
          color: '#15658a'
        }
      }
      getGraphs.value.finalProducts.forEach(product => {
        if (shows.value.find(hide => hide === product)) {
          object[product] = {
            color: getGraphs.value.colors[product],
          }
        }
      })
      return object
    })

    const weekTitle = (date) => {
      const splitName = date.split(' ')
      return `${splitName[0].split('-').reverse().join('.')} - ${splitName[2].split('-').reverse().join('.')}`
    }


    return {
      date, format, findGraphic, getMinDate, getGraphs, shows, direction, margin, finalArray, config, weekTitle
    }
  },
}
</script>

<template>
  <div class="graphs">
    <h2 class="graphs__title">Выбор диапазона:</h2>
    <div class="graphs__form">
      <VueDatePicker
          class="graphs__input"
          v-model="date"
          range
          :format="format"
          :max-date="new Date()"
          :min-date="getMinDate"
          locale="ru-RU"
          :enable-time-picker="false"
          selectText="Выбрать"
          cancelText="Закрыть"
      />
      <UButton @click="findGraphic">Найти данные</UButton>
    </div>
    <template v-if="getGraphs">
      <h2 class="graphs__title">Общие расходы:</h2>
      <div class="graphs__table">
        <p class="graphs__name">Заказов:</p>
        <p class="graphs__value">{{ getGraphs.total_orders }}</p>
        <template v-for="product in getGraphs.finalProducts" :key="`account-${product}`">
          <p class="graphs__name">{{ product }}:</p>
          <p class="graphs__value">{{ getGraphs.accounting[product] }}</p>
        </template>
        <template v-for="product in Object.entries(getGraphs.accounting_others)" :key="`account-other-${product[0]}`">
          <p class="graphs__name">{{ product[0] }}:</p>
          <p class="graphs__value">{{ product[1] }}</p>
        </template>
      </div>
      <h2 class="graphs__title">График:</h2>
      <div class="graphs__products">
        <p class="graphs__sub-title">Показать товары на графике:</p>
        <label class="graphs__label" v-for="product in getGraphs.finalProducts">
          <input type="checkbox" v-model="shows" :value="product"/>
          <span class="graphs__marker"></span>
          <span>{{ product }}</span>
          <span class="graphs__color" :style="`--color-primary: ${getGraphs.colors[product]}`"></span>
        </label>
      </div>
      <div class="graphs__chart">
        <Chart
            :size="{ width: finalArray.length * 100, height: 700 }"
            :data="finalArray"
            :margin="margin"
            :direction="direction">

          <template #layers>
            <Grid strokeDasharray="2,2"/>
            <Line :dataKeys="['name', 'Заказы']" :lineStyle="{ stroke: '#15658a' }"/>
            <Line v-for="product in getGraphs.finalProducts" :dataKeys="['name', product]"
                  :lineStyle="{ stroke: getGraphs.colors[product] }"/>
          </template>

          <template #widgets>
            <Tooltip
                borderColor="#48CAE4"
                :config="{
                  name: { hide: true },
                  ...config
                }"
            />
          </template>
        </Chart>
      </div>
      <h2 class="graphs__title">Среднее количество:</h2>
      <div class="graphs__chart">
        <div class="graphs__table graphs__table--average"
             :style="`--columns: ${Object.entries(getGraphs.weeks).length + 1}`">
          <p class="graphs__name"></p>
          <p class="graphs__value" v-for="week in Object.entries(getGraphs.weeks)">{{ weekTitle(week[0]) }}</p>
          <p class="graphs__value">За выбранный диапазон</p>
          <p class="graphs__name">Заказов:</p>
          <p class="graphs__value" v-for="week in Object.entries(getGraphs.weeks)">{{ week[1].orders_count }}</p>
          <p class="graphs__value">{{ getGraphs.average.orders_count }}</p>
          <template v-for="product in shows">
            <p class="graphs__name">{{ product }}:</p>
            <p class="graphs__value" v-for="week in Object.entries(getGraphs.weeks)">
              {{ week[1][[product]] ? week[1][[product]] : 0 }}</p>
            <p class="graphs__value">{{ getGraphs.average[product] }}</p>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>

<style src="./Graphs.scss" lang="scss" scoped/>