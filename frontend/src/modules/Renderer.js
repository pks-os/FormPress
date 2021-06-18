import React, { Component } from 'react'
import * as StandartElements from './elements'
import * as InternalElements from './internal'

export default class Renderer extends Component {
  render() {
    let { className } = this.props
    const {
      dragging,
      dragMode,
      sortItem,
      customBuilderHandlers,
      configureQuestion,
      builderHandlers,
      handleLabelChange,
      handleAddingItem,
      handleDeletingItem,
      selectedField,
      theme,
      allowInternal
    } = this.props


    let Elements = { ...StandartElements }
    if (allowInternal === true) {
      Elements = { ...StandartElements, ...InternalElements }
    }

    if (this.props.dragging === true) {
      className += ' dragging'
    }

    className += ` ${this.props.mode} ${theme}`

    return (
      <div className={className} {...builderHandlers}>
        {this.props.form.props.elements.map((elem) => {
          const Component = Elements[elem.type]
          const extraProps = { mode: this.props.mode }

          if (typeof this.props.handleFieldChange === 'function') {
            extraProps.onChange = (e) => {
              this.props.handleFieldChange(elem, e)
            }
          }

          // Hide sorted item
          if (
            dragging === true &&
            dragMode === 'sort' &&
            sortItem.id === elem.id
          ) {
            extraProps.className = 'dn'
          }

          const renderList = [
            <Component
              key={elem.id}
              id={elem.id}
              config={elem}
              builderHandlers={builderHandlers}
              customBuilderHandlers={customBuilderHandlers}
              handleLabelChange={handleLabelChange}
              handleAddingItem={handleAddingItem}
              handleDeletingItem={handleDeletingItem}
              configureQuestion={configureQuestion}
              selectedField={selectedField}
              {...extraProps}
            />
          ]

          if (
            this.props.dragIndex === elem.id.toString() &&
            this.props.dragging === true
          ) {
            if (this.props.insertBefore === true) {
              renderList.unshift(
                <div key="dropPlaceHolder" className="dropPlaceHolder"></div>
              )
            } else {
              renderList.push(
                <div key="dropPlaceHolder" className="dropPlaceHolder"></div>
              )
            }
          }

          return renderList.length === 1 ? renderList[0] : renderList
        })}

        {this.props.form.props.elements.length === 0 &&
          this.props.dragging === true && (
            <div key="dropPlaceHolder" className="dropPlaceHolder"></div>
          )}
      </div>
    )
  }
}

Renderer.defaultProps = {
  mode: 'viewer',
  theme: 'gleam',
  allowInternal: false
}
