import AFHConvert from 'ascii-fullwidth-halfwidth-convert'

import RenderFormItem from './render-form-item'
import RenderFormGroup from './render-form-group'

import { Form } from 'element-ui'

const converter = new AFHConvert();

export default {
  render (h) {
    return h(
      'el-form', {
        props: Object.assign({}, this._props, {
          model: this.value // 用于校验
        }),
        ref: 'elForm'
      },
      this.content
        .map((item, index) => {
          // handle default value
          if (item.$id && this.value[item.$id] === undefined && item.$default !== undefined) {
            this.updateValue({ id: item.$id, value: item.$default })
          }
          const data = {
            props: {
              key: index,
              data: item,
              value: this.value,
              itemValue: this.value[item.$id],
              disabled: this.disabled
            },
            on: {
              updateValue: this.updateValue
            }
          }
          if (item.$type === 'group') return h('render-form-group', data)
          else return h('render-form-item', data)
        })
        .concat(this.$slots.default)
    )
  },
  components: {
    RenderFormItem,
    RenderFormGroup
  },
  mounted () {
    this.$nextTick(() => {
      Object.keys(Form.methods).forEach((item) => {
        this[item] = this.$refs.elForm[item]
      })
    })
  },
  props: Object.assign({}, Form.props, {
    content: {
      type: Array,
      required: true
    },
    // 禁用所有表单
    disabled: {
      type: Boolean,
      default: false
    },
  }),
  data () {
    return {
      value: {}, // 表单数据对象
      initialValue: null
    }
  },
  methods: {
    /**
     * 更新表单数据
     * @param  {String} options.id 表单ID
     * @param  {All} options.value 表单数据
     */
    updateValue ({ id, value }) {
      this.value = Object.assign({}, this.value, {
        [id]: this.convertHalfWidth(value)
      })

      if (this.initialValue !== null) {
        this.checkifChanged(id)
      }
    },
    checkifChanged(id) {
      this.$emit('hasChanges', this.initialValue[id] !== this.value[id]);
    },
    setInitialValue (initValue) {
      this.initialValue = initValue;
    },
    convertHalfWidth (str) {
      if (typeof str === 'string') {
        return converter.toHalfWidth(str)
      }

      return str
    },
    // 对外提供获取表单数据的函数
    getFormValue () {
      return this.value
    }
  }
}
