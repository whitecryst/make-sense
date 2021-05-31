//import Combobox from 'react-widgets'
import React, { ChangeEvent } from 'react';
//import PropTypes from 'prop-types';
import { Component } from 'react';
import DropdownList from 'react-widgets/lib/DropdownList'
import "react-widgets/dist/css/react-widgets.css";
import { KtkSelector } from '../../../../store/selectors/KtkSelector';
import { KtkActions } from '../../../../logic/actions/KtkActions';
import { Settings } from '../../../../settings/Settings';
import {ImageButton} from "../../../Common/ImageButton/ImageButton";
import {ImageSeriesMeta, ImageSeriesContent, SymbolsContent, SymbolCategory} from "../../../../store/ktk/types";
import {ImageData, LabelName, LabelRect, Side} from "../../../../store/labels/types";
import {IRect} from "../../../../interfaces/IRect";
import TextInput from '../../../Common/TextInput/TextInput';
import { TextareaAutosize } from '@material-ui/core';
import { url } from 'node:inspector';
import {store} from "../../../../index";
import {addImageSeriesContentRow, addSymbolsContentRow} from "../../../../store/ktk/actionCreators";
import connectorNodeV1 from '../../../../filemanager/server-connector/';
import api from '../../../../filemanager/server-connector/api';
import apiOptions from '../../../../filemanager/server-connector/apiOptions';
import { LabelsSelector } from '../../../../store/selectors/LabelsSelector';
import {LabelType} from '../../../../../src/data/enums/LabelType';

interface IProps {
  labelId: string;
  onDelete: (id: string) => any;
  highlightLabel: (highlightedLabelId: string) => any;
  imageData: ImageData;
  onSelectLabel: (labelRectId: string, symbolId: string, symbol:SymbolsContent) => any;
  value: LabelName;
  setRectSide: (labelId:string, side:Side) => any;
}
  
interface IState {
  showInfo: boolean;
  showMoreAction: boolean;
  addSymbolInUse: boolean;
  actSymbol: LabelName;
  actCategory: string;
  symbolToAdd: SymbolsContent;
  /*addSymbolValue_Category;
  addSymbolValue_Name;
  addSymbolValue_Description;*/
  addSymbolImgBlob;

}
export default
class LabelSelect extends Component<IProps, IState>  {

  constructor(props) {
      super(props);
      this.state={
        showInfo:false, 
        showMoreAction:false, 
        addSymbolInUse:false, 
        actSymbol:null, 
        actCategory:'', 
        symbolToAdd:{
          id:null,
          category:null,
          name:null,
          fullname:null,
          imgUrl:null,
          description:null/*,
          handTechniqueContent:null,
          footTechniqueContent:null*/
        },
        /*addSymbolValue_Category:'',
        addSymbolValue_Name:'',
        addSymbolValue_Description:'',*/
        addSymbolImgBlob:null
       };
  }

  private reRender = () => {
    console.log("reRender()");
    this.setState( this.state );
  }

  private showInfo = () => {
    if( !this.state.addSymbolInUse ) {
      this.setState( {showInfo:true} );
    }
    this.props.highlightLabel(this.props.labelId);
  };

  private hideInfo = () => {
    this.setState( {showInfo:false} );
    this.props.highlightLabel(null);
  }

  private updateSelect = (i:SymbolsContent) => {
    this.setState( { actSymbol: i} );
    // give selected symbol id up to parent
    //define side
    console.log("update symbol in labelRect:"+i);
    this.props.onSelectLabel( this.props.labelId, i.id , i);
  }

  private updateSelectCategory = (i:string) => {
    this.setState( { actCategory: i} );
  }

  private toogleMoreAction = () => {
    let newVal = this.state.showMoreAction ? false : true;
    this.setState(  {showMoreAction: newVal} );
  }

  private hideMoreAction = () => {
    setTimeout( () => {this.setState( {showMoreAction: false} )}, 750);
  }

  private checkSymbolCategory = (i:LabelName) => {
    if( this.state.actCategory != null && this.state.actCategory != '' ) {
      return i.category == this.state.actCategory;
    } else {
      return true;
    }
  }

  


  private cancelAddNewSymbol = () => {
    this.setState( {addSymbolInUse: false} );

  }

  private addNewSymbol = () => {
    this.setState( {addSymbolInUse: true} );
    this.setState( {showInfo:false} );
    
    // find act RectLabel
    let rectLabel:LabelRect = null;
    for( let rl of this.props.imageData.labelRects ) {
        if( rl.id == this.props.labelId ) {
            rectLabel = rl;
            break;
        }
    }
    if( rectLabel == null ) {
        console.error( "unable to find act LabelRect in list:"+this.props.labelId  );
        return null;
    }
    let canvas = this.resizeCropImg( this.props.imageData.fileData, rectLabel.rect );
  }

  private finishAddNewSymbol = async () => {
    // create new Symbol object
    //const newSymbolId = Math.max.apply(Math, symbols.map(function(s) { return Number(s.symbolId); })) + 1;
    /*let newSymbol:SymbolsContent = {
      id: String(0),
      category:this.state.addSymbolValue_Category,
      name:this.state.addSymbolValue_Name,
      fullname:this.state.addSymbolValue_Category+"/"+this.state.addSymbolValue_Name,
      description:this.state.addSymbolValue_Description,
      imgUrl:'' // https://www.rd.com/wp-content/uploads/2019/09/GettyImages-621924830.jpg
    };*/

    let newSymbol:SymbolsContent = {
      ...this.state.symbolToAdd,
      id: String(0),
      fullname:this.state.symbolToAdd.category+"/"+this.state.symbolToAdd.name,
      imgUrl:'' // https://www.rd.com/wp-content/uploads/2019/09/GettyImages-621924830.jpg
    };

    // upload new Symbol to GoogleSheets (will add the symbolId)
    newSymbol.id = await KtkActions.addSymbolsContentRow( newSymbol );

    newSymbol.imgUrl = 'https://kungfu-wiki.com/fileserver/images/Symbols/'+newSymbol.id+'.png';
    // add new symbol to redux store
    store.dispatch( addSymbolsContentRow(newSymbol) );
    console.log( "added new KtK Symbol to redux store" );

    //upload image to server
    //const apiOptions = this.props;
    const apiOptions:any = {
      ...connectorNodeV1.apiOptions,
      apiRoot: `https://kungfu-wiki.com:3001` // Or you local Server Node V1 installation.
    }
    const api = connectorNodeV1.api;
    const symbolsFolderId:any = await api.getIdForPath(apiOptions, '/Symbols')
    let imgFile = this.state.addSymbolImgBlob;
    imgFile.name = newSymbol.id+".png";
    imgFile.lastModifiedDate = new Date();
    let uploadObj = {type:'image/png', name:imgFile.name, file:imgFile};
    console.log( "now uploading: "+imgFile.name+"..." )
    const response = await api.uploadFileToId( {
      apiOptions:apiOptions, 
      parentId:symbolsFolderId, 
      file:uploadObj, 
      onProgress:(percent)=>{console.log("fileUpload progress:"+percent);}} );  
    //console.log( response );
    
    // now add uploaded symbol image to imageSeriesContent
    let newSymbolImageContent : ImageSeriesContent = {
      seriesId: "43",
      imageId: String( newSymbol.id ),
      url: newSymbol.imgUrl,
      imageMap: '',
      posture: null,
      technique: null,
      sheetRow: -1
    }
    KtkActions.addImageSeriesContentRow( newSymbolImageContent );  

    // update state to hide the form
    this.setState( {actCategory:newSymbol.category});
    this.setState( {actSymbol:newSymbol});
    this.setState( {addSymbolInUse:false} );
    this.setState( {showInfo:true} );
    this.props.onSelectLabel(this.props.labelId, newSymbol.id, newSymbol);
    // if new ImageSymbol was of type 'technique' try to prefill technique values from existing bodyPart and posture annotations
    if( newSymbol.category == SymbolCategory.HAND_TECHNIQUE 
      || newSymbol.category == SymbolCategory.FOOT_TECHNIQUE
      || newSymbol.category == SymbolCategory.KUNGFU_TECHNIQUE ) {

        KtkActions.addTechniqueContent(this.props.imageData, this.props.imageData.labelRects.find(r => r.id == this.props.labelId));
        
    }
  }

  private resizeCropImg = ( srcImg:File, cropArea:IRect ) => {
      
      //var canvas = document.createElement("canvas"); 
      var ReactDOM = require('react-dom');
      var canvas = ReactDOM.findDOMNode(this.refs.canvas);                
      var context = canvas.getContext('2d');
      var imageEl = new Image();//ReactDOM.findDOMNode(this.refs.symbolImg);                
      let thisObj = this;
      const reader = new FileReader();
      reader.readAsDataURL(srcImg);
      reader.onloadend = function(evt){
          if( evt.target.readyState == FileReader.DONE) {
              imageEl.src = evt.target.result as string;
              var sourceX = cropArea.x;//150;
              var sourceY = cropArea.y;//0;
              var sourceWidth = cropArea.width;// 150;
              var sourceHeight = cropArea.height;//150;
              var destWidth = 200;
              var destHeight = (destWidth / cropArea.width) * sourceHeight;
              canvas.width=destWidth;
              canvas.height=destHeight;
              var destX = canvas.width / 2 - destWidth / 2;
              var destY = canvas.height / 2 - destHeight / 2;

              context.drawImage(imageEl, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);
              canvas.toBlob((blob) => {thisObj.setState( {addSymbolImgBlob:blob} ); thisObj.setState( {showInfo:false} ); });
          }
      }   

      console.log("onCropEnd");
  }

  public render() {
//    let symbols = [];
//    if( this.props.labelOptions != null && this.props.labelOptions.length > 0 ) {
//      symbols = this.props.labelOptions;
//    }  else {
      let symbols = KtkSelector.getSymbolsContent() ;
//    }

    //console.log( symbols );
    let categories = Array.from(new Set(symbols.map(symbol => symbol.category)));
    let categoriesWithoutLeftRight = Array.from(new Set(symbols.map(symbol => symbol.category.replace("Left ","").replace("Right ",""))));

    let ListItem = ( i:any ) => {
      let symbol:SymbolsContent = i.item;
      return (<div className="grid-container" style={{display:"inline-grid", width:'100%', margin:'none',gridTemplateColumns: 'auto auto'}}>
        <div style={{ gridColumn: '1 / 2' , gridRow: 1}}>
          <img height={"30"} src={String(symbol.imgUrl)}></img>
        </div>
        <div style={{ gridColumn: '2 / 2' , gridRow: 1, lineHeight:'1'}}>  
          {symbol.name}<strong>{" ("+symbol.id+")"}</strong>
        </div>
      </div>);
    };

      let GroupHeading = ({ item }) => (
        <span style={{border: "1px", color: "#555", fontSize: "medium"}}>{'--- ' + item + ' ---'}</span>
      );

      // on first start, load value according to already set Rectlabel content
      let noImageSeriesAssigned = this.props.imageData ? this.props.imageData.ktk_imageSeriesContent.seriesId == "0" : true;
      
      // TODO use value unstead of this crap below
      let labelData = null;
      switch(LabelsSelector.getActiveLabelType()) {
        case LabelType.LINE: 
          labelData = this.props.imageData.labelLines;
        break;
        case LabelType.POINT: 
          labelData = this.props.imageData.labelPoints;
        break;
        case LabelType.POLYGON: 
          labelData = this.props.imageData.labelPolygons;
        break;
        case LabelType.RECT: 
          labelData = this.props.imageData.labelRects;
        break;
        
      }
      let side:Side = Side.UNKNOWN;
      // get initial value from ktk googlesheet (saved value)
    
      for( let actLabelRect of labelData ) {
        if( actLabelRect.id == this.props.labelId ) {
          side = actLabelRect.side;
          if( this.state.actSymbol == null && this.props.value == null && labelData) {      
            // now find this symbol id in symbols
            let defaultSymbol = symbols.find(s => s.id == actLabelRect.labelId);
            if( defaultSymbol != null ) {
              this.setState({ actSymbol: defaultSymbol });
              this.setState({ actCategory: defaultSymbol.category });
            }
            
          } else if( this.state.actSymbol == null && this.props.value != null) {
            //get initial value from parent (e.g. from pose detection)
            this.setState( { actSymbol: this.props.value} );
            console.log( "got value from props" )
          }
        }
      } 

      let isHighlighted = LabelsSelector.getHighlightedLabelId() == this.props.labelId;
      const mainStyle = isHighlighted ? {
        backgroundColor:'red',
        padding:'1px'
        
      } : {};

    return ( 
<div style = {mainStyle}>
{ noImageSeriesAssigned && <div style={{color:'red', width:'100%'}} >! Image has no Imageseries ID !<br/>Assign imageseries in filemanager!</div> }
  {/*selectfield for label category and label*/}
  
  <div className="grid-container" style={{display:"inline-grid", width:'100%', gridTemplateColumns: '12% auto 32px', verticalAlign:'top'}} onMouseLeave={this.hideInfo}
          onMouseEnter={!noImageSeriesAssigned && this.showInfo}>
    
    <div style={{ gridColumn: '1 / 3' , gridRow: 1}}>
      
      <DropdownList style={{fontSize: "small"}}
          name = 'CategorySelect'
          autoFocus 
          suggest  
          value={ this.state.actCategory }
          disabled = {this.state.addSymbolInUse || noImageSeriesAssigned}
          data = {categories} 
          caseSensitive={false}
          filter='contains'
          textField = 'name'
          valueField = 'name'
          onChange={this.updateSelectCategory}
      /> 
    </div>
    <div style={{ gridColumn: '2 / 3' , gridRow: 1}}>
      <DropdownList style={{fontSize: "small"}}
        name = 'LabelSelect'
        value = { this.state.actSymbol }  
        suggest  
        data = {symbols.filter( this.checkSymbolCategory )} 
        disabled = {this.state.addSymbolInUse || noImageSeriesAssigned}
        caseSensitive={false}
        filter='contains'
        textField = 'fullname'
        valueField = 'symbolId'
        itemComponent={ListItem}
        groupComponent={GroupHeading}
        groupBy={symbol => symbol.category}
        onChange={this.updateSelect}
      />
    </div>

    {/*dropdown menu for more actions (delete label, add label)*/}
    <div style={{ gridColumn: '3 / 3' , gridRow: 1, height:'31px', justifyContent: 'center', alignItems: 'center',lineHeight:'1', background:Settings.DARK_THEME_THIRD_COLOR, borderRadius:'4px'}}>
      <ImageButton
          externalClassName={"trash"}
          image={"ico/more.png"}
          imageAlt={"remove_rect"}
          buttonSize={{width: 25, height: 25}}
          onClick={this.toogleMoreAction}
      />
      {this.state.showMoreAction && <div 
      onMouseLeave={this.hideMoreAction}  
      style={{position: 'relative', zIndex: 102, borderStyle: 'solid', borderColor:Settings.DARK_THEME_THIRD_COLOR, borderWidth:'1px', background:Settings.DARK_THEME_THIRD_COLOR}}>
        {LabelsSelector.getActiveLabelType() == LabelType.RECT && <ImageButton
            externalClassName={"trash"}
            image={"ico/left.png"}
            imageAlt={"side=L"}
            buttonSize={{width: 25, height: 25}}
            onClick={() => this.props.setRectSide(this.props.labelId, Side.LEFT)}
        />}
        {LabelsSelector.getActiveLabelType() == LabelType.RECT && <ImageButton
            externalClassName={"trash"}
            image={"ico/checkbox-unchecked.png"}
            imageAlt={"side=NONE"}
            buttonSize={{width: 25, height: 25}}
            onClick={() => this.props.setRectSide(this.props.labelId, Side.NONE)}
        />}
        {LabelsSelector.getActiveLabelType() == LabelType.RECT && <ImageButton
            externalClassName={"trash"}
            image={"ico/right.png"}
            imageAlt={"side=R"}
            buttonSize={{width: 25, height: 25}}
            onClick={() => this.props.setRectSide(this.props.labelId, Side.RIGHT)}
        />}
        <ImageButton
            externalClassName={"trash"}
            image={"ico/trash.png"}
            imageAlt={"remove_rect"}
            buttonSize={{width: 25, height: 25}}
            onClick={() => this.props.onDelete(this.props.labelId)}
        />
        {!noImageSeriesAssigned && <ImageButton
            externalClassName={"trash"}
            image={"ico/plus.png"}
            imageAlt={"add_new_symbol"}
            buttonSize={{width: 25, height: 25}}
            onClick={() => this.addNewSymbol()}
        />} 
      </div>}
      
    </div>
  </div>

  {/*info field for a label*/}
  { this.state.showInfo && <div className="LabelSelectorInfo" style={{position:'relative'}}/*style={{position:'relative', zIndex:200}}*/>
    <div className={'oc-fm--dialog__input-label'} style={{fontWeight:'normal', color:'#ddd'}}><strong>{"Category: "}</strong>{ (this.state.actSymbol ? this.state.actSymbol.category : "")}</div>
    <div className={'oc-fm--dialog__input-label'} style={{fontWeight:'normal', color:'#ddd'}}><strong>{"Side: "}</strong>{ (side ? side : "")}</div>
    <div className={'oc-fm--dialog__input-label'} style={{fontWeight:'normal', color:'#ddd'}}><strong>{"Symbol: "+  (this.state.actSymbol ? "("+this.state.actSymbol.id +")" : "")}{":"}
      </strong>{ this.state.actSymbol ? this.state.actSymbol.fullname : ""}</div> 
    <div className={'oc-fm--dialog__input-label'} style={{fontWeight:'normal', color:'#ddd'}}><strong>{"Info: "}</strong>{ this.state.actSymbol ? this.state.actSymbol.description: ""}</div>
    <div className={'oc-fm--dialog__input-label'} style={{fontWeight:'normal', color:'#ddd'}}><strong>{"Image: "}</strong>
      <img ref="symbolImg" width={"100%"} src={this.state.actSymbol ? this.state.actSymbol.imgUrl: ""} style={this.state.addSymbolInUse ? {display:'none'} : {display:'default'}}></img>
    </div>
  </div> }

  {/*Form for adding new Label*/}   
  <div className="LabelSelectorInfo" hidden={!this.state.addSymbolInUse}>
    <span className={'oc-fm--dialog__input-label'} style={{fontSize:18, textAlign:'center', color:'#ddd'}}>Add new symbol label:</span>
    <div className="grid-container2" style={{display:"grid", gridTemplateColumns: '70px 200px',}}>
      <div className={'oc-fm--dialog__input-label'} style={{gridColumn: '1 / 2' , gridRow: 1, fontWeight:'normal', color:'#ddd'}}><strong>{"Category: "}</strong></div>
      <DropdownList style={{fontSize: "small", gridColumn: '2 / 2' , gridRow: 1, }}
          name = {'CategorySelect'+this.props.labelId}
          suggest  
          data = {categoriesWithoutLeftRight} 
          caseSensitive={false}
          filter='contains'
          textField = 'name'
          valueField = 'name'
          onSelect = { (i:string) => {this.setState( { symbolToAdd: {...this.state.symbolToAdd, category:i} } ); } }
      />
      <div className={'oc-fm--dialog__input-label'} style={{fontWeight:'normal', color:'#ddd', gridColumn: '1 / 2' , gridRow: 2}}><strong>{"Name: "}</strong></div>
      <div style={{gridColumn: '2 / 2' , gridRow: 2}}>
        <TextInput inputStyle={{ height:'30px'}}
          key={"newSymbolName"+this.props.labelId}
          isPassword={false}
          onChange = { (event) => {this.setState( { symbolToAdd: {...this.state.symbolToAdd, name: event.target.value} } ); } }
          />
      </div>
  
      <div className={'oc-fm--dialog__input-label'} style={{fontWeight:'normal', color:'#ddd', gridColumn: '1 / 2' , gridRow: 3}}><strong>{"Info: "}</strong></div>
      <TextareaAutosize 
        rowsMin={4} 
        style={{width:'100%', gridColumn: '2 / 2' , gridRow: 3}}
        onChange = { (event) => {this.setState( { symbolToAdd: {...this.state.symbolToAdd, description: event.target.value} } ); } }
      />

    </div>
    <div className={'oc-fm--dialog__input-label'} style={{fontWeight:'normal', color:'#ddd'}}><strong>{"Image: "}</strong></div>
    <canvas ref="canvas" onChange={() => {this.reRender()}}/>
    <div style={{display:'inline', textAlign:'right', background:Settings.DARK_THEME_FORTH_COLOR}}>
      <ImageButton
            externalClassName={"trash"}
            image={"ico/cancel.png"}
            imageAlt={"cancel"}
            buttonSize={{width: 25, height: 25}}
            onClick={() => this.cancelAddNewSymbol()}
        /> 
      <ImageButton
          externalClassName={"trash"}
          image={"ico/ok.png"}
          imageAlt={"add symbol"}
          buttonSize={{width: 25, height: 25}}
          onClick={() => this.finishAddNewSymbol()}
      /> 
    </div>
  </div> 
  
</div>      
    );
  }
}
  
  