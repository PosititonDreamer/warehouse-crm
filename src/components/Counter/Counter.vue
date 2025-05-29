<script>
    import { ref } from 'vue';

    export default {
        props: {
            max: {
                type: Number,
                required: true
            },
            startValue: {
                type: Number, 
                default: 0
            },
          multiplier: {
              type: Number,
            default: 1
          }
        },
        setup({max, startValue, multiplier}, {emit}) {
            const count = ref(startValue)

            const checkValue = () => {
                if(count.value < 0) {
                    count.value = 0
                }

                if(count.value > max) {
                    count.value = max
                }

                emit('change', count.value)
            }

            const increment = () => {
                count.value += 1 * multiplier
                checkValue()
            }
            
            const decrement = () => {
                count.value -= 1 * multiplier
                checkValue()
            }

            return {
                count, checkValue, increment, decrement
            }
        },
    }
</script>

<template>
  <div class="counter">
    <button class="counter__button counter__button--minus" @click="decrement"></button>
    <input class="counter__input" type="number" v-model="count" @change="checkValue">
    <button class="counter__button counter__button--plus" @click="increment"></button>
  </div>
</template>

<style src="./Counter.scss" lang="scss" scoped />