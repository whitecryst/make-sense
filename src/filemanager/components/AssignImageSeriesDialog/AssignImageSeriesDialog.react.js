import PropTypes from 'prop-types';
import React, { Component } from 'react';
import './AssignImageSeriesDialog.css';
import Dialog from '../Dialog';
import ImageSeriesSelect from './ImageSeriesSelector';
import { KtkActions } from '../../../logic/actions/KtkActions';
import FileNavigator from '../FileNavigator';

const propTypes = {
  cancelButtonText: PropTypes.string,
  headerText: PropTypes.string,
  messageText: PropTypes.string,
  inputLabelText: PropTypes.string,
  initialValue: PropTypes.string,
  onChange: PropTypes.func,
  onHide: PropTypes.func,
  onSubmit: PropTypes.func,
  onValidate: PropTypes.func,
  submitButtonText: PropTypes.string
};
const defaultProps = {
  cancelButtonText: 'Cancel',
  headerText: 'Assign ImageSeries',
  messageText: '',
  inputLabelText: '',
  initialValue: '',
  onChange: () => {},
  onHide: () => {},
  onSubmit: () => {},
  onValidate: () => {},
  submitButtonText: 'Assign'
};

export default
class AssignImageSeriesDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.initialValue,
      validationError: null,
      valid: true,
      selectedImageSeries: null
    };
  }

  componentDidMount() {
    this._isMounted = true
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  handleChange = async (e) => {
    console.log(e);
    this.setState({ selectedImageSeries: e });
    /*const validationError = await this.props.onValidate(e.target.value);
    if (this._isMounted) {
      this.setState({ validationError, valid: !validationError });
    }*/
  }

  handleKeyDown = async (e) => {
    if (e.which === 13) { // Enter key
      if (!this.state.validationError && this.state.value) {
        this.handleSubmit(this.state.value);
      }
    }
  }

  handleSubmitButtonClick = async (e) => {
    
    //if (!this.state.validationError && this.state.value) {
    if( this.state.selectedImageSeries ) {  
      this.handleSubmit(this.state.selectedImageSeries);
    }
    //}
  }

  handleSubmit = async () => {
    const validationError = await this.props.onSubmit(this.state.selectedImageSeries);
    /*if (validationError && this._isMounted) {
      this.setState({ validationError });
    } else {
      
    }*/
  }

  handleFocus = (e) => {
    // Move caret to the end
    const tmpValue = e.target.value;
    e.target.value = ''; // eslint-disable-line no-param-reassign
    e.target.value = tmpValue; // eslint-disable-line no-param-reassign
  }


  render() {
    const { onHide, headerText, inputLabelText, messageText, submitButtonText, cancelButtonText } = this.props;
    const { value, validationError, valid } = this.state;

    const showValidationErrorElement = typeof validationError === 'string' && validationError;
    const validationErrorElement = (
      <div
        className={`
          oc-fm--dialog__validation-error
          ${showValidationErrorElement ? '' : 'oc-fm--dialog__validation-error--hidden'}
        `}
      >
        {validationError || <span>&nbsp;</span>}
      </div>
    );

    return (
      <Dialog onHide={onHide}>
        <div className="oc-fm--dialog__content" onKeyDown={this.handleKeyDown}>
          <div className="oc-fm--dialog__header">
            {headerText}
          </div>

          {messageText && (
            <div className="oc-fm--dialog__message">{messageText}</div>
          )}

          {inputLabelText && (
            <div className="oc-fm--dialog__input-label">{inputLabelText}</div>
          )}

        <ImageSeriesSelect 
        onChange={this.handleChange}/>
         
          {validationErrorElement}

          <div className="oc-fm--dialog__horizontal-group oc-fm--dialog__horizontal-group--to-right">
            <button type="button" className="oc-fm--dialog__button oc-fm--dialog__button--default" onClick={onHide}>
              {cancelButtonText}
            </button>
            <button
              type="button"
              className={`oc-fm--dialog__button oc-fm--dialog__button--primary`}
              onClick={this.handleSubmitButtonClick}

              //disabled={!valid}
            >
              {submitButtonText}
            </button>
          </div>
        </div>
      </Dialog>
    );
  }
}

AssignImageSeriesDialog.propTypes = propTypes;
AssignImageSeriesDialog.defaultProps = defaultProps;
