<script>
import {computed} from "vue";

export default {
  name: "Graphic",
  props: {
    items: {
      type: [Array, Object],
      required: true
    },
    products: {
      type: Array,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    colors: {
      type: [Object, Array],
      required: true
    },
    hides: {
      type: Array,
      required: true
    }
  },
  setup({items, products, colors, title}) {
    const finalArray = computed(() => {
      const final_items = [
        {
          title: 'Заказы',
          count: items.orders_count,
          color: '#15658a',
        }
      ];
      products.forEach((product) => {
        final_items.push({
          title: product,
          count: items[product] ? items[product] : 0,
          color: colors[product],
        });
      })
      return final_items;
    })

    const finalTitle = computed(() => {
      if(title === 'Среднее за весь диапазон') {
        return title
      }
      if(title.indexOf('Среднее за') > -1) {
        const splitTitle = title.split(' ')
        let text = [
            splitTitle[0],
            splitTitle[1]
        ];

        text = [...text, splitTitle[2].split('-').reverse().join('.')]
        text.push('-')
        text = [...text, splitTitle[4].split('-').reverse().join('.')]
        return text.join(' ');
      }
      return title.split('-').reverse().join('.')
    })

    const maxSize = computed(() => {
      if(finalArray.value.length) {
        return finalArray.value.reduce((max, obj) => obj.count > max.count? obj : max).count;
      }

      return 0
    })

    return {finalArray, finalTitle, maxSize};
  }
}
</script>
<template>
  <div class="graphic">
    <h2 class="graphic__title">{{finalTitle}}</h2>
    <div class="graphic__list">
      <template v-for="item in finalArray">
        <div v-if="products.find(product => product === item.title) || item.title === 'Заказы'" class="graphic__item" :style="`--height: ${100 / maxSize * item.count}; --primary-color: ${item.color}`">
          <p class="graphic__count">{{ item.count }}</p>
          <div class="graphic__line"></div>
          <p class="graphic__date"></p>
        </div>
      </template>
    </div>
    <ul class="graphic__colors">
      <li>Заказы <span :style="`--color-primary: `"></span></li>
    </ul>
  </div>
</template>
<style src="./Graphic.scss" lang="scss" scoped/>