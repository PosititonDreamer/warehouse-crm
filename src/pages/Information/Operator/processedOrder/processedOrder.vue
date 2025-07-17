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
    const ordersUpdate = ref({});

    watch([getProcessedOrders], () => {
      if(getProcessedOrders) {
        Object.values(getProcessedOrders.value['Почта России']).forEach(order => {
          ordersUpdate.value[order.id] = ({
            id: order.id,
            type: order.delivery,
            track: ''
          })
        })
        Object.values(getProcessedOrders.value.Boxberry).forEach(order => {
          ordersUpdate.value[order.id] = ({
            id: order.id,
            type: order.delivery,
            delivery: '',
            address: '',
            track: ''
          })
        })
      }
    })

    const confirmUpdate = () => {
      let check = true

      Object.values(ordersUpdate.value).forEach((order) => {
        if(order.type === 'Boxberry') {
          if(!order.address.trim().length || !order.track.trim().length || !order.delivery.trim().length) {
            check = false
          }
        } else {
          if(!order.track.trim().length) {
            check = false
          }
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
  <form class="processed-order" @submit.prevent="confirmUpdate">
    <template v-if="Object.values(getProcessedOrders['Почта России']).length || Object.values(getProcessedOrders.Boxberry).length">
      <h2 class="processed-order__title">Обработка заказов</h2>
      <div class="processed-order__list" v-if="Object.values(getProcessedOrders['Почта России']).length + Object.values(getProcessedOrders.Boxberry).length === Object.values(ordersUpdate).length ">
        <div class="processed-order__item processed-order__item--mail" v-for="order in getProcessedOrders['Почта России']">
          <h3 class="processed-order__sub-title">Почта России</h3>
          <p class="processed-order__name">
            <span @click="copyText(order.number)">{{order.number}}</span>
            <span @click="copyText(order.name)">{{ order.name }}</span>
          </p>
          <UInput name="Трек-номер" v-model="ordersUpdate[order.id].track" />
        </div>
        <div class="processed-order__item" v-for="order in getProcessedOrders.Boxberry">
          <h3 class="processed-order__sub-title">BoxBerry</h3>
          <p class="processed-order__name">
            <span @click="copyText(order.number)">{{order.number}}</span>
            <span @click="copyText(order.name)">{{ order.name }}</span>
          </p>
          <UInput name="Трек-номер" v-model="ordersUpdate[order.id].track" />
          <UInput name="Адрес" v-model="ordersUpdate[order.id].address" />
          <UInput name="Служба доставки" v-model="ordersUpdate[order.id].delivery" view="select">
            <option value="CDEK">CDEK</option>
            <option value="Почта России">Почта России</option>
          </UInput>
          <p class="processed-order__text" v-html="order.message" />
        </div>
      </div>
      <UButton class="processed-order__submit" type="submit">Сохранить изменения</UButton>
    </template>

    <h2 v-else class="processed-order__title">В данный момент нет заказов</h2>
  </form>
</template>

<style lang="scss" src="./processedOrder.scss" scoped />