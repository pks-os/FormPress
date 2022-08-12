import React, { Component } from 'react'
import { cloneDeep } from 'lodash'
import EditableLabel from '../common/EditableLabel'
import EditableList from '../common/EditableList'
import ElementContainer from '../common/ElementContainer'
import { faDotCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons'

import './Radio.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default class Radio extends Component {
  static weight = 3

  static defaultConfig = {
    id: 0,
    type: 'Radio',
    label: 'Single Choice',
    options: ['New Radio']
  }

  static metaData = {
    icon: faDotCircle,
    displayText: 'Single Choice'
  }

  static submissionHandler = {
    getQuestionValue: (inputs, qid) => {
      let value = ''
      for (const elem of inputs) {
        if (elem.q_id === qid) {
          value = elem.value
        }
      }
      return value
    }
  }

  static IsJsonString(str) {
    try {
      JSON.parse(str)
    } catch (e) {
      return false
    }
    return true
  }

  static dataContentOrganizer(dataContentValue, element) {
    const tempContentValue = cloneDeep(dataContentValue)
    let returnContent = []

    if (this.IsJsonString(tempContentValue) === false) {
      for (let elementContent of element.options) {
        if (
          parseInt(tempContentValue) ===
            element.options.indexOf(elementContent) ||
          tempContentValue === elementContent
        ) {
          returnContent.push({
            content: elementContent,
            value: 'checked',
            type: element.type,
            toggle: element.toggle
          })
        } else {
          returnContent.push({
            content: elementContent,
            value: '',
            type: element.type,
            toggle: element.toggle
          })
        }
      }
    } else {
      for (let elementContent of element.options) {
        if (
          parseInt(tempContentValue) ===
            element.options.indexOf(elementContent) ||
          tempContentValue.includes(elementContent)
        ) {
          returnContent.push({
            content: elementContent,
            value: 'checked',
            type: element.type,
            toggle: element.toggle
          })
        } else {
          returnContent.push({
            content: elementContent,
            value: '',
            type: element.type,
            toggle: element.toggle
          })
        }
      }
    }

    return returnContent
  }

  static renderDataValue(entry) {
    return entry.value.map((input, index) => {
      return (
        <div className="input" key={index}>
          <input
            type={input.type.toLowerCase()}
            id={'q_required_' + index}
            className={input.toggle === true ? 'toggle-checkbox' : ''}
            defaultChecked={input.value}
            disabled
            readOnly
          />
          {input.toggle === true ? <span className="slider"></span> : null}
          <label
            className={
              input.type.toLowerCase() +
              '-label ' +
              (input.toggle === true ? 'toggle-label' : '')
            }
            htmlFor={'q_required_' + index}
            dangerouslySetInnerHTML={{
              __html: input.content
            }}></label>
        </div>
      )
    })
  }

  static helpers = {
    getElementValue: (id) => {
      const nodeList = document.getElementsByName(`q_${id}`)
      return Array.from(nodeList)
    },
    isFilled: (value) => {
      return !value.every((item) => item.checked === false)
    }
  }

  constructor(props) {
    super(props)

    this.handleAddingItem = this.handleAddingItem.bind(this)
    this.handleDeletingItem = this.handleDeletingItem.bind(this)
    this.config = props.config
    this.state = {
      isDetailOpen: false
    }
  }

  static configurableSettings = {
    editor: {
      default: false,
      formProps: {
        type: 'Checkbox',
        label: '',
        options: ['Use rich text editor for question']
      }
    },
    editorForOptions: {
      default: false,
      formProps: {
        type: 'Checkbox',
        label: '',
        options: ['Use rich text editor for options']
      }
    },
    expectedAnswer: {
      default: '',
      formProps: {
        type: 'Dropdown',
        options: [{ value: 0, display: 'New Radio' }],
        label: 'Expected Answer',
        placeholder: 'None'
      }
    },
    answerExplanation: {
      default: '',
      formProps: {
        type: 'TextArea',
        editor: true,
        placeholder: 'Please enter an answer explanation',
        label: 'Answer Explanation'
      }
    }
  }

  handleAddingItem() {
    const { config } = this.props
    if (typeof config.options === 'undefined') {
      config.options = [`New ${config.type}`]
    }

    const newOptions = cloneDeep(config.options)
    newOptions.push(`New ${config.type}`)

    this.props.configureQuestion({
      id: config.id,
      newState: {
        options: newOptions
      }
    })
  }

  handleDeletingItem(id) {
    const { config } = this.props
    const options = config.options
    const newOptions = options.filter((option, index) => index !== id)

    this.props.configureQuestion({
      id: config.id,
      newState: {
        options: newOptions
      }
    })
  }

  render() {
    const { config, mode, selectedLabelId, selectedField } = this.props
    const { isDetailOpen } = this.state

    const options =
      Array.isArray(config.options) === true ||
      typeof config.options !== 'undefined'
        ? config.options
        : ['']

    const inputProps = {}

    if (typeof this.props.onChange !== 'undefined') {
      inputProps.onChange = this.props.onChange
    }

    var display
    if (mode === 'builder') {
      display = [
        <EditableLabel
          key="1"
          className="fl label"
          mode={mode}
          order={this.props.order}
          labelKey={config.id}
          editor={
            config.editor &&
            selectedField === config.id &&
            selectedLabelId === config.id
          }
          form_id={config.form_id}
          rteUploadHandler={this.props.rteUploadHandler}
          question_id={config.id}
          dataPlaceholder="Type a question"
          handleLabelChange={this.props.handleLabelChange}
          handleLabelClick={this.props.handleLabelClick}
          value={config.label}
          required={config.required}
          limit={2000}
        />,
        <div key="2" className="fl input">
          <EditableList
            config={config}
            mode={mode}
            rteUploadHandler={this.props.rteUploadHandler}
            editorForOptions={
              config.editorForOptions && selectedField === config.id
            }
            order={this.props.order}
            options={options}
            handleAddingItem={this.handleAddingItem}
            handleDeletingItem={this.handleDeletingItem}
            handleLabelChange={this.props.handleLabelChange}
            handleLabelClick={this.props.handleLabelClick}
            customBuilderHandlers={this.props.customBuilderHandlers}
            selectedLabelId={selectedLabelId}
          />
        </div>,
        <div className="clearfix" key="3">
          <EditableLabel
            className="sublabel"
            dataPlaceholder="Click to edit sublabel"
            mode={mode}
            labelKey={`sub_${config.id}`}
            handleLabelChange={this.props.handleLabelChange}
            handleLabelClick={this.props.handleLabelClick}
            value={
              typeof config.sublabelText !== 'undefined' &&
              config.sublabelText !== ''
                ? config.sublabelText
                : ''
            }
          />
        </div>,
        config.answerExplanation && config.answerExplanation !== '' ? (
          <div className="fl metadata answerExplanationContainer" key="4">
            <details
              title={'Click to edit answer explanation'}
              open={this.state.isDetailOpen}
              onClick={() => this.setState({ isDetailOpen: !isDetailOpen })}>
              <summary>
                <EditableLabel
                  className="sublabel"
                  dataPlaceholder="Click to edit answer title"
                  mode={mode}
                  labelKey={`radio_${config.id}_answerLabel`}
                  handleLabelChange={this.props.handleLabelChange}
                  value={
                    typeof config.answerLabelText !== 'undefined' &&
                    config.answerLabelText !== ''
                      ? config.answerLabelText
                      : ''
                  }
                />
                <span className="popover-container">
                  <FontAwesomeIcon icon={faInfoCircle} />
                  <div className="popoverText">
                    This part will not be displayed on the form.
                  </div>
                </span>
              </summary>
              <p
                dangerouslySetInnerHTML={{
                  __html: config.answerExplanation
                }}></p>
            </details>
          </div>
        ) : null
      ]
    } else {
      display = [
        <div key="1" className="fl label">
          <span
            className={config.required ? 'required' : ''}
            dataplaceholder="Type a question"
            editor={config.editor ? 'true' : 'false'}
            spellCheck="false"
            dangerouslySetInnerHTML={{
              __html: config.label
            }}></span>
        </div>,
        <div key="2" className="fl input">
          <ul>
            {config.options.map((item, key) => {
              return (
                <li key={key}>
                  <input
                    type="radio"
                    id={`q_${config.id}_${key}`}
                    name={`q_${config.id}`}
                    value={mode === 'renderer' ? key : item}
                    onChange={inputProps.onChange}
                    checked={config.value === item}></input>
                  <label
                    className="radio-label"
                    htmlFor={`q_${config.id}_${key}`}
                    dangerouslySetInnerHTML={{ __html: item }}></label>
                  <div className="check">
                    <div className="inside"></div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>,
        <div className="clearfix" key="3">
          <EditableLabel
            className="sublabel"
            dataPlaceholder="Click to edit sublabel"
            mode={mode}
            labelKey={`sub_${config.id}`}
            handleLabelChange={this.props.handleLabelChange}
            value={
              typeof config.sublabelText !== 'undefined' &&
              config.sublabelText !== ''
                ? config.sublabelText
                : ''
            }
          />
        </div>,
        <div key="4" className="fl metadata">
          <div className="requiredErrorText">{config.requiredText}</div>
        </div>,
        <div className="fl metadata answerExplanation dn" key="5">
          <details>
            <summary id={`q_${config.id}_answerLabel`}></summary>
            <div id={`q_${config.id}_answerExplanation`}></div>
          </details>
        </div>
      ]
    }

    return (
      <ElementContainer type={config.type} {...this.props}>
        {display}
      </ElementContainer>
    )
  }
}
