<script>
import {Supplies} from "@/store/warehouse/Supplies.js";
import UButton from "@/components/_UIComponents/UButton/UButton.vue";
import Counter from "@/components/Counter/Counter.vue";
import {authorization} from "@/store/authorization.js";
import {computed, ref} from "vue";
import UInput from "@/components/_UIComponents/UInput/UInput.vue";

export default {
  components: {UInput, Counter, UButton},
  setup() {
    const {getSuppliesActive, confirmSupply, finishSupply} = Supplies()
    const {getUser} = authorization()
    const activeAccount = ref(null)
    const checked = ref([]);

    const getStatus = (status) => {
      const statuses = [
        {
          name: 'created',
          value: 'Создан',
        },
        {
          name: 'sended',
          value: 'Отправлен',
        }
      ]
      return statuses.find(st => st.name === status).value;
    }

    const openModal = (account) => {
      activeAccount.value = account
    }

    const filterAccount = computed(() => {
      const newAccount = [];
      if (activeAccount.value) {
        if (getUser.value.warehouse_id === activeAccount.value.target_warehouse.id) {
          activeAccount.value.products.forEach(item => {
            newAccount.push({
              ...item.current,
              type: item.type,
              supply_count: item.count,
            })
          })
        } else {
          activeAccount.value.products.forEach(item => {
            newAccount.push({
              ...item.target,
              type: item.type,
              supply_count: item.count,
            })
          })
        }
        return newAccount
      }

      return []
    })

    const sendSupply = () => {
      if (checked.value.length !== activeAccount.value.products.length) {
        alert("Не все положил")
        return
      }

      if (confirm("Точно все собрал?")) {
        confirmSupply(activeAccount.value.id, () => {
          activeAccount.value = null
        })
      }
    }

    const acceptSupply = () => {
      finishSupply(activeAccount.value.id, () => {
        activeAccount.value = null
      })
    }


    return {
      getSuppliesActive,
      getUser,
      getStatus,
      openModal,
      activeAccount,
      checked,
      filterAccount,
      sendSupply,
      acceptSupply
    }
  }
}
</script>
<template>
  <div class="active-supplies" v-if="getSuppliesActive.length">
    <h3 class="active-supplies__title">Текущие поставки</h3>
    <Teleport to="body" v-if="activeAccount">
      <div class="supply-modal">
        <button class="supply-modal__close" @click="activeAccount = null"></button>
        <p class="supply-modal__title">Поставка</p>
        <p class="supply-modal__text"><b>Из склада:</b>{{ activeAccount.warehouse.name }}</p>
        <p class="supply-modal__text"><b>В склад:</b>{{ activeAccount.target_warehouse.name }}</p>
        <p class="supply-modal__text"><b>Статус:</b>{{ getStatus(activeAccount.status) }}</p>
        <template v-if="filterAccount.filter(product => product.type === 'accounting').length">
          <p class="supply-modal__sub-title"><b>Фасованные товары:</b></p>
          <div
              :class="['supply-modal__table', {'supply-modal__table--target': activeAccount.target_warehouse.id === getUser.warehouse_id || activeAccount.status === 'sended'}]">
            <template v-for="account in filterAccount.filter(product => product.type === 'accounting')">
              <div v-if="activeAccount.warehouse.id === getUser.warehouse_id && activeAccount.status === 'created'"
                   :class="['supply-modal__table-item', {'supply-modal__table-item--active': checked.find(check => check === `accounting-${account.id}`)}]">
                <label class="supply-modal__checkbox">
                  <input type="checkbox" v-model="checked" :value="`accounting-${account.id}`">
                  <span class="supply-modal__marker"></span>
                </label>
              </div>
              <div
                  :class="['supply-modal__table-item', 'supply-modal__table-item--title', {'supply-modal__table-item--active': checked.find(check => check === account.id)}]">
                <p>{{ account.title }}</p>
              </div>
              <div class="supply-modal__table-item">
                {{ account.count }} {{ account.measure_unit }}
              </div>
              <div class="supply-modal__table-item">{{ account.supply_count }}</div>
            </template>
          </div>
        </template>

        <template v-if="filterAccount.filter(product => product.type === 'weight').length">
          <p class="supply-modal__sub-title"><b>Весовые товары:</b></p>
          <div
              :class="['supply-modal__table supply-modal__table--small', {'supply-modal__table--target': activeAccount.target_warehouse.id === getUser.warehouse_id || activeAccount.status === 'sended'}]">
            <template v-for="account in filterAccount.filter(product => product.type === 'weight')">
              <div v-if="activeAccount.warehouse.id === getUser.warehouse_id && activeAccount.status === 'created'"
                   :class="['supply-modal__table-item', {'supply-modal__table-item--active': checked.find(check => check === `weight-${account.id}`)}]">
                <label class="supply-modal__checkbox">
                  <input type="checkbox" v-model="checked" :value="`weight-${account.id}`">
                  <span class="supply-modal__marker"></span>
                </label>
              </div>
              <div
                  :class="['supply-modal__table-item', 'supply-modal__table-item--title', {'supply-modal__table-item--active': checked.find(check => check === account.id)}]">
                <p>{{ account.title }}</p>
              </div>
              <div class="supply-modal__table-item">{{ account.supply_count }}</div>
            </template>
          </div>
        </template>

        <template v-if="filterAccount.filter(product => product.type === 'consumable').length">
          <p class="supply-modal__sub-title"><b>Расходники:</b></p>
          <div
              :class="['supply-modal__table supply-modal__table--small', {'supply-modal__table--target': activeAccount.target_warehouse.id === getUser.warehouse_id || activeAccount.status === 'sended'}]">
            <template v-for="account in filterAccount.filter(product => product.type === 'consumable')">
              <div v-if="activeAccount.warehouse.id === getUser.warehouse_id && activeAccount.status === 'created'"
                   :class="['supply-modal__table-item', {'supply-modal__table-item--active': checked.find(check => check === `consumable-${account.id}`)}]">
                <label class="supply-modal__checkbox">
                  <input type="checkbox" v-model="checked" :value="`consumable-${account.id}`">
                  <span class="supply-modal__marker"></span>
                </label>
              </div>
              <div
                  :class="['supply-modal__table-item', 'supply-modal__table-item--title', {'supply-modal__table-item--active': checked.find(check => check === account.id)}]">
                <p>{{ account.title }}</p>
              </div>
              <div class="supply-modal__table-item">{{ account.supply_count }}</div>
            </template>
          </div>
        </template>

        <template v-if="filterAccount.filter(product => product.type === 'individual').length">
          <p class="supply-modal__sub-title"><b>Коробки и мелочевка:</b></p>
          <div
              :class="['supply-modal__table supply-modal__table--small', {'supply-modal__table--target': activeAccount.target_warehouse.id === getUser.warehouse_id || activeAccount.status === 'sended'}]">
            <template v-for="account in filterAccount.filter(product => product.type === 'individual')">
              <div v-if="activeAccount.warehouse.id === getUser.warehouse_id && activeAccount.status === 'created'"
                   :class="['supply-modal__table-item', {'supply-modal__table-item--active': checked.find(check => check === `individual-${account.id}`)}]">
                <label class="supply-modal__checkbox">
                  <input type="checkbox" v-model="checked" :value="`individual-${account.id}`">
                  <span class="supply-modal__marker"></span>
                </label>
              </div>
              <div
                  :class="['supply-modal__table-item', 'supply-modal__table-item--title', {'supply-modal__table-item--active': checked.find(check => check === account.id)}]">
                <p>{{ account.title }}</p>
              </div>
              <div class="supply-modal__table-item">{{ account.supply_count }}</div>
            </template>
          </div>
        </template>
        <UButton @click="sendSupply" class="supply-modal__button"
                 v-if="activeAccount.warehouse.id === getUser.warehouse_id && activeAccount.status === 'created'">
          Отправить
        </UButton>
        <UButton @click="acceptSupply" class="supply-modal__button"
                 v-if="activeAccount.target_warehouse.id === getUser.warehouse_id && activeAccount.status === 'sended'">
          Принять
        </UButton>
      </div>
    </Teleport>
    <div class="active-supplies__table">
      <div class="active-supplies__table-item active-supplies__table-item--head">
        Из склада
      </div>
      <div class="active-supplies__table-item active-supplies__table-item--head">
        В склад
      </div>
      <div class="active-supplies__table-item active-supplies__table-item--head">
        Статус
      </div>
      <div class="active-supplies__table-item active-supplies__table-item--head">
        Продуктов
      </div>
      <template v-for="account in getSuppliesActive">
        <div @click="openModal(account)" class="active-supplies__table-item">
          {{ account.warehouse.name }}
        </div>
        <div @click="openModal(account)" class="active-supplies__table-item active-supplies__table-item--center">
          {{ account.target_warehouse.name }}
        </div>
        <div @click="openModal(account)" class="active-supplies__table-item active-supplies__table-item--center">
          {{ getStatus(account.status) }}
        </div>
        <div @click="openModal(account)" class="active-supplies__table-item active-supplies__table-item--center">
          {{ account.products.length }}
        </div>
      </template>
    </div>

  </div>
</template>
<style src="./ActiveSupplies.scss" lang="scss" scoped/>