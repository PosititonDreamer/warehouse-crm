<script>
import UButton from '@/components/_UIComponents/UButton/UButton.vue';
import UInput from '../../../../components/_UIComponents/UInput/UInput.vue';
import URadio from '../../../../components/_UIComponents/URadio/URadio.vue';
import {ref, computed, watch} from 'vue';
import {products} from '../../../../store/products';
import {warehouses} from '../../../../store/warehouses';
import {accounting} from '../../../../store/accounting';
import Weight from './Weight/Weight.vue';
import {weight} from '../../../../store/weight';
import Consumable from './Consumable/Consumable.vue';
import {authorization} from '../../../../store/authorization';
import Individual from './Individual/Individual.vue';
import {individual} from '../../../../store/individual';
import {consumable} from '../../../../store/consumable';

export default {
  components: {
    UButton, UInput, URadio, Weight, Consumable, Individual
  },
  beforeCreate() {
    const {findProducts} = products()
    const {findWarehouses} = warehouses()

    findProducts()
    findWarehouses()
  },
  setup() {
    const {getProducts} = products()
    const {getWarehouses} = warehouses()
    const {
      getAccounting,
      findAccounting,
      newAccounting,
      updateAccounting,
      deleteAccounting,
      updateAmountAccounting
    } = accounting()
    const {findWeight, getWeight} = weight()
    const {findIndividual} = individual()
    const {findConsumable} = consumable()
    const {changeWarehouse} = authorization()
    const page = ref(null)
    const product = ref("");
    const measureUnit = ref("");
    const article = ref("");
    const count = ref(0);
    const amount = ref(0);
    const typeLaterSave = ref("close")
    const openModal = ref(false)
    const pageModal = ref("add")
    const id = ref(0)
    const weightId = ref(0)
    const accountWeight = ref(false)

    const takedProduct = ref(false)
    const takedMeasureUnit = ref(false)
    const takedCount = ref(false)
    const takedAmount = ref(false)

    const loading = ref(false)

    const getPage = computed(() => page.value)

    const getActiveWarehouse = computed(() => {
      const currentWarehouse = getWarehouses.value.find(warehouse => warehouse.id === page.value)
      return currentWarehouse
    })

    const getProduct = computed(() => product.value)
    const getMeasureUnit = computed(() => measureUnit.value)
    const getArticle = computed(() => article.value)
    const getCount = computed(() => count.value)
    const getAmount = computed(() => amount.value)
    const getLoading = computed(() => loading.value)

    watch(getWarehouses, () => {
      if (page.value === null && getWarehouses.value.length) {
        changePage(getWarehouses.value[0].id)
      }
    })

    const errorProduct = computed(() => {
      if (!product.value.trim() && takedProduct.value) {
        return "Обязательное поле для заполнения"
      }
      return ""
    })

    const errorMeasureUnit = computed(() => {
      if (!measureUnit.value.trim() && takedMeasureUnit.value) {
        return "Обязательное поле для заполнения"
      }
      return ""
    })

    const errorCount = computed(() => {
      if (count.value < 1 && takedCount.value) {
        return "Должно быть больше 0"
      }
      return ""
    })

    const errorAmount = computed(() => {
      if (amount.value < 0 && takedAmount.value) {
        return "Не может быть меньше 0"
      }
      return ""
    })


    const closeModal = () => {
      openModal.value = false
      pageModal.value = "add"

      product.value = ""
      measureUnit.value = ""
      article.value = ""
      count.value = 0
      amount.value = 0
      typeLaterSave.value = "close"
      id.value = 0

      takedProduct.value = false
      takedMeasureUnit.value = false
      takedCount.value = false
      takedAmount.value = false
      loading.value = false
      weight.value = false
    }

    const addNewAccount = () => {
      product.value = ""
      measureUnit.value = ""
      article.value = ""
      count.value = 0
      amount.value = 0
      takedProduct.value = false
      takedMeasureUnit.value = false
      takedCount.value = false
      takedAmount.value = false
      setTimeout(() => {
        loading.value = false
      })
    }

    const addCurrentAccount = () => {
      article.value = ""
      count.value = 0
      amount.value = 0

      takedProduct.value = false
      takedMeasureUnit.value = false
      takedCount.value = false
      takedAmount.value = false

      setTimeout(() => {
        loading.value = false
      })
    }

    const editAccounting = (account) => {
      openModal.value = true
      pageModal.value = "edit"

      product.value = account.product_id
      measureUnit.value = account.measure_unit
      article.value = account.article
      count.value = account.count
      amount.value = account.amount
      typeLaterSave.value = "close"
      id.value = account.id

      takedProduct.value = false
      takedMeasureUnit.value = false
      takedCount.value = false
      takedAmount.value = false
      loading.value = false
    }

    const saveAccounting = async () => {
      takedProduct.value = true
      takedMeasureUnit.value = true
      takedCount.value = true
      takedAmount.value = true

      const checkProduct = !errorProduct.length && product.value.trim().length
      const checkMeasureUnit = !errorMeasureUnit.length && measureUnit.value.trim().length
      const checkCount = !errorCount.length && count.value > 0
      const checkAmount = !errorAmount.length && amount.value > -1

      if (checkProduct && checkMeasureUnit && checkCount && checkAmount) {
        const account = {
          product_id: product.value,
          warehouse_id: getActiveWarehouse.value.id,
          measure_unit: measureUnit.value,
          article: article.value,
          count: count.value,
          amount: amount.value,
          weight_id: weightId.value
        }
        if (pageModal.value === "add") {
          loading.value = true
          if (typeLaterSave.value === 'close') {
            await newAccounting(account, closeModal)
          }
          if (typeLaterSave.value === 'addNew') {
            await newAccounting(account, addNewAccount)
          }
          if (typeLaterSave.value === 'addNewCurrent') {
            await newAccounting(account, addCurrentAccount)
          }
          return
        }

        if (pageModal.value === 'editAmount') {
          updateAmountAccounting({...account, id: id.value}, closeModal)
          return
        }
        await updateAccounting({...account, id: id.value, weight_id: weightId.value}, closeModal)
      }
    }

    const removeAccounting = ({title, id, warehouse_id}) => {
      if (confirm(`Удалить товар ${title}?`)) {
        deleteAccounting(id, warehouse_id)
      }
    }

    const changeAmount = (account) => {
      openModal.value = true
      pageModal.value = "editAmount"
      product.value = account.product_id
      measureUnit.value = account.measure_unit
      article.value = account.article
      count.value = account.count
      amount.value = account.amount
      typeLaterSave.value = "close"
      id.value = account.id

      takedProduct.value = false
      takedMeasureUnit.value = false
      takedCount.value = false
      takedAmount.value = false
      loading.value = false
    }

    const changeProduct = () => {
      takedProduct.value = true
      const findWeight = getWeight.value.find(weight => weight.product_id === product.value)

      if (findWeight) {
        accountWeight.value = true
        weightId.value = findWeight.id
        return

      }
      accountWeight.value = false
      weightId.value = 0
    }

    const changePage = (id) => {
      loading.value = this
      page.value = id
      changeWarehouse(id)
      findWeight()
      findAccounting()
      findIndividual()
      findConsumable()
    }

    return {
      page,
      getPage,
      openModal,
      pageModal,
      closeModal,
      getProducts,
      getWarehouses,
      getActiveWarehouse,
      product,
      measureUnit,
      article,
      count,
      amount,
      typeLaterSave,
      takedProduct,
      takedMeasureUnit,
      takedCount,
      takedAmount,
      getProduct,
      getMeasureUnit,
      getArticle,
      getCount,
      getAmount,
      errorProduct,
      errorMeasureUnit,
      errorCount,
      errorAmount,
      editAccounting,
      saveAccounting,
      removeAccounting,
      changeAmount,
      getLoading,
      accountWeight,
      getWeight,
      changeProduct,
      changePage,
      getAccounting
    }

  },
}
</script>

<template>
  <div class="accounting">
    <h2 class="accounting__title accounting__title--head">Зарплата</h2>
    <div class="accounting__header">
      <u-button v-for="warehouse in getWarehouses" :class="[{'u-button--active': getPage === warehouse.id}]"
                @click="changePage(warehouse.id)">{{ warehouse.title }}
      </u-button>
    </div>
    <div class="accounting__content" v-if="getActiveWarehouse">
      <h2 class="accounting__title">Товары из: {{ getActiveWarehouse.title }}</h2>
      <U-Button class="accounting__button" @click="openModal = true">Добавить Товар</U-Button>
      <form @submit.prevent="saveAccounting" class="accounting__form" @reset="closeModal" v-if="openModal">
        <div class="accounting__content-form" v-if="!getLoading">
          <U-Button class="accounting__close" type="reset" modifier="red"></U-Button>
          <h3 class="accounting__sub-title">{{
              pageModal === 'add' ? 'Добавление товара' : 'Редактирование товара'
            }}</h3>
          <U-Input :error="errorProduct" @change="changeProduct" class="accounting__input" name="Выберите продукт"
                   view="select" v-model="product" :start-value="getProduct" key="product-name"
                   :disabled="pageModal === 'editAmount'">
            <option value=""></option>
            <option v-for="product in getProducts" :value="product.id">{{ product.title }}</option>
          </U-Input>
          <U-Input :error="errorCount" @change="takedCount = true" class="accounting__input"
                   name="Введите количество в упаковке" type="number" v-model="count" :start-value="getCount.toString()"
                   key="product-count" :disabled="pageModal === 'editAmount'"/>
          <U-Input :error="errorMeasureUnit" @change="takedMeasureUnit = true" class="accounting__input"
                   name="Введите единицу измерения" v-model="measureUnit" :start-value="getMeasureUnit"
                   key="product-measure" :disabled="pageModal === 'editAmount'"/>
          <U-Input v-if="getActiveWarehouse.rule === 'commodity'" class="accounting__input" name="Введите артикул"
                   v-model="article" :start-value="getArticle" key="product-article"
                   :disabled="pageModal === 'editAmount'"/>
          <U-Input :error="errorAmount" @change="takedAmount = true" class="accounting__input" name="Введите остаток"
                   type="number" v-model="amount" :start-value="getAmount.toString()" key="product-amount"
                   v-if="!accountWeight"/>
          <template v-if="pageModal === 'add'">
            <p class="accounting__text">Выберите действие после добавления: </p>
            <u-radio class="accounting__radio" value="close" name="typeLaterSave" v-model="typeLaterSave"
                     :checked="typeLaterSave === 'close'">Закрыть
            </u-radio>
            <u-radio class="accounting__radio" value="addNew" name="typeLaterSave" v-model="typeLaterSave"
                     :checked="typeLaterSave === 'addNew'">Добавить другой товар
            </u-radio>
            <u-radio class="accounting__radio accounting__radio--last" value="addNewCurrent" name="typeLaterSave"
                     v-model="typeLaterSave" :checked="typeLaterSave === 'addNewCurrent'">Добавить такой же товар
            </u-radio>
          </template>
          <U-Button class="accounting__button" type="submit">
            {{ pageModal === 'add' ? 'Добавить товар' : 'Редактировать товар' }}
          </U-Button>
        </div>
        <h3 class="accounting__sub-title" v-else>Идет загрузка</h3>
      </form>
      <div :class="['accounting__table', {'accounting__table--commodity': getActiveWarehouse.rule === 'commodity'}]"
           v-if="getAccounting.length">
        <div class="accounting__table-item accounting__table-item--head">
          Название
        </div>
        <div class="accounting__table-item accounting__table-item--head">
          Упаковка
        </div>
        <div class="accounting__table-item accounting__table-item--head" v-if="getActiveWarehouse.rule === 'commodity'">
          Остаток
        </div>
        <div class="accounting__table-item accounting__table-item--head">
          Артикул
        </div>
        <div class="accounting__table-item accounting__table-item--head">
          Действия
        </div>
        <template v-for="account in getAccounting">
          <div class="accounting__table-item">
            {{ account.title }}
          </div>
          <div class="accounting__table-item">
            {{ account.count }} {{ account.measure_unit }}
          </div>
          <div
              :class="['accounting__table-item', 'accounting__table-item--amount', {'accounting__table-item--few': !account.weighted && account.amount <= 50 && account.amount > 10, 'accounting__table-item--tiny': !account.weighted && account.amount <= 10  }]">
            {{ account.weighted ? "вес" : account.amount }}
          </div>
          <div class="accounting__table-item" v-if="getActiveWarehouse.rule === 'commodity'">
            {{ account.article }}
          </div>
          <div class="accounting__table-item">
            <U-Button :disabled="!!account.weighted" @click="changeAmount(account)">Поменять остаток</U-Button>
            <U-Button modifier="yellow" @click="editAccounting(account)">Редактировать</U-Button>
            <U-Button modifier="red" @click="removeAccounting(account)">Удалить</U-Button>
          </div>
        </template>
      </div>
      <h2 v-else class="accounting__title">Добавь товар, а то кого отслеживать собрался?</h2>
    </div>
    <Weight v-if="getActiveWarehouse" :warehouse="getActiveWarehouse" :products="getProducts"></Weight>
    <h2 class="accounting__title">Расходники для товаров из: {{ getActiveWarehouse?.title }}</h2>
    <Consumable v-if="getActiveWarehouse" :products="getAccounting"/>
    <Individual v-if="getActiveWarehouse"/>
  </div>
</template>

<style src="./Accounting.scss" lang="scss" scoped/>