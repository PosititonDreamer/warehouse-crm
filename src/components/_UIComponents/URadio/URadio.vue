<script>
    import { ref } from 'vue';

    export default {
        props: {
            active: {
                type: Boolean,
                default: false
            },
            view: {
                type: String,
                default: 'input'
            },
            type: {
                type: String,
                default: 'radio' 
            },
            value: {
                type: String,
                required: true
            },
            name: {
                type: String,
                required: true
            },
            checked: {
                type: Boolean,
                default: false
            }
        },
        setup(_, {emit}) {

            const changeValue = (target) => {
                emit('update:modelValue', target.value)
                emit('changeView', target.checked)
            }

            return {
                changeValue
            }
        },
    }
</script>

<template>
  <label class="u-radio">
    <input class="u-radio__input" :type="type" :value="value" :name="name" @change="changeValue($event.target)" :checked="checked">
    <span class="u-radio__marker"></span>
    <slot></slot>
  </label>
</template>

<style src="./URadio.scss" lang="scss" scoped />