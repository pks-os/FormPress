import React, { Component } from 'react'

import EditableLabel from '../common/EditableLabel'
import ElementContainer from '../common/ElementContainer'

export default class Checkbox extends Component {
  static weight = 3

  static defaultConfig = {
    id: 0,
    type: 'Checkbox',
    label: 'Label'
  }

  static configurableSettings = {
    required: {
      default: false,
      formProps: {
        type: 'Checkbox',
        label: 'Make this field required?'
      }
    }
  }

  render() {
    const { config, mode } = this.props
    const inputProps = {}

    if (typeof config.value !== 'undefined') {
      inputProps.checked = (config.value === true)
    }

    if (typeof this.props.onChange !== 'undefined') {
      inputProps.onChange = this.props.onChange
    }

    return (
      <ElementContainer type={ config.type } { ...this.props }>
        <EditableLabel
          className='fl label'
          mode={ mode }
          labelKey={ config.id }
          handleLabelChange={ this.props.handleLabelChange }
          value={ config.label }
          required={ config.required }
        />
        <div className='fl input'>
          <input
            type='checkbox'
            id={ `q_${config.id}` }
            name={ `q_${config.id}` }
            { ...inputProps }
          />
        </div>
      </ElementContainer>
    )
  }
}