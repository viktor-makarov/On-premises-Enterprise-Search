import React,{Component} from 'react';
import {Spinner,Container, Row,Col } from 'reactstrap';
import {QueryFunction,CustomSuggester,CustomReactiveList} from './myFunctions.js';
import {ReactiveBase,DateRange, SelectedFilters, DataSearch, MultiList, ReactiveList} from '@appbaseio/reactivesearch';
import StrategySwitcher from './StrategySwitcher';
import CarouselAdvert from './Carousel';
import FieldControl from './FieldControl.js'
import HideButton from './HideButton.js'
import axios from 'axios';
import SimpleSlider from './Carousel.js'


 let logvalue = {before_select:null,selected:null,cause:null}

function valueLogFunction(value,tag,cause){

if (tag==="selected"){
logvalue.selected = value
logvalue.cause = cause
if (cause!="CLEAR_VALUE"){

  return axios.post('/api/loggs/queryvalue',
  {data: {
     before_select: logvalue.before_select,
     selected: logvalue.selected,
     cause:logvalue.cause
   }})
}
} else {
  logvalue.before_select = value;
  logvalue.selected = null
  logvalue.cause = null
}
};
class SearchMainView extends Component {
//export function StrategySwitcher (props) {

constructor(props) {
  super(props);

  const search_fields =
  {"filename":{"boost":1.5,"status": true,"name":"Название файла"},
  "file_folder":{"boost":1.2,"status": true,"name":"Название папки"},
  "file_content_ru":{"status": true,"name":"Текст документа"},
  "file_attachments_list":{"boost":1.2,"status": true,"name":"Названия вложенных файлов"},
}

  const users =
    {"user_id":"unknown",
    "user_fio":"unknown",
    "user_fio_short":"UN"
  }
  this.self_url = new URL(window.location.href)

  this.state = {
    search_strategy: "word",
    search_fields_list:Object.keys(search_fields),
    search_fields_true:Object.keys(search_fields),
    search_fields:search_fields,
    users:users
    };

    axios.get('/users/getUser/')
     .then(response => {
       this.handleUserChange(response.data)
     })
     .catch((error) => {
        console.log(error);
     })

  this.handleStrategyChange = this.handleStrategyChange.bind(this);
  this.handleSearchFieldsChange = this.handleSearchFieldsChange.bind(this);
  this.handleUserChange = this.handleUserChange.bind(this);
}

handleUserChange(user) {

  const usersLocal =
    {
    "user_id":user.user_id,
    "user_fio":user.user_fio,
    "user_fio_short":user.user_fio_short
  }

this.setState({users: usersLocal
});
console.log(this.state.users)
}

handleStrategyChange(strategy) {

this.setState({search_strategy: strategy
});
}

handleSearchFieldsChange(status,name) {

  let newItem = this.state.search_fields
  newItem[name].status=status

  let search_fields_list_true = []
  let search_fields_list_false = []
  const list = Object.keys(newItem)
  list.map((item)=>{
    if(newItem[item].status){
      search_fields_list_true.push(item)
    } else {
      search_fields_list_false.push(item)
    }
    return search_fields_list_false
  })
  let search_fields_list = search_fields_list_true.concat(search_fields_list_false)

  this.setState({
    search_fields: newItem,
    search_fields_list:search_fields_list,
    search_fields_true:search_fields_list_true});

}

render() {

  function searchFieldsForHighlight(fieldsDict){
    const list = Object.keys(fieldsDict)
    const fields={}
    list.map((item)=>{
        fields[item]={}
        return fields[item]
    })

  return fields
  }

  const origin_url = this.self_url.origin+'/'

  return (
    <div  className="app_container">

    <SimpleSlider/>

    <ReactiveBase
      app="elasticsearch"
      //url="https://search.aorti.ru"
      url={origin_url}

      transformRequest={props => ({
      ...props,
      })}
    >
    <Container fluid className="first-container add">
      <div className="top-row-container">
      <Row fluid xs="4" className="main-class-row">
        <Col className="col-class">
        <div className="search-class">
          <h1 >Search! <span style={{color:"black"}}>beta</span></h1>
        </div>
        </Col>
        <Col className="col2-class" xs="6">
          <div>
          <DataSearch
            componentId="SearchSensor"
            search_fields={this.state.search_fields}
            search_fields_true={this.state.search_fields_true}
            className="search-input-container"
            onValueSelected={
              function(value, cause, source) {
                valueLogFunction(value,"selected",cause)
              }
            }
            onValueChange={
              function(value) {
                valueLogFunction(value,"changed",null)
              }
            }
            search_strategy={this.state.search_strategy}
            innerClass={{input: 'search-input'}}

            dataField = {this.state.search_fields_list}
            defaultQuery={function(value, props) {
                            return QueryFunction(value, props);
                          }}
            customQuery={function(value, props) {
                            return QueryFunction(value, props);
                        }}
            placeholder="Что Вам найти?"
            autosuggest={true}
            debounce={300}
            size={5}
            highlight={true}
            showIcon ={true}
            showClear ={true}
            filterLabel="Запрос"
            customHighlight={props => ({
              highlight: {
                pre_tags: ['<b>'],
                  post_tags: ['</b>'],
                  fields: searchFieldsForHighlight(this.state.search_fields),
                  fragment_size:100,
                  number_of_fragments: 3,
                  no_match_size:200
              },
            })}
            render={function({ loading, error, data,resultStats, value, downshiftProps: { isOpen, getItemProps }  }) {

              return CustomSuggester({ loading, error, data,resultStats, value, downshiftProps: { isOpen, getItemProps}});
            }}
            showFilter={true}
            react={{and: ['LoadSuccess','FolderFilter','FormatFilter', 'SourceFilter','LastEditor','DateModified','SearchResult'],}}
            URLParams={true}
          />
          </div>
          <div>
          <StrategySwitcher
            search_strategy={this.state.search_strategy}
            onStrategyChange={this.handleStrategyChange}
          />
          </div>
        </Col>
        <Col className="col-class">
        </Col>
      </Row>
      </div>
      </Container>

      <div className="resuts-and-filters">
    {/*  <Container fluid>
      <Row fluid xs="4" className="body-container-class-row">

        <Col className="col3-class">*/}
        <div className="filters">
          {/*<div className="col3-class-facet">*/}
          <HideButton
          initialState ={true}
          title = "Название сетевой папки"
          main_element = {
          <MultiList
            componentId="FolderFilter"
            size={20}
            className="facet-overal"
            innerClass={{
              label: 'facet-label',
              count: 'facet-count',
              list: 'facet-list'
            }}
            dataField="folder_name.keyword"
            showSearch={false}
            showCheckbox={true}
            showCount={true}
            URLParams={true}
            filterLabel="Название сетевой папки"
            react={{and: ['LoadSuccess','FormatFilter','LastEditor','SourceFilter','SearchResult','DateModified','SearchSensor'],}}
          />}
          />
          <HideButton
          initialState ={true}
          title = "Формат файла"
          main_element = {
          <MultiList
            componentId="FormatFilter"
            size={20}
            className="facet-overal"
            innerClass={{
              label: 'facet-label',
              count: 'facet-count',
              list: 'facet-list'
            }}
            dataField="format.keyword"
            showSearch={false}
            showCheckbox={true}
            showCount={true}
            URLParams={true}
            filterLabel="Формат файла"
            react={{and: ['LoadSuccess','FolderFilter','LastEditor','SourceFilter','SearchResult','DateModified','SearchSensor'],}}
          />}
          />
          <HideButton
          initialState ={false}
          title = "Успешность загрузки"
          main_element = {
          <MultiList
            componentId="LoadSuccess"
            size={20}
            className="facet-overal"
            innerClass={{
              label: 'facet-label',
              count: 'facet-count',
              list: 'facet-list'
            }}
            dataField="file_process_result.keyword"
            showSearch={false}
            showCheckbox={true}
            showCount={true}
            URLParams={true}
            filterLabel="Успех загрузки"
            react={{and: ['FormatFilter','FolderFilter','LastEditor','SourceFilter','SearchResult','DateModified','SearchSensor'],}}
          />}
          />
        {/*  </div>*/}
          </div>
      {/*  </Col>
      /*  <Col xs="6"  className="col3-class">
        <div className="filters_class">*/}
        <div id="scrollable-results" className="results">
            <SelectedFilters showClearAll={false} />
            <ReactiveList
              componentId="SearchResult"
              className="facet-overal"
              innerClass={{
              resultsInfo: 'result-stat-class'
              }}
              renderItem={CustomReactiveList}

              react={{"and": ['LoadSuccess','FolderFilter','FormatFilter', 'LastEditor', 'SearchSensor','SourceFilter','DateModified']}}
              dataField="_score"
              size={10}
              renderNoResults ={() => <h5>Увы, ничего не найдено.</h5>}
              loader={<Spinner color="secondary" />}
              showResultStats={true}
              scrollTarget="scrollable-results"
              renderResultStats={function(stats){
                                  return (`Результатов: ${stats.numberOfResults}`)
              }}
            />
        </div>
        {/*</Col>
        <Col className="col3-class">*/}
        <div className="filters">
        <FieldControl
          search_fields={this.state.search_fields}
          search_fields_true = {this.state.search_fields_true}
          onFieldListChange={this.handleSearchFieldsChange}
          className="facet-overal"
          innerClass={{
            label: 'facet-label',
            count: 'facet-count',
            list: 'facet-list'
          }}
        />
          <HideButton
          initialState ={false}
          title = "Источник"
          main_element = {
          <MultiList
           componentId="SourceFilter"
           dataField="source.keyword"
           showSearch={false}
           className="facet-overal"
           innerClass={{
            label: 'list-items-class',
            count: 'list-items-class',
            checkbox: 'list-checkbox-class',
            list: 'list-class'
          }}
           showCheckbox={true}
           showCount={true}
           URLParams={true}
           filterLabel="Источник"
           react={{and: ['LoadSuccess','FolderFilter','LastEditor','FormatFilter','DateModified','SearchSensor','SearchResult'],}}
         />}
         />
         <HideButton
         initialState ={true}
         title = "Дата последнего изменения"
         main_element = {
         <DateRange
          componentId="DateModified"
          dataField="date_last_modyfied"
          placeholder={{
            start: 'Начало',
            end: 'Конец',
          }}
          //defaultValue={{
          //  start: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
          //  end: new Date()
          //}}
          focused={false}
          numberOfMonths={2}
          queryFormat="date"
          autoFocusEnd={true}
          showClear={false}
          showFilter={true}
          filterLabel="Д. посл. изм."
          URLParams={true}
          react={{and: ['LoadSuccess','FolderFilter','LastEditor','FormatFilter','SearchSensor','SourceFilter','SearchResult'],}}
         />}
         />
         <HideButton
         initialState ={true}
         title = "Автор последнего изменения"
         main_element = {
         <MultiList
           componentId="LastEditor"
           dataField="file_last_modified_by.keyword"
           showSearch={true}
           showCheckbox={true}
           showCount={true}
           className="facet-overal"
           innerClass={{
            label: 'list-items-class',
            count: 'list-items-class',
            checkbox: 'list-checkbox-class',
            input:'search-input-list',
            list: 'list-class'
          }}
           placeholder ="Искать по списку"
           URLParams={true}
           filterLabel="А. посл. изм."
           react={{and: ['LoadSuccess','FolderFilter','FormatFilter', 'SourceFilter','DateModified','SearchSensor','SearchResult'],}}
         />}
         />
        </div>
      {/*  </Col>

      </Row>

    </Container>*/}
    </div>
    </ReactiveBase>
    </div>
  );
}

componentDidMount() {

}
}

export default SearchMainView;
