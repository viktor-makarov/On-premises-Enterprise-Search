import React, { Component } from "react";
var Carousel = require('react-responsive-carousel').Carousel;
import ModalWindow from './ModalWindow';
import ModalWindow1 from './ModalWindow1';

export default class SimpleSlider extends Component {

    render() {
        return (
          <div className="menu-bar">
            <Carousel showArrows={false} showThumbs={false} autoPlay={true} infiniteLoop={true}>
                <div className="carousel-inside-class1">
                    <span className="advert-class-text">Использование операторов улучшает поиск на 30%</span>
                    <span>
                      <ModalWindow
                        classNamefooter = {"modal-footer-class"}
                        buttonLabel = {"Подробнее"}
                      />
                    </span>
                </div>
                <div className="carousel-inside-class2">
                    <span className="advert-class-text">Искать: по словам и фразам vs. по нескольким символам</span>
                    <span>
                      <ModalWindow1
                        classNamefooter = {"modal-footer-class"}
                        buttonLabel = {"В чем разница?"}
                      />
                    </span>
                </div>
                <div className="carousel-inside-class1">
                    <span className="advert-class-text">Нажмите <b>Ctrl-D</b>, чтобы добавить Search! в закладки браузера</span>
                </div>

            </Carousel>
            </div>
        );
    }
};
