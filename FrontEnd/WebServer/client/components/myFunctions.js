import React from 'react';
import { Badge} from 'reactstrap';
import  {List,ListInlineItem }  from 'reactstrap';
import ButtonsBlock from './ButtonsBlock';
import LineActionable from './LineActionable';
import DepartmentComponent from './DepartmentComponent';
import ReactiveDepartment from './ReactiveDepartment';
import ClipboardCopyButton from './ClipboardCopy';
import FDownload from './FileDownload'


//Функция преобразовывает дату в нужный формат
export function DateF(data_) {
	if (!data_ ) {
	    return;
	}
return new Intl.DateTimeFormat('ru', {year:"numeric",month:"short",day:"2-digit"}).format(new Date(Date.parse(data_)))
}

//Делает правильный формат для указания части
export function TagAfter(d) {
	let filepart;
							if(d.file_part){
				      if (d.file_part==="1/1") {
				        return;
				      }
							filepart=" ("+d.file_part+")"
						}

				      return filepart;
				  }

export function DateRangeQueryFunction(value, props) {

return 	{
        query: {
            range: {
							"date_last_modyfied": {
									"gte": "2019-11-17",
									"lte": "2020-11-17"
								}
            }
        }
      }
}

export function QueryFunction(value, props) {

if (!props||!value ) {
    return;
}
let searchStrategyFlag = props.search_strategy

let searchFieldsDict = props.search_fields
let searchFieldsListTrue = props.search_fields_true

let fieldsList =[]
if (searchFieldsDict){

	searchFieldsListTrue.map((item)=>{
				if (searchFieldsDict[item].boost){
			fieldsList.push(item+"^"+searchFieldsDict[item].boost)
		} else{
			fieldsList.push(item)
		};

		return fieldsList
	})

}



let boolSentance ={};
let currentDefinition;

if (props.source==="people"){
currentDefinition = {
	"fields": fieldsList,
	"default_operator": "and"
}}
else{
	currentDefinition = {
		"fields": fieldsList,
		"default_operator": "and"
	}
}

switch (searchStrategyFlag){

case "word":
	currentDefinition.query = value;
	boolSentance.must = {"simple_query_string": currentDefinition};

	break;

case "char":

	let newValuelist = value.split(' ');

	newValuelist = newValuelist.map((item)=>{
	  return ("*"+item+"*");
	})

	let newValue = newValuelist.join(" ")

	currentDefinition.query = newValue;
	boolSentance.must = {"query_string": currentDefinition};

	break;

case "regexp":

	currentDefinition.query = "/" + value + "/";

	boolSentance.must = {"query_string": currentDefinition};
	break;

default:

	currentDefinition.query = value;
	boolSentance.must = {"simple_query_string": currentDefinition};
		break;

}

//console.log(boolSentance)
return {
  	"query": {
        "function_score": {
            "linear": {
                "date_last_modyfied": {
                    "offset": "0d",
                    "scale": "900d",
                    "decay": 0.5
                }
            },
	        "query": {
	          "bool": boolSentance
	        }
		}
	}
  }
}


export function CustomSuggester({ loading, error, data, resultStats, value, downshiftProps: { isOpen, getItemProps }}) {

    const ItemsInList = 5
  //  if (loading) {
  //      return <div className="suggester-class">Загружаем подсказки</div>;
  //  };
    if (error) {
        return <div className="suggester-class">Что-то пошло не так! Инфо об ошибке: {JSON.stringify(error)}</div>;
    }

    function contentGenerator(contentItem){

    	let contentHtml = "";
    	if(contentItem){

    		return (
    			contentItem.map((item) => {
	        		if(!item){
						item = '-'
					}
						return (
							<div key={item} dangerouslySetInnerHTML={{__html: "..."+item+"..."}}></div>
						)
				})
			)
    	}

    	return contentHtml
    };

		function TotalCount(count){
			let totalcountString;

			if(count!==0 & data.length!==0){

				totalcountString = "Результатов всего: " + count
			}

			return totalcountString
		}

		function skillsList(string){
			let skillsString = string
			if(!skillsString){
		    return null
		  }
			let skillslist;
		  if(typeof skillsString =='object'){
		  skillslist = skillsString[0].split('|');
		  } else {
		  skillslist = skillsString.split('|');
		  }

			return (
				<div>
				<span className="skill-span-class2">Навыки:</span>
				{skillslist.map((item)=>(
				<span className="skill-span-class" dangerouslySetInnerHTML={{__html:(item)}}></span>
			))}
			</div>)}

			function degreeList(string){
				let degreeString = string
				if(!degreeString){
			    return null
			  }
				let degreelist;
			  if(typeof degreeString =='object'){
			  degreelist = degreeString[0].split('|');
			  } else {
			  degreelist = degreeString.split('|');
			  }

				return (
					<div>
					<span className="skill-span-class2">Уч. степени:</span>
					{degreelist.map((item)=>(
					<span className="skill-span-class" dangerouslySetInnerHTML={{__html:(item)}}></span>
				))}
				</div>)}

				function email(string){
					let emailString = string
					if(!emailString){
				    return null
				  }

					return (
						<div>
						<span className="skill-span-class2">Email: </span>
						<span className="skill-span-class" dangerouslySetInnerHTML={{__html:(emailString)}}></span>
					</div>)
				}

				function educationList(string){
					let educationString = string
					if(!educationString){
				    return null
				  }
					let educationlist;
				  if(typeof educationString =='object'){
				  educationlist = educationString[0].split('|');
				  } else {
				  educationlist = educationString.split('|');
				  }

					return (
						<div>
						<span className="education-span-class2">Образование:</span>
						{educationlist.map((item)=>(
						<span className="education-span-class" dangerouslySetInnerHTML={{__html:(item)}}></span>
					))}
					</div>)}

    return isOpen && Boolean(value.length) ? (
        <div className="suggester-class">
						<div className="suggester-snipet-total-class">
							<div className="suggester-snipet-inner-total-class">{TotalCount(resultStats.numberOfResults)}</div>
						</div>
            {data.slice(0, ItemsInList).map((suggestion, index) => (

                <div className="suggester-snipet-class" key={suggestion.value} {...getItemProps({ item: suggestion })}>
                 	<div className="suggester-snipetInside-class">
	                    <div className="suggester-header-class" dangerouslySetInnerHTML={{__html:suggestion.source.highlight.filename}}></div>
	                    <div className="suggester-header2-class" dangerouslySetInnerHTML={{__html: suggestion.source.highlight.file_attachments_list?"Вложенные файлы: "+suggestion.source.highlight.file_attachments_list:suggestion.source.highlight.file_attachments_list}}></div>
											<div className="suggester-jt-dt-class" dangerouslySetInnerHTML={{__html:suggestion.source.highlight.file_folder}}></div>
											<div className="suggester-content-class">
	                    	{contentGenerator(suggestion.source.highlight.file_content_ru)	    					}
	                    </div>
											<div className="suggester-fio-class" ></div>
											<div className="suggester-jt-dt-class" dangerouslySetInnerHTML={{__html:suggestion.source.highlight.jobtitle}}></div>

											<div className="suggester-jt-dt-class" dangerouslySetInnerHTML={{__html:suggestion.source.highlight.department}}></div>
											<div className="suggester-jt-dt-class">{skillsList(suggestion.source.highlight.skills)}</div>
											<div className="suggester-jt-dt-class">{degreeList(suggestion.source.highlight.degree)}</div>
											<div className="suggester-jt-dt-class">{educationList(suggestion.source.highlight.education)}</div>
											<div className="suggester-jt-dt-class">{email(suggestion.source.highlight.email)}</div>
	                </div>
                </div>
            ))}


        </div>
    ):null
};

 //Функция формирует кастомный snipet
export function CustomReactiveList(data) {



function filecontent(content){
let line;

if (content) {
  line = content.map((item) => {
        if (!item) {
          item = '-'
        }
         return (<div key={item} dangerouslySetInnerHTML={{__html: "..."+item+"..."}}></div>)
    });
}
return (line)
};



function file_detailes(date,option){
let detailstring;

switch  (option){

case "date_mod":

if(data.date_last_modyfied){
	if(data.filename){
		detailstring = "Посл. изм.: " + DateF(data.date_last_modyfied)
	}
}
break;

case "author_mod":

if(data.file_last_modified_by){

detailstring = " (" + data.file_last_modified_by +")"

}
break;

case "score":

if(data._score){
//detailstring = " • Score:" + data._score
}
break;

default:
break;
}

	return detailstring
}

function pagecount(page,type){
	let pagecount;
	if(page){
		switch (type){

		case "Excel":
		  pagecount = " • " + page + " листов"
			break;

		default:
				pagecount = " • " + page +  " стр."
				break;
		}
	}

	return pagecount
}


function filesize(filesize){
	let filesizeString;

	if(filesize){
				filesizeString = " • " + filesize
	}
	return filesizeString
}


function LoadSuccess(type){
	let LoadSuccess;

	if(type){

	if(!type.includes("OK")){
		LoadSuccess=type
	}
}

	return LoadSuccess
}

/*function test(){
	shell.openExternal("file:\\Dfsman-1\fs\ОБЩАЯ\Соглашение о неразглашении___1.docx")
	console.log("triggered")
}*/


return (
	<div className="snipet-class" key={data._id}>
			<div  className="snipet-class-inner">
					<div className="source-class">

					<span className ="folderpath-class">{data.source} : </span>
					{/*<form action="">
					<p><input type="button" value="Проверить" onclick="test()"></input></p>
					</form>*/}
					<LineActionable
						className ={"folderpath-class"}
						Name = {data.file_folder}
						data={data}
						actionLink = {data.folder_link}
					/>
						<FDownload
						   filepath={data.action_link}
						   filename={data.filename_keyword}
							 size ={data.filesize_str}
							 keyElement ={data._id+1}
						/>
						<ClipboardCopyButton
							copyText = {data.action_link}
							keyElement ={data._id}
							/>
					</div>
					<div tabIndex="2" >
					<LineActionable
						className ={"filename-fio-class"}
						Name = {data.filename}
						actionLink = {data.action_link}
					/>
						<Badge className="successloade-badge-class">{LoadSuccess(data.file_process_result)}</Badge>
					</div>
					<div className="file-content-class">
						{filecontent(data.highlight.file_content_ru)}
					</div>
					<div className="file-detailes-class" >
						<span className="f-d-span" >
                 {file_detailes(data,"date_mod")} {file_detailes(data,"author_mod")}
						</span>
            <span className="f-d-span">
							{pagecount(data.file_pages,data.format)}{TagAfter(data)}
            </span>
            {/*<span className="f-d-span">
            	{filesize(data.filesize_str)}
            </span>*/}
           	<span className="f-d-span">
                {file_detailes(data,"score")}
            </span>

					</div>

				     <div className={data.file_attachments_num>0 ? "sixth-line-class":"sixth-line-hide-class"}
				     dangerouslySetInnerHTML={{__html: data.file_attachments_num + " вложений : " + data.file_attachments_list}}>
					</div>
			</div>
		</div>
	);
}

//Функция формирует кастомный snipet
export function CustomReactiveListPeople(data,abc,deptFunc) {


function department (dep){

 let departmentSring;
 if(dep){
	 departmentSring = dep[0].charAt(0).toUpperCase()+dep[0].slice(1)
 }
 return departmentSring
}

function vacationstatus(vacationDate,vacationType){
 let vacationDateString;
 if(vacationDate){
	 switch  (vacationType){

	 case "В отпуске":
	 	 vacationDateString = "В отпуске до " + DateF(vacationDate) + " (вкл.)"
	 break;

	 case "В декрете":
	 	vacationDateString = "В декрете до  " + DateF(vacationDate)
	 break;

	 case "В учебном отпуске":
	 	vacationDateString = "В учебном отпуске до  " + DateF(vacationDate)
	 break;

	 default:
	 break;
	 }
 }

 return vacationDateString
}

function jobtitleString(jobtitle){
 let jobtitleString;
 if(jobtitle){
	 jobtitleString= jobtitle[0].charAt(0).toUpperCase()+jobtitle[0].slice(1)
}
 return jobtitleString
}

function email(email){
 let emailString;
	 if(email){
		 emailString = email
	 }
 return emailString
}


function email_mailto(email){
 let email_mailto;
 if(email){
	 email_mailto = "mailto:" +email
 }

 return email_mailto
}

function headertext(content) {
 let headerline;
 if(content.filename){
	 headerline = content.filename
 }
 if(content.fio){
	 headerline = content.fio
 }


 return headerline
}


function Ocupation(type){
 let occupation;

 if(type){

 if(!type.includes("Осн.")){
	 occupation=type
 }
}
 return occupation
}

function Category(type){
 let category;

 if(type){

 if(type.includes("Руководитель")){
	 category=type
 }
}
 return category
}

function BirthDate(bd){
 let birthDateString;
 if (bd){
	 let dateParse = new Date(Date.parse(bd))
	 let year = dateParse.getFullYear()

		 if(year!==1900){
			 let dateString = new Intl.DateTimeFormat('ru', {month:"long",day:"2-digit"}).format(dateParse)
		 		birthDateString="Д.р.: " + dateString
		 }
 }
 return birthDateString
}

function LenthOfWork(lw){
	let LenthOfWork;
		if (lw){
			let years = Math.floor(lw)
			let month = Math.round((lw % 1)*12)
			let yearName

			switch  (years){

			case 11: case 12: case 13: case 14:
				yearName = "лет"
				break;

			default:

			let last_digit = years % 10
			switch  (last_digit){
				case 1:
				 yearName = "год"
				 break;
				case 2: case 3: case 4:
					yearName = "года"
			 		break;
				default:
					yearName = "лет"
				break;
			}
			break;
		 }

			if (month===0){
				if (years===0){
					LenthOfWork = "Стаж в орг.: менее месяца"
				}else{
					LenthOfWork = "Стаж в орг.: " + years +" " + yearName
				}
		} else {
			if (years===0){
				LenthOfWork = "Стаж в орг.: " + month + " мес."
			}else{
				LenthOfWork = "Стаж в орг.: " + years +" " + yearName + " " + month + " мес."
		}
		}
	}
	return LenthOfWork
}

return (
		 <div className="snipet-class" key={data._id}>

				 <div tabIndex="2" className="first-line-class">

						 <span className="fio-class" dangerouslySetInnerHTML={{
								 __html: headertext(data)}}>
						 </span>

					 <Badge className="ocupation-badge-class">{Ocupation(data.occupation_type)}</Badge>
					 <Badge className="category-badge-class">{Category(data.staff_category)}</Badge>
					 <Badge className="vacation-badge-class">{vacationstatus(data.vacation_end_date,data.availability)}</Badge>
				 </div>
				 <div className="jobtitle-department-class" dangerouslySetInnerHTML={{
							 __html: jobtitleString(data.highlight.jobtitle)}}>
				 </div>
				 <div className="jobtitle-department-class" dangerouslySetInnerHTML={{
							 __html: department (data.highlight.department,data.employer)}}>
				 </div>

				 <div className="employer-class">
					 {data.employer}
				 </div>
				 <div >
				 	<List type="inline" className="file-detailes-class" >
						<ListInlineItem>
							<a
							dangerouslySetInnerHTML={{
		 							 __html: email(data.email)}}
							href={email_mailto(data.email)}></a>
						</ListInlineItem>
						<ListInlineItem>
							{BirthDate(data.birth_date)}
						</ListInlineItem>
						<ListInlineItem>
							{LenthOfWork(data.lenth_of_work)}
						</ListInlineItem>

				  </List>

				 </div>
				 <div>
				  <ButtonsBlock
						degreeHighlight={data.degree}
						educationHighlight={data.education}
						skillsHighlight={data.skills}
						/>
				 </div>
		 </div>
 );
}
