import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';


export function ModalWindow1 (props) {

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
        Какая разница между двумя вариантами поиска?

        </ModalHeader>
        <ModalBody>
        <div>

        <p><b>По словам или фразам</b> - это главная стратегия поиска. Здесь основная задача - угадать ключевое слово, которое есть в документе. При вводе ключевого слова, за окончания можно не беспокоится, т.к. поиск умеет их игнорировать. Если ключевое слово угадали, то дальше нужно уточнять поиск с помощью дополнительных слов, операторов поиска и фильтров.</p>

        <p>Cтратегия поиска <b>по нескольким символам</b> подходит, когда поиск нужно вести не по словам, а по наборам символов, например, по маркировке номенклатуры, по ИНН, по номеру договора и прочее. Но комбинация символов должна быть достаточно редкая, иначе поиск выдаст слишком много совпадений. К тому же, эта стратегия поиска не умеет сортировать результаты по степени соответствия, то есть не нужно расчитывать, что самые подходящие будут в начале списка.</p>
        </div>
        </ModalBody>
      {/*  <ModalFooter >
          <Button href={"https://wiki.aorti.ru/pages/viewpage.action?pageId=8455780"} target="_blank" rel="noopener noreferrer" color="primary" onClick={toggle}>Подробная инструкция</Button>{' '}
          <Button color="secondary" onClick={toggle}>Закрыть</Button>
        </ModalFooter>*/}
      </Modal>
    </span>
  );

}
export default ModalWindow1
