<script>
import {Supplies} from "@/store/supplies.js";
import UInput from "@/components/_UIComponents/UInput/UInput.vue";
import UButton from "@/components/_UIComponents/UButton/UButton.vue";
import {warehouses} from "@/store/warehouses.js";
import inputData from "@/hooks/inputData.js";
import {ref} from "vue";

export default {
  components: {UButton, UInput},
  setup() {
    const {getSupplies, newSupplies, updateDirectionSupply, deleteSupply} = Supplies()
    const {getWarehouses} = warehouses()
    const {value: target, takedValue: tackedTarget, error: errorTarget} = inputData("", "string")
    const {value: where, takedValue: tackedWhere, error: errorWhere} = inputData("", "string")
    const {value: type} = inputData("target", "string")
    const id = ref(null)
    const openModal = ref(false)
    const typeModal = ref('add')

    const saveSupplies = () => {
      tackedTarget.value = true
      tackedWhere.value = true

      const checkTarget = !!target.value && !errorTarget.value.length
      const checkWhere= !!where.value && !errorWhere.value.length

      if(checkTarget && checkWhere) {
        if(typeModal.value === "add") {
          newSupplies({target: target.value, where: where.value, type: type.value}, closeModal)
          return
        }
        updateDirectionSupply({type: type.value, id: id.value}, closeModal)
      }
    }

    const closeModal = () => {
      target.value = ""
      where.value = ""
      type.value = "target"
      typeModal.value = "add"
      tackedTarget.value = false
      tackedWhere.value = false
      openModal.value = false
      id.value = null
    }

    const updateSupplies = (supply) => {
      target.value = supply.target
      where.value = supply.where
      type.value = supply.type
      typeModal.value = "update"
      tackedTarget.value = true
      tackedWhere.value = true
      openModal.value = true
      id.value = supply.id
    }

    const removeSupply = (id) => {
      if(confirm("Точно удалить связь складов?")) {
        deleteSupply(id)
      }
    }

    return {
      getSupplies, getWarehouses,
      target, tackedTarget, errorTarget,
      where, tackedWhere, errorWhere,
      type,
      openModal,
      saveSupplies,
      closeModal,
      updateSupplies,
      removeSupply,
      typeModal
    }
  }
}
</script>
<template>
  <div class="supplies-warehouse">
    <h2 class="supplies-warehouse__title">Связь складов</h2>
    <UButton class="supplies-warehouse__open-form" @click="openModal = true">Добавить связь</UButton>
    <form class="supplies-warehouse__form" v-if="openModal" @submit.prevent="saveSupplies">
      <div class="supplies-warehouse__content">
        <UButton class="supplies-warehouse__close" type="button" @click="closeModal" modifier="red"></UButton>
        <h3 class="supplies-warehouse__sub-title">{{ typeModal === "add" ? "Добавление" : "Редактирование" }} связи</h3>
        <UInput :disabled="typeModal === 'update'" name="Склад для поставки" view="select" v-model="target" :start-value="target" :error="errorTarget" @change="tackedTarget = true">
          <option value=""></option>
          <option v-for="warehouse in getWarehouses.filter(ware => ware.id !== where)" :key="`target-${warehouse.id}`" :value="warehouse.id">
            {{ warehouse.title }}
          </option>
        </UInput>
        <UInput :disabled="typeModal === 'update'" name="Склад от куда поставлять" view="select" v-model="where" :start-value="where" :error="errorWhere" @change="tackedWhere = true">
          <option value=""></option>
          <option v-for="warehouse in getWarehouses.filter(ware => ware.id !== target && ware.rule === 'feedstock')" :key="`where-${warehouse.id}`" :value="warehouse.id">
            {{ warehouse.title }}
          </option>
        </UInput>
        <UInput name="Направление" view="select" v-model="type" :start-value="type">
          <option value="target">Только в выбранный склад</option>
          <option value="all" v-if="!target || getWarehouses.find(ware => ware.id === target).rule !== 'commodity'">Между складов</option>
        </UInput>
        <UButton class="supplies-warehouse__button" type="submit">{{ typeModal === "add" ? "Добавить" : "Редактировать" }} связь</UButton>
      </div>
    </form>
    <div class="supplies-warehouse__table" v-if="getSupplies.length">
      <div class="supplies-warehouse__table-item supplies-warehouse__table-item--head">
        Склад для поставки
      </div>
      <div class="supplies-warehouse__table-item supplies-warehouse__table-item--head">
        Склад от куда поставлять
      </div>
      <div class="supplies-warehouse__table-item supplies-warehouse__table-item--head">
        Направление
      </div>
      <div class="supplies-warehouse__table-item supplies-warehouse__table-item--head">
        Действия
      </div>
      <template v-for="supply in getSupplies">
        <div class="supplies-warehouse__table-item">
          {{getWarehouses.find(ware => ware.id === supply.target)?.title}}
        </div>
        <div class="supplies-warehouse__table-item">
          {{getWarehouses.find(ware => ware.id === supply.where)?.title}}
        </div>
        <div class="supplies-warehouse__table-item">
          {{supply.type === "target" ? "Только в склад" : "Между собой"}}
        </div>
        <div class="supplies-warehouse__table-item supplies-warehouse__table-item--action">
          <UButton @click="updateSupplies(supply)" :disabled="getWarehouses.find(ware => ware.id === supply.target)?.rule === 'commodity'" modifier="yellow">Изименить направление</UButton>
          <UButton v-if="!supply.find_connect" modifier="red" @click="removeSupply(supply.id)">Удалить</UButton>
        </div>
      </template>
    </div>
  </div>
</template>
<style src="./SuppliesWarehouse.scss" lang="scss" scoped/>