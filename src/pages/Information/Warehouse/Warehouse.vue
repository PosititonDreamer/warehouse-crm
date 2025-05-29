<script>
import {authorization} from '../../../store/authorization';
import {computed, ref} from 'vue';
import UButton from '@/components/_UIComponents/UButton/UButton.vue'
import Accounting from './Accounting/Accounting.vue';
import Orders from './Orders/Orders.vue';
import Payed from './Payed/Payed.vue';
import Supplies from "./Supplies/Supplies.vue";

export default {
  components: {
    Supplies,
    UButton, Accounting, Orders, Payed
  },
  setup() {
    const {getUser, changeWarehouse} = authorization()
    const page = ref('accounting')
    const loading = ref(false)

    const getPage = computed(() => page.value)


    const takeWarehouse = (id) => {
      loading.value = true
      changeWarehouse(id)

      setTimeout(() => {
        loading.value = false
      });
    }

    return {
      page, getPage, getUser, changeWarehouse, loading, takeWarehouse
    }
  },
}
</script>

<template>
  <div class="warehouse">
    <div class="warehouse__header" v-if="getUser.warehouses.length > 1">
      <u-button v-for="warehouse in getUser.warehouses"
                :class="[{'u-button--active': getUser.warehouse_id === warehouse.warehouse_id}]"
                @click="takeWarehouse(warehouse.warehouse_id)">{{ warehouse.title }}
      </u-button>
    </div>
    <template
        v-if="getUser.warehouses.find(warehouse => warehouse.warehouse_id === getUser.warehouse_id).rule === 'commodity'">
      <div class="warehouse__header">
        <u-button :class="[{'u-button--active': getPage === 'accounting'}]" @click="page = 'accounting'">Товарный
          склад
        </u-button>
        <u-button :class="[{'u-button--active': getPage === 'orders'}]" @click="page = 'orders'">Заказы</u-button>
        <u-button :class="[{'u-button--active': getPage === 'salary'}]" @click="page = 'salary'">Зарплата</u-button>
        <u-button :class="[{'u-button--active': getPage === 'supplies'}]" @click="page = 'supplies'">Поставки</u-button>
      </div>
      <div class="warehouse__content">
        <Accounting v-if="getPage === 'accounting'"></Accounting>
        <Orders v-if="getPage === 'orders'"></Orders>
        <Payed v-if="getPage === 'salary'"></Payed>
        <Supplies v-if="getPage === 'supplies'"></Supplies>
      </div>
    </template>
    <template
        v-else-if="getUser.warehouses.find(warehouse => warehouse.warehouse_id === getUser.warehouse_id).rule === 'feedstock'">
      <div class="warehouse__header">
        <u-button :class="[{'u-button--active': getPage === 'accounting'}]" @click="page = 'accounting'">Товарный
          склад
        </u-button>
        <u-button :class="[{'u-button--active': getPage === 'supplies'}]" @click="page = 'supplies'">Поставки</u-button>
      </div>
      <div class="warehouse__content">
        <Accounting v-if="getPage === 'accounting'"></Accounting>
        <Supplies v-if="getPage === 'supplies'"></Supplies>
      </div>
    </template>
  </div>
</template>

<style src="./Warehouse.scss" lang="scss" scoped/>