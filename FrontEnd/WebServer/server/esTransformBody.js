const mongo = require('./mongo.js');

function ES_Body_Transform(proxyReq, req){

  /* transform the req body back from text */
  const {body} = req;

  //console.log("body check",body)


  if(Object.keys(body).length===0){
   //Проверяем, есть ли хоть один символ и если нет - ничего не делаем
     return
  };

  let bodylist = body.split("\n"); //разделяем первую и вторую часть запроса
  let bodylistobjects = bodylist.map(item => {

    let newitem = new Object(); //Создаем новый объект, чтобы не менять старый
    //Делаем защиту против пустых items
    if (!item){
        newitem = item
        return newitem
      }

    newitem =JSON.parse(item); //Наполняем объект
    if(newitem.preference){
      return newitem
    }

    ShowHideFields(newitem) //Убираем лишние поля из ответа

    if (newitem.query){

      const user = req.session.user_id;
      const groups =req.session.groups;
      //const users_list = req.session.groups
    /*  if (users_list){
      groups = users_list.map(x => {return x.split('\\')[1]});
    }*/

  //  console.log("user",user,"groups",groups)

      BodyEditorShould(newitem,{user:user,groups:groups}) //Добавляем к body фильтр по группам
    }
      return newitem
    });

    bodylist = bodylistobjects.map(item => {
        let newitem = "";
        if (item){
          newitem=JSON.stringify(item)
        } else {
          newitem=item
        }
        return newitem
      });

    const bodystring = bodylist.join("\n")

  // console.log("NewRequest:",Buffer.from(bodystring).length,bodystring);

/*
   if(bodylist[0]==="{\"preference\":\"SearchResult\"}"){
     console.log("NewRequest:",Buffer.from(bodystring).length,bodystring);
   }
   */

  //Добавляем в пересылаемое сообщение ключ авторизации
  /*
    proxyReq.setHeader(
      'Authorization',
      'Basic '+ btoa(global.elastic_config.login +':'+ global.elastic_config.pass))
      */

      proxyReq.setHeader(
        'Authorization',
        'Basic '+ Buffer.from(global.elastic_config.login +':'+ global.elastic_config.pass).toString('base64')
      )

    //Меняем в пересылаемом сообщении количество символов под новое сформированное body. Иначе оно будет обрезано
    proxyReq.setHeader('Content-length',Buffer.from(bodystring).length.toString());

  //Добавляем (заменяем) в пересылаемом сообщении body на вновь сформированное
    proxyReq.write(bodystring)
};

function ShowHideFields (newitem) {
    //Функция регулирует, какие поля нужно, показывать, а какие нет.

    let excludes = ["file_content_ru"];

    if(newitem._source){
        newitem._source.excludes = excludes
      } else {
          newitem._source = {};
          newitem._source.includes = ["*"]
          newitem._source.excludes = excludes
      }
  }

function ShouldFunction (authInfo) {
  		//Функция берет ииз переменной информацию группах, в которых пользователь участвует
  		//и формирует из них cекцию should для запроса в формате JSON

      let permission = [];
  		if (authInfo.groups) {

        let groupslist_added = [];
        groupslist_added = groupslist_added.concat(authInfo.groups).concat([authInfo.user])
    //    groupslist_added.push(authInfo.user) //добавляем также самого пользователя, т.к. доступ иногда выдается напрямую пользователю

  		     for (var i=0; i<20; i++) {
  		     var dict = {};

           dict["permission" + (i+1) +".keyword"] = groupslist_added

  		     var dict1 = {"terms":dict}
  		     permission[i]=dict1;
  		};
  		};

  		if (permission==[]){
  		    permission= [{"terms": {"permission":["Nothing"]}}];
  		}
  		//console.log('Groups:', JSON.stringify(authInfo.groups))
  		return permission
    }

function BodyEditorShould(newitem,UserNameAndGroupsObject) {

  const shouldQuery = ShouldFunction(UserNameAndGroupsObject)

   if(newitem.query.match_all){

       newitem.query.bool={};
       newitem.query.bool.should = shouldQuery;
       newitem.query.bool.minimum_should_match = 1;

       delete newitem.query.match_all;

   } else {

       let querytype = 0;
       newitem.query.bool.must[0].bool.must.map(item1=>{
           let i = item1

           if(i.function_score){
               querytype = 1
               i.function_score.query.bool.should = shouldQuery;
               i.function_score.query.bool.minimum_should_match = 1
           };

       return i
       });

       if(querytype==0){
               newitem.query.bool.must[0].bool.must.push({"bool":{"should":shouldQuery,"minimum_should_match":1}})
       };
   }
 }

module.exports = {
es_body_transform:ES_Body_Transform
}
