import React, { Component } from 'react'

import * as Elements from './elements'
import Renderer from './Renderer'
import { api } from '../helper'
import './Builder.css'

const BACKEND = process.env.REACT_APP_BACKEND

//Stuff that we render in left hand side
const getElements = () => Object.values(Elements).map((element) => Object
  .assign({}, element.defaultConfig)
)
const getWeightedElements = () => Object
  .values(Elements)
  .map((element) => Object
    .assign({}, element.defaultConfig, {weight: element.weight})
  )
const getElementsKeys = () => getElements()
  .reduce((acc, item) => {
    acc[item.type] = item

    return acc
  }, {})
const pickerElements = getWeightedElements()
  .sort((a, b) => a.weight - b.weight)

const user_id = 1

export default class Builder extends Component {
  async componentDidMount () {
    if (typeof this.props.match.params.formId !== 'undefined') {
      const { formId } = this.props.match.params

      this.setState({ loading: true })

      const { data } = await api({
        resource: `/api/users/${user_id}/forms/${formId}`
      })

      if (typeof data.props === 'undefined') {
        this.setState({
          loading: false
        })
        return
      }

      const props = JSON.parse(data.props)
      const form = {
        ...data,
        props
      }
      console.log('Form received ', JSON.stringify(data))
      console.log('Form will be set to state ', JSON.stringify(form))

      this.setState({
        loading: false,
        form
      })
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      counter: 0,
      saving: false,
      loading: false,
      dragging: false,
      dragIndex: false,
      insertBefore: false,
      form: {
        id: null,
        user_id: null,
        title: 'My Form ' + Math.random(),
        props: {
          elements: [
            {
              id: 1,
              type: 'Text',
              label: 'First Name'
            },
            {
              id: 2,
              type: 'Button',
              buttonText: 'Submit'
            }
          ]
        }
      }
    }
    //this.handleClick = this.handleClick.bind(this)
    this.handleDragStart = this.handleDragStart.bind(this)
    this.handleDragEnter = this.handleDragEnter.bind(this)
    this.handleDragLeave = this.handleDragLeave.bind(this)
    this.handleDragOver = this.handleDragOver.bind(this)
    this.handleDrop = this.handleDrop.bind(this)
    this.handleDragEnd = this.handleDragEnd.bind(this)
    this.handleSaveClick = this.handleSaveClick.bind(this)
    this.handlePreviewClick = this.handlePreviewClick.bind(this)
  }

  handleDragStart (item, e) {
    e.dataTransfer.setData('text/plain', item.type)
    this.setState({ dragging: true })
  }

  handleDragEnter (e, elem) {
    //console.log('Drag enter ', elem)
  }

  handleDragLeave (e, elem) {
    // drag leave
  }

  handleDrop (e) {
    e.stopPropagation()
    e.preventDefault()
    
    const type = e.dataTransfer.getData('text')
    const item = getElementsKeys()[type]
    const { form, dragIndex } = this.state

    //set auto increment element id
    const maxId = Math.max(...form.props.elements.map((element) => element.id))

    item.id = maxId + 1

    const index = form.props.elements.findIndex(
      (element) => (element.id.toString() === dragIndex)
    )

    let newElements

    if (this.state.insertBefore === true) {
      newElements = [
        ...form.props.elements.slice(0, index),
        item,
        ...form.props.elements.slice(index)
      ]
    } else {
      newElements = [
        ...form.props.elements.slice(0, index + 1),
        item,
        ...form.props.elements.slice(index + 1)
      ]
    }

    this.setState({
      dragging: false,
      dragIndex: false,
      form: {
        ...form,
        props: {
          ...form.props,
          elements: newElements
        }
      }
    })
  }

  handleDragEnd (e) {
    this.setState({ dragging: false })
  }

  handleDragOver (e, elem) {
    const rect = e.target.getBoundingClientRect()
    const {top, height} = rect
    const {clientY} = e
    const id = e.target.id
    const middleTop = top + height / 2
    const diff = clientY - middleTop
    const insertBefore = (diff < 0)

    if (
      id !== '' &&
      (
        id !== this.state.dragIndex.toString() ||
        insertBefore !== this.state.insertBefore
      )
    ) {
      this.setState({
        dragIndex: id,
        insertBefore
      })
    }

    e.stopPropagation()
    e.preventDefault()
  }

  async handleSaveClick (e) {
    const { form } = this.state

    this.setState({ saving: true })

    const { data } = await api({
      resource: `/api/users/${user_id}/forms`,
      method: (form.id === null) ? 'post' : 'put',
      body: this.state.form
    })

    this.setState({ saving: false })

    if (form.id === null && typeof data.id !== 'undefined') {
      this.props.history.push(`/editor/${data.id}`)
      this.setState({
        form: {
          ...this.state.form,
          id: data.id
        }
      })
    }
  }

  handlePreviewClick (e) {
    const { id } = this.state.form

    window.open(`${BACKEND}/form/view/${id}`, '_blank')
  }

  render () {
    const { saving, loading } = this.state
    const saveButtonProps = {}

    if (saving === true || loading === true) {
      saveButtonProps.disabled = true
    }

    return (
      <div className='builder center'>
        <div className='header oh'>
          <div className='fl'>
            Welcome to builder!
            <button onClick={ this.handleSaveClick } { ...saveButtonProps }>
              { saving === true ? 'Saving...': 'Save' }
            </button>
            <button onClick={ this.handlePreviewClick }>
              Preview Form
            </button>
          </div>
        </div>
        <div className='content oh'>
          <div className='fl elements'>
            <div className='elementsContent'>
              <div>Form Elements</div>
              <div className='elementList'>
                {pickerElements.map((elem) =>
                  <div
                    className='element'
                    draggable
                    onDragStart={ this.handleDragStart.bind(this, elem) }
                    onDragEnd={ this.handleDragEnd }
                    key={ elem.type }
                  >
                    { elem.type }
                  </div>
                )}
              </div>
            </div>
          </div>
          {
            (loading === true)
              ? 'Loading...'
              : <Renderer
                className='fl form'
                handleDragEnter={ this.handleDragEnter }
                handleDragLeave={ this.handleDragLeave }
                handleDrop={ this.handleDrop }
                handleDragOver={ this.handleDragOver }
                dragIndex={ this.state.dragIndex }
                dragging={ this.state.dragging }
                insertBefore={ this.state.insertBefore }
                form={ this.state.form }
              />
          }
        </div>
      </div>
    )
  }
}
