<script>
import {kits} from "@/store/kits.js";
import {ref} from "vue";
import UInput from "@/components/_UIComponents/UInput/UInput.vue";
import UButton from "@/components/_UIComponents/UButton/UButton.vue";

export default {
  components: {UButton, UInput},
  created() {
    const {findKits} = kits()

    findKits()
  },
  setup() {
    const { getKits, getProducts, getAccounting, createNewKit, changeKit, removeKit } = kits()
    const newKit = ref()
    const updateKit = ref(null)

    const resetKit = () => {
      newKit.value = {
        number: 0,
        title: '',
        accounting: [
          {
            id: Date.now(),
            product_id: 0,
            accounting_id: "",
            count: 0
          }
        ]
      }
    }
    resetKit()

    const addKitAccount = (kit) => {
      kit.accounting.push({
        id: Date.now(),
        product_id: 0,
        accounting_id: "",
        count: 0
      })
    }

    const deleteAccount = (kit, id) => {
      kit.accounting = kit.accounting.filter(account => account.id !== id)
    }

    const createKit = async () => {
      let create = true

      if(!newKit.value.title || !newKit.value.number) {
        create = false
      }

      newKit.value.accounting.forEach((account) => {
        if(!account.accounting_id || !account.count) {
          create = false
        }
      })

      if(create) {
        const res = await createNewKit(newKit.value)
        if(res) {
          alert('Набор успешно создан')
          resetKit()
        }
      } else {
        alert("Заполни все данные")
      }
    }

    const confirmUpdate = async () => {
      let update = true

      if(!updateKit.value.title || !updateKit.value.number) {
        update = false
      }

      updateKit.value.accounting.forEach((account) => {
        if(!account.accounting_id || !account.count) {
          update = false
        }
      })

      if(update) {
        const res = await changeKit(updateKit.value)
        if(res) {
          alert('Набор успешно отредактирован')
          updateKit.value = null
        }
      } else {
        alert("Заполни все данные")
      }
    }

    const deleteKit = async (id) => {
      if(confirm("Удалить набор?")){
        const res = await removeKit(id)
        if(res) {
          alert("Набор успешно удален");
        }
      }
    }

    return {
      getKits,
      getProducts,
      getAccounting,
      newKit,
      updateKit,
      createKit,
      deleteKit,
      addKitAccount,
      deleteAccount,
      confirmUpdate
    }
  }
}

</script>
<template>
  <div class="kits">
    <form class="kits__form" action="" @submit.prevent="createKit">
      <h2 class="kits__title">Создать новый набор</h2>
      <div class="kits__header">
        <UInput class="kits__input" name="Номер" v-model="newKit.number" :start-value="newKit.number" type="number" />
        <UInput class="kits__input" name="Название" v-model="newKit.title" :start-value="newKit.title" />
      </div>
      <div class="kits__list">
        <div class="kits__item" v-for="kitProduct in newKit.accounting" :key="`kit-account-${kitProduct.id}`">
          <UInput class="kits__input" name="Продукт" view="select" v-model="kitProduct.product_id" :start-value="kitProduct.product_id">
            <option value=""></option>
            <option v-for="product in getProducts" :value="product.id">{{product.title}}</option>
          </UInput>
          <UInput class="kits__input" name="Фасовка" view="select" v-model="kitProduct.accounting_id" :start-value="kitProduct.accounting_id">
            <option value=""></option>
            <option v-for="view in getAccounting.filter(account => account.product_id === kitProduct.product_id)" :value="view.id">{{view.count}} {{view.measure_unit}}</option>
          </UInput>
          <UInput type="number" class="kits__input" name="Количество" v-model="kitProduct.count" :start-value="kitProduct.count" />
          <UButton class="kits__delete-account" modifier="red" type="button" v-if="newKit.accounting.length > 1" @click="deleteAccount(newKit, kitProduct.id)">Удалить</UButton>
        </div>
        <UButton class="kits__add-account" type="button" @click="addKitAccount(newKit)">Добавить еще один товар</UButton>
      </div>
      <UButton type="submit">Создать набор</UButton>
    </form>

    <h2 class="kits__title">Список наборов</h2>
    <div class="kits__list-items">
      <div :class="['kit', {'kit--update': kit.id === updateKit?.id}]" v-for="kit in getKits" :key="`kit-${kit.id}`">
        <template v-if="updateKit && updateKit.id === kit.id">
          <h2 class="title">Изменение набора</h2>
          <div class="kit__header">
            <UInput class="kit__input" name="Номер" v-model="updateKit.number" :start-value="updateKit.number" type="number" />
            <UInput class="kit__input" name="Название" v-model="updateKit.title" :start-value="updateKit.title" />
          </div>
          <div class="kit__list">
            <p class="kit__sub-title">Список товаров:</p>
            <div class="kit__item" v-for="kitProduct in updateKit.accounting" :key="`kit-account-${kitProduct.id}`">
              <UInput class="kit__input" name="Продукт" view="select" v-model="kitProduct.product_id" :start-value="kitProduct.product_id">
                <option value=""></option>
                <option v-for="product in getProducts" :value="product.id">{{product.title}}</option>
              </UInput>
              <UInput class="kit__input" name="Фасовка" view="select" v-model="kitProduct.accounting_id" :start-value="kitProduct.accounting_id">
                <option value=""></option>
                <option v-for="view in getAccounting.filter(account => account.product_id === kitProduct.product_id)" :value="view.id">{{view.count}} {{view.measure_unit}}</option>
              </UInput>
              <UInput type="number" class="kit__input" name="Количество" v-model="kitProduct.count" :start-value="kitProduct.count" />
              <UButton class="kit__delete-account" modifier="red" type="button" v-if="updateKit.accounting.length > 1" @click="deleteAccount(updateKit, kitProduct.id)">Удалить</UButton>
            </div>
            <UButton class="kit__add-account" @click="addKitAccount(updateKit)">Добавить еще один товар</UButton>
          </div>
          <div class="kit__actions">
            <UButton @click="confirmUpdate" class="kit__delete-kit" >Сохранить изменения</UButton>
            <UButton @click="updateKit = null" class="kit__delete-kit" modifier="red" >Отменить</UButton>
          </div>
        </template>
        <template v-else>
          <div class="kit__header">
            <p class="kit__number"><b>Номер набора:</b> {{kit.number}}</p>
            <p class="kit__title"><b>Название:</b> {{kit.title}}</p>
          </div>
          <div class="kit__list">
            <p class="kit__sub-title">Список товаров:</p>
            <div class="kit__item" v-for="account in kit.accounting" :key="`kit-${kit.id}-account-${account.id}`">
              <p class="kit__product">
                {{getProducts.find(product => product.id === account.product_id)?.title}}&nbsp;{{getAccounting.find(accountItem => accountItem.id === account.accounting_id)?.count}}&nbsp;{{getAccounting.find(accountItem => accountItem.id === account.accounting_id)?.measure_unit}}&nbsp;* &nbsp;{{account.count}}
              </p>
            </div>
          </div>
          <div class="kit__actions">
            <UButton @click="updateKit = kit" class="kit__delete-kit" modifier="yellow" type="button">Изменить набор</UButton>
            <UButton @click="deleteKit(kit.id)" class="kit__delete-kit" modifier="red" type="button">Удалить набор</UButton>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>


<style lang="scss" src="./Kits.scss" scoped/>