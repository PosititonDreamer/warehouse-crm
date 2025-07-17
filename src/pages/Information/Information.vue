<script>
    import { authorization } from '../../store/authorization';
    import UButton from '@/components/_UIComponents/UButton/UButton.vue';
    import Products from './admin/Products/Products.vue';
    import { ref, computed } from 'vue';
    import Admin from './Admin/Admin.vue';
    import Warehouse from './Warehouse/Warehouse.vue';
    import Operator from './Operator/Operator.vue';
    import Loader from "@/components/_UIComponents/Loader/Loader.vue";
    import {checkOrder} from "@/store/checkOrder.js";
    export default {
        components: {
          Loader,
            UButton, 
            Products,
            Admin,
            Warehouse,
            Operator
        },
        created() {
          const {checkOrderProcessed, checkTildaOrder, checkOtherOrderProcessed} = checkOrder()
          checkOrderProcessed()
          checkTildaOrder()
          checkOtherOrderProcessed()
          setInterval(() => {
            checkOrderProcessed()
            checkTildaOrder()
            checkOtherOrderProcessed()
          }, 300000)
        },
        setup() {
            const { getUser, logout } = authorization()
            const {getLoading} = checkOrder()
            const page = ref("");

            const getPage = computed(() => {
                return page.value
            })

            return {
                getUser, logout, page, getPage, getLoading
            }
        },
    }
</script>

<template>
  <Loader v-if="getLoading" />
    <div class="information" v-else>
        <div class="information__header">
            <div class="information__user">
                <p class="information__name">{{ getUser?.name }}</p>
                <U-Button  @click="logout">Выйти</U-Button>
            </div>
        </div>
        <div class="information__content">
            <Admin v-if="getUser?.rule === 'super'"></Admin>
            <Operator v-else-if="getUser?.rule === 'operator'"></Operator>
            <Warehouse v-else-if="getUser?.rule === 'warehouse'"></Warehouse>
        </div>
    </div>
</template>

<style src="./Information.scss" lang="scss" scoped />