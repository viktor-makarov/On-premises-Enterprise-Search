import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';


export function ModalWindow (props) {


  const {
    buttonLabel,
    className
  } = props;

  const [modal, setModal] = useState(false);

  const toggle = () => setModal(!modal);

  return (
    <span>
      <Button  onClick={toggle}>{buttonLabel}</Button>
      <Modal size={"lg"} returnFocusAfterClose={false} isOpen={modal} toggle={toggle} className={className}>
        <ModalHeader toggle={toggle}>
        Операторы поиска

        </ModalHeader>
        <ModalBody>
        <div>
        <p>ВАЖНО! Операторы поиска работают только в режиме "Искать по словам и фразам"</p>
        <table className="operator-tbl">
        <tr>
          <th  className="operator-tbl-cells">Оператор</th>
          <th  className="operator-tbl-cells">Название</th>
          <th  className="operator-tbl-cells">Описание</th>
          <th  className="operator-tbl-cells">Пример запроса</th>
          <th  className="operator-tbl-cells">Примечание</th>
        </tr>
        <tr>
          <td  className="operator-tbl-cells operator-tbl-column">""</td>
          <td  className="operator-tbl-cells">Кавычки</td>
          <td  className="operator-tbl-cells">Учитывает порядок слов</td>
          <td  className="operator-tbl-cells">"мой дядя самых честных правил"</td>
          <td  className="operator-tbl-cells"></td>
        </tr>
        <tr>
          <td  className="operator-tbl-cells operator-tbl-column">|</td>
          <td  className="operator-tbl-cells">Труба</td>
          <td  className="operator-tbl-cells">Соответствует оператору ИЛИ</td>
          <td  className="operator-tbl-cells">сцилла | харибда</td>
          <td  className="operator-tbl-cells"></td>
        </tr>
        <tr>
          <td  className="operator-tbl-cells operator-tbl-column">-</td>
          <td  className="operator-tbl-cells">Дефис</td>
          <td  className="operator-tbl-cells" >Исключает слово из поиска</td>
          <td  className="operator-tbl-cells">котлеты -мухи</td>
          <td  className="operator-tbl-cells">пишется слитно со словом, которое нужно исключить</td>
        </tr>
        <tr>
          <td  className="operator-tbl-cells operator-tbl-column">*</td>
          <td  className="operator-tbl-cells">Звездочка</td>
          <td  className="operator-tbl-cells">Заменяет любые буквы</td>
          <td  className="operator-tbl-cells">пей*</td>
          <td  className="operator-tbl-cells">пишется слитно со словом, которое нужно продолжить</td>
        </tr>
        <tr>
          <td  className="operator-tbl-cells operator-tbl-column">~</td>
          <td  className="operator-tbl-cells">Тильда</td>
          <td  className="operator-tbl-cells">Игнорирует до 2х опечаток</td>
          <td  className="operator-tbl-cells">догавор~</td>
          <td  className="operator-tbl-cells"></td>
        </tr>
      </table>
        </div>
        </ModalBody>
      {/*  <ModalFooter >
          <Button href={"https://wiki.aorti.ru/pages/viewpage.action?pageId=8455639"} target="_blank" rel="noopener noreferrer" color="primary" onClick={toggle}>Подробная инструкция</Button>{' '}
          <Button color="secondary" onClick={toggle}>Закрыть</Button>
        </ModalFooter>*/}
      </Modal>
    </span>
  );

}
export default ModalWindow
