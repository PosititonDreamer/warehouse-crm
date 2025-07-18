<script>
import {processedOrders} from "@/store/operator/proccessedOrders.js";
import {ref, watch} from "vue";
import UInput from "@/components/_UIComponents/UInput/UInput.vue";
import UButton from "@/components/_UIComponents/UButton/UButton.vue";

export default {
  components: {UButton, UInput},
  created () {
    const {findProcessedOrders} = processedOrders()
    findProcessedOrders()
  },
  setup() {
    const {getProcessedOrders, updateProcessedOrders} = processedOrders()
    const ordersUpdate = ref([]);

    watch([getProcessedOrders], () => {
      getProcessedOrders.value.forEach(order => {
        ordersUpdate.value.push({
          id: order.id,
          type: order.delivery,
          track: ''
        })
      })
    })

    const confirmUpdate = () => {
      let check = true

      Object.values(ordersUpdate.value).forEach((order) => {
        if(!order.track.trim().length) {
          check = false
        }
      })

      if(!check) {
        alert("Заполни все данные")
        return
      }
      updateProcessedOrders(Object.values(ordersUpdate.value))
    }

    const copyText = (text) => {
      navigator.clipboard.writeText(text)
    }

    return {
      getProcessedOrders,
      ordersUpdate,
      confirmUpdate,
      copyText
    }
  }
}
</script>

<template>
  <form class="processed-order" @submit.prevent="confirmUpdate" v-if="getProcessedOrders">
    <template v-if="getProcessedOrders.length">
      <h2 class="processed-order__title">Обработка заказов</h2>
      <div class="processed-order__list" v-if="getProcessedOrders.length === ordersUpdate.length ">
        <div class="processed-order__item" v-for="order in getProcessedOrders">
          <h3 class="processed-order__sub-title">Почта России</h3>
          <p class="processed-order__name">
            <span @click="copyText(order.number)">{{order.number}}</span>
            <span @click="copyText(order.name)">{{ order.name }}</span>
          </p>
          <UInput name="Трек-номер" v-model="ordersUpdate.find(updateOrder => updateOrder.id === order.id).track" />
        </div>
      </div>
      <UButton class="processed-order__submit" type="submit">Сохранить изменения</UButton>
    </template>

    <h2 v-else class="processed-order__title">В данный момент нет заказов</h2>
  </form>
</template>

<style lang="scss" src="./processedOrder.scss" scoped />