//import Combobox from 'react-widgets'
import PropTypes from 'prop-types';
import { Component } from 'react';
import Combobox from 'react-widgets/lib/Combobox'
import DropdownList from 'react-widgets/lib/DropdownList'
import "react-widgets/dist/css/react-widgets.css";
import { KtkSelector } from '../../../store/selectors/KtkSelector';

const propTypes = {
    
  };
  const defaultProps = {
      
  };
  
  
  export default
  class ImageSeriesSelect extends Component {
    

    constructor(props) {
        super(props);
        this.state={showInfo:'', actSeries:''};
    }

    

    showInfo = (i) => {
        this.setState( {actSeries: i} );
    };

    render() {

        let items = KtkSelector.getImageSeriesMeta() ;
        for( let i of items ) {
             
            let s = i.seriesId ? i.seriesId : ""; 
            s += i.routine || i.lineage ? " - " : "";
            s += i.routine ? i.routine : "";
            s += i.lineage ? " (" + i.lineage +")" : "";
            i['fullName'] = s;
        }
        let ListItem = ({ item }) => (
            <span >
              <strong>{item.seriesId}</strong> - 
              {" " + item.routine}
              {" (" + item.lineage + ")"}
            </span>
          );

          let GroupHeading = ({ item }) => (
            <span style={{border: "1px", color: "#555", fontSize: "medium"}}>{'--- ' + item + ' ---'}</span>
          );
          const { value , onChange } = this.props;
      return (
        <>
    <DropdownList style={{fontSize: "small", width:'100%'}}
        name = 'ImageSeriesSelect'
        //defaultValue = {items[0]} 
        autoFocus 
        suggest 
        dropUp 
        data = {items} 
        //caseSensitive={false}
        //minLength={3}
        filter='contains'
        textField = 'fullName'
        valueField = 'seriesId'
        itemComponent={ListItem}
        groupComponent={GroupHeading}
        groupBy={seriesMeta => seriesMeta.routine}
        onSelect={this.showInfo}
        onChange={onChange,onChange}
    />
    
    <span className={'oc-fm--dialog__input-label'} style={{fontWeight:'normal'}}><strong>{"Source: "}</strong><a href={ this.state.actSeries ? this.state.actSeries.source : '' } target={"_blank"}>{ this.state.actSeries.source }</a></span>
    <span className={'oc-fm--dialog__input-label'} style={{fontWeight:'normal'}}><strong>{"Info: "}</strong>{ this.state.actSeries.info }</span> 
    
  </>
      );
    }
  }
  
  ImageSeriesSelect.propTypes = propTypes;
  ImageSeriesSelect.defaultProps = defaultProps;