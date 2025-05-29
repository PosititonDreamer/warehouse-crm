<script>
import UButton from "@/components/_UIComponents/UButton/UButton.vue";
import Counter from "@/components/Counter/Counter.vue";
import {Supplies} from "@/store/warehouse/Supplies.js";
import {computed, ref} from "vue";
import ActiveSupplies from "@/pages/Information/Warehouse/Supplies/ActiveSupplies/ActiveSupplies.vue";

export default {
  name: "Supplies",
  components: {ActiveSupplies, Counter, UButton},
  beforeCreate() {
    const {findSupplies, findActiveSupplies} = Supplies()
    findSupplies()
    findActiveSupplies()
  },
  setup() {
    const { getSupplies, createSupply } = Supplies()

    const activeSupplies = ref(null)
    const currentSupplies = ref(null)
    const accountingWeight = ref(null)

    const takeSupply = (id) => {
      activeSupplies.value = id
      currentSupplies.value = Object.values(getSupplies.value).find(supply => supply.target_id === id)
      accountingWeight.value = [];
      Object.values(currentSupplies.value.products.target_accounting_weight).forEach((weight) => {
        accountingWeight.value.push(JSON.parse(JSON.stringify(weight)))
      })
      currentSupplies.value.products.accounting?.forEach(account => {
        account.selected = {
          count: 0,
          id: account.id,
          target: account.target,
          loading: false,
          max: computed(() => {
            if(account.max) {
              return +account.max
            }
            return Math.floor(+accountingWeight.value.find(item => item.id === account.weight_id).amount / account.count + account.selected.count )
          })
        }
      })
      currentSupplies.value.products.accounting_weight?.forEach(account => {
        account.selected = {
          count: 0,
          id: account.id,
          loading: false,
          target: account.target,
          max: account.max
        }
      })
      currentSupplies.value.products.accounting_individual?.forEach(account => {
        account.selected = {
          count: 0,
          loading: false,
          id: account.id,
          target: account.target,
          max: account.max
        }
      })
      currentSupplies.value.products.accounting_consumable?.forEach(account => {
        account.selected = {
          count: 0,
          loading: false,
          id: account.id,
          target: account.target,
          max: account.max
        }
      })
    }

    const updateSuppliesAccounting = (e, account) => {
      if(typeof e  != 'number') return;
      if(account.weight_id) {
        account.selected.count = e
        let startValue = +(Object.values(currentSupplies.value.products.target_accounting_weight).find(item => item.id === account.weight_id).amount) * 1
        const currentSupply = accountingWeight.value.find(item => item.id === account.weight_id)
        currentSupply.products.forEach(item => {
          const selected = currentSupplies.value.products.accounting.find(account => account.id === item)
          startValue -= +selected.selected.count * +selected.count
        })

        currentSupply.amount = startValue
        currentSupply.products.forEach(item => {
          const selected = currentSupplies.value.products.accounting.find(account => account.id === item)
          selected.selected.loading = true

          setTimeout(() => {
            selected.selected.loading = false
          })
        })
        return
      }
      account.selected.loading = true
      account.selected.count = e
      setTimeout(() => {
        account.selected.loading = false
      })
    }

    const confirmSupply = () => {
      const finalSupply = {
        accounting: [],
        accounting_weight: [],
        accounting_individual: [],
        accounting_consumable: [],
      }
      currentSupplies.value.products.accounting.forEach((account) => {
        if(account.selected.count >= 1) {
          finalSupply.accounting.push({
            id: account.selected.id,
            target: account.selected.target,
            count: account.selected.count,
          });
        }
      })
      currentSupplies.value.products.accounting_weight.forEach((account) => {
        if(account.selected.count >= 1) {
          finalSupply.accounting_weight.push({
            id: account.selected.id,
            target: account.selected.target,
            count: account.selected.count,
          });
        }
      })
      currentSupplies.value.products.accounting_individual.forEach((account) => {
        if(account.selected.count >= 1) {
          finalSupply.accounting_individual.push({
            id: account.selected.id,
            target: account.selected.target,
            count: account.selected.count,
          });
        }
      })
      currentSupplies.value.products.accounting_consumable.forEach((account) => {
        if(account.selected.count >= 1) {
          finalSupply.accounting_consumable.push({
            id: account.selected.id,
            target: account.selected.target,
            count: account.selected.count,
          });
        }
      })
      createSupply({
        supply: finalSupply,
        target_warehouse: currentSupplies.value.target_id
      })
    }


    return {
      getSupplies,
      activeSupplies,
      currentSupplies,
      takeSupply,
      accountingWeight,
      updateSuppliesAccounting,
      confirmSupply

    }
  }
}
</script>
<template>
  <div class="supplies">
    <ActiveSupplies />
    <h3 class="supplies__title">Заказ поставки</h3>
    <div class="supplies__warehouse">
      <UButton
          v-for="supply in getSupplies"
          :class="[{'u-button--active': activeSupplies === supply.target_id}]"
          @click="takeSupply(supply.target_id)"
          :key="supply.id"
      >
        {{supply.name}}
      </UButton>
    </div>
    <div class="supplies__wrapper" v-if="activeSupplies">
      <h3 class="supplies__sub-title">Фасованные товары</h3>
      <div class="supplies__table">
        <div class="supplies__table-item supplies__table-item--head">
          Название
        </div>
        <div class="supplies__table-item supplies__table-item--head">
          Упаковка
        </div>
        <div class="supplies__table-item supplies__table-item--head">
          Остаток
        </div>
        <div class="supplies__table-item supplies__table-item--head">
          Поставка
        </div>
        <div class="supplies__table-item supplies__table-item--head">
          Максимум
        </div>
        <template v-for="account in currentSupplies.products.accounting">
          <div class="supplies__table-item" >
            {{ account.title }}
          </div>
          <div class="supplies__table-item supplies__table-item--center">
            {{ account.count }} {{account.measure_unit}}
          </div>
          <div :class="['supplies__table-item supplies__table-item--center']">
            {{account.amount}}
          </div>
          <div :class="['supplies__table-item supplies__table-item--center']">
            <Counter
                v-if="!account.selected.loading"
                v-model="account.selected.count"
                :max="account.selected.max" @change="(e) => updateSuppliesAccounting(e, account)"
                :startValue="account.selected.count"
            />
            <UButton @click="updateSuppliesAccounting(account.selected.max, account)">МАКС</UButton>
          </div>
          <div :class="['supplies__table-item supplies__table-item--center']">
            {{ account.selected.max }}
          </div>
        </template>
      </div>

      <h3 class="supplies__sub-title">Весовые товары</h3>
      <div class="supplies__table supplies__table--weight">
        <div class="supplies__table-item supplies__table-item--head">
          Название
        </div>
        <div class="supplies__table-item supplies__table-item--head">
          Остаток
        </div>
        <div class="supplies__table-item supplies__table-item--head">
          Поставка
        </div>
        <div class="supplies__table-item supplies__table-item--head">
          Максимум
        </div>
        <template v-for="account in currentSupplies.products.accounting_weight">
          <div class="supplies__table-item" >
            {{ account.title }}
          </div>
          <div :class="['supplies__table-item supplies__table-item--center']">
            {{account.count}}
          </div>
          <div :class="['supplies__table-item supplies__table-item--center']">
            <Counter
                v-if="!account.selected.loading"
                v-model="account.selected.count"
                :max="account.selected.max"
                @change="(e) => updateSuppliesAccounting(e, account)"
                :startValue="account.selected.count"
                :multiplier="100"
            />
            <UButton @click="updateSuppliesAccounting(account.selected.max, account)">МАКС</UButton>
          </div>
          <div :class="['supplies__table-item supplies__table-item--center']">
            {{ account.selected.max }}
          </div>
        </template>
      </div>

      <h3 class="supplies__sub-title">Расходники</h3>
      <div class="supplies__table supplies__table--weight">
        <div class="supplies__table-item supplies__table-item--head">
          Название
        </div>
        <div class="supplies__table-item supplies__table-item--head">
          Остаток
        </div>
        <div class="supplies__table-item supplies__table-item--head">
          Поставка
        </div>
        <div class="supplies__table-item supplies__table-item--head">
          Максимум
        </div>
        <template v-for="account in currentSupplies.products.accounting_consumable">
          <div class="supplies__table-item" >
            {{ account.title }}
          </div>
          <div :class="['supplies__table-item supplies__table-item--center']">
            {{account.count}}
          </div>
          <div :class="['supplies__table-item supplies__table-item--center']">
            <Counter
                v-if="!account.selected.loading"
                v-model="account.selected.count"
                :max="account.selected.max"
                @change="(e) => updateSuppliesAccounting(e, account)"
                :startValue="account.selected.count"
            />
            <UButton @click="updateSuppliesAccounting(account.selected.max, account)">МАКС</UButton>
          </div>
          <div :class="['supplies__table-item supplies__table-item--center']">
            {{ account.selected.max }}
          </div>
        </template>
      </div>

      <h3 class="supplies__sub-title">Коробки</h3>
      <div class="supplies__table supplies__table--weight">
        <div class="supplies__table-item supplies__table-item--head">
          Название
        </div>
        <div class="supplies__table-item supplies__table-item--head">
          Остаток
        </div>
        <div class="supplies__table-item supplies__table-item--head">
          Поставка
        </div>
        <div class="supplies__table-item supplies__table-item--head">
          Максимум
        </div>
        <template v-for="account in currentSupplies.products.accounting_individual">
          <div class="supplies__table-item" >
            {{ account.title }}
          </div>
          <div :class="['supplies__table-item supplies__table-item--center']">
            {{account.count}}
          </div>
          <div :class="['supplies__table-item supplies__table-item--center']">
            <Counter
                v-if="!account.selected.loading"
                v-model="account.selected.count"
                :max="account.selected.max"
                @change="(e) => updateSuppliesAccounting(e, account)"
                :startValue="account.selected.count"
            />
            <UButton @click="updateSuppliesAccounting(account.selected.max, account)">МАКС</UButton>
          </div>
          <div :class="['supplies__table-item supplies__table-item--center']">
            {{ account.selected.max }}
          </div>
        </template>
      </div>
      <UButton @click="confirmSupply">Оформить поставку</UButton>
    </div>
  </div>
</template>
<style src="./Supplies.scss" lang="scss" scoped/>