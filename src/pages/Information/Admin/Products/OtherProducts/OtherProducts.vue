<script>
import {products} from "@/store/products.js";
import UButton from "@/components/_UIComponents/UButton/UButton.vue";
import UInput from "@/components/_UIComponents/UInput/UInput.vue";
import {ref} from "vue";

export default {
  name: "OtherProducts",
  components: {UInput, UButton},
  setup() {
    const {getOtherProducts, getProducts, updateOtherProducts} = products()
    const updateProduct = ref(null)

    const confirmUpdate = async () => {
      if(!!updateProduct.value?.count && !!updateProduct.value?.product_id ) {
        await updateOtherProducts(updateProduct.value)
        updateProduct.value = null
        return
      }
      alert("Заполни все поля")
    }

    return {
      getProducts, getOtherProducts, updateProduct, confirmUpdate
    }
  }
}
</script>

<template>
  <div class="other-products">
    <h2 class="other-products__title">Продукты с неправильным названием</h2>
    <div class="other-products__table" v-if="getOtherProducts.length">
      <div class="other-products__table-item other-products__table-item--head">
        Название
      </div>
      <div class="other-products__table-item other-products__table-item--head">
        Продукт
      </div>
      <div class="other-products__table-item other-products__table-item--head">
        Упаковка
      </div>
      <div class="other-products__table-item other-products__table-item--head">
        Действие
      </div>
      <template v-for="product in getOtherProducts" :key="`other-product-${product.id}`">
        <template v-if="updateProduct && product.id === updateProduct.id">
          <div class="other-products__table-item">
            {{ product.title }}
          </div>
          <div class="other-products__table-item">
            <UInput name="Упаковка" v-model="updateProduct.product_id" :start-value="updateProduct.product_id"  view="select">
              <option value=""></option>
              <option v-for="productItem in getProducts" :value="productItem.id">{{productItem.title}}</option>
            </UInput>
          </div>
          <div class="other-products__table-item">
            <UInput name="Упаковка" v-model="updateProduct.count" :start-value="updateProduct.count" type="number" />
          </div>
          <div class="other-products__table-item">
            <U-Button modifier="yellow" @click="confirmUpdate">Редактировать</U-Button>
            <U-Button modifier="red" @click="updateProduct = null">Отменить</U-Button>
          </div>
        </template>
        <template v-else>
          <div class="other-products__table-item">
            {{ product.title }}
          </div>
          <div class="other-products__table-item">
            {{ getProducts.find(productitem => productitem.id === product.product_id ).title }}
          </div>
          <div class="other-products__table-item">
            {{ product.count }}
          </div>
          <div class="other-products__table-item">
            <U-Button modifier="yellow" @click="updateProduct = product">Редактировать</U-Button>
          </div>
        </template>
      </template>
    </div>
    <h2 v-else class="other-products__title">Еще не приходили кривые названия</h2>
  </div>
</template>

<style lang="scss" src="./OtherProducts.scss" scoped />
