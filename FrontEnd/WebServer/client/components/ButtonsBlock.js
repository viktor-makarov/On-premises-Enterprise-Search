import React,{ useState } from 'react';
import { Container,Badge, Row, Button, Toast, ToastBody, ToastHeader} from 'reactstrap';


const ButtonsBlock = (props) => {

  function stateOnOpenE(){
    let edString = props.educationHighlight
    if(!edString){
      return false
    }

    if (edString.includes("</",1)){
      return true

    } else{
      return false

    }

  }

  function stateOnOpenS(){
    let degString = props.degreeHighlight
    if(!degString){
      return false
    }

    if (degString.includes("</",1)){
      return true
    } else {

      return false
    }
  }



  function stateOnOpenSkills(){
    let skillsString = props.skillsHighlight
    if(!skillsString){
      return false
    }

    if (skillsString.includes("</",1)){
      return true
    } else {
      return false
    }

  }

  const [isOpenE, setIsOpenE] = useState(stateOnOpenE());
  const onCheckboxBtnClickE = () => setIsOpenE(!isOpenE);

  const [isOpenS, setIsOpenS] = useState(stateOnOpenS());
  const onCheckboxBtnClickS = () => setIsOpenS(!isOpenS);

  const [isOpenSkills, setIsOpenSkills] = useState(stateOnOpenSkills());
  const onCheckboxBtnClickSkills = () => setIsOpenSkills(!isOpenSkills);

  function EducationButton(){

  let educationString = props.educationHighlight

  if(!educationString){
    return null
  }

  return (
    <span>
      <Button active={isOpenE} outline onClick={onCheckboxBtnClickE} className="button-bottom" size="sm" color="secondary">Образование</Button>
    </span>
  )
}

function EducationCollapce(){

  let educationString = props.educationHighlight;

  if(!educationString){
    return null
  }

  let educationlistfirstlevel;
  if(typeof educationlistfirstlevel =='object'){
    educationlistfirstlevel = educationString[0].split('%');
  } else {
    educationlistfirstlevel = educationString.split('%');
  }

  let educationlist = [];
  let educationlistSecondLevel;
  for (let i = 0; i < educationlistfirstlevel.length; i++) {
    educationlistSecondLevel = educationlistfirstlevel[i].split("|")
    for (let a = 0; a < educationlistSecondLevel.length; a++) {
      educationlistSecondLevel[a] = educationlistSecondLevel[a][0].toUpperCase() + educationlistSecondLevel[a].substr(1);
      if (a === 0){
        educationlistSecondLevel[a] = "<h6>"+ educationlistSecondLevel[a] +"</h6>"
      }
      educationlist.push(educationlistSecondLevel[a]);
    }
  }

  return(
    <span>
    <Toast isOpen={isOpenE} className="toast-class">
          <ToastHeader toggle={onCheckboxBtnClickE}>
            Образование
          </ToastHeader>
          <ToastBody>
          {educationlist.map((item,count)=>(
            <div  dangerouslySetInnerHTML={{
                  __html: (item)}}>
            </div>
          ))}
          </ToastBody>
        </Toast>
    </span>
  )
}

  function degreeButton(){

  if(!props.degreeHighlight){
    return null
  }
  return (
    <span>
      <Button outline active={isOpenS} onClick={onCheckboxBtnClickS} className="button-bottom" size="sm" color="secondary">Научная степень</Button>
    </span>
  )
}

function degreeCollapce(){

let degreeString = props.degreeHighlight;

if(!degreeString){
  return null
}

let degreelist;
if(typeof degreelist =='object'){
  degreelist = degreeString[0].split('|');
} else {
  degreelist = degreeString.split('|');
}

return (
  <span>
  <Toast isOpen={isOpenS} className="toast-class">
        <ToastHeader toggle={onCheckboxBtnClickS}>
          Научная степень
        </ToastHeader>
        <ToastBody>
        {degreelist.map((item,count)=>(
          <div  dangerouslySetInnerHTML={{
                __html: (item)}}>
          </div>
        ))}
        </ToastBody>
      </Toast>

  </span>
)
}

function skillsButton(){

if(!props.skillsHighlight){
  return null
}
return (
  <span>
    <Button outline active={isOpenSkills} onClick={onCheckboxBtnClickSkills} className="button-bottom" size="sm" color="secondary">Навыки</Button >
  </span>
)
}

function skillsCollapce(){

let skillsString = props.skillsHighlight;

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
  <span>
  <Toast isOpen={isOpenSkills} className="toast-class">
        <ToastHeader toggle={onCheckboxBtnClickSkills}>
        Навыки
        </ToastHeader>
        <ToastBody>
        {skillslist.map((item,count)=>(
          <Badge className="skill-badge-class" dangerouslySetInnerHTML={{
                __html: (item)}}></Badge>
        ))}
        </ToastBody>
      </Toast>
  </span>
)
}

  return (
    <div>
    <Container>
    <Row>
      {EducationButton()}
      {degreeButton()}
      {skillsButton()}
    </Row>
    <Row className="collapce-block">
       {EducationCollapce()}
        {degreeCollapce()}
        {skillsCollapce()}
    </Row>
    </Container>
    </div>
  );
}


export default ButtonsBlock;
