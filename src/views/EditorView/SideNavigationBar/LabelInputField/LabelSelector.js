//import Combobox from 'react-widgets'
import PropTypes from 'prop-types';
import { Component } from 'react';
import DropdownList from 'react-widgets/lib/DropdownList'
import "react-widgets/dist/css/react-widgets.css";
import { KtkSelector } from '../../../../store/selectors/KtkSelector';
import { Settings } from '../../../../settings/Settings';
import {ImageButton} from "../../../Common/ImageButton/ImageButton";

const propTypes = {
  id: PropTypes.string,
  //onDelete: PropTypes.func
  };
  const defaultProps = {
   // onDelete: (id) => {}
  };
  
  
  export default
  class LabelSelect extends Component {
    

    constructor(props) {
        super(props);
        this.state={showInfo:'', showMoreAction:'', actSymbol:'', actCategory:''};
    }

    

    showInfo = (i) => {
        this.setState( {showInfo:true} );
        this.props.highlightLabel(this.props.labelRectId);
        
    };

    hideInfo = (i) => {
      //setTimeout(() => { this.setState( {showInfo: false} ) }, 1000);
      this.setState( {showInfo:false} );
      this.props.highlightLabel(null);
    }

    updateSelect = (i) => {
      this.setState( { actSymbol: i} );
      //console.log( "actSymbol:"+this.state.actSymbol.name );
    }

    updateSelectCategory = (i) => {
      this.setState( { actCategory: i} );
      //console.log( "actSymbol:"+this.state.actSymbol.name );
    }

    toogleMoreAction = () => {
      let newVal = this.state.showMoreAction ? false : true;
      this.setState(  {showMoreAction: newVal} );
    }

    hideMoreAction = () => {
      this.setState( {showMoreAction: false} );
    }

    checkSymbolCategory = (i) => {
      if( this.state.actCategory != null && this.state.actCategory != '' ) {
        return i.category == this.state.actCategory;
      } else {
        return true;
      }
    }

    render() {
        
        let symbols = KtkSelector.getSymbolsContent() ;
        let categories = Array.from(new Set(symbols.map(symbol => symbol.category)));
  
        let ListItem = ({ item }) => (
          <div class="grid-container" style={{display:"inline-grid", width:'100%', margin:'none',gridTemplateColumns: 'auto auto'}}>
            <div style={{ gridColumn: '1 / 2' , gridRow: 1}}>
              <img height={"30"} src={String(item.imgUrl).replace("files","thumbs")}></img>
            </div>
            <div style={{ gridColumn: '2 / 2' , gridRow: 1, lineHeight:'1'}}>  
              {item.name}<strong>{" ("+item.symbolId+")"}</strong>
            </div>
          </div>
          );

          let GroupHeading = ({ item }) => (
            <span style={{border: "1px", color: "#555", fontSize: "medium"}}>{'--- ' + item + ' ---'}</span>
          );
          const { value , onChange } = this.props;
      return (
        <>
  <div className="grid-container" style={{display:"inline-grid", width:'100%', gridTemplateColumns: '10% auto 32px', verticalAlign:'top'}} onMouseLeave={this.hideInfo}
          onMouseEnter={this.showInfo}>
    <div style={{ gridColumn: '1 / 3' , gridRow: 1}}>
      <DropdownList style={{fontSize: "small"}}
          name = 'CategorySelect'
          autoFocus 
          suggest  
          data = {categories} 
          caseSensitive={false}
          filter='contains'
          textField = 'name'
          valueField = 'name'
          //itemComponent={ListItem}
          onSelect={this.updateSelectCategory}
          //onMouseLeave={this.hideInfo}
          //onMouseEnter={this.showInfo}
      />
    </div>
    <div style={{ gridColumn: '2 / 3' , gridRow: 1}}>
     <DropdownList style={{fontSize: "small"}}
        name = 'LabelSelect'
        //defaultValue = {items[0]} 
        //autoFocus 
        suggest  
        data = {symbols.filter( this.checkSymbolCategory )} 
        //dropUp
        caseSensitive={false}
        //minLength={3}
        filter='contains'
        textField = 'fullname'
        valueField = 'symbolId'
        itemComponent={ListItem}
        groupComponent={GroupHeading}
        groupBy={symbol => symbol.category}
        onSelect={this.updateSelect}
        //onChange={onChange}
        //onMouseLeave={this.hideInfo}
        //onMouseEnter={this.showInfo}
      />
    </div>
    <div style={{ gridColumn: '3 / 3' , gridRow: 1, height:'31px', justifyContent: 'center', alignItems: 'center',lineHeight:'1', background:Settings.DARK_THEME_THIRD_COLOR, borderRadius:'4px'}}>
      <center><ImageButton
          externalClassName={"trash"}
          image={"ico/more.png"}
          imageAlt={"remove_rect"}
          buttonSize={{width: 25, height: 25}}
          onClick={this.toogleMoreAction}
      /></center>
      {this.state.showMoreAction && <div 
      onMouseLeave={this.hideMoreAction}  
      style={{position: 'relative', zIndex: 102, borderStyle: 'solid', borderColor:Settings.DARK_THEME_THIRD_COLOR, borderWidth:'1px', background:Settings.DARK_THEME_THIRD_COLOR}}>
        <ImageButton
            externalClassName={"trash"}
            image={"ico/trash.png"}
            imageAlt={"remove_rect"}
            buttonSize={{width: 25, height: 25}}
            onClick={() => this.props.onDelete(this.props.labelRectId)}
        />
        <ImageButton
            externalClassName={"trash"}
            image={"ico/plus.png"}
            imageAlt={"remove_rect"}
            buttonSize={{width: 25, height: 25}}
            onClick={() => this.props.onAdd(this.props.labelRectId)}
        /> 
      </div>}
      
    </div>
  </div>
     { this.state.showInfo ? <div style={{background:Settings.DARK_THEME_FORTH_COLOR ,position: 'relative', zIndex: 100 ,width:'100%', borderStyle: 'solid', borderColor:Settings.DARK_THEME_THIRD_COLOR, borderWidth:'1px', padding:'2px'}}>
        <div className={'oc-fm--dialog__input-label'} style={{fontWeight:'normal', color:'#ddd'}}><strong>{"Symbol: "}</strong>{ this.state.actSymbol.fullname }</div> 
        <div className={'oc-fm--dialog__input-label'} style={{fontWeight:'normal', color:'#ddd'}}><strong>{"Info: "}</strong>{this.state.actSymbol.description}</div>
        <div className={'oc-fm--dialog__input-label'} style={{fontWeight:'normal', color:'#ddd'}}><strong>{"Image: "}</strong><img width={"100%"} src={this.state.actSymbol.imgUrl}></img></div>
        </div> : ""}
   
    
  </>
      );
    }
  }
  
  LabelSelect.propTypes = propTypes;
  LabelSelect.defaultProps = defaultProps;