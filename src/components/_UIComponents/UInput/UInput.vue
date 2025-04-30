<script>
    import { ref, watch } from 'vue';

    export default {
        props: {
            disabled: {
                type: Boolean,
                default: false
            },
            error: {
                type: String,
                default: ""
            },
            name: {
                type: String,
                required: true
            },
            max: {
                type: [Number, null], 
                default: null
            },
            startValue: {
                type: [String, Number],
                default: ""
            },
            view: {
                type: String,
                default: 'input'
            }, 
            type: {
                type: String,
                default: 'text'
            },
            rows: {
                type: Number,
                default: 4,
            }
        },
        setup({max, startValue, type}, {emit}) {
            const value = ref(startValue)

            const checkValue = (inputValue) => {
                if(type === 'number' && max) {
                    if(value.value > max) {
                        value.value = max
                    }
                } else {
                    if(max) {
                        value.value = inputValue.slice(0,20);
                    }
                }
                emit('update:modelValue', value.value)
            }

            return {
                value, checkValue
            }
        },
    }
</script>

<template>
  <label :class="['u-input', {'u-input--disabled': disabled}]">
    <span class="u-input__name">{{ name }}</span>
    <span class="u-input__error" v-if="error">{{ error }}</span>
    
    <input :type="type" class="u-input__input" v-model="value" :disabled @input="checkValue($event.target.value)" @blur="$emit('blur')" v-if="view === 'input'"/>
    <textarea class="u-input__input" v-model="value" :disabled @input="checkValue($event.target.value)" @blur="$emit('blur')" :rows="rows" v-else-if="view === 'textarea'"></textarea>
    <select v-else class="u-input__input" v-model="value" :disabled @change="checkValue($event.target.value)" @blur="$emit('blur')" >
        <slot></slot>
    </select>
  </label>
</template>

<style src="./UInput.scss" lang="scss" scoped />