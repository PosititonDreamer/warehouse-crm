<script>
import {Supplies} from "@/store/supplies.js"
import {warehouses} from "@/store/warehouses.js";
import SuppliesWarehouse from "./SuppliesWarehouse/SuppliesWarehouse.vue";
import UButton from "@/components/_UIComponents/UButton/UButton.vue";
import {ref, watch} from "vue";

export default {
  components: {UButton, SuppliesWarehouse},
  beforeCreate() {
    const {findSupplies} = Supplies()
    const {findWarehouses} = warehouses()

    findWarehouses()
    findSupplies()
  },
  setup() {
    const {getSupplies, getSuppliesProduct, findSupplyProducts, saveSupplyProducts, getSupplyConnection} = Supplies()
    const {getWarehouses} = warehouses()
    const selectSupplies = ref(null)

    const selectedSuppliesConfirm = ref([])
    const selectedSuppliesProduct = ref({
      target: null,
      where: null,
      type: ""
    })

    const findWarehouseById = (id) => {
      return getWarehouses.value.find(warehouse => warehouse.id === id)
    }

    const updateSupplies = () => {
      if(confirm("Точно все правильно заполнил?")) {
        saveSupplyProducts({id: selectSupplies.value, supplies: selectedSuppliesConfirm.value})
      }
    }

    const selectSupply = (id) => {
      selectSupplies.value = id
      findSupplyProducts(id)
    }

    const takeSupply = (supply, type = "target") => {
      if(selectedSuppliesProduct.value.type === supply.type || !selectedSuppliesProduct.value.type) {
        selectedSuppliesProduct.value.type = supply.type
        selectedSuppliesProduct.value[type] = supply
        if(selectedSuppliesProduct.value.target !== null && selectedSuppliesProduct.value.where !== null) {
          selectedSuppliesConfirm.value.push({id: Date.now(), ...selectedSuppliesProduct.value})
          selectedSuppliesProduct.value = {
            target: null,
            where: null,
            type: ""
          }
        }
      } else {
        const target = type === "target" ? 'where' : 'target'
        selectedSuppliesProduct.value[type] = supply
        selectedSuppliesProduct.value[target] = null
        selectedSuppliesProduct.value.type = supply.type
      }
    }

    watch([getSuppliesProduct, getSupplyConnection], () => {
      if(getSuppliesProduct.value.length, getSupplyConnection.value.length) {
        selectedSuppliesConfirm.value = getSupplyConnection.value.map(connection => {
          if(connection.type === "accounting") {
            connection.target = getSuppliesProduct.value.target.accounting.find(item => item.id === connection.target.id)
            connection.where = getSuppliesProduct.value.where.accounting.find(item => item.id === connection.where.id)
          }
          if(connection.type === "weight") {
            connection.target = getSuppliesProduct.value.target.accounting_weight.find(item => item.id === connection.target.id)
            connection.where = getSuppliesProduct.value.where.accounting_weight.find(item => item.id === connection.where.id)
          }
          if(connection.type === "consumable") {
            connection.target = getSuppliesProduct.value.target.accounting_consumable.find(item => item.id === connection.target.id)
            connection.where = getSuppliesProduct.value.where.accounting_consumable.find(item => item.id === connection.where.id)
          }
          if(connection.type === "individual") {
            connection.target = getSuppliesProduct.value.target.accounting_individual.find(item => item.id === connection.target.id)
            connection.where = getSuppliesProduct.value.where.accounting_individual.find(item => item.id === connection.where.id)
          }
          return connection
        })
      }
      if(!getSupplyConnection.value.length) {
        selectedSuppliesConfirm.value = []
      }
    })

    return {
      getSupplies, findWarehouseById, updateSupplies, selectSupplies, selectSupply, getSuppliesProduct, takeSupply, selectedSuppliesConfirm, selectedSuppliesProduct
    }
  }
}
</script>
<template>
  <div class="supplies">
    <SuppliesWarehouse/>
    <h2 class="supplies__title">Настройка поставки</h2>
    <div class="supplies__header">
      <UButton v-for="supply in getSupplies" @click="selectSupply(supply.id)" :class="[{'u-button--active': selectSupplies === supply.id}]">
        {{ findWarehouseById(supply.where)?.title }} {{ supply.type === 'target' ? "=>" : "<=>" }}
        {{ findWarehouseById(supply.target)?.title }}
      </UButton>
    </div>
    <form class="supplies__form" @submit.prevent="updateSupplies" v-if="selectSupplies">
      <h3 class="supplies__sub-title supplies__sub-title--head">Товары</h3>
      <div class="supplies__wrapper">
        <div class="supplies__list">
          <h3 class="supplies__sub-title">Товары склада для поставки</h3>
          <UButton type="button" :class="['supplies__item', {'u-button--active': selectedSuppliesProduct.type === 'accounting' && selectedSuppliesProduct.target?.id === supply.id}]" v-for="supply in getSuppliesProduct.target?.accounting" @click="takeSupply(supply)" :disabled="selectedSuppliesConfirm.find(item => item.type === 'accounting' && item.target.id === supply.id)">
            {{supply.title}} {{supply.count}} {{supply.measure_unit}}
          </UButton>
        </div>
        <div class="supplies__list">
          <h3 class="supplies__sub-title">Товары склада от куда поставляют</h3>
          <UButton type="button" :class="['supplies__item', {'u-button--active': selectedSuppliesProduct.type === 'accounting' && selectedSuppliesProduct.where?.id === supply.id}]" v-for="supply in getSuppliesProduct.where?.accounting" @click="takeSupply(supply, 'where')" :disabled="selectedSuppliesConfirm.find(item => item.type === 'accounting' && item.where.id === supply.id)">
            {{supply.title}} {{supply.count}} {{supply.measure_unit}}
          </UButton>
        </div>
        <div class="supplies__list">
          <h3 class="supplies__sub-title">Связанные товары</h3>

          <div class="supplies__confirm">
            <div class="supplies__confirm-item" v-for="supply in selectedSuppliesConfirm.filter(item => item.type === 'accounting')" :key="supply.id">
              <p>{{supply.target.title}} {{supply.target.count}} {{supply.target.measure_unit}}</p> =>
              <p>{{supply.where.title}} {{supply.where.count}} {{supply.where.measure_unit}}</p>
              <UButton type="button" modifier="red" @click="selectedSuppliesConfirm = selectedSuppliesConfirm.filter(item => item.id !== supply.id)">Удалить</UButton>
            </div>
          </div>
        </div>
      </div>

      <h3 class="supplies__sub-title supplies__sub-title--head">Весовые товары склада</h3>
      <div class="supplies__wrapper">
        <div class="supplies__list">
          <h3 class="supplies__sub-title">Весовые товары склада для поставки</h3>
          <UButton type="button" :class="['supplies__item', {'u-button--active': selectedSuppliesProduct.type === 'weight' && selectedSuppliesProduct.target?.id === supply.id}]" v-for="supply in getSuppliesProduct.target?.accounting_weight" @click="takeSupply(supply)" :disabled="!!+supply.composite || selectedSuppliesConfirm.find(item => item.type === 'weight' && item.target.id === supply.id)">
            {{supply.title}}
          </UButton>
        </div>
        <div class="supplies__list">
          <h3 class="supplies__sub-title">Весовые товары склада от куда поставляют</h3>
          <UButton type="button" :class="['supplies__item', {'u-button--active': selectedSuppliesProduct.type === 'weight' && selectedSuppliesProduct.where?.id === supply.id}]" v-for="supply in getSuppliesProduct.where?.accounting_weight" @click="takeSupply(supply, 'where')" :disabled="!!+supply.composite || selectedSuppliesConfirm.find(item => item.type === 'weight' && item.where.id === supply.id)">
            {{supply.title}}
          </UButton>
        </div>
        <div class="supplies__list">
          <h3 class="supplies__sub-title">Связанные весовые товары</h3>
          <div class="supplies__confirm">
            <div class="supplies__confirm-item" v-for="supply in selectedSuppliesConfirm.filter(item => item.type === 'weight')" :key="supply.id">
              <p>{{supply.target.title}} {{supply.target.count}} {{supply.target.measure_unit}}</p> =>
              <p>{{supply.where.title}} {{supply.where.count}} {{supply.where.measure_unit}}</p>
              <UButton type="button" modifier="red" @click="selectedSuppliesConfirm = selectedSuppliesConfirm.filter(item => item.id !== supply.id)">Удалить</UButton>
            </div>
          </div>
        </div>
      </div>

      <h3 class="supplies__sub-title supplies__sub-title--head">Расходники</h3>
      <div class="supplies__wrapper">
        <div class="supplies__list">
          <h3 class="supplies__sub-title">Расходники для товаров склада для поставки</h3>
          <UButton type="button" :class="['supplies__item', {'u-button--active': selectedSuppliesProduct.type === 'consumable' && selectedSuppliesProduct.target?.id === supply.id}]" v-for="supply in getSuppliesProduct.target?.accounting_consumable" @click="takeSupply(supply)"  :disabled="selectedSuppliesConfirm.find(item => item.type === 'consumable' && item.target.id === supply.id)">
            {{supply.title}}
          </UButton>
        </div>
        <div class="supplies__list">
          <h3 class="supplies__sub-title">Расходники для товаров склада от куда поставляют</h3>
          <UButton type="button" :class="['supplies__item', {'u-button--active': selectedSuppliesProduct.type === 'consumable' && selectedSuppliesProduct.where?.id === supply.id}]" v-for="supply in getSuppliesProduct.where?.accounting_consumable" @click="takeSupply(supply, 'where')"  :disabled="selectedSuppliesConfirm.find(item => item.type === 'consumable' && item.where.id === supply.id)">
            {{supply.title}}
          </UButton>
        </div>
        <div class="supplies__list">
          <h3 class="supplies__sub-title">Связанные расходники для товаров</h3>
          <div class="supplies__confirm">
            <div class="supplies__confirm-item" v-for="supply in selectedSuppliesConfirm.filter(item => item.type === 'consumable')" :key="supply.id">
              <p>{{supply.target.title}} {{supply.target.count}} {{supply.target.measure_unit}}</p> =>
              <p>{{supply.where.title}} {{supply.where.count}} {{supply.where.measure_unit}}</p>
              <UButton type="button" modifier="red" @click="selectedSuppliesConfirm = selectedSuppliesConfirm.filter(item => item.id !== supply.id)">Удалить</UButton>
            </div>
          </div>
        </div>
      </div>

      <h3 class="supplies__sub-title supplies__sub-title--head">Мелочь и коробки</h3>
      <div class="supplies__wrapper">
        <div class="supplies__list">
          <h3 class="supplies__sub-title">Мелочь и коробки склада для поставки</h3>
          <UButton type="button" :class="['supplies__item', {'u-button--active': selectedSuppliesProduct.type === 'individual' && selectedSuppliesProduct.target?.id === supply.id}]" v-for="supply in getSuppliesProduct.target?.accounting_individual" @click="takeSupply(supply)"  :disabled="selectedSuppliesConfirm.find(item => item.type === 'individual' && item.target.id === supply.id)">
            {{supply.title}}
          </UButton>
        </div>
        <div class="supplies__list">
          <h3 class="supplies__sub-title">Мелочь и коробки склада от куда поставляют</h3>
          <UButton type="button" :class="['supplies__item', {'u-button--active': selectedSuppliesProduct.type === 'individual' && selectedSuppliesProduct.where?.id === supply.id}]" v-for="supply in getSuppliesProduct.where?.accounting_individual" @click="takeSupply(supply, 'where')"  :disabled="selectedSuppliesConfirm.find(item => item.type === 'individual' && item.where.id === supply.id)">
            {{supply.title}}
          </UButton>
        </div>
        <div class="supplies__list">
          <h3 class="supplies__sub-title">Связанные мелочи и коробки</h3>
          <div class="supplies__confirm">
            <div class="supplies__confirm-item" v-for="supply in selectedSuppliesConfirm.filter(item => item.type === 'individual')" :key="supply.id">
              <p>{{supply.target.title}} {{supply.target.count}} {{supply.target.measure_unit}}</p> =>
              <p>{{supply.where.title}} {{supply.where.count}} {{supply.where.measure_unit}}</p>
              <UButton type="button" modifier="red" @click="selectedSuppliesConfirm = selectedSuppliesConfirm.filter(item => item.id !== supply.id)">Удалить</UButton>
            </div>
          </div>
        </div>
      </div>
      <UButton class="supplies__confirm-button" type="submit">Сохранить связь поставок</UButton>
    </form>
  </div>
</template>
<style src="./Supplies.scss" lang="scss" scoped/>